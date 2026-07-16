/* Sliding sidebar behaviour for the unified site chrome.
   Wires the header hamburger, the overlay, the close button, and Escape. */
(function () {
  "use strict";

  function init() {
    var sidebar = document.getElementById("site-sidebar");
    var overlay = document.querySelector(".site-overlay");
    var toggle = document.querySelector(".site-hamburger");
    var closeBtn = document.querySelector(".site-sidebar-close");
    if (!sidebar || !overlay || !toggle) return;

    function open() {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-open");
      overlay.hidden = false;
      sidebar.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function close() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-open");
      sidebar.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      // hide overlay from AT/tab order after the fade-out finishes
      window.setTimeout(function () {
        if (!overlay.classList.contains("is-open")) overlay.hidden = true;
      }, 300);
    }

    toggle.addEventListener("click", open);
    overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
