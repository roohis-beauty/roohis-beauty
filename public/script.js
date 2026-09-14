// Scroll animation handler
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const navbar = document.getElementById('navbar');
    const heroTitle = document.getElementById('heroTitle');

    // Toggle navbar frosted glass background
    if (navbar) {
        if (scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Smoothly parallax and fade out the giant hero title as you scroll down
    if (heroTitle && scrollY <= window.innerHeight) {
        const progress = scrollY / (window.innerHeight * 0.6);
        const scale = Math.max(0.75, 1 - progress * 0.25);
        const opacity = Math.max(0, 1 - progress * 1.3);
        const translateY = scrollY * 0.35;

        heroTitle.style.transform = `translateY(${translateY}px) scale(${scale})`;
        heroTitle.style.opacity = opacity;
    }
});

// Gentle, smooth scroll movement for the floating product canvas
window.addEventListener('scroll', () => {
    const floatingSection = document.getElementById('floatingSection');
    const floatingWrapper = document.getElementById('floatingWrapper');

    if (!floatingSection || !floatingWrapper) return;

    const rect = floatingSection.getBoundingClientRect();
    
    // Only animate when the section is passing through the screen view
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;

        // Subtle upward movement as you scroll
        const translateY = (scrollProgress - 0.5) * -100; 

        floatingWrapper.style.transform = `translateY(${translateY}px)`;
    }
});

// Load live dynamic theme colors from database
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/get-config');
        const config = await res.json();

        if (config.background_color) {
            document.documentElement.style.setProperty('--main-bg', config.background_color);
            document.body.style.backgroundColor = 'var(--main-bg)';
        }
        
        if (config.secondary_color) {
            document.documentElement.style.setProperty('--accent-bg', config.secondary_color);
        }
    } catch (err) {
        console.error('Error loading store theme config:', err);
    }
});