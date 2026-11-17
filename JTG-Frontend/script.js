const PROJECTS = [
  { img: "images/project1.jpg", title: "How To Make Flyer Design" },
  { img: "images/project2.jpg", title: "How To Make Flyer Design", tagCount: 4 },
  { img: "images/project3.jpg", title: "How To Make Flyer Design" },
  { img: "images/project4.jpg", title: "How To Make Flyer Design" },
  { img: "images/project5.jpg", title: "How To Make Flyer Design" },
  { img: "images/project6.jpg", title: "How To Make Flyer Design" }
];
const PROJECT_DESC = "Lorem Ipsum Dolor Sit Amet, Consec Adipiscing Elit Awd And Lorem Ipsum...";
const PROJECT_TAGS = ["Typescript", "ReactJs", "NextJs", "CSS", "HTML", "MongoDB"];

// Line breaks are kept exactly as in the Figma card
const RECO_TEXT = "Lorem Ipsum Dolor Sit Amet,<br class=\"br-d\" /> Consectetur Adipiscing Elit. Vitae Nulla<br class=\"br-d\" /> Diam In Ac Dictum A Urna Viverra Morbi.<br class=\"br-d\" /> Morbi Donec Amet....";

// 5 slides: slide 0 and slide 4 are the half-visible cards at the edges.
// pl = card left padding, nameGap / roleShift = text offsets used in the Figma layout.
const RECOMMENDATIONS = [
  { title: "Great Quality!", name: "Talan Westervelt", role: "Business Man",     img: "images/reviewer3.jpg", pl: 28, nameGap: 29, roleShift: 6 },
  { title: "Great Quality!", name: "James Gouse",      role: "Graphic Designer", img: "images/reviewer1.jpg", pl: 27, nameGap: 11, roleShift: 0, framed: true },
  { title: "Amazing Work!",  name: "Tiana Philips",    role: "Photographer",     img: "images/reviewer2.jpg", pl: 18, nameGap: 33, roleShift: 3 },
  { title: "Great Quality!", name: "Talan Westervelt", role: "Business Man",     img: "images/reviewer3.jpg", pl: 28, nameGap: 29, roleShift: 6 },
  { title: "Great Quality!", name: "James Gouse",      role: "Graphic Designer", img: "images/reviewer1.jpg", pl: 27, nameGap: 17, roleShift: 0 }
];
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#FFB400" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>';

