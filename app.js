const clips = [
  { title: "A slower morning", user: "Mina Studio", category: "Lifestyle", likes: "48.2K", poster: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85" },
  { title: "Lisbon in 30 seconds", user: "Jonas Away", category: "Reisen", likes: "92.8K", poster: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=85" },
  { title: "First light on the board", user: "Surf Note", category: "Sport", likes: "31.4K", poster: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=85" },
  { title: "The table changed everything", user: "Studio Kind", category: "Design", likes: "18.7K", poster: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85" }
];

const creators = [
  { name: "Mina Studio", handle: "@mina", color: "#8c9b64", initials: "MS" },
  { name: "Jonas Away", handle: "@jonastravel", color: "#e08b62", initials: "JA" },
  { name: "The Beat Lab", handle: "@beatlab", color: "#647795", initials: "BL" }
];

const feed = document.querySelector("#feed");

function renderClips(items) {
  feed.innerHTML = items.map((clip, index) => `
    <article class="clip-card" data-category="${clip.category}">
      <div class="video-shell">
        <video poster="${clip.poster}" loop muted playsinline preload="metadata"></video>
        <div class="video-overlay">
          <h2>${clip.title}</h2>
          <p>@${clip.user.replaceAll(" ", "").toLowerCase()} · ${clip.category}</p>
        </div>
      </div>
      <div class="clip-actions">
        <button class="action" data-action="like" aria-label="Gefällt mir"><span class="action-round">♥</span><span>${clip.likes}</span></button>
        <button class="action" data-action="comment" aria-label="Kommentare"><span class="action-round">◯</span><span>${Math.max(200, 1200 - index * 137)}</span></button>
        <button class="action" data-action="save" aria-label="Speichern"><span class="action-round">◆</span><span>Speichern</span></button>
        <button class="action" data-action="share" aria-label="Teilen"><span class="action-round">↗</span><span>Teilen</span></button>
      </div>
    </article>
  `).join("");
}

renderClips(clips);

document.querySelector("#creatorList").innerHTML = creators.map(c => `
  <div class="creator"><div class="creator-avatar" style="background:${c.color}">${c.initials}</div><div class="creator-info"><b>${c.name}</b><span>${c.handle}</span></div></div>
`).join("");

feed.addEventListener("click", event => {
  const action = event.target.closest(".action");
  if (!action) return;
  const type = action.dataset.action;
  if (type === "like" || type === "save") action.classList.toggle(type === "like" ? "liked" : "saved");
  if (type === "comment") alert("Kommentare sind in dieser Demo-Vorschau verfügbar.");
  if (type === "share") navigator.clipboard?.writeText(location.href);
});

const searchPanel = document.querySelector("#searchPanel");
document.querySelector(".search-button").addEventListener("click", () => {
  searchPanel.classList.add("open");
  searchPanel.setAttribute("aria-hidden", "false");
  document.querySelector("#searchInput").focus();
});
document.querySelector("#closeSearch").addEventListener("click", () => {
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
});

document.querySelector("#searchInput").addEventListener("input", event => {
  const term = event.target.value.trim().toLowerCase();
  if (!term) { document.querySelector("#searchResults").textContent = "Beliebte Themen: Reisen, Musik, Design"; return; }
  const matches = clips.filter(c => `${c.title} ${c.category} ${c.user}`.toLowerCase().includes(term));
  document.querySelector("#searchResults").textContent = matches.length ? matches.map(c => c.title).join(" · ") : "Keine Treffer gefunden";
});

document.querySelector("#searchResults").textContent = "Beliebte Themen: Reisen, Musik, Design";

const dialog = document.querySelector("#uploadDialog");
document.querySelector("#openUpload").addEventListener("click", () => dialog.showModal());
document.querySelector("#publishButton").addEventListener("click", event => {
  event.preventEvent?.();
  event.preventDefault();
  const title = document.querySelector("#uploadTitle").value.trim();
  if (title) {
    clips.unshift({ title, user: "Meine Community", category: "Neu", likes: "0", poster: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85" });
    renderClips(clips);
  }
  dialog.close();
});
