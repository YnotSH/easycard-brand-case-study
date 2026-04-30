const themeToggle = document.getElementById("themeToggle");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("section[id]");

/* ---------- Theme toggle ---------- */

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("night");

    const isNight = document.body.classList.contains("night");

    themeToggle.setAttribute("aria-pressed", isNight ? "true" : "false");
    themeToggle.setAttribute("aria-label", isNight ? "切換白天模式" : "切換夜晚模式");
  });
}

/* ---------- Smooth nav scroll ---------- */

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    const headerHeight = document.querySelector(".site-header").offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

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
  ".hero-content, .content-section:not(.insight-section) .container, .case-section .container, .statement-card"
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

/* ---------- Insight pinned storytelling ---------- */

const insightSection = document.getElementById("insight");
const insightQuestion = document.querySelector(".insight-question");
const insightAnswer = document.querySelector(".insight-answer");

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const smoothStep = (edge0, edge1, value) => {
  const x = clampNumber((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
};

let insightTicking = false;

const updateInsightTransition = () => {
  if (!insightSection || !insightQuestion || !insightAnswer) return;

  if (window.matchMedia("(max-width: 900px)").matches) {
    insightQuestion.removeAttribute("style");
    insightAnswer.removeAttribute("style");
    insightAnswer.setAttribute("aria-hidden", "false");
    insightSection.classList.add("is-answer-visible");
    insightTicking = false;
    return;
  }

  const rect = insightSection.getBoundingClientRect();
  const headerHeight = document.querySelector(".site-header").offsetHeight;
  const viewportHeight = window.innerHeight;

  const scrollRange = rect.height - viewportHeight + headerHeight;
  const progress = clampNumber((-rect.top + headerHeight) / scrollRange, 0, 1);

  const questionOut = smoothStep(0.16, 0.34, progress);
  const answerIn = smoothStep(0.30, 0.52, progress);

  insightQuestion.style.opacity = 1 - questionOut;
  insightQuestion.style.transform = `translateY(${-24 * questionOut}px) scale(${1 - 0.015 * questionOut})`;
  insightQuestion.style.filter = `blur(${3 * questionOut}px)`;

  insightAnswer.style.opacity = answerIn;
  insightAnswer.style.transform = `translateY(${28 * (1 - answerIn)}px) scale(${0.985 + 0.015 * answerIn})`;
  insightAnswer.style.filter = `blur(${3 * (1 - answerIn)}px)`;
  insightAnswer.setAttribute("aria-hidden", answerIn > 0.5 ? "false" : "true");

  insightSection.classList.toggle("is-answer-visible", progress > 0.48);

  insightTicking = false;
};

const requestInsightUpdate = () => {
  if (insightTicking) return;

  insightTicking = true;
  window.requestAnimationFrame(updateInsightTransition);
};

window.addEventListener("scroll", requestInsightUpdate, { passive: true });
window.addEventListener("resize", requestInsightUpdate);

updateInsightTransition();

/* ---------- MRK count-up and chart reveal ---------- */

const mrkSection = document.getElementById("mrk");
const countUpItems = document.querySelectorAll(".count-up");
let mrkAnimated = false;

const formatNumber = (number) => {
  return Math.round(number).toLocaleString("en-US");
};

const animateCountUp = (element) => {
  const start = Number(element.dataset.start || 0);
  const end = Number(element.dataset.end || 0);
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";
  const finalText = element.dataset.final || "";
  const duration = 1100;
  const startTime = performance.now();

  const tick = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    element.textContent = `${prefix}${formatNumber(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else if (finalText) {
      element.textContent = finalText;
    }
  };

  requestAnimationFrame(tick);
};

const mrkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || mrkAnimated) return;

      mrkAnimated = true;
      mrkSection.classList.add("is-chart-visible");

      countUpItems.forEach((item, index) => {
        window.setTimeout(() => {
          animateCountUp(item);
        }, index * 120);
      });

      mrkObserver.unobserve(entry.target);
    });
  },
  {
    root: null,
    rootMargin: "0px 0px -18% 0px",
    threshold: 0.28,
  }
);

if (mrkSection) {
  mrkObserver.observe(mrkSection);
}

/* ---------- TPASS banner lightbox ---------- */

const tpassBannerButton = document.getElementById("tpassBannerButton");
const imageLightbox = document.getElementById("imageLightbox");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxBackdrop = document.querySelector(".lightbox-backdrop");

const openLightbox = () => {
  if (!imageLightbox) return;

  imageLightbox.classList.add("is-open");
  imageLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");

  if (lightboxClose) {
    lightboxClose.focus();
  }
};

const closeLightbox = () => {
  if (!imageLightbox) return;

  imageLightbox.classList.remove("is-open");
  imageLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");

  if (tpassBannerButton) {
    tpassBannerButton.focus();
  }
};

if (tpassBannerButton) {
  tpassBannerButton.addEventListener("click", openLightbox);
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

/* ---------- Reporter info modal ---------- */

const reporterButton = document.getElementById("reporterButton");
const reporterModal = document.getElementById("reporterModal");
const reporterClose = document.getElementById("reporterClose");
const reporterBackdrop = document.querySelector(".reporter-backdrop");

const openReporterModal = () => {
  if (!reporterModal) return;

  reporterModal.classList.add("is-open");
  reporterModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("reporter-modal-open");

  if (reporterClose) {
    reporterClose.focus();
  }
};

const closeReporterModal = () => {
  if (!reporterModal) return;

  reporterModal.classList.remove("is-open");
  reporterModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reporter-modal-open");

  if (reporterButton) {
    reporterButton.focus();
  }
};

if (reporterButton) {
  reporterButton.addEventListener("click", openReporterModal);
}

if (reporterClose) {
  reporterClose.addEventListener("click", closeReporterModal);
}

if (reporterBackdrop) {
  reporterBackdrop.addEventListener("click", closeReporterModal);
}

/* ---------- Global modal keyboard control ---------- */

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (imageLightbox?.classList.contains("is-open")) {
    closeLightbox();
  }

  if (reporterModal?.classList.contains("is-open")) {
    closeReporterModal();
  }
});/* ---------- Keyboard topic navigation ---------- */

const topicNavLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const topicSections = topicNavLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    return target
      ? {
          link,
          target,
          id: target.id,
        }
      : null;
  })
  .filter(Boolean);

const isTypingContext = () => {
  const activeElement = document.activeElement;

  if (!activeElement) return false;

  const tagName = activeElement.tagName?.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    activeElement.isContentEditable
  );
};

const isAnyModalOpen = () => {
  return (
    document.querySelector(".image-lightbox.is-open") ||
    document.querySelector(".reporter-modal.is-open")
  );
};

const getCurrentTopicIndex = () => {
  const activeLinkIndex = topicNavLinks.findIndex((link) =>
    link.classList.contains("is-active")
  );

  if (activeLinkIndex >= 0) {
    return activeLinkIndex;
  }

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const currentY = window.scrollY + headerHeight + window.innerHeight * 0.28;

  let currentIndex = -1;

  topicSections.forEach((item, index) => {
    const sectionTop = item.target.offsetTop;

    if (currentY >= sectionTop) {
      currentIndex = index;
    }
  });

  return currentIndex;
};

const scrollToTopic = (index) => {
  const item = topicSections[index];

  if (!item) return;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const targetTop = item.target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });

  topicNavLinks.forEach((link) => {
    link.classList.toggle("is-active", link === item.link);
  });
};

window.addEventListener("keydown", (event) => {
  if (
    isTypingContext() ||
    isAnyModalOpen() ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  ) {
    return;
  }

  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
    return;
  }

  const currentIndex = getCurrentTopicIndex();

  if (event.key === "ArrowRight") {
    const nextIndex = Math.min(currentIndex + 1, topicSections.length - 1);

    if (nextIndex !== currentIndex) {
      event.preventDefault();
      scrollToTopic(nextIndex);
    }
  }

  if (event.key === "ArrowLeft") {
    const prevIndex = Math.max(currentIndex - 1, 0);

    if (prevIndex !== currentIndex && currentIndex >= 0) {
      event.preventDefault();
      scrollToTopic(prevIndex);
    }
  }
});