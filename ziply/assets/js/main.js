/**
 * Ziply - Main JavaScript
 * Handles navigation, smooth scrolling, and basic interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ziply: Ready to share.');

    // Navbar scroll effect
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-opacity-90', 'backdrop-blur-lg', 'border-b', 'border-white/5');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.remove('bg-opacity-90', 'backdrop-blur-lg', 'border-b', 'border-white/5');
            navbar.classList.add('bg-transparent');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // CTA Button Interaction
    const startSharingBtns = document.querySelectorAll('.btn-start-sharing');
    startSharingBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add simple click effect
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                window.location.href = 'share.html';
            }, 150);
        });
    });
});
