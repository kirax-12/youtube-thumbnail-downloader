"use strict";

const form = document.getElementById("thumb-form");
const urlInput = document.getElementById("input-url");
const pasteButton = document.getElementById("paste-button");
const errorBox = document.getElementById("error-box");
const resultSection = document.getElementById("result");
const videoIdEl = document.getElementById("video-id");
const watchLink = document.getElementById("watch-link");
const thumbGrid = document.getElementById("thumb-grid");

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// Urutan dari yang paling besar. `width` dipakai buat deteksi placeholder:
// thumbnail yang gak ada bakal diganti YouTube dengan gambar 120x90.
const RESOLUTIONS = [
  { file: "maxresdefault", name: "HD Penuh", size: "1280 × 720", width: 1280, featured: true },
  { file: "sddefault", name: "SD", size: "640 × 480", width: 640, featured: false },
  { file: "hqdefault", name: "HQ", size: "480 × 360", width: 480, featured: false },
  { file: "mqdefault", name: "MQ", size: "320 × 180", width: 320, featured: false },
  { file: "default", name: "Kecil", size: "120 × 90", width: 120, featured: false },
];

function extractVideoId(raw) {
  const text = (raw || "").trim();
  if (!text) return null;
  if (ID_PATTERN.test(text)) return text;

  let parsed = null;
  try {
    parsed = new URL(text);
  } catch {
    try {
      parsed = new URL("https://" + text);
    } catch {
      return null;
    }
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const segments = parsed.pathname.split("/").filter(Boolean);
  let candidate = null;

  if (host === "youtu.be") {
    candidate = segments[0] || null;
  } else if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) {
    const first = segments[0] || "";
    if (first === "watch") {
      candidate = parsed.searchParams.get("v");
    } else if (first === "shorts" || first === "embed" || first === "live" || first === "v") {
      candidate = segments[1] || null;
    }
  }

  return candidate && ID_PATTERN.test(candidate) ? candidate : null;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

async function downloadImage(url, filename, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Lagi ngunduh…";
  try {
    const response = await fetch(url, { method: "GET", mode: "cors" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
    button.textContent = "Keunduh ✓";
  } catch {
    // Fallback: buka gambarnya di tab baru, user bisa simpan manual.
    window.open(url, "_blank", "noopener");
    button.textContent = "Dibuka di tab baru ↗";
  } finally {
    setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 1600);
  }
}

function buildCard(res, videoId) {
  const url = "https://i.ytimg.com/vi/" + videoId + "/" + res.file + ".jpg";

  const card = document.createElement("article");
  card.className = "thumb-card" + (res.featured ? " featured" : "");

  const img = document.createElement("img");
  img.alt = "Thumbnail YouTube ukuran " + res.size + " (" + res.file + ")";
  img.loading = "lazy";

  const info = document.createElement("div");
  info.className = "thumb-info";
  const name = document.createElement("p");
  name.className = "thumb-name";
  name.textContent = res.name;
  const size = document.createElement("span");
  size.className = "thumb-size";
  size.textContent = res.size;
  info.appendChild(name);
  info.appendChild(size);

  const status = document.createElement("p");
  status.className = "thumb-status";
  status.textContent = "Memeriksa…";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn dl-thumb-btn";
  button.textContent = "Download JPG →";
  button.disabled = true;
  button.addEventListener("click", () => {
    downloadImage(url, "youtube-" + videoId + "-" + res.file + ".jpg", button);
  });

  function markUnavailable() {
    card.classList.add("unavailable");
    status.textContent = "Tidak tersedia untuk video ini";
    button.disabled = true;
    button.textContent = "Gak ada ukuran ini";
  }

  img.addEventListener("load", () => {
    // Thumbnail yang gak tersedia diganti YouTube dengan placeholder 120x90.
    // Jadi kalau resolusi besar tapi yang datang cuma 120px, anggap gak ada.
    if (res.width > 120 && img.naturalWidth <= 120) {
      markUnavailable();
      return;
    }
    status.textContent = "Siap diunduh · " + img.naturalWidth + " × " + img.naturalHeight + " px";
    button.disabled = false;
  });
  img.addEventListener("error", markUnavailable);
  img.src = url;

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(status);
  card.appendChild(button);
  return card;
}

function renderThumbs(videoId) {
  videoIdEl.textContent = videoId;
  watchLink.href = "https://www.youtube.com/watch?v=" + videoId;
  thumbGrid.textContent = "";
  RESOLUTIONS.forEach((res) => {
    thumbGrid.appendChild(buildCard(res, videoId));
  });
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

pasteButton.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      urlInput.value = text.trim();
      hideError();
      urlInput.focus();
    } else {
      showError("Clipboard-nya kosong. Salin dulu link YouTube-nya, baru tekan Tempel lagi.");
    }
  } catch {
    showError("Browser belum ngasih izin baca clipboard. Paste manual aja: tahan kolom link-nya lalu pilih Tempel.");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hideError();

  const videoId = extractVideoId(urlInput.value);
  if (!videoId) {
    resultSection.hidden = true;
    showError("Link-nya gak kebaca. Pakai link video YouTube yang bener, contohnya: https://www.youtube.com/watch?v=dQw4w9WgXcQ — atau tempel ID video-nya aja (11 karakter). Link Shorts, youtu.be, embed, dan live juga bisa.");
    urlInput.focus();
    return;
  }

  renderThumbs(videoId);
});
