import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

FRIENDLI_API_KEY = os.getenv("FRIENDLI_API_KEY")

BASE_URL = "https://api.friendli.ai/serverless/v1/chat/completions"
DEFAULT_MODEL = "meta-llama-3.1-8b-instruct"

class FriendliClient:
    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        self.api_key = api_key or FRIENDLI_API_KEY
        self.base_url = base_url or BASE_URL
        if not self.api_key:
            raise ValueError("FRIENDLI_API_KEY is not set in environment or .env")

    def chat(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }

        resp = requests.post(self.base_url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

client = FriendliClient()
