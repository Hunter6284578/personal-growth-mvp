(() => {
    "use strict";

    const body = document.body;
    const menuToggle = document.getElementById("menuToggle");
    const siteNav = document.getElementById("siteNav");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("siteSidebar");
    const themeToggle = document.getElementById("themeToggle");

    if (menuToggle && siteNav) {
        menuToggle.addEventListener("click", () => siteNav.classList.toggle("is-open"));
    }

    if (sidebarToggle && sidebar) {
        const key = "cagedsheep-sidebar-collapsed";
        if (window.localStorage.getItem(key) === "1") {
            sidebar.classList.add("is-collapsed");
        }
        sidebarToggle.addEventListener("click", () => {
            const collapsed = sidebar.classList.toggle("is-collapsed");
            window.localStorage.setItem(key, collapsed ? "1" : "0");
        });
    }

    if (themeToggle && body.dataset.darkEnabled === "1") {
        const key = "cagedsheep-theme";
        const saved = window.localStorage.getItem(key);
        if (saved === "light" || saved === "dark") {
            body.setAttribute("data-theme", saved);
        }
        themeToggle.addEventListener("click", () => {
            const next = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
            body.setAttribute("data-theme", next);
            window.localStorage.setItem(key, next);
        });
    }

    document.querySelectorAll(".single-content img, .post-card img, .work-card img").forEach((img) => {
        if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", "lazy");
        }
        if (!img.hasAttribute("decoding")) {
            img.setAttribute("decoding", "async");
        }
    });

    document.querySelectorAll("pre > code").forEach((code) => {
        if (!/language-[\w-]+/.test(code.className || "")) {
            code.classList.add("language-markup");
        }
    });
})();
