from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import ChatRequest, ChatResponse, InsightsRequest
from agent import app as agent_app, generate_insights

app = FastAPI(title="FlowForge ERP AI Copilot", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint for the AI Copilot using LangGraph to process user queries.
    """
    try:
        initial_state = {
            "question": request.question,
            "role": request.role
        }
        
        # Invoke LangGraph agent
        result = agent_app.invoke(initial_state)
        
        answer = result.get("answer", "I couldn't generate an answer.")
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/insights")
async def insights_endpoint(request: InsightsRequest):
    """
    Endpoint for generating role-aware dashboard insights.
    """
    try:
        insights = generate_insights(request.context, request.role)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "FlowForge ERP FastAPI Copilot is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

