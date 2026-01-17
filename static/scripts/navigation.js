'use strict';

// Navigation and page switching
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    console.log('=== NAVIGATION INITIALIZATION ===');

    const navbarLinks = document.querySelectorAll('[data-nav-link]');
    const pages = document.querySelectorAll('[data-page]');

    if (!navbarLinks.length || !pages.length) {
        console.error('Navigation elements not found!');
        return;
    }

    // Find the initially active page from the HTML
    let activePage = 'about'; // default

    // Check which page is currently visible (has display: block)
    pages.forEach(page => {
        const style = window.getComputedStyle(page);
        if (style.display === 'block') {
            activePage = page.getAttribute('data-page');
        }
    });

    // Function to switch pages
    const switchPage = function(pageId) {
        console.log('Switching to page:', pageId);

        // Update navbar links
        navbarLinks.forEach(link => {
            if (link.getAttribute('data-nav-link') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show/hide pages
        pages.forEach(page => {
            if (page.getAttribute('data-page') === pageId) {
                page.style.display = 'block';
                page.classList.add('active');
            } else {
                page.style.display = 'none';
                page.classList.remove('active');
            }
        });

        // Update URL hash (optional)
        window.location.hash = pageId;
    };

    // Add click events to navbar links
    navbarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const pageId = this.getAttribute('data-nav-link');
            if (!pageId) return;

            switchPage(pageId);
        });
    });

    // Check URL hash on load
    const hash = window.location.hash.substring(1);
    if (hash && document.querySelector(`[data-page="${hash}"]`)) {
        switchPage(hash);
    } else {
        // Set the page that Flask rendered as active
        switchPage(activePage);
    }

    console.log('=== NAVIGATION INITIALIZED ===');
}