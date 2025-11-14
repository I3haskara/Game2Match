import csv
from pathlib import Path
from typing import List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "games.csv"

def load_games() -> List[Dict[str, Any]]:
    games: List[Dict[str, Any]] = []
    with DATA_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            genres = [g.strip() for g in row["genres"].split(";") if g.strip()]
            tags = [t.strip() for t in row["tags"].split(";") if t.strip()]
            games.append(
                {
                    "title": row["title"],
                    "description": row["description"],
                    "genres": genres,
                    "tags": tags,
                }
            )
    return games
