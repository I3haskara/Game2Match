import random
from typing import List, Dict


def _tokenize(text: str) -> set:
    return set(
        t.strip(".,!?;:()[]\"'").lower()
        for t in text.split()
        if t.strip()
    )


def score_game(prompt_tokens: set, game: Dict) -> float:
    """
    Score a single game based on:
    - overlap between prompt tokens and description/genres/tags
    - hidden_gem flag
    - lower popularity -> higher score
    - plus a small random jitter so we get mix & match results
    """
    desc = (game.get("description") or "").lower()
    genres = ";".join(game.get("genres", []))
    tags = ";".join(game.get("tags", []))

    text = " ".join([desc, genres, tags]).lower()
    game_tokens = _tokenize(text)

    # basic overlap score
    overlap = len(prompt_tokens.intersection(game_tokens))

    # hidden gem bonus
    hidden = str(game.get("hidden_gem", "")).lower() == "yes"
    hidden_bonus = 2.0 if hidden else 0.0

    # popularity penalty (0–100; lower is better)
    try:
        popularity = float(game.get("popularity", 50))
    except ValueError:
        popularity = 50.0
    pop_norm = min(max(popularity / 100.0, 0.0), 1.0)
    pop_penalty = pop_norm  # subtract this later

    # random jitter so each search mixes results a bit
    jitter = random.uniform(-0.7, 0.7)

    score = overlap + hidden_bonus - pop_penalty + jitter
    return score


def match_games(prompt: str, games: List[Dict], max_results: int = 3) -> List[Dict]:
    """
    Main entry point used by /recommend.

    - If the prompt is empty: just return random hidden gems.
    - Otherwise: compute a relevance score + random jitter
      so each click feels like a fresh mix & match.
    """
    if not games:
        return []

    # No prompt → pure random hidden gems
    if not prompt or not prompt.strip():
        hidden = [g for g in games if str(g.get("hidden_gem", "")).lower() == "yes"]
        pool = hidden or games
        return random.sample(pool, k=min(max_results, len(pool)))

    prompt_tokens = _tokenize(prompt)

    # Score each game
    scored = []
    for g in games:
        s = score_game(prompt_tokens, g)
        scored.append((s, g))

    # Sort by score (highest first) then take top N
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [g for _, g in scored[:max_results]]

    return top
