function initializeNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (!toggle || !navigation) return;

  const mobile = window.matchMedia("(max-width: 980px)");
  let open = false;
  const background = [...document.querySelectorAll("main, footer, .site-header .brand, .site-header .button")];
  const originalInert = new Map(background.map(element => [element, element.inert]));
  navigation.id ||= "primary-navigation";
  toggle.setAttribute("aria-controls", navigation.id);

  function setOpen(nextOpen, restoreFocus = false) {
    open = nextOpen && mobile.matches;
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    for (const element of background) element.inert = open || originalInert.get(element);
    if (open) requestAnimationFrame(() => {
      if (open) {
        // Flush the visibility change before moving focus into the overlay.
        navigation.getBoundingClientRect();
        navigation.querySelector("a")?.focus({ preventScroll: true });
      }
    });
    else if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  navigation.addEventListener("transitionend", event => {
    if (event.target === navigation && open && document.activeElement === toggle) {
      navigation.querySelector("a")?.focus({ preventScroll: true });
    }
  });
  toggle.addEventListener("click", () => setOpen(!open, open));
  navigation.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    const destination = new URL(link.href);
    setOpen(false);
    // Same-page navigation moves focus to its destination, not a hidden link.
    if (destination.pathname === location.pathname && destination.hash) {
      const section = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
      if (section) {
        section.setAttribute("tabindex", "-1");
        section.focus({ preventScroll: true });
      }
    }
  });
  document.addEventListener("keydown", event => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
    } else if (event.key === "Tab") {
      const controls = [...navigation.querySelectorAll("a[href]"), toggle];
      const index = controls.indexOf(document.activeElement);
      const next = (index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[next].focus();
    }
  });
  mobile.addEventListener("change", () => {
    const focusWasInMenu = navigation.contains(document.activeElement);
    setOpen(false);
    if (mobile.matches && focusWasInMenu) toggle.focus({ preventScroll: true });
  });
  setOpen(false);
  document.documentElement.classList.add("navigation-ready");
}

initializeNavigation();

function initializeFAQs() {
  document.querySelectorAll(".faq-item button").forEach(button => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    if (!answer) return;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!open));
      answer.classList.toggle("open", !open);
    });
    button.closest(".faq-item").setAttribute("data-enhanced", "");
  });
}

initializeFAQs();

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

function initializeCarousel(carousel) {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const dots = carousel.querySelector("[data-carousel-dots]");
  const count = carousel.querySelector("[data-carousel-count]");
  if (!track || !slides.length || !previous || !next || !dots || !count) return;

  let active = 0;
  carousel.setAttribute("role", "region");
  carousel.setAttribute("aria-roledescription", "carousel");
  carousel.setAttribute("aria-label", carousel.getAttribute("aria-label") || carousel.parentElement.querySelector(":scope > .proof-label")?.textContent.trim() || "Gallery");
  const status = document.createElement("span");
  status.className = "visually-hidden";
  status.setAttribute("role", "status");
  status.setAttribute("aria-atomic", "true");
  carousel.append(status);

  function showSlide(index, announce = true) {
    active = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== active));
      slide.inert = slideIndex !== active;
    });
    [...dots.children].forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === active));
    });
    count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (announce) status.textContent = `Item ${active + 1} of ${slides.length}`;
  }

  dots.replaceChildren();
  slides.forEach((slide, index) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${slides.length}`);
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to item ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dots.append(dot);
  });
  previous.addEventListener("click", () => showSlide(active - 1));
  next.addEventListener("click", () => showSlide(active + 1));
  if (slides.length === 1) {
    previous.disabled = true;
    next.disabled = true;
  }
  carousel.setAttribute("data-enhanced", "");
  showSlide(0, false);
}

document.querySelectorAll("[data-carousel]").forEach(initializeCarousel);
