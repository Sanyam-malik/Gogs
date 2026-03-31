/* =========================
   GLOBAL CACHE
========================= */
let THEME_CACHE = [];
let darkMode = window.matchMedia("(prefers-color-scheme: dark)");

/* =========================
   FETCH THEMES (ONCE)
========================= */
async function fetchThemes() {
  if (THEME_CACHE.length) {
    console.log("[Theme] Using cached themes");
    return THEME_CACHE;
  }

  console.log("[Theme] Fetching themes.json");

  const response = await fetch("/themes/themes.json");

  if (!response.ok) {
    throw new Error(`[Theme] Failed to fetch themes.json: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("[Theme] themes.json must be an array");
  }

  THEME_CACHE = data.filter(t => t && t.name && t.dir);

  console.log("[Theme] Themes loaded:", THEME_CACHE);

  return THEME_CACHE;
}

/* =========================
   APPLY THEME
========================= */
function applyTheme(themeDir) {
  console.log("[Theme] Applying:", themeDir);

  const theme = THEME_CACHE.find(t => t.dir === themeDir);

  if (!theme) {
    console.warn("[Theme] Theme not found:", themeDir);
    return;
  }

  // Remove old assets
  document.querySelectorAll(".theme-css").forEach(el => el.remove());
  document.querySelectorAll(".theme-js").forEach(el => el.remove());

  // Load CSS
  (theme.css || []).forEach(file => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = file;
    link.className = "theme-css";

    link.onload = () => console.log("[Theme] CSS loaded:", file);
    link.onerror = () => console.warn("[Theme] CSS failed:", file);

    document.head.appendChild(link);
  });

  // Load JS sequentially
  (async () => {
    for (const file of (theme.js || [])) {
      await new Promise(resolve => {
        const script = document.createElement("script");
        script.src = file;
        script.className = "theme-js";

        script.onload = () => {
          console.log("[Theme] JS loaded:", file);
          resolve();
        };

        script.onerror = () => {
          console.warn("[Theme] JS failed:", file);
          resolve();
        };

        document.body.appendChild(script);
      });
    }

    initThemeCallBack(darkMode);
        // also listen once
      darkMode.removeEventListener("change", initThemeCallBack);
      darkMode.addEventListener("change", initThemeCallBack);
  })();

  console.log("[Theme] Assets applied:", themeDir);
}

/* =========================
   BUILD DROPDOWN
========================= */
function buildThemeDropdown(themes, currentTheme) {
  const themeDropdown = document.createElement("div");
  themeDropdown.className =
    "ui theme bottom floating slide up dropdown link item";
  themeDropdown.setAttribute("tabindex", "0");

  const current =
    themes.find(t => t.dir === currentTheme) || themes[0];

  const menuItems = themes
    .map(t => {
      const active = t.dir === current.dir ? "active selected" : "";
      return `<a class="item ${active}" data-value="${t.dir}">${t.name}</a>`;
    })
    .join("");

  themeDropdown.innerHTML = `
    <i class="paint brush icon"></i>
    <div class="text">${current.name}</div>
    <div class="menu">
      ${menuItems}
    </div>
  `;

  return themeDropdown;
}

/* =========================
   INIT DROPDOWN
========================= */
function initThemeDropdown(themeDropdown, currentTheme) {
  if (!(window.$ && $.fn.dropdown)) {
    console.warn("[Theme] Semantic UI dropdown not available");
    return;
  }

  console.log("[Theme] Initializing dropdown");

  $(themeDropdown).dropdown({
    onChange: function (value, text) {
      console.log("[Theme] Changed →", value);

      if (currentTheme === value) return; // 🚫 prevent useless reload

      localStorage.setItem("gogs_theme", value);
      location.reload();
    }
  });

  $(themeDropdown).dropdown("set selected", currentTheme);
}

/* =========================
   CREATE DROPDOWN
========================= */
async function createThemeDropdown() {
  const container = document.querySelector(".ui.right.links");
  const pageInfo = container?.querySelector("span");

  if (!container || !pageInfo) {
    console.warn("[Theme] Footer target not found");
    return;
  }

  if (container.querySelector(".ui.theme.dropdown")) {
    console.log("[Theme] Dropdown already exists");
    return;
  }

  const themes = await fetchThemes();

  if (!themes.length) {
    console.warn("[Theme] No themes available");
    return;
  }

  const saved = localStorage.getItem("gogs_theme");
  const fallback = themes[0].dir;

  const currentTheme = themes.some(t => t.dir === saved)
    ? saved
    : fallback;

  localStorage.setItem("gogs_theme", currentTheme);

  const dropdown = buildThemeDropdown(themes, currentTheme);

  // 👉 insert BEFORE Page/Template
  container.insertBefore(dropdown, pageInfo);

  console.log("[Theme] Dropdown inserted");

  initThemeDropdown(dropdown, currentTheme);
}

/* =========================
   INIT SYSTEM
========================= */
async function initThemeSystem() {
  console.log("[Theme] Initializing system");

  try {
    const themes = await fetchThemes();

    if (!themes.length) return;

    const saved = localStorage.getItem("gogs_theme");
    const fallback = themes[0].dir;

    const currentTheme = themes.some(t => t.dir === saved)
      ? saved
      : fallback;

    localStorage.setItem("gogs_theme", currentTheme);

    applyTheme(currentTheme);
    await createThemeDropdown();

    console.log("[Theme] Ready");
  } catch (err) {
    console.error("[Theme] Init failed:", err);
  }
}

/* =========================
   ENTRY POINT
========================= */
document.addEventListener("DOMContentLoaded", initThemeSystem);