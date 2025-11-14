const API_BASE = "http://127.0.0.1:8000";

const moodInput = document.getElementById("mood-input");
const matchBtn = document.getElementById("match-btn");
const statusEl = document.getElementById("status");
const curatorEl = document.getElementById("curator");
const resultsEl = document.getElementById("results");
const explanationsEl = document.getElementById("explanations");
const chips = document.querySelectorAll(".chip");

/**
 * Short, friendly curator lines.
 * {word} will be replaced with a vibe word inferred from genres/tags.
 */
const CURATOR_LINES = {
  horror: [
    "Nice pick. These {word} games are spooky without being scream-y.",
    "Soft scares, strong stories. These {word} gems should land well."
  ],
  cozy: [
    "Wholesome mood detected. These {word} picks are perfect after a long day.",
    "Comfort games unlocked. These {word} titles are all tea-and-blanket energy."
  ],
  scifi: [
    "Dialing in strange {word} worlds instead of loud space marines.",
    "Good sci-fi taste. These {word} stories keep things weird in a good way."
  ],
  rpg: [
    "RPG brain activated. These {word} games are deep but not 200-hour grinds.",
    "You like building characters. These {word} picks let you tinker without burnout."
  ],
  narrative: [
    "Story gamer spotted. These {word} games are basically interactive midnight podcasts.",
    "Less grind, more feelings. These {word} tales lean hard on narrative."
  ],
  default: [
    "Good taste. Here's a small {word} playlist pulled from the underrated pile.",
    "Solid vibe. These {word} games deserve way more love than they get."
  ]
};

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    moodInput.value = chip.dataset.prompt;
  });
});

matchBtn.addEventListener("click", async () => {
  const prompt = moodInput.value.trim();
  if (!prompt) {
    statusEl.textContent = "Tell me a vibe or tap a preset chip above.";
    curatorEl.textContent = "";
    return;
  }

  statusEl.textContent = "Searching for hidden gems…";
  curatorEl.textContent = "";
  resultsEl.innerHTML = "";
  explanationsEl.textContent = "";

  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, max_results: 3 }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    renderResults(data);
    statusEl.textContent = "Found a few matches for your vibe:";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "I couldn't reach the backend. Make sure the server is running on port 8000.";
    curatorEl.textContent = "";
  }
});

function renderResults(data) {
  const { results = [], explanations_raw = "" } = data;

  if (!results.length) {
    resultsEl.innerHTML =
      '<p style="color:#a5b0d8;font-size:0.9rem;">No matches yet – try describing a different vibe or be less specific.</p>';
    curatorEl.textContent = "";
    return;
  }

  // Try to split explanations_raw into lines per game
  const lines = explanations_raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  resultsEl.innerHTML = "";

  results.forEach((game, idx) => {
    const whyText = lines[idx] || "";
    const quote = game.player_quote || "";
    const emoji = pickEmojiForGame(game);

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
      <div class="card-content">
        <div class="card-title-row">
          <h3 class="card-title">${emoji} ${game.title}</h3>
          <span class="pill">Hidden Gem</span>
        </div>
        <div class="card-genres">${(game.genres || []).join(" • ")}</div>
        <p class="card-desc">${game.description}</p>
        ${
          quote
            ? `<p class="card-quote">"${quote}"</p>`
            : ""
        }
        ${
          whyText
            ? `<p class="card-why">${whyText}</p>`
            : ""
        }
      </div>
    `;
    resultsEl.appendChild(card);
  });

  if (lines.length && results.length > 0) {
    explanationsEl.textContent = explanations_raw;
  } else {
    explanationsEl.textContent = "";
  }

  // Curator line based on genres/tags
  const vibeWord = inferVibeWordFromResults(results);
  const curatorLine = pickCuratorLine(vibeWord);
  curatorEl.textContent = curatorLine;
}

/**
 * Infer a simple vibe word from the genres/tags of the results.
 */
function inferVibeWordFromResults(results) {
  const bucketCounts = {
    horror: 0,
    cozy: 0,
    scifi: 0,
    rpg: 0,
    narrative: 0,
  };

  for (const g of results) {
    const genres = (g.genres || []).join(" ").toLowerCase();
    const tags = (g.tags || []).join(" ").toLowerCase();

    const text = `${genres} ${tags}`;

    if (text.includes("horror")) bucketCounts.horror += 1;
    if (text.includes("cozy") || text.includes("wholesome")) bucketCounts.cozy += 1;
    if (text.includes("sci") || text.includes("space")) bucketCounts.scifi += 1;
    if (text.includes("rpg")) bucketCounts.rpg += 1;
    if (text.includes("narrative") || text.includes("adventure")) bucketCounts.narrative += 1;
  }

  // Pick the bucket with the highest count
  let bestBucket = "default";
  let bestScore = 0;
  for (const [bucket, count] of Object.entries(bucketCounts)) {
    if (count > bestScore) {
      bestScore = count;
      bestBucket = bucket;
    }
  }

  // Map buckets to a fun display word
  const bucketToWord = {
    horror: "cozy horror",
    cozy: "cozy narrative",
    scifi: "weird sci-fi",
    rpg: "indie RPG",
    narrative: "story-driven",
    default: "good-taste",
  };

  return bucketToWord[bestBucket] || "good-taste";
}

/**
 * Pick a curator line template based on the vibe word, then fill {word}.
 */
function pickCuratorLine(vibeWord) {
  const vw = (vibeWord || "").toLowerCase();
  let bucket = "default";

  if (vw.includes("horror")) bucket = "horror";
  else if (vw.includes("cozy")) bucket = "cozy";
  else if (vw.includes("sci")) bucket = "scifi";
  else if (vw.includes("rpg")) bucket = "rpg";
  else if (vw.includes("story") || vw.includes("narrative")) bucket = "narrative";

  const options = CURATOR_LINES[bucket] || CURATOR_LINES.default;
  const template =
    options[Math.floor(Math.random() * options.length)] || CURATOR_LINES.default[0];

  return template.replace("{word}", vibeWord || "good-taste");
}

/**
 * Choose an emoji for the card based on its genres/tags.
 */
function pickEmojiForGame(game) {
  const genres = (game.genres || []).join(" ").toLowerCase();
  const tags = (game.tags || []).join(" ").toLowerCase();
  const text = `${genres} ${tags}`;

  if (text.includes("horror")) return "👻";
  if (text.includes("cozy") || text.includes("wholesome")) return "🧡";
  if (text.includes("sci") || text.includes("space")) return "🛰️";
  if (text.includes("rpg")) return "🧙‍♂️";
  if (text.includes("puzzle") || text.includes("mystery")) return "🧩";
  if (text.includes("platformer")) return "🕹️";
  if (text.includes("adventure") || text.includes("narrative")) return "📖";

  return "🎮";
}
