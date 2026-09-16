// admin.js - Storefront Admin Portal Logic

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. DOM Elements
    // -----------------------------------------------------------------
    // Views
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');

    // Navigation Links
    const goToLogin = document.getElementById('goToLogin');
    const goToRegister = document.getElementById('goToRegister');

    // Auth Controls
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // Theme & Aesthetic Controls
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // Color Pickers & Displays
    const bgColorPicker = document.getElementById('bgColorPicker');
    const hexDisplay = document.getElementById('hexCodeDisplay');
    const secondaryColorPicker = document.getElementById('secondaryColorPicker');
    const secondaryHexDisplay = document.getElementById('secondaryHexDisplay');
    const textColorPicker = document.getElementById('textColorPicker');
    const textHexDisplay = document.getElementById('textHexDisplay');
    const textHoverColorPicker = document.getElementById('textHoverColorPicker');
    const textHoverHexDisplay = document.getElementById('textHoverHexDisplay');
    const saveConfigBtn = document.getElementById('saveConfigBtn');

    // Product Text Controls
    const productTitleInput = document.getElementById('productTitleInput');
    const productDescInput = document.getElementById('productDescInput');
    const saveTextBtn = document.getElementById('saveTextBtn');

    // -----------------------------------------------------------------
    // Helper Function: Single Config Updater
    // -----------------------------------------------------------------
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
    }

    // -----------------------------------------------------------------
    // 3. Authentication Actions
    // -----------------------------------------------------------------
    // Register
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

    // Login
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

    // Logout
    logoutBtn?.addEventListener('click', () => {
        sessionStorage.removeItem('adminUser');
        dashboardView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
    });

    // Delete Account
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

            // Populate Colors
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

            // Populate Product Text
            if (config.product_title && productTitleInput) {
                productTitleInput.value = config.product_title;
            }
            if (config.product_desc && productDescInput) {
                productDescInput.value = config.product_desc;
            }
        } catch (err) {
            console.error('Error fetching current config:', err);
        }
    }

    // Save Theme Colors
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

    // Save Product Title and Description
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
});
// Load categories into dropdown
async function loadCategories() {
    const catSelect = document.getElementById('prodCategorySelect');
    if (!catSelect) return;
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        catSelect.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    } catch(e) { console.error(e); }
}

// Add category handler
document.getElementById('addNewCatBtn')?.addEventListener('click', async () => {
    const newCat = prompt("Enter new category name:");
    if (!newCat) return;
    await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat })
    });
    alert('Category created!');
    loadCategories();
});

// Save WhatsApp Number
document.getElementById('saveWhatsappBtn')?.addEventListener('click', async () => {
    const num = document.getElementById('whatsappInput')?.value;
    await saveSingleConfig('whatsapp_number', num);
    alert('WhatsApp number saved!');
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

// Initialize
loadCategories();