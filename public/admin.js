// admin.js

document.getElementById('saveConfigBtn').addEventListener('click', async () => {
    const selectedBgColor = document.getElementById('bgColorPicker').value;

    // Package the changes
    const payload = {
        backgroundColor: selectedBgColor
    };

    try {
        // Send the changes to your backend API to save in Turso
        const response = await window.fetch('/api/update-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Settings saved and deployed successfully!');
        } else {
            alert('Failed to save settings.');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Views
    const registerView = document.getElementById('registerView');
    const loginView = document.getElementById('loginView');
    const dashboardView = document.getElementById('dashboardView');

    // View Navigation Links
    const goToLogin = document.getElementById('goToLogin');
    const goToRegister = document.getElementById('goToRegister');

    // Auth Controls
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Dashboard Controls
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const hexCodeDisplay = document.getElementById('hexCodeDisplay');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // 1. Navigation Between Register / Login Views
    goToLogin.addEventListener('click', () => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    goToRegister.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    // Check if session exists on load
    if (sessionStorage.getItem('adminUser')) {
        showDashboard();
    }

    // 2. Account Registration Action
    registerBtn.addEventListener('click', async () => {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

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

    // 3. Login Action
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

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

    // 4. Logout Action
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminUser');
        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    // 5. Account Deletion (Allows handing off to a new owner)
    deleteAccountBtn.addEventListener('click', async () => {
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
                dashboardView.classList.add('hidden');
                registerView.classList.remove('hidden');
            } else {
                alert('Failed to delete account.');
            }
        } catch (err) {
            console.error('Account deletion error:', err);
        }
    });

    // Utility Functions & Aesthetics
    function showDashboard() {
        registerView.classList.add('hidden');
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    }

    themeToggleBtn.addEventListener('click', () => {
        const root = document.documentElement;
        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
            themeToggleBtn.textContent = 'Dark Mode';
        } else {
            root.setAttribute('data-theme', 'dark');
            themeToggleBtn.textContent = 'Light Mode';
        }
    });

    bgColorPicker.addEventListener('input', (e) => {
        hexCodeDisplay.textContent = e.target.value;
    });

    // Save Configuration
    saveConfigBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/update-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backgroundColor: bgColorPicker.value })
            });

            if (res.ok) alert('Store configuration deployed!');
        } catch (err) {
            console.error('Save error:', err);
        }
    });
});

// ==========================================
// STOREFRONT CONFIGURATION (Background Color)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Grab your color input and button elements by their HTML IDs
  const colorPicker = document.getElementById('bg-color-picker'); // Update ID if different
  const saveBtn = document.getElementById('save-settings-btn');   // Update ID if different

  if (saveBtn && colorPicker) {
    saveBtn.addEventListener('click', async () => {
      const selectedColor = colorPicker.value;

      try {
        const response = await fetch('/api/update-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backgroundColor: selectedColor }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Storefront background updated successfully!');
        } else {
          alert('Failed to save settings: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error saving background color:', err);
        alert('Server error saving settings.');
      }
    });
  }
});
// ==========================================
// STOREFRONT BACKGROUND COLOR SAVER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const colorPicker = document.getElementById('bgColorPicker');
  const hexDisplay = document.getElementById('hexCodeDisplay');
  const saveBtn = document.getElementById('saveConfigBtn');

  // Sync the text display (#fdfbf7) when picking a color
  if (colorPicker && hexDisplay) {
    colorPicker.addEventListener('input', (e) => {
      hexDisplay.textContent = e.target.value;
    });
  }

  // Save color to database
  if (saveBtn && colorPicker) {
    saveBtn.addEventListener('click', async () => {
      const selectedColor = colorPicker.value;

      try {
        const response = await fetch('/api/update-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backgroundColor: selectedColor }),
        });

        const data = await response.json();
        if (data.success) {
          alert('Storefront background updated successfully!');
        } else {
          alert('Failed to save settings: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error saving background color:', err);
        alert('Server error saving settings.');
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const colorPicker = document.getElementById('bgColorPicker');
  const hexDisplay = document.getElementById('hexCodeDisplay');
  const secondaryPicker = document.getElementById('secondaryColorPicker');
  const secondaryHexDisplay = document.getElementById('secondaryHexDisplay');
  const saveBtn = document.getElementById('saveConfigBtn');

  colorPicker?.addEventListener('input', (e) => hexDisplay.textContent = e.target.value);
  secondaryPicker?.addEventListener('input', (e) => secondaryHexDisplay.textContent = e.target.value);

  saveBtn?.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundColor: colorPicker.value,
          secondaryColor: secondaryPicker.value
        }),
      });

      const data = await res.json();
      if (data.success) alert('Theme colors saved successfully!');
    } catch (err) {
      console.error('Error saving colors:', err);
    }
  });
});