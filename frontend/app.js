const API_BASE = "http://127.0.0.1:8000";

const moodInput = document.getElementById("mood-input");
const matchBtn = document.getElementById("match-btn");
const statusEl = document.getElementById("status");
const curatorEl = document.getElementById("curator");
const resultsEl = document.getElementById("results");
const explanationsEl = document.getElementById("explanations");
const chips = document.querySelectorAll(".chip");

/**
 * Curator phrases keyed loosely by vibe / genre.
 * {word} will be replaced with a vibe word inferred from genres/tags.
 */
const CURATOR_LINES = {
  horror: [
    "Ohhh, a {word} seeker. Respect – let me dig past the usual jump-scare junk.",
    "Your taste screams cozy creep-core. These {word} picks should hit just right.",
    "Spooky but soft? I got you. These {word} games are criminally under-talked about."
  ],
  cozy: [
    "Big comfy vibes. These {word} games feel like a warm blanket and a good playlist.",
    "Love that chill taste. Here's a batch of {word} gems you can sink into after a long day.",
    "You radiate wholesome energy. These {word} picks are very 'self-care but with pixels'."
  ],
  scifi: [
    "Sci-fi brain detected. Let's lean into the weird with these {word} stories.",
    "You're not here for space marines, you're here for strange little {word} worlds.",
    "Dialing in some offbeat {word} science fiction from the backlog multiverse."
  ],
  rpg: [
    "You have main-character energy. These {word} picks should scratch that build-craft itch.",
    "Okay, RPG enjoyer, I see you. Serving up {word} games people should talk about way more.",
    "Big stat-brain vibes. These {word} titles are secretly goated."
  ],
  narrative: [
    "Story gamer spotted. These {word} games are basically interactive midnight podcasts.",
    "You want feelings, not fetch quests. Here's a stack of {word} tales.",
    "Dialogue > DPS. These {word} picks are heavy on vibes and writing."
  ],
  default: [
    "Nice prompt. I rummaged through the weird corner of the library for these {word} vibes.",
    "Certified good taste detected. Here's a little {word} playlist from the backlog multiverse.",
    "You ask for cool things. These {word} games deserve way more love than they get."
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
    statusEl.textContent = "Type a vibe or click a preset chip first.";
    curatorEl.textContent = "";
    return;
  }

  statusEl.textContent = "Summoning hidden gems from the backlog multiverse… ✨";
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
    statusEl.textContent = "Here's your curated batch of underrated picks:";
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Something broke talking to the backend. Is the server running on port 8000?";
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
    const card = document.createElement("article");
    card.className = "card";

    const quote = game.player_quote || "";

    card.innerHTML = `
      <div class="card-content">
        <div class="card-title-row">
          <h3 class="card-title">${game.title}</h3>
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
 * Pick a curator line template based on the vibe word,
 * then fill in {word}.
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
  const template = options[Math.floor(Math.random() * options.length)] || CURATOR_LINES.default[0];

  return template.replace("{word}", vibeWord || "good-taste");
}