$(function () {
  /* ---------- Projects ---------- */
  $(".projects-grid").html(PROJECTS.map(p => {
    const tags = PROJECT_TAGS.slice(0, p.tagCount || PROJECT_TAGS.length).map(t => `<span>${t}</span>`).join("");
    return `
    <article class="project-card card">
      <img src="${p.img}" alt="${p.title}" loading="lazy" />
      <div class="project-body">
        <h3>${p.title}</h3>
        <p>${PROJECT_DESC}</p>
        <div class="tags">${tags}</div>
      </div>
    </article>`;
  }).join(""));

  /* ---------- Recommendations: centred carousel (3 full cards + half cards at both edges) ---------- */
  const base = RECOMMENDATIONS.length;
  const GAP = 24;
  const slideHtml = (r, i) => `
    <div class="slide" role="group" aria-roledescription="slide" aria-label="${(i % base) + 1} of ${base}">
      <article class="reco-card card" style="padding-left:${r.pl}px">
        <div class="stars" aria-label="5 out of 5 stars">${STAR.repeat(5)}</div>
        <h3>${r.title}</h3>
        <p>${RECO_TEXT}</p>
        <div class="reviewer">
          <span class="avatar${r.framed ? " framed" : ""}"><img src="${r.img}" alt="${r.name}" /></span>
          <div class="who" style="margin-left:${r.nameGap}px">
            <strong>${r.name}</strong><small style="margin-left:${r.roleShift}px">${r.role}</small>
          </div>
        </div>
      </article>
    </div>`;
  // three copies of the list so the carousel can loop endlessly
  const all = [...RECOMMENDATIONS, ...RECOMMENDATIONS, ...RECOMMENDATIONS];
  $(".carousel-track").html(all.map(slideHtml).join(""));

  const $carousel = $(".carousel");
  const $viewport = $(".carousel-viewport");
  const $track = $(".carousel-track");
  const $slides = $track.children(".slide");
  const $dots = $(".carousel-dots");
  let index = base + 2;            // middle card of the middle copy (3rd dot active, like the design)
  let slideW = 340, timer = null;

  for (let i = 0; i < base; i++) {
    $("<button>", { type: "button", role: "tab", "aria-label": `Go to slide ${i + 1}` })
      .data("i", i).appendTo($dots);
  }

  function place(animate) {
    const vw = $viewport.width();
    const x = vw / 2 - (index * (slideW + GAP) + slideW / 2);
    $track.css("transition", animate ? "" : "none");
    $track.css("transform", `translateX(${x}px)`);
    if (!animate) $track[0].offsetWidth;   // force reflow so the next move animates
    const active = ((index % base) + base) % base;
    $dots.children().removeClass("active").attr("aria-selected", "false")
      .eq(active).addClass("active").attr("aria-selected", "true");
  }

  function layout() {
    slideW = Math.min(340, Math.round($viewport.width() * 0.78));
    $carousel[0].style.setProperty("--slide-w", slideW + "px");
    place(false);
  }

  function goTo(i) { index = i; place(true); }
  $track.on("transitionend", function (e) {
    if (e.target !== this) return;
    if (index >= base * 2 || index < base) {
      index = (((index % base) + base) % base) + base;
      place(false);
    }
  });

  function startAuto() { stopAuto(); timer = setInterval(() => goTo(index + 1), 4000); }
  function stopAuto() { clearInterval(timer); }

  $dots.on("click", "button", function () { goTo(base + $(this).data("i")); startAuto(); });
  $carousel.on("mouseenter", stopAuto).on("mouseleave", startAuto);

  let startX = null;
  $viewport.on("pointerdown", e => { startX = e.clientX; stopAuto(); });
  $(window).on("pointerup", e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
    startAuto();
  });

  $carousel.attr("tabindex", 0).on("keydown", e => {
    if (e.key === "ArrowRight") goTo(index + 1);
    if (e.key === "ArrowLeft") goTo(index - 1);
  });

  let resizeTimer;
  $(window).on("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });

  layout();
  startAuto();

  /* ---------- Header / nav ---------- */
  $(".nav-toggle").on("click", function () {
    const open = !$(".nav").hasClass("open");
    $(".nav").toggleClass("open", open);
    $(this).toggleClass("open", open).attr("aria-expanded", open);
  });
  $(".nav a").on("click", function () {
    $(".nav a").removeClass("active");
    $(this).addClass("active");
    $(".nav, .nav-toggle").removeClass("open");
    $(".nav-toggle").attr("aria-expanded", false);
  });

  const sectionIds = ["home", "projects", "recommendations", "contact"];
  function onScroll() {
    const st = $(window).scrollTop();
    $(".header").toggleClass("scrolled", st > 40);
    const y = st + 160;
    let current = "home";
    sectionIds.forEach(id => { const $s = $("#" + id); if ($s.length && $s.offset().top <= y) current = id; });
    $(".nav a").removeClass("active").filter(`[href="#${current}"]`).addClass("active");
  }
  $(window).on("scroll", onScroll);
  onScroll();

  /* ---------- Contact form ---------- */
  $(".contact-form").on("submit", function (e) {
    e.preventDefault();
    const $form = $(this);
    const $name = $form.find("[name=name]");
    const $email = $form.find("[name=email]");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email.val().trim());
    const nameOk = $name.val().trim() !== "";

    $name.toggleClass("invalid", !nameOk);
    $email.toggleClass("invalid", !emailOk);

    const $status = $form.find(".form-status").removeClass("ok err");
    if (!nameOk || !emailOk) {
      $status.addClass("err").text("Please enter your name and a valid email.");
      return;
    }
    $status.addClass("ok").text(`Thanks, ${$name.val().trim()}! Your message has been noted.`);
    this.reset();
  });
  $(".contact-form input").on("input", function () { $(this).removeClass("invalid"); });
});
