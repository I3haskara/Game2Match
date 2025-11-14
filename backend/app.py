from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
# from opik import track  # Temporarily disabled for debugging

from logic.loader import load_games
from logic.parser import parse_preferences
from logic.matcher import match_games
from logic.explainer import explain_matches

app = FastAPI(title="Game2Match - AI Game Recommender")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for hack/demo – later you can restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GAMES: List[Dict[str, Any]] = load_games()

class RecommendRequest(BaseModel):
    prompt: str
    max_results: int = 3

@app.get("/")
def root():
    return {
        "message": "Game2Match backend is running.",
        "endpoints": {
            "health": "/health",
            "recommend": "/recommend",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok", "games_loaded": len(GAMES)}

@app.post("/recommend")
# @track(name="game2match_recommend", capture_input=True, capture_output=True)  # Temporarily disabled
def recommend(req: RecommendRequest):
    prefs = parse_preferences(req.prompt)
    top_games = match_games(req.prompt, GAMES, max_results=req.max_results)
    explanations = explain_matches(req.prompt, top_games)

    return {
        "prompt": req.prompt,
        "preferences": prefs,
        "results": top_games,
        "explanations_raw": explanations
    }
