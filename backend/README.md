# Game2Match Backend

Run server:
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

Test:
curl -X POST "http://localhost:8000/recommend" \
-H "Content-Type: application/json" \
-d '{"prompt": "I want a cozy horror game", "max_results": 3}'
