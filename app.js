const demoVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const clips = [
  { title: "A slower morning ☀️", user: "Mina Studio", category: "Lifestyle", likes: 48200, poster: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85", video: demoVideo },
  { title: "Lisbon in 30 seconds 🇵🇹", user: "Jonas Away", category: "Reisen", likes: 92800, poster: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=85", video: demoVideo },
  { title: "First light on the board", user: "Surf Note", category: "Sport", likes: 31400, poster: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=85", video: demoVideo },
  { title: "The table changed everything", user: "Studio Kind", category: "Design", likes: 18700, poster: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85", video: demoVideo },
  { title: "Pop-Momente: Taylor Swift", user: "Pop Radar · Fan-Edit", category: "Musik", likes: 126000, poster: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85", video: demoVideo, note: "Fan-Edit · kein offizieller Account" },
  { title: "Fußball-Momente: Lionel Messi", user: "Match Day · Fan-Edit", category: "Sport", likes: 204000, poster: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=85", video: demoVideo, note: "Fan-Edit · kein offizieller Account" },
  { title: "Style-Inspiration: Zendaya", user: "Style Watch · Fan-Edit", category: "Style", likes: 87500, poster: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85", video: demoVideo, note: "Fan-Edit · kein offizieller Account" }
];

const creators = [
  { name: "Mina Studio", handle: "@mina", color: "#8c9b64", initials: "MS" },
  { name: "Jonas Away", handle: "@jonastravel", color: "#e08b62", initials: "JA" },
  { name: "Pop Radar", handle: "Fan-Edits", color: "#dd4870", initials: "PR" },
  { name: "Match Day", handle: "Fan-Edits", color: "#647795", initials: "MD" },
  { name: "Style Watch", handle: "Fan-Edits", color: "#a175ac", initials: "SW" }
];

const feed = document.querySelector("#feed");
const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const formatCount = value => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : String(value);
const liked = new Set(JSON.parse(localStorage.getItem("clipzz-liked") || "[]"));
const saved = new Set(JSON.parse(localStorage.getItem("clipzz-saved") || "[]"));
let activeFeed = "Für dich";
let searchTerm = "";

function renderClips() {
  const filtered = clips.filter(clip => {
    const matchesSearch = `${clip.title} ${clip.category} ${clip.user}`.toLowerCase().includes(searchTerm);
    const matchesFollowing = activeFeed !== "Folge ich" || creators.some(creator => clip.user.toLowerCase().includes(creator.name.toLowerCase()));
    return matchesSearch && matchesFollowing;
  });
  feed.innerHTML = filtered.length ? filtered.map((clip, index) => {
    const id = esc(clip.id || clip.title);
    const count = clip.likes + (liked.has(id) ? 1 : 0);
    return `
      <article class="clip-card" data-clip="${id}">
        <div class="video-shell">
          <video src="${esc(clip.video || demoVideo)}" poster="${esc(clip.poster)}" loop muted playsinline preload="metadata" aria-label="${esc(clip.title)}"></video>
          <button class="video-toggle" type="button" aria-label="Video abspielen">▶</button>
          <div class="video-overlay">
            <h2>${esc(clip.title)}</h2>
            <p>@${esc(clip.user.replaceAll(" ", "").toLowerCase())} · ${esc(clip.category)}${clip.note ? ` · ${esc(clip.note)}` : ""}</p>
          </div>
        </div>
        <div class="clip-actions">
          <button class="action ${liked.has(id) ? "liked" : ""}" data-action="like" aria-label="Gefällt mir"><span class="action-round">♥</span><span>${formatCount(count)}</span></button>
          <button class="action" data-action="comment" aria-label="Kommentieren"><span class="action-round">▢</span><span>${clip.comments || 0}</span></button>
          <button class="action ${saved.has(id) ? "saved" : ""}" data-action="save" aria-label="Speichern"><span class="action-round">◆</span><span>${saved.has(id) ? "Gespeichert" : "Speichern"}</span></button>
          <button class="action" data-action="share" aria-label="Teilen"><span class="action-round">↗</span><span>Teilen</span></button>
        </div>
      </article>`;
  }).join("") : `<p class="empty-state">Keine Clips gefunden. Versuch einen anderen Suchbegriff.</p>`;
}

renderClips();
document.querySelector("#creatorList").innerHTML = creators.map(c => `
  <button class="creator" type="button" data-creator="${esc(c.name)}"><span class="creator-avatar" style="background:${esc(c.color)}">${esc(c.initials)}</span><span class="creator-info"><b>${esc(c.name)}</b><span>${esc(c.handle)}</span></span></button>
`).join("");

feed.addEventListener("click", async event => {
  const playButton = event.target.closest(".video-toggle");
  if (playButton) {
    const video = playButton.closest(".video-shell").querySelector("video");
    if (video.paused) { document.querySelectorAll(".video-shell video").forEach(other => { if (other !== video) other.pause(); }); await video.play().catch(() => {}); }
    else video.pause();
    playButton.textContent = video.paused ? "▶" : "Ⅱ";
    return;
  }
  const action = event.target.closest(".action");
  if (!action) return;
  const card = action.closest(".clip-card");
  const id = card.dataset.clip;
  if (action.dataset.action === "like") {
    liked.has(id) ? liked.delete(id) : liked.add(id);
    localStorage.setItem("clipzz-liked", JSON.stringify([...liked]));
    renderClips();
  } else if (action.dataset.action === "save") {
    saved.has(id) ? saved.delete(id) : saved.add(id);
    localStorage.setItem("clipzz-saved", JSON.stringify([...saved]));
    renderClips();
  } else if (action.dataset.action === "comment") {
    const comment = prompt("Schreib einen Kommentar:");
    if (comment?.trim()) { const clip = clips.find(item => (item.id || item.title) === id); clip.comments = (clip.comments || 0) + 1; alert("Kommentar hinzugefügt: " + comment.trim()); renderClips(); }
  } else if (action.dataset.action === "share") {
    try { await navigator.clipboard.writeText(location.href); alert("Link kopiert!"); }
    catch { prompt("Kopiere den Link:", location.href); }
  }
});
feed.addEventListener("play", event => { const button = event.target.closest("video")?.parentElement.querySelector(".video-toggle"); if (button) button.textContent = "Ⅱ"; }, true);
feed.addEventListener("pause", event => { const button = event.target.closest("video")?.parentElement.querySelector(".video-toggle"); if (button) button.textContent = "▶"; }, true);

document.querySelectorAll(".nav-link").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item === button));
  activeFeed = button.textContent.trim();
  renderClips();
}));
document.querySelectorAll(".side-link").forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  document.querySelectorAll(".side-link").forEach(item => item.classList.toggle("active", item === link));
  const label = link.textContent.trim();
  searchTerm = label === "Entdecken" ? "" : label === "Gespeichert" ? "" : "";
  if (label === "Gespeichert") {
    const previous = activeFeed; activeFeed = "Gespeichert"; renderClips(); activeFeed = previous;
  } else renderClips();
}));
document.querySelector("#creatorList").addEventListener("click", event => {
  const button = event.target.closest("[data-creator]");
  if (!button) return;
  document.querySelector("#searchInput").value = button.dataset.creator;
  searchTerm = button.dataset.creator.toLowerCase();
  activeFeed = "Für dich";
  document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item.textContent.trim() === activeFeed));
  renderClips();
});

