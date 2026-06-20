import { aiEngineService } from './lib/server/ai/ai-engine.service';
import prisma from './lib/server/db';

async function main() {
  try {
    console.log('--- Calling 1st time (cold, should fetch fresh context) ---');
    const insights1 = await aiEngineService.getInsights(false);
    
    console.log('\n--- Calling 2nd time (should hit cache) ---');
    const insights2 = await aiEngineService.getInsights(false);
    
    if (insights1 === insights2) {
      console.log('\n[SUCCESS] Both calls returned identical object references from cache.');
    } else {
      console.warn('\n[WARNING] Cache did not return identical object references.');
    }
  } catch (error) {
    console.error('Error running cache test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
