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

// Unified loader for theme colors and dynamic text
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/get-config');
    if (!res.ok) return;

    const rawData = await res.json();

    // Convert array format or object format seamlessly
    const configMap = {};
    if (Array.isArray(rawData)) {
      rawData.forEach(item => { configMap[item.key] = item.value; });
    } else {
      Object.assign(configMap, rawData);
    }

    // 1. Apply Theme Colors
    if (configMap.background_color) {
      document.documentElement.style.setProperty('--main-bg', configMap.background_color);
      document.body.style.backgroundColor = 'var(--main-bg)';
    }
    if (configMap.secondary_color) {
      document.documentElement.style.setProperty('--accent-bg', configMap.secondary_color);
    }
    if (configMap.text_color) {
      document.documentElement.style.setProperty('--main-text', configMap.text_color);
    }
    if (configMap.text_hover_color) {
      document.documentElement.style.setProperty('--text-hover', configMap.text_hover_color);
    }

    // 2. Apply Dynamic Product Text
    if (configMap['product_title']) {
      const titleEl = document.getElementById('displayProductTitle');
      if (titleEl) titleEl.textContent = configMap['product_title'];
    }
    if (configMap['product_desc']) {
      const descEl = document.getElementById('displayProductDesc');
      if (descEl) descEl.textContent = configMap['product_desc'];
    }

  } catch (err) {
    console.error('Error loading store configuration:', err);
  }
});

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

    prevBtn?.onclick = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSliderPosition();
    };

    nextBtn?.onclick = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSliderPosition();
    };
}

function updateSliderPosition() {
    const track = document.getElementById('sliderTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

// Load slider images
async function loadSliderConfig() {
    try {
        const res = await fetch('/api/get-config');
        if (!res.ok) return;

        const rawData = await res.json();
        
        // Handle array response or object response format seamlessly
        let sliderVal = null;
        if (Array.isArray(rawData)) {
            const item = rawData.find(i => i.key === 'slider_images');
            if (item) sliderVal = item.value;
        } else if (rawData.slider_images) {
            sliderVal = rawData.slider_images;
        }

        if (sliderVal) {
            let urls = sliderVal;
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
        console.error('Error loading slider images:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadSliderConfig);