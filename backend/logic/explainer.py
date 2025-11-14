from typing import List, Dict, Any
from services.friendli_client import client

def build_games_block(games: List[Dict[str, Any]]) -> str:
    lines = []
    for i, g in enumerate(games, start=1):
        lines.append(
            f"{i}. {g['title']} | Genres: {', '.join(g['genres'])} | "
            f"Tags: {', '.join(g['tags'])} | Description: {g['description']}"
        )
    return "\n".join(lines)

def explain_matches(user_prompt: str, games: List[Dict[str, Any]]) -> str:
    games_block = build_games_block(games)

    system_prompt = (
        "You are a friendly game recommender. "
        "Explain in 1–2 sentences why each game fits the user's described mood. "
        "Return a numbered list."
    )

    user_p = (
        f"User prompt:\n{user_prompt}\n\n"
        f"Games:\n{games_block}\n\n"
        "Explain why each game matches."
    )

    return client.chat(system_prompt, user_p, temperature=0.4)
