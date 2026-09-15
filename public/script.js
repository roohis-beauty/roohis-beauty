// 1. Scroll animation handler (Navbar frosted glass & Hero title parallax)
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const navbar = document.getElementById('navbar');
    const heroTitle = document.getElementById('heroTitle');

    if (navbar) {
        if (scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    if (heroTitle && scrollY <= window.innerHeight) {
        const progress = scrollY / (window.innerHeight * 0.6);
        const scale = Math.max(0.75, 1 - progress * 0.25);
        const opacity = Math.max(0, 1 - progress * 1.3);
        const translateY = scrollY * 0.35;

        heroTitle.style.transform = `translateY(${translateY}px) scale(${scale})`;
        heroTitle.style.opacity = opacity;
    }
});

// 2. Floating product PNG smooth movement
window.addEventListener('scroll', () => {
    const floatingSection = document.getElementById('floatingSection');
    const floatingWrapper = document.getElementById('floatingWrapper');

    if (!floatingSection || !floatingWrapper) return;

    const rect = floatingSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        const scrollProgress = (window.innerHeight - rect.top) / window.innerHeight;
        const translateY = (scrollProgress - 0.5) * -100; 
        floatingWrapper.style.transform = `translateY(${translateY}px)`;
    }
});

// 3. Slider logic functions
let currentSlide = 0;
let totalSlides = 0;

function setupSlider(imageUrls) {
    const track = document.getElementById('sliderTrack');
    if (!track || !imageUrls || imageUrls.length === 0) return;

    track.innerHTML = '';
    imageUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        track.appendChild(img);
    });

    totalSlides = imageUrls.length;

    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSliderPosition();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSliderPosition();
        };
    }
}

function updateSliderPosition() {
    const track = document.getElementById('sliderTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

// 4. Single DOMContentLoaded listener for Theme, Dynamic Text, and Slider
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/get-config');
        if (!res.ok) return;

        const rawData = await res.json();

        // Standardize output to key-value map
        const configMap = {};
        if (Array.isArray(rawData)) {
            rawData.forEach(item => { configMap[item.key] = item.value; });
        } else {
            Object.assign(configMap, rawData);
        }

        // Check both camelCase and snake_case so colors always match database keys
        const bgColor = configMap.backgroundColor || configMap.background_color;
        const secondaryColor = configMap.secondaryColor || configMap.secondary_color;
        const textColor = configMap.textColor || configMap.text_color;
        const textHoverColor = configMap.textHoverColor || configMap.text_hover_color;

        // Apply Theme Colors
        if (bgColor) {
            document.documentElement.style.setProperty('--main-bg', bgColor);
            document.body.style.backgroundColor = 'var(--main-bg)';
        }
        if (secondaryColor) {
            document.documentElement.style.setProperty('--accent-bg', secondaryColor);
        }
        if (textColor) {
            document.documentElement.style.setProperty('--main-text', textColor);
        }
        if (textHoverColor) {
            document.documentElement.style.setProperty('--text-hover', textHoverColor);
        }

        // Apply Dynamic Product Text
        if (configMap['product_title']) {
            const titleEl = document.getElementById('displayProductTitle');
            if (titleEl) titleEl.textContent = configMap['product_title'];
        }
        if (configMap['product_desc']) {
            const descEl = document.getElementById('displayProductDesc');
            if (descEl) descEl.textContent = configMap['product_desc'];
        }

        // Render Slider Images
        if (configMap.slider_images) {
            let urls = configMap.slider_images;
            if (typeof urls === 'string') {
                try {
                    urls = JSON.parse(urls);
                } catch (e) {
                    console.error('Failed to parse slider JSON:', e);
                }
            }
            if (Array.isArray(urls) && urls.length > 0) {
                setupSlider(urls);
            }
        }
    } catch (err) {
        console.error('Error loading store configuration:', err);
    }
});