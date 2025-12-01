/**
 * Ziply Navigation & Search Logic
 * Handles the search modal and global navigation interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('nav-search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchBackdrop = document.getElementById('search-backdrop');
    const searchInput = document.getElementById('search-input');
    const searchSubmit = document.getElementById('search-submit');
    const searchError = document.getElementById('search-error');

    // --- Theme Toggle Logic ---
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeTray = document.getElementById('theme-tray');
    const themeOptions = document.querySelectorAll('.theme-opt');
    const html = document.documentElement;
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

    // Check local storage or system preference
    // Modes: 'dark' | 'light' | 'system'
    let currentTheme = localStorage.getItem('theme') || 'dark';

    function openSearch() {
        if (searchModal) {
            searchModal.classList.remove('hidden');
            if (searchInput) searchInput.focus();
        }
    }

    function closeSearch() {
        if (searchModal) {
            searchModal.classList.add('hidden');
            if (searchError) searchError.classList.add('hidden');
            if (searchInput) searchInput.value = '';
        }
    }

    function handleSearch() {
        if (searchInput) {
            const code = searchInput.value.trim().toUpperCase();
            // Simple validation: 6 chars
            if (code.length === 6) {
                window.location.href = `view.html?id=${code}`;
            } else {
                if (searchError) searchError.classList.remove('hidden');
            }
        }
    }

    function applyTheme(theme) {
        let effectiveTheme = theme;
        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            effectiveTheme = systemDark ? 'dark' : 'light';
        }

        // Apply to DOM
        if (effectiveTheme === 'dark') {
            html.removeAttribute('data-theme'); // Default is dark
        } else {
            html.setAttribute('data-theme', 'light');
        }

        // Update Icon
        if (themeIcon) {
            themeIcon.className = ''; // Clear
            if (theme === 'dark') {
                themeIcon.className = 'fa-regular fa-moon';
            } else if (theme === 'light') {
                themeIcon.className = 'fa-regular fa-sun';
            } else {
                themeIcon.className = 'fa-solid fa-desktop'; // System
            }
        }

        // Update Tray Active State
        if (themeOptions) {
            themeOptions.forEach(opt => {
                if (opt.dataset.value === theme) {
                    opt.classList.add('text-brand-primary', 'bg-white/10');
                    opt.classList.remove('text-brand-muted');
                } else {
                    opt.classList.remove('text-brand-primary', 'bg-white/10');
                    opt.classList.add('text-brand-muted');
                }
            });
        }
    }

    // Initial Apply
    applyTheme(currentTheme);

    // Toggle Tray
    if (themeBtn && themeTray) {
        themeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeTray.classList.toggle('hidden');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!themeBtn.contains(e.target) && !themeTray.contains(e.target)) {
                themeTray.classList.add('hidden');
            }
        });
    }

    // Option Click
    if (themeOptions) {
        themeOptions.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately
                const val = opt.dataset.value;
                currentTheme = val;
                localStorage.setItem('theme', currentTheme);
                applyTheme(currentTheme);
                if (themeTray) themeTray.classList.add('hidden');
            });
        });
    }

    // Listen for system changes if in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
    if (searchSubmit) searchSubmit.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});
