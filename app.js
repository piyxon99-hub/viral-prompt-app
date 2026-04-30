const prompts = [
  {
    id: "pov-shift",
    title: "POV transformation hook",
    platform: "TikTok",
    format: "POV",
    category: "lifestyle",
    lift: 48,
    prompt:
      "Write a 20-second POV video script for [niche] that starts with: 'POV: you finally stopped doing the thing everyone told you to do.' End with one surprising lesson and a soft call to comment."
  },
  {
    id: "carousel-myth",
    title: "Myth vs truth carousel",
    platform: "Instagram",
    format: "Carousel",
    category: "business",
    lift: 39,
    prompt:
      "Create a 7-slide Instagram carousel for [topic]. Slide 1 should challenge a popular myth. Slides 2-6 reveal the real explanation with plain language examples. Slide 7 asks the audience to save it."
  },
  {
    id: "ai-workflow",
    title: "AI workflow reveal",
    platform: "YouTube",
    format: "Short",
    category: "business",
    lift: 55,
    prompt:
      "Draft a YouTube Shorts script showing how [audience] can use AI to complete [task] in under 10 minutes. Include a fast before-after, 3 screen-recording beats, and a closing line that invites viewers to try it today."
  },
  {
    id: "x-thread",
    title: "Contrarian thread starter",
    platform: "X",
    format: "Thread",
    category: "entertainment",
    lift: 34,
    prompt:
      "Write a 9-post X thread about why the common advice on [topic] is incomplete. Start with a bold one-line claim, support it with 3 examples, and end with a practical checklist."
  },
  {
    id: "zero-budget",
    title: "Zero-budget experiment",
    platform: "TikTok",
    format: "Challenge",
    category: "food",
    lift: 45,
    prompt:
      "Design a 5-day zero-budget challenge for [niche]. Each day should have one simple action, one measurable result, and one sentence that makes viewers want to follow for the next update."
  },
  {
    id: "behind-scenes",
    title: "Behind-the-scenes breakdown",
    platform: "Instagram",
    format: "Reel",
    category: "nature",
    lift: 41,
    prompt:
      "Write an Instagram Reel script that reveals the behind-the-scenes process of creating [result]. Use quick cuts, captions under 7 words, and a final line that makes the process feel achievable."
  },
  {
    id: "before-after",
    title: "Before-after proof story",
    platform: "YouTube",
    format: "Short",
    category: "travel",
    lift: 46,
    prompt:
      "Create a before-after story script for [audience] trying to improve [goal]. Open with the frustrating before state, show 3 changes, then close with the after state in one vivid sentence."
  },
  {
    id: "hot-take",
    title: "Helpful hot take",
    platform: "X",
    format: "Post",
    category: "entertainment",
    lift: 29,
    prompt:
      "Write 5 concise hot-take posts about [topic]. Each one should feel useful, not inflammatory: name the bad assumption, explain the better frame, and include one actionable next step."
  }
];

const state = {
  platform: "All",
  query: "",
  view: "discover",
  saved: new Set(JSON.parse(localStorage.getItem("savedPrompts") || "[]"))
};

const promptList = document.querySelector("#promptList");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#searchInput");
const toast = document.querySelector("#toast");
const avgLift = document.querySelector("#avgLift");
const radarStatus = document.querySelector("#radarStatus");
const briefSheet = document.querySelector("#briefForm");

function getVisiblePrompts() {
  return prompts.filter((item) => {
    const matchesPlatform = state.platform === "All" || item.platform === state.platform;
    const text = `${item.title} ${item.platform} ${item.format} ${item.category} ${item.prompt}`.toLowerCase();
    const matchesQuery = text.includes(state.query.toLowerCase());
    const matchesView = state.view !== "saved" || state.saved.has(item.id);
    return matchesPlatform && matchesQuery && matchesView;
  });
}

