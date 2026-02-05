// School Info page script

// Access lucide from window (loaded via CDN)
const lucide = (window as any).lucide;

const API_BASE = '/api';

// --- Core Helpers ---
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

// --- Auth Check ---
async function checkAuth() {
    const userId = getCookie('userId');
    if (!userId) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) {
            window.location.href = '/login.html';
            return;
        }

        const data = await res.json();
        const users = data.data || [];
        const user = users.find((u: any) => u.id === userId);

        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        // Update user display
        const nameEl = document.getElementById('user_name_display');
        const roleEl = document.getElementById('user_role_display');
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.isAdmin ? 'Administrator' : 'Student';

        // Show admin link if admin
        if (user.isAdmin) {
            const adminLink = document.getElementById('admin-nav-link');
            if (adminLink) adminLink.classList.remove('hidden');
        }
    } catch {
        window.location.href = '/login.html';
    }
}

// --- Init ---
(async () => {
    lucide.createIcons();
    await checkAuth();
})();

export { };
