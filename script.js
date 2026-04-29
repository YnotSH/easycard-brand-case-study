const themeToggle = document.getElementById("themeToggle");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("section[id]");

/* ---------- Theme toggle ---------- */

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("night");

  const isNight = document.body.classList.contains("night");

  themeToggle.textContent = isNight ? "白天模式" : "夜晚模式";
  themeToggle.setAttribute("aria-pressed", isNight ? "true" : "false");
});

/* ---------- Smooth nav scroll ---------- */

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    const headerHeight = document.querySelector(".site-header").offsetHeight;
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  });
});

/* ---------- Active nav observer ---------- */

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    root: null,
    rootMargin: "-42% 0px -48% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => {
  navObserver.observe(section);
});

/* ---------- Reveal on scroll ---------- */

const revealItems = document.querySelectorAll(
  ".hero-content, .content-section .container, .case-section .container, .ending-card, .statement-card"
);

revealItems.forEach((item) => {
  item.classList.add("reveal-target");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12,
  }
);

revealItems.forEach((item) => {
  revealObserver.observe(item);
});