const searchPanel = document.querySelector("#searchPanel");
document.querySelector(".search-button").addEventListener("click", () => { searchPanel.classList.add("open"); searchPanel.setAttribute("aria-hidden", "false"); document.querySelector("#searchInput").focus(); });
document.querySelector("#closeSearch").addEventListener("click", () => { searchPanel.classList.remove("open"); searchPanel.setAttribute("aria-hidden", "true"); });
document.querySelector("#searchInput").addEventListener("input", event => { searchTerm = event.target.value.trim().toLowerCase(); renderClips(); });
document.querySelector("#searchResults").textContent = "Beliebte Themen: Reisen, Musik, Design, Promis";

const dialog = document.querySelector("#uploadDialog");
document.querySelector("#openUpload").addEventListener("click", () => dialog.showModal());
document.querySelector("#uploadForm").addEventListener("submit", event => {
  event.preventDefault();
  const titleInput = document.querySelector("#uploadTitle");
  const fileInput = document.querySelector('#uploadForm input[type="file"]');
  const file = fileInput.files[0];
  const title = titleInput.value.trim();
  if (!file || !title) { alert("Bitte wähle ein Video und gib einen Titel ein."); return; }
  const clip = { id: `upload-${Date.now()}`, title, user: "Meine Community", category: "Neu", likes: 0, comments: 0, poster: "", video: URL.createObjectURL(file) };
  clips.unshift(clip);
  activeFeed = "Für dich"; searchTerm = "";
  document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item.textContent.trim() === activeFeed));
  renderClips();
  dialog.close();
  document.querySelector("#uploadForm").reset();
  feed.scrollIntoView({ behavior: "smooth" });
});
