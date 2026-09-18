// admin.js - Storefront Admin Portal Logic

// Helper Function: Single Config Updater (Placed globally so all handlers can access it)
async function saveSingleConfig(key, value) {
    const res = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to update ${key}`);
    }
    return data;
}

// Load categories into dropdown
async function loadCategories() {
    const catSelect = document.getElementById('prodCategorySelect');
    if (!catSelect) return;

    try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        
        const categories = await res.json();
        
        if (Array.isArray(categories) && categories.length > 0) {
            catSelect.innerHTML = categories
                .map(c => `<option value="${c.name}">${c.name}</option>`)
                .join('');
        } else {
            catSelect.innerHTML = `<option value="">No categories found</option>`;
        }
    } catch (e) {
        console.error('Error loading categories:', e);
        catSelect.innerHTML = `<option value="">Error loading categories</option>`;
    }
}

// Load and render products inside the admin dashboard
async function loadAdminProducts() {
    const container = document.getElementById('adminProductsContainer') || document.getElementById('productList');
    if (!container) return;

    try {
        const res = await fetch('/api/get-products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<p>No products found.</p>';
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="admin-product-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${p.image_url ? `<img src="${p.image_url}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : ''}
                    <div>
                        <strong>${p.title}</strong> - $${p.price} <span style="font-size: 0.85em; opacity: 0.7;">(${p.category})</span>
                    </div>
                </div>
                <button type="button" onclick="deleteProduct(${p.id})" style="background: #ff4d4d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Delete</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error loading admin products:', e);
    }
}

