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
let autoSlideInterval = null;

function setupSlider(imageUrls) {
    const track = document.getElementById('sliderTrack');
    if (!track || !imageUrls || imageUrls.length === 0) return;

    track.innerHTML = '';
    imageUrls.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Slider Image';
        track.appendChild(img);
    });

    totalSlides = imageUrls.length;

    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSliderPosition();
            restartAutoSlide();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSliderPosition();
            restartAutoSlide();
        };
    }

    if (totalSlides > 1) {
        startAutoSlide();
    }
}

function updateSliderPosition() {
    const track = document.getElementById('sliderTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSliderPosition();
    }, 3500);
}

function restartAutoSlide() {
    startAutoSlide();
}

// 4. Load Categories & Products Grid with Expandable "See All"
async function loadStoreCategoriesAndProducts() {
    const container = document.getElementById('dynamicCategoriesContainer');
    if (!container) return;

    try {
        const [catRes, prodRes, configRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/get-products'),
            fetch('/api/get-config')
        ]);

        const categories = await catRes.json();
        const products = await prodRes.json();
        const config = await configRes.json();

        container.innerHTML = '';

        const categoryList = [...categories, { id: 'all', name: 'All Products' }];

        categoryList.forEach(cat => {
            const catProducts = cat.name === 'All Products' 
                ? products 
                : products.filter(p => p.category === cat.name);

            if (catProducts.length === 0) return;

            const section = document.createElement('section');
            section.className = 'category-section';

            const cardsHtml = catProducts.map(p => `
                <a href="product.html?id=${p.id}" class="scroll-card">
                    <div class="card-image-box" style="background-color: var(--secondary-color, ${config.secondaryColor || '#ffffff'});">
                        <img src="${p.image_url || 'media/cleanser.png'}" alt="${p.title}">
                    </div>
                    <h3>${p.title}</h3>
                    <p class="card-price">${p.price} BDT</p>
                </a>
            `).join('');

            section.innerHTML = `
                <div class="category-header-bar" style="background-color: var(--main-bg, ${config.backgroundColor || '#fdfbf7'});">
                    <h2 class="category-title">${cat.name}</h2>
                    <button class="see-all-btn" style="background-color: var(--secondary-color, ${config.secondaryColor || '#ffffff'}); color: var(--main-text, #1a1a1a); cursor: pointer;">See All</button>
                </div>
                <div class="horizontal-cards-scroll">
                    ${cardsHtml}
                </div>
            `;

            // Toggle functionality for the "See All" button
            const seeAllBtn = section.querySelector('.see-all-btn');
            const scrollContainer = section.querySelector('.horizontal-cards-scroll');

            seeAllBtn.addEventListener('click', () => {
                const isExpanded = scrollContainer.classList.toggle('grid-view');
                if (isExpanded) {
                    seeAllBtn.textContent = 'Show Less';
                    scrollContainer.style.display = 'grid';
                    scrollContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
                    scrollContainer.style.gap = '20px';
                    scrollContainer.style.overflowX = 'visible';
                } else {
                    seeAllBtn.textContent = 'See All';
                    scrollContainer.style.display = '';
                    scrollContainer.style.gridTemplateColumns = '';
                    scrollContainer.style.gap = '';
                    scrollContainer.style.overflowX = '';
                }
            });

            container.appendChild(section);
        });
    } catch(e) { 
        console.error('Error loading store data:', e); 
    }
}

// 5. Unified DOMContentLoaded Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Load Store Configuration, Theme & Slider
    try {
        const res = await fetch('/api/get-config');
        if (res.ok) {
            const rawData = await res.json();
            const configMap = {};
            if (Array.isArray(rawData)) {
                rawData.forEach(item => { configMap[item.key] = item.value; });
            } else {
                Object.assign(configMap, rawData);
            }

            const bgColor = configMap.backgroundColor || configMap.background_color;
            const secondaryColor = configMap.secondaryColor || configMap.secondary_color;
            const textColor = configMap.textColor || configMap.text_color;
            const textHoverColor = configMap.textHoverColor || configMap.text_hover_color;

            if (bgColor) {
                document.documentElement.style.setProperty('--main-bg', bgColor);
                document.body.style.backgroundColor = 'var(--main-bg)';
            }
            if (secondaryColor) document.documentElement.style.setProperty('--accent-bg', secondaryColor);
            if (textColor) document.documentElement.style.setProperty('--main-text', textColor);
            if (textHoverColor) document.documentElement.style.setProperty('--text-hover', textHoverColor);

            if (configMap['product_title']) {
                const titleEl = document.getElementById('productTitleDisplay');
                if (titleEl) titleEl.textContent = configMap['product_title'];
            }
            if (configMap['product_desc']) {
                const descEl = document.getElementById('productDescDisplay');
                if (descEl) descEl.textContent = configMap['product_desc'];
            }

            if (configMap.slider_images) {
                let urls = configMap.slider_images;
                if (typeof urls === 'string') {
                    try { urls = JSON.parse(urls); } catch (e) {}
                }
                if (Array.isArray(urls) && urls.length > 0) {
                    setupSlider(urls);
                }
            }
        }
    } catch (err) {
        console.error('Error loading config:', err);
    }

    // Load Products & Categories
    loadStoreCategoriesAndProducts();
});