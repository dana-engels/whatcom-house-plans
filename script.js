const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    answer?.classList.toggle("open", !open);
  });
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const dots = carousel.querySelector("[data-carousel-dots]");
  const count = carousel.querySelector("[data-carousel-count]");
  let active = 0;

  const update = () => {
    track.style.transform = `translateX(-${active * 100}%)`;
    dots.querySelectorAll("button").forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === active));
    });
    count.textContent = `${String(active + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to item ${index + 1}`);
    dot.addEventListener("click", () => {
      active = index;
      update();
    });
    dots.append(dot);
  });

  previous.addEventListener("click", () => {
    active = (active - 1 + slides.length) % slides.length;
    update();
  });

  next.addEventListener("click", () => {
    active = (active + 1) % slides.length;
    update();
  });

  update();
});
