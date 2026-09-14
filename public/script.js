// Scroll animation handler
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const navbar = document.getElementById('navbar');
    const heroTitle = document.getElementById('heroTitle');

    // Toggle navbar frosted glass background
    if (scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Smoothly parallax and fade out the giant hero title as you scroll down
    if (scrollY <= window.innerHeight) {
        const progress = scrollY / (window.innerHeight * 0.6);
        const scale = Math.max(0.75, 1 - progress * 0.25);
        const opacity = Math.max(0, 1 - progress * 1.3);
        const translateY = scrollY * 0.35;

        heroTitle.style.transform = `translateY(${translateY}px) scale(${scale})`;
        heroTitle.style.opacity = opacity;
    }
});
// Scroll animation for the floating product canvas
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const floatingSection = document.getElementById('floatingSection');
    const floatingWrapper = document.getElementById('floatingWrapper');

    if (!floatingSection || !floatingWrapper) return;

    // Get position of the section relative to the viewport
    const rect = floatingSection.getBoundingClientRect();
    
    // Only run animation when the section is near or in view
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;

        // Subtle zoom and Y-axis shift based on scroll progress
        const scale = 0.9 + (scrollProgress * 0.2); // Zooms in slightly
        const translateY = (scrollProgress - 0.5) * -80; // Shifts position up/down

        floatingWrapper.style.transform = `translateY(${translateY}px) scale(${scale})`;
    }
});
// Gentle, stable scroll movement for the floating product canvas
// window.addEventListener('scroll', () => {
//     const scrollY = window.scrollY;
//     const floatingSection = document.getElementById('floatingSection');
//     const floatingWrapper = document.getElementById('floatingWrapper');

//     if (!floatingSection || !floatingWrapper) return;

//     const rect = floatingSection.getBoundingClientRect();
    
//     // Only animate when the section is passing through the screen view
//     if (rect.top <= window.innerHeight && rect.bottom >= 0) {
//         const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;

//         // Subtle, smooth movement so it never overlaps or breaks boundaries
//         const translateY = (scrollProgress - 0.5) * -30; 

//         floatingWrapper.style.transform = `translateY(${translateY}px)`;
//     }
// });
// Gentle, smooth scroll movement for the floating product canvas
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const floatingSection = document.getElementById('floatingSection');
    const floatingWrapper = document.getElementById('floatingWrapper');

    if (!floatingSection || !floatingWrapper) return;

    const rect = floatingSection.getBoundingClientRect();
    
    // Only animate when the section is passing through the screen view
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;

        // Subtle upward movement as you scroll (adjust the '-40' to make it move more or less)
        const translateY = (scrollProgress - 0.5) * -100; 

        floatingWrapper.style.transform = `translateY(${translateY}px)`;
    }
});

// Instantly changes the background color across the whole site
document.documentElement.style.setProperty('--site-bg', '#f4efe6');

// Apply saved background color on main storefront load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/get-config');
    const config = await res.json();

    if (config.background_color) {
      document.body.style.backgroundColor = config.background_color;
    }
  } catch (err) {
    console.error('Error fetching storefront background color:', err);
  }
});
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
    console.error('Error loading store config:', err);
  }
});