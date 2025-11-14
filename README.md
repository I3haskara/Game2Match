# 🎮 Game2Match

An intelligent game recommendation system that uses FriendliAI to match users with their perfect games based on natural language preferences.

## 📋 Project Overview

Game2Match combines the power of FriendliAI's language models with a curated game database to provide personalized game recommendations. Users describe what they're looking for in natural language, and the system returns ranked matches with explanations.

## 🏗️ Project Structure

```
Game2Match/
│
├── backend/
│   ├── app.py                     # FastAPI backend entry
│   │
│   ├── logic/                     # Core logic modules
│   │   ├── parser.py              # FriendliAI: parse user preferences
│   │   ├── matcher.py             # Local game scoring & ranking
│   │   ├── explainer.py           # FriendliAI: explain matches
│   │   └── loader.py              # Load games.csv into memory
│   │
│   ├── services/                  # External service integrations
│   │   └── friendli_client.py     # FriendliAI API wrapper
│   │
│   ├── data/
│   │   └── games.csv              # Your curated dataset
│   │
│   ├── .env                       # FRIENDLI_API_KEY goes here
│   ├── requirements.txt           # Backend dependencies
│   └── README.md                  # Backend notes/instructions
│
├── frontend/
│   ├── index.html                 # UI input + game results
│   ├── styles.css                 # Styling
│   ├── app.js                     # Calls backend /recommend endpoint
│   └── assets/                    # logos/icons (optional)
│
└── README.md                      # Main project instructions (this file)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- FriendliAI API key
- Modern web browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your environment:
   - Edit `.env` file and add your FriendliAI API key:
   ```
   FRIENDLI_API_KEY=your_actual_api_key_here
   ```

4. Start the FastAPI server:
```bash
uvicorn app:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in your web browser, or serve it using a simple HTTP server:
```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`

## 📊 How It Works

1. **User Input**: Users describe their game preferences in natural language
2. **Parse Preferences**: FriendliAI extracts structured preferences from the input
3. **Match & Rank**: Local algorithm scores and ranks games from the database
4. **Explain Matches**: FriendliAI generates explanations for why each game matches
5. **Display Results**: Frontend shows ranked games with explanations

## 🛠️ Features

- Natural language preference parsing
- Intelligent game matching and ranking
- AI-generated match explanations
- Clean, responsive UI
- RESTful API design

## 📝 API Endpoints

- `GET /` - Health check
- `POST /recommend` - Get game recommendations
  - Request body: `{ "preferences": "user description" }`
  - Response: `{ "recommendations": [...] }`

## 🎯 Next Steps

- [ ] Implement FriendliAI integration in `parser.py` and `explainer.py`
- [ ] Complete scoring algorithm in `matcher.py`
- [ ] Expand `games.csv` with more games
- [ ] Add filtering options (platform, genre, etc.)
- [ ] Implement user ratings and feedback
- [ ] Add game images and trailers

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.
