function initThemeCallBack(e) {
    const logo = document.querySelector(".home .logo img");
  if (!logo) return;

  if (e.matches) {
    logo.src = "/themes/og/img/gogs-dark-hero.png";
  } else {
    logo.src = "/themes/og/img/gogs-light-hero.png";
  }
}