from typing import List, Dict, Any
import math

def score_game(game: Dict[str, Any], prefs: Dict[str, Any], user_prompt: str) -> float:
    preferred_genres = [g.lower() for g in prefs.get("preferred_genres", [])]
    style_tags = [t.lower() for t in prefs.get("style_tags", [])]
    avoid_tags = [t.lower() for t in prefs.get("avoid_tags", [])]
    score = 0.0

    for pg in preferred_genres:
        if any(pg in g.lower() for g in game["genres"]):
            score += 2.0

    for st in style_tags:
        if any(st in t.lower() for t in game["tags"]):
            score += 1.0

    for at in avoid_tags:
        if any(at in t.lower() for t in game["tags"]):
            score -= 2.0

    user_words = [w.lower() for w in user_prompt.split() if len(w) > 3]
    desc = game["description"].lower()
    keyword_hits = sum(1 for w in user_words if w in desc)
    score += min(keyword_hits * 0.3, 2.0)

    return score

def select_top_games(
    games: List[Dict[str, Any]],
    prefs: Dict[str, Any],
    user_prompt: str,
    max_results: int = 3
) -> List[Dict[str, Any]]:
    scored = [(score_game(g, prefs, user_prompt), g) for g in games]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [g for (s, g) in scored[:max_results]]
