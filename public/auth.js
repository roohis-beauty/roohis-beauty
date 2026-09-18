// Initialize Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzvDFscBuvKh1w5jMNcHpnkP895WF2K1U",
    authDomain: "roohis-beauty.firebaseapp.com",
    projectId: "roohis-beauty",
    storageBucket: "roohis-beauty.firebasestorage.app",
    messagingSenderId: "890578261102",
    appId: "1:890578261102:web:ad6e64b0b9483e0178827f",
    measurementId: "G-6DSYJK70F0"
};

// Ensure Firebase isn't initialized multiple times
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// 1. Google OAuth Sign-In
async function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        await syncUserToDatabase({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber,
            provider: 'google'
        });

        alert(`Welcome back, ${user.displayName || 'Customer'}!`);
        location.reload();
    } catch (error) {
        console.error("Google Auth Error:", error);
        alert(error.message || "Failed to sign in with Google.");
    }
}

// 2. Email & Password Sign-In / Auto-Registration
async function loginWithEmail(email, password) {
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        alert("Successfully logged in!");
        location.reload();
    } catch (error) {
        // If user does not exist, automatically register them
        if (error.code === 'auth/user-not-found') {
            try {
                const newResult = await auth.createUserWithEmailAndPassword(email, password);
                const newUser = newResult.user;

                await syncUserToDatabase({
                    id: newUser.uid,
                    name: email.split('@')[0],
                    email: email,
                    phone: null,
                    provider: 'email'
                });

                alert("Account created successfully!");
                location.reload();
            } catch (signupError) {
                console.error("Sign-Up Error:", signupError);
                alert(signupError.message);
            }
        } else {
            console.error("Email Login Error:", error);
            alert(error.message);
        }
    }
}

// 3. Sync Profile Data to Turso Database via Vercel Endpoint
async function syncUserToDatabase(userData) {
    try {
        const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            console.warn("User sync warning: Server responded with status", response.status);
        }
    } catch (err) {
        console.error("Failed to sync user to server database:", err);
    }
}

// 4. Sign Out Handler
async function logoutUser() {
    try {
        await auth.signOut();
        alert("Logged out successfully.");
        location.reload();
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Automatically Update Navbar UI State
auth.onAuthStateChanged((user) => {
    const accountBtn = document.getElementById('accountNavBtn');
    if (accountBtn) {
        if (user) {
            accountBtn.textContent = user.displayName || user.email.split('@')[0] || 'My Account';
            accountBtn.onclick = () => {
                if (confirm("Do you want to log out?")) {
                    logoutUser();
                }
            };
        } else {
            accountBtn.textContent = 'Sign In';
            accountBtn.onclick = loginWithGoogle;
        }
    }
});
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function handleEmailAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    loginWithEmail(email, password);
}

// Attach opening logic to the nav button automatically
auth.onAuthStateChanged((user) => {
    const accountBtn = document.getElementById('accountNavBtn');
    if (accountBtn) {
        if (user) {
            accountBtn.textContent = user.displayName || user.email.split('@')[0] || 'My Account';
            accountBtn.onclick = () => {
                if (confirm("Do you want to log out?")) logoutUser();
            };
        } else {
            accountBtn.textContent = 'Sign In';
            accountBtn.onclick = openAuthModal;
        }
    }
});

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function handleEmailAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    loginWithEmail(email, password);
}

// Attach opening logic to the nav button automatically
auth.onAuthStateChanged((user) => {
    const accountBtn = document.getElementById('accountNavBtn');
    if (accountBtn) {
        if (user) {
            accountBtn.textContent = user.displayName || user.email.split('@')[0] || 'My Account';
            accountBtn.onclick = () => {
                if (confirm("Do you want to log out?")) logoutUser();
            };
        } else {
            accountBtn.textContent = 'Sign In';
            accountBtn.onclick = openAuthModal;
        }
    }
});