// Delete product handler
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`/api/delete-product?id=${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.success) {
            loadAdminProducts(); // Refresh the admin product list
        } else {
            alert('Error: ' + result.error);
        }
    } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete product.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. DOM Elements
    // -----------------------------------------------------------------
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');

    const goToLogin = document.getElementById('goToLogin');
    const goToRegister = document.getElementById('goToRegister');

    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    const themeToggleBtn = document.getElementById('themeToggleBtn');

    const bgColorPicker = document.getElementById('bgColorPicker');
    const hexDisplay = document.getElementById('hexCodeDisplay');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const secondaryHexDisplay = document.getElementById('secondaryHexDisplay');
    const textColorPicker = document.getElementById('textColorPicker');
    const textHexDisplay = document.getElementById('textHexDisplay');
    const textHoverColorPicker = document.getElementById('textHoverColorPicker');
    const textHoverHexDisplay = document.getElementById('textHoverHexDisplay');
    const saveConfigBtn = document.getElementById('saveConfigBtn');

    const productTitleInput = document.getElementById('productTitleInput');
    const productDescInput = document.getElementById('productDescInput');
    const saveTextBtn = document.getElementById('saveTextBtn');

    // -----------------------------------------------------------------
    // 2. View Routing & Auth Session Check
    // -----------------------------------------------------------------
    if (sessionStorage.getItem('adminUser')) {
        showDashboard();
    }

    goToLogin?.addEventListener('click', () => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    goToRegister?.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    function showDashboard() {
        registerView?.classList.add('hidden');
        loginView?.classList.add('hidden');
        dashboardView?.classList.remove('hidden');
        loadCurrentConfig();
        loadCategories(); // Fetch categories when dashboard opens
        loadAdminProducts(); // Fetch and display products list
    }

    // -----------------------------------------------------------------
    // 3. Authentication Actions
    // -----------------------------------------------------------------
    registerBtn?.addEventListener('click', async () => {
        const email = document.getElementById('regEmail')?.value;
        const password = document.getElementById('regPassword')?.value;

        if (!email || !password) {
            alert('Please fill out all fields.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                alert('Account created successfully!');
                sessionStorage.setItem('adminUser', email);
                showDashboard();
            } else {
                alert('Registration failed. An owner account might already exist.');
            }
        } catch (err) {
            console.error('Registration error:', err);
        }
    });

    loginBtn?.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                sessionStorage.setItem('adminUser', email);
                showDashboard();
            } else {
                alert('Invalid email or password.');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    });

    logoutBtn?.addEventListener('click', () => {
        sessionStorage.removeItem('adminUser');
        dashboardView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
    });

    deleteAccountBtn?.addEventListener('click', async () => {
        const confirmDelete = confirm('Are you sure you want to delete this account? This will un-assign current owner access and allow a new owner to register.');
        if (!confirmDelete) return;

        try {
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('Account deleted. System ready for a new owner to register.');
                sessionStorage.removeItem('adminUser');
                dashboardView?.classList.add('hidden');
                registerView?.classList.remove('hidden');
            } else {
                alert('Failed to delete account.');
            }
        } catch (err) {
            console.error('Account deletion error:', err);
        }
    });

    // -----------------------------------------------------------------
    // 4. Admin UI Themes & Color Input Sync
    // -----------------------------------------------------------------
    themeToggleBtn?.addEventListener('click', () => {
        const root = document.documentElement;
        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
            themeToggleBtn.textContent = 'Dark Mode';
        } else {
            root.setAttribute('data-theme', 'dark');
            themeToggleBtn.textContent = 'Light Mode';
        }
    });

    bgColorPicker?.addEventListener('input', (e) => {
        if (hexDisplay) hexDisplay.textContent = e.target.value;
    });

    secondaryColorPicker?.addEventListener('input', (e) => {
        if (secondaryHexDisplay) secondaryHexDisplay.textContent = e.target.value;
    });

    textColorPicker?.addEventListener('input', (e) => {
        if (textHexDisplay) textHexDisplay.textContent = e.target.value;
    });

    textHoverColorPicker?.addEventListener('input', (e) => {
        if (textHoverHexDisplay) textHoverHexDisplay.textContent = e.target.value;
    });

    // -----------------------------------------------------------------
    // 5. Data Fetching & Saving
    // -----------------------------------------------------------------
    async function loadCurrentConfig() {
        try {
            const res = await fetch('/api/get-config');
            if (!res.ok) return;

            const config = await res.json();

            if (config.backgroundColor && bgColorPicker) {
                bgColorPicker.value = config.backgroundColor;
                if (hexDisplay) hexDisplay.textContent = config.backgroundColor;
            }
            if (config.secondaryColor && secondaryColorPicker) {
                secondaryColorPicker.value = config.secondaryColor;
                if (secondaryHexDisplay) secondaryHexDisplay.textContent = config.secondaryColor;
            }
            if (config.textColor && textColorPicker) {
                textColorPicker.value = config.textColor;
                if (textHexDisplay) textHexDisplay.textContent = config.textColor;
            }
            if (config.textHoverColor && textHoverColorPicker) {
                textHoverColorPicker.value = config.textHoverColor;
                if (textHoverHexDisplay) textHoverHexDisplay.textContent = config.textHoverColor;
            }

            if (config.product_title && productTitleInput) {
                productTitleInput.value = config.product_title;
            }
            if (config.product_desc && productDescInput) {
                productDescInput.value = config.product_desc;
            }
            if (config.whatsapp_number && document.getElementById('whatsappInput')) {
                document.getElementById('whatsappInput').value = config.whatsapp_number;
            }
        } catch (err) {
            console.error('Error fetching current config:', err);
        }
    }

    saveConfigBtn?.addEventListener('click', async () => {
        try {
            if (bgColorPicker) await saveSingleConfig('backgroundColor', bgColorPicker.value);
            if (secondaryColorPicker) await saveSingleConfig('secondaryColor', secondaryColorPicker.value);
            if (textColorPicker) await saveSingleConfig('textColor', textColorPicker.value);
            if (textHoverColorPicker) await saveSingleConfig('textHoverColor', textHoverColorPicker.value);

            alert('Theme colors saved successfully!');
        } catch (err) {
            console.error('Error saving colors:', err);
            alert('Failed to save settings: ' + err.message);
        }
    });

    saveTextBtn?.addEventListener('click', async () => {
        const title = productTitleInput ? productTitleInput.value : '';
        const desc = productDescInput ? productDescInput.value : '';

        try {
            await saveSingleConfig('product_title', title);
            await saveSingleConfig('product_desc', desc);

            alert('Product text saved successfully!');
        } catch (err) {
            console.error('Failed to save text:', err);
            alert('Error saving text: ' + err.message);
        }
    });

    // Upload Slider Images
    const sliderFileInput = document.getElementById('sliderFileInput');
    const uploadSliderBtn = document.getElementById('uploadSliderBtn');

    uploadSliderBtn?.addEventListener('click', async () => {
        const files = sliderFileInput?.files;
        if (!files || files.length === 0) {
            alert('Please pick at least one image from your gallery.');
            return;
        }

        uploadSliderBtn.disabled = true;
        uploadSliderBtn.innerText = 'Uploading...';

        const uploadedUrls = [];

        try {
            for (let file of files) {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'x-filename': file.name },
                    body: file
                });

                if (!uploadRes.ok) {
                    const errText = await uploadRes.text();
                    throw new Error(`Upload failed: ${uploadRes.status} - ${errText}`);
                }

                const blobData = await uploadRes.json();
                if (blobData.url) {
                    uploadedUrls.push(blobData.url);
                }
            }

            if (uploadedUrls.length > 0) {
                await saveSingleConfig('slider_images', JSON.stringify(uploadedUrls));
                alert('Images uploaded and saved to slider successfully!');
            }
        } catch (err) {
            console.error('Slider Upload Error:', err);
            alert('Upload Error: ' + err.message);
        } finally {
            uploadSliderBtn.disabled = false;
            uploadSliderBtn.innerText = 'Upload Selected Images';
        }
    });

    // Add category handler
    document.getElementById('addNewCatBtn')?.addEventListener('click', async () => {
        const newCat = prompt("Enter new category name:");
        if (!newCat || !newCat.trim()) return;

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCat.trim() })
            });

            if (res.ok) {
                alert('Category created!');
                await loadCategories();
                const catSelect = document.getElementById('prodCategorySelect');
                if (catSelect) catSelect.value = newCat.trim();
            } else {
                alert('Failed to add category.');
            }
        } catch (e) {
            console.error('Category creation error:', e);
        }
    });

    // Save WhatsApp Number
    document.getElementById('saveWhatsappBtn')?.addEventListener('click', async () => {
        const num = document.getElementById('whatsappInput')?.value;
        try {
            await saveSingleConfig('whatsapp_number', num);
            alert('WhatsApp number saved!');
        } catch (e) {
            alert('Error saving WhatsApp number: ' + e.message);
        }
    });

    // Save Product Handler
    document.getElementById('saveProductBtn')?.addEventListener('click', async () => {
        const title = document.getElementById('prodTitle')?.value;
        const price = document.getElementById('prodPrice')?.value;
        const category = document.getElementById('prodCategorySelect')?.value;
        const short_desc = document.getElementById('prodShortDesc')?.value;
        const long_desc = document.getElementById('prodLongDesc')?.value;
        const fileInput = document.getElementById('prodImageInput');

        if (!title || !price || !category) {
            alert('Please fill out title, price, and category.');
            return;
        }

        let image_url = '';
        if (fileInput?.files[0]) {
            const file = fileInput.files[0];
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-filename': file.name },
                body: file
            });
            const blobData = await uploadRes.json();
            image_url = blobData.url || '';
        }

        const res = await fetch('/api/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price, short_desc, long_desc, category, image_url })
        });

        if (res.ok) {
            alert('Product added successfully!');
            location.reload();
        } else {
            alert('Failed to save product.');
        }
    });
});
// Load and render products inside the admin dashboard
async function loadAdminProducts() {
    const container = document.getElementById('adminProductsContainer');
    if (!container) return;

    try {
        const res = await fetch('/api/get-products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<p style="font-size: 13px; color: #666;">No products found.</p>';
            return;
        }

        container.innerHTML = products.map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--admin-border); font-size: 14px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${p.image_url ? `<img src="${p.image_url}" alt="" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px;">` : ''}
                    <div>
                        <strong>${p.title}</strong> — <span style="opacity: 0.8;">৳${p.price}</span> <span style="font-size: 0.8em; opacity: 0.6;">(${p.category})</span>
                    </div>
                </div>
                <button type="button" onclick="deleteProduct(${p.id})" style="background: var(--danger-btn, #d9534f); color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">Delete</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error loading admin products:', e);
        container.innerHTML = '<p style="font-size: 13px; color: #d9534f;">Failed to load products.</p>';
    }
}