function renderPrompts() {
  const visible = getVisiblePrompts();
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? "prompt" : "prompts"}`;
  radarStatus.textContent = `${visible.length} active`;

  if (!visible.length) {
    promptList.innerHTML = `<div class="empty-state">No prompts match this choice yet. Try another category or search.</div>`;
    updateStats([]);
    return;
  }

  promptList.innerHTML = visible
    .map((item) => {
      const saved = state.saved.has(item.id);
      return `
        <article class="prompt-card">
          <h3>${item.title}</h3>
          <div class="prompt-meta">
            <span>${item.platform}</span>
            <span>${item.format}</span>
            <span>+${item.lift}% signal</span>
          </div>
          <p>${item.prompt}</p>
          <div class="prompt-actions">
            <button class="icon-button ${saved ? "active" : ""}" type="button" data-save="${item.id}">${saved ? "Saved" : "Save"}</button>
            <button class="icon-button" type="button" data-copy="${item.id}">Copy</button>
          </div>
        </article>
      `;
    })
    .join("");

  updateStats(visible);
}

function updateStats(items) {
  if (!items.length) {
    avgLift.textContent = "0%";
    return;
  }

  const avg = Math.round(items.reduce((sum, item) => sum + item.lift, 0) / items.length);
  avgLift.textContent = `${avg}%`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function saveState() {
  localStorage.setItem("savedPrompts", JSON.stringify([...state.saved]));
}

function setPlatform(platform) {
  state.platform = platform;
  document.querySelectorAll("[data-platform]").forEach((item) => {
    item.classList.toggle("active", item.dataset.platform === platform);
  });
  state.view = "discover";
  setBriefVisible(false);
  renderPrompts();
}

function setBriefVisible(visible) {
  briefSheet.classList.toggle("visible", visible);
  document.querySelector(".prompt-panel").style.display = visible ? "none" : "block";
  document.querySelectorAll("[data-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === (visible ? "brief" : state.view));
  });
}

document.querySelectorAll("[data-platform]").forEach((button) => {
  button.addEventListener("click", () => setPlatform(button.dataset.platform));
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    state.query = button.dataset.query;
    searchInput.value = button.dataset.query;
    state.view = "discover";
    setBriefVisible(false);
    renderPrompts();
    document.querySelector(".prompt-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    if (state.view === "brief") {
      setBriefVisible(true);
      briefSheet.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBriefVisible(false);
    renderPrompts();
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.view = "discover";
  setBriefVisible(false);
  renderPrompts();
});

promptList.addEventListener("click", async (event) => {
  const saveButton = event.target.closest("[data-save]");
  const copyButton = event.target.closest("[data-copy]");

  if (saveButton) {
    const id = saveButton.dataset.save;
    if (state.saved.has(id)) {
      state.saved.delete(id);
      showToast("Removed from saved prompts");
    } else {
      state.saved.add(id);
      showToast("Saved prompt");
    }
    saveState();
    renderPrompts();
  }

  if (copyButton) {
    const item = prompts.find((prompt) => prompt.id === copyButton.dataset.copy);
    await copyText(item.prompt);
    showToast("Prompt copied");
  }
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
}

document.querySelector("#briefForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const niche = document.querySelector("#nicheInput").value.trim() || "your niche";
  const mood = document.querySelector("#moodInput").value;
  const strongest = [...prompts].sort((a, b) => b.lift - a.lift).slice(0, 3);
  document.querySelector("#briefOutput").textContent =
    `For ${niche}, start with ${strongest[0].format.toLowerCase()} content for ${mood}. Use "${strongest[0].title}" first, repurpose it for ${strongest[1].platform}, then close with a ${strongest[2].format.toLowerCase()} that asks viewers to share their result.`;
});

document.querySelector("#refreshBtn").addEventListener("click", () => {
  prompts.forEach((item) => {
    item.lift = Math.max(24, Math.min(62, item.lift + Math.round(Math.random() * 8 - 3)));
  });
  renderPrompts();
  showToast("Trend signals refreshed");
});

renderPrompts();
