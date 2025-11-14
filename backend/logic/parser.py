from typing import Dict, Any
import json
from services.friendli_client import client

def parse_preferences(user_prompt: str) -> Dict[str, Any]:
    system_prompt = (
        "You are a game preference parser. "
        "Return ONLY valid JSON with the keys: preferred_genres, style_tags, avoid_tags."
    )

    raw = client.chat(system_prompt, user_prompt, temperature=0.1)

    try:
        prefs = json.loads(raw)
    except json.JSONDecodeError:
        prefs = {
            "preferred_genres": [],
            "style_tags": [],
            "avoid_tags": []
        }

    prefs.setdefault("preferred_genres", [])
    prefs.setdefault("style_tags", [])
    prefs.setdefault("avoid_tags", [])
    return prefs
