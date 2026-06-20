import os
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv

from schemas import ERPState
from tools import tools_list, tools_map

load_dotenv()

# Initialize LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def get_authorized_tools(role: str) -> list:
    """Returns a list of tool names the role is authorized to use."""
    role = role.lower()
    authorized = [
        "get_low_stock_products", 
        "get_today_revenue", 
        "get_delayed_orders", 
        "get_pending_manufacturing", 
        "get_pending_purchase_orders",
        "business_health_score",
        "recommend_actions"
    ]
    
    if role == "admin":
        authorized.append("get_audit_logs")
        
    return authorized

def role_validator(state: ERPState):
    """
    Clears any previous validation errors.
    """
    return {"validation_error": ""}

def tool_selector(state: ERPState):
    """
    Selects the best tool using the LLM, exposing ONLY tools authorized for the user's role.
    """
    if state.get("validation_error"):
        return state # Skip tool selection if validation failed

    role = state.get("role", "guest").lower()
    authorized_tool_names = get_authorized_tools(role)
    
    prompt = f"""You are FlowForge ERP AI.
Available Tools for the user's role '{role}':
{", ".join(authorized_tool_names)}

Choose the best tool to answer the user's question.
If the user asks "What should I do today?", choose recommend_actions.
If the user asks for information outside the scope of their Available Tools (like audit logs for a non-admin), do NOT select a tool. Instead, return "UNAUTHORIZED".
Return ONLY the tool name, or "UNAUTHORIZED", nothing else.

User: {state['question']}
Output:"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    selected_tool = response.content.strip()
    
    if selected_tool == "UNAUTHORIZED":
        return {"validation_error": f"You do not have permission to perform this action or query this data with the '{role}' role."}
        
    return {"selected_tool": selected_tool}

def tool_executor(state: ERPState):
    """
    Executes the selected tool and stores the output.
    """
    if state.get("validation_error"):
        return state # Skip tool execution if validation failed
        
    tool_name = state.get("selected_tool", "")
    
    # Check if the tool exists and run it
    if tool_name in tools_map:
        tool_func = tools_map[tool_name]
        try:
            # We assume tools don't need complicated arguments for this scope
            tool_output = tool_func.invoke({})
            return {"tool_output": str(tool_output)}
        except Exception as e:
            return {"tool_output": f"Error executing tool {tool_name}: {str(e)}"}
    else:
        return {"tool_output": f"Tool '{tool_name}' not found or not recognized."}

def response_generator(state: ERPState):
    """
    Generates a concise response based on the tool output.
    """
    if state.get("validation_error"):
        return {"answer": state["validation_error"]}
        
    prompt = f"""You are FlowForge ERP Copilot.

Question:
{state['question']}

Tool Result:
{state.get('tool_output', 'No result')}

Generate an ERP answer.
Be concise.
Give recommendations.
If the Tool Result contains structured priorities (like 'Today's Priorities'), present it clearly in markdown format.
"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"answer": response.content}

# Build LangGraph
workflow = StateGraph(ERPState)

# Add Nodes
workflow.add_node("role_validator", role_validator)
workflow.add_node("tool_selector", tool_selector)
workflow.add_node("tool_executor", tool_executor)
workflow.add_node("response_generator", response_generator)

# Add Edges
workflow.add_edge(START, "role_validator")
workflow.add_edge("role_validator", "tool_selector")
workflow.add_edge("tool_selector", "tool_executor")
workflow.add_edge("tool_executor", "response_generator")
workflow.add_edge("response_generator", END)

# Compile Graph
app = workflow.compile()
