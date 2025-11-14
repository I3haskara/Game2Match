from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

from logic.loader import load_games
from logic.parser import parse_preferences
from logic.matcher import select_top_games
from logic.explainer import explain_matches

app = FastAPI(title="Game2Match - AI Game Recommender")

GAMES: List[Dict[str, Any]] = load_games()

class RecommendRequest(BaseModel):
    prompt: str
    max_results: int = 3

@app.get("/health")
def health():
    return {"status": "ok", "games_loaded": len(GAMES)}

@app.post("/recommend")
def recommend(req: RecommendRequest):
    prefs = parse_preferences(req.prompt)
    top_games = select_top_games(GAMES, prefs, req.prompt, req.max_results)
    explanations = explain_matches(req.prompt, top_games)

    return {
        "prompt": req.prompt,
        "preferences": prefs,
        "results": top_games,
        "explanations_raw": explanations
    }
