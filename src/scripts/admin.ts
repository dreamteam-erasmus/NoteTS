// Admin page script

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

// --- Auth Guard ---
async function checkAdminAuth() {
    const userId = getCookie('userId');
    if (!userId) {
        window.location.href = '/login.html';
        return;
    }
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    const user = data.data?.find((u: any) => u.id === userId);
    if (!user || !user.isAdmin) {
        alert('Access Denied. Admins only.');
        window.location.href = '/dash.html';
        return;
    }
    const adminNameEl = document.getElementById('admin_name');
    const adminInitialsEl = document.getElementById('admin_initials');
    if (adminNameEl) adminNameEl.textContent = user.name;
    if (adminInitialsEl) adminInitialsEl.textContent = user.name.split(' ').map((n: string) => n[0]).join('');
}

// --- Mobile Nav ---
function setupMobileNav() {
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
        const aside = document.querySelector('aside');
        if (aside) {
            aside.classList.toggle('hidden');
            aside.classList.toggle('fixed');
            aside.classList.toggle('inset-0');
            aside.classList.toggle('z-[100]');
            aside.classList.toggle('w-full');
        }
    });

    // Close mobile menu on nav click
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const aside = document.querySelector('aside');
            if (window.innerWidth < 1024 && aside && !aside.classList.contains('hidden')) {
                aside.classList.add('hidden');
                aside.classList.remove('fixed', 'inset-0', 'z-[100]', 'w-full');
            }
        });
    });
}

// --- Data Fetching ---
async function fetchAll() {
    await Promise.all([
        fetchAnnouncements(),
        fetchEvents(),
        fetchUsers(),
        fetchSchedule(),
        fetchSavedSchedules(),
        fetchAlerts(),
        fetchUpdates(),
        fetchStats()
    ]);
}

async function fetchStats() {
    const [ann, ev, usr, alr] = await Promise.all([
        fetch(`${API_BASE}/announcements`).then(r => r.json()),
        fetch(`${API_BASE}/events`).then(r => r.json()),
        fetch(`${API_BASE}/users`).then(r => r.json()),
        fetch(`${API_BASE}/alerts`).then(r => r.json())
    ]);
    const statAnn = document.getElementById('stat-ann-count');
    const statEvent = document.getElementById('stat-event-count');
    const statUser = document.getElementById('stat-user-count');
    const statAlert = document.getElementById('stat-alert-count');
    if (statAnn) statAnn.textContent = String(ann.data?.length || 0);
    if (statEvent) statEvent.textContent = String(ev.data?.length || 0);
    if (statUser) statUser.textContent = String(usr.data?.length || 0);
    if (statAlert) statAlert.textContent = String(alr.data?.length || 0);
}

async function fetchAnnouncements() {
    const res = await fetch(`${API_BASE}/announcements`);
    const data = await res.json();
    const container = document.getElementById('announcements-list');
    if (!container) return;
    container.innerHTML = data.data?.slice().reverse().map((ann: any) => `
        <div class="group flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/40 cursor-default relative overflow-hidden">
            <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                    <div class="h-2 w-2 rounded-full ${ann.type === 'urgent' ? 'bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.5)]' : ann.type === 'sports' ? 'bg-warning' : 'bg-accent'}"></div>
                    <h3 class="font-bold text-foreground">${ann.title}</h3>
                </div>
                <p class="text-sm text-muted-foreground leading-relaxed">${ann.content}</p>
            </div>
            <button onclick="deleteItem('/announcements', '${ann.id}')" class="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        </div>
    `).join('') || '<p class="p-8 text-center text-muted-foreground italic">No announcements found</p>';
    lucide.createIcons();
}

async function fetchEvents() {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    const container = document.getElementById('events-list');
    if (!container) return;
    container.innerHTML = data.data?.slice().reverse().map((ev: any) => `
        <div class="p-4 rounded-xl bg-card border border-border hover:border-accent/40 transition-all group flex items-start justify-between">
            <div class="flex items-start gap-3">
                <div class="h-2 w-2 rounded-full mt-1.5 shrink-0 ${ev.type === 'sports' ? 'bg-chart-2' : 'bg-info'}"></div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-foreground text-sm mb-1.5">${ev.title}</h3>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase">
                            <i data-lucide="clock" class="h-3 w-3"></i> ${new Date(ev.time).toLocaleString()}
                        </div>
                        <div class="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase">
                            <i data-lucide="map-pin" class="h-3 w-3"></i> ${ev.location || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="deleteItem('/events', '${ev.id}')" class="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        </div>
    `).join('') || '<p class="p-8 text-center text-muted-foreground italic">No upcoming events</p>';
    lucide.createIcons();
}

async function fetchAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    const data = await res.json();
    const container = document.getElementById('alerts-list');
    if (!container) return;
    container.innerHTML = data.data?.slice().reverse().map((al: any) => `
        <div class="p-4 rounded-xl bg-destructive/5 border border-destructive/20 hover:border-destructive/40 flex items-start justify-between group">
            <div class="flex items-start gap-3 min-w-0">
                <i data-lucide="alert-triangle" class="h-4 w-4 text-destructive mt-0.5 shrink-0"></i>
                <p class="text-sm font-medium text-foreground">${al.message}</p>
            </div>
            <button onclick="deleteItem('/alerts', '${al.id}')" class="p-2 text-muted-foreground hover:text-destructive shrink-0">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        </div>
    `).join('') || '<p class="p-8 text-center text-muted-foreground italic">No active system alerts</p>';
    lucide.createIcons();
}

async function fetchUpdates() {
    const res = await fetch(`${API_BASE}/updates`);
    const data = await res.json();
    const container = document.getElementById('updates-list');
    if (!container) return;
    container.innerHTML = data.data?.slice().reverse().map((up: any) => `
        <div class="p-4 rounded-xl bg-card border border-border hover:border-accent/40 group flex items-start justify-between">
            <div class="flex items-start gap-3 min-w-0">
                <i data-lucide="check-circle-2" class="h-4 w-4 text-accent mt-0.5 shrink-0"></i>
                <p class="text-sm font-medium text-foreground">${up.message}</p>
            </div>
            <button onclick="deleteItem('/updates', '${up.id}')" class="p-2 text-muted-foreground hover:text-destructive shrink-0">
                <i data-lucide="trash-2" class="h-4 w-4"></i>
            </button>
        </div>
    `).join('') || '<p class="p-8 text-center text-muted-foreground italic">No recent updates</p>';
    lucide.createIcons();
}

async function fetchUsers() {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    const container = document.getElementById('users-table-body');
    if (!container) return;
    container.innerHTML = data.data?.map((user: any) => `
        <tr class="hover:bg-secondary/20 transition-colors">
            <td class="px-6 py-4 font-medium text-foreground">${user.name}</td>
            <td class="px-6 py-4 text-muted-foreground">${user.email}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                    ${user.classId || '-'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.isAdmin ? 'bg-accent/20 text-accent' : 'bg-muted/30 text-muted-foreground'}">
                    ${user.isAdmin ? 'Admin' : 'Student'}
                </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="toggleAdmin('${user.id}')" class="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Toggle Admin">
                    <i data-lucide="shield" class="h-4 w-4"></i>
                </button>
                <button onclick="deleteItem('/users', '${user.id}')" class="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive" title="Delete User">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `).join('') || '';
    lucide.createIcons();
}

async function fetchSchedule() {
    const classIdEl = document.getElementById('sched-class-id') as HTMLInputElement | null;
    const classId = classIdEl?.value || '';
    const res = await fetch(`${API_BASE}/schedules?classId=${classId}`);
    const data = await res.json();

    const gridData = data.data?.[0]?.periods || Array(8).fill(null).map(() => Array(5).fill({ name: '', teacher: '', room: '' }));
    renderScheduleGrid(gridData);
}

function renderScheduleGrid(gridData: any[][]) {
    const container = document.getElementById('schedule-grid-container');
    if (!container) return;
    container.innerHTML = Array(8).fill(0).map((_, pIdx) => `
        <div class="grid grid-cols-6 border-b border-border last:border-0 hover:bg-secondary/10">
            <div class="p-4 flex items-center justify-center border-r border-border font-bold text-muted-foreground">
                ${pIdx + 1}
            </div>
            ${Array(5).fill(0).map((_, dIdx) => {
        const cell = gridData[pIdx]?.[dIdx] || { name: '', teacher: '', room: '' };
        return `
                <div class="p-2 border-r border-border last:border-0 space-y-1">
                    <input type="text" placeholder="Subject" value="${cell.name || ''}" data-p="${pIdx}" data-d="${dIdx}" data-field="name" class="sched-input w-full px-2 py-1 bg-secondary/50 border border-border rounded text-xs focus:ring-1 focus:ring-accent outline-none">
                    <div class="grid grid-cols-2 gap-1">
                        <input type="text" placeholder="Room" value="${cell.room || ''}" data-p="${pIdx}" data-d="${dIdx}" data-field="room" class="sched-input w-full px-1.5 py-0.5 bg-secondary/30 border border-border rounded text-[10px] outline-none">
                        <input type="text" placeholder="Teach" value="${cell.teacher || ''}" data-p="${pIdx}" data-d="${dIdx}" data-field="teacher" class="sched-input w-full px-1.5 py-0.5 bg-secondary/30 border border-border rounded text-[10px] outline-none">
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    `).join('');
}

async function fetchSavedSchedules() {
    const res = await fetch(`${API_BASE}/schedules`);
    const data = await res.json();
    const container = document.getElementById('saved-schedules-list');
    if (!container) return;

    if (!data.data || data.data.length === 0) {
        container.innerHTML = '<p class="text-xs text-muted-foreground italic p-4 text-center border border-dashed border-border rounded-xl">No saved schedules yet</p>';
        return;
    }

    container.innerHTML = data.data.map((sched: any) => `
        <div class="rounded-xl border border-border bg-card overflow-hidden">
            <div class="flex items-center justify-between p-3 bg-secondary/10 cursor-pointer hover:bg-secondary/20" onclick="toggleAccordion('${sched.id}')">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <i data-lucide="book-open" class="h-4 w-4 text-accent"></i>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-foreground">Class: ${sched.classId || 'Global'}</h4>
                        <p class="text-[10px] text-muted-foreground uppercase font-medium">Weekly Grid</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="loadToEditor('${sched.classId}', event)" class="px-2 py-1 bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground text-[10px] font-bold rounded-md">EDIT</button>
                    <button onclick="deleteItem('/schedules', '${sched.id}', event)" class="p-1 text-muted-foreground hover:text-destructive"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                    <i data-lucide="chevron-down" class="h-4 w-4 text-muted-foreground" id="icon-${sched.id}"></i>
                </div>
            </div>
            <div id="content-${sched.id}" class="hidden flex flex-col divide-y divide-border border-t border-border bg-black/20">
                ${[0, 1, 2, 3, 4].map(dIdx => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const subjects = sched.periods.map((row: any) => row[dIdx]?.name).filter(Boolean);
        return `
                        <div class="p-2.5 flex items-start gap-4">
                            <span class="text-[10px] font-bold text-muted-foreground uppercase w-8">${days[dIdx]}</span>
                            <div class="flex-1 flex flex-wrap gap-1.5">
                                ${subjects.length > 0 ? subjects.map((s: string) => `<span class="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-secondary-foreground font-medium">${s}</span>`).join('') : '<span class="text-[10px] text-muted-foreground italic">No classes</span>'}
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- UI Helpers ---
function toggleAccordion(id: string) {
    const content = document.getElementById(`content-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (!content || !icon) return;
    const isHidden = content.classList.contains('hidden');

    // Close all others
    document.querySelectorAll('[id^="content-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="icon-"]').forEach(el => el.classList.remove('rotate-180'));

    if (isHidden) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    }
}

function loadToEditor(classId: string, event?: Event) {
    if (event) event.stopPropagation();
    const classIdEl = document.getElementById('sched-class-id') as HTMLInputElement | null;
    if (classIdEl) classIdEl.value = classId;
    fetchSchedule();
    setActiveNav('Schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- API Actions ---
async function submitUser() {
    const nameEl = document.getElementById('user-name') as HTMLInputElement | null;
    const emailEl = document.getElementById('user-email') as HTMLInputElement | null;
    const passwordEl = document.getElementById('user-password') as HTMLInputElement | null;
    const classEl = document.getElementById('user-class') as HTMLInputElement | null;
    const isAdminEl = document.getElementById('user-is-admin') as HTMLInputElement | null;

    const name = nameEl?.value || '';
    const email = emailEl?.value || '';
    const password = passwordEl?.value || '';
    const classId = classEl?.value || '';
    const isAdmin = isAdminEl?.checked || false;

    if (!name || !email || !password) return alert('Fill required fields');

    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, classId, isAdmin })
    });

    if (res.ok) {
        closeModal('user');
        fetchUsers();
    }
}

async function submitAlert() {
    const messageEl = document.getElementById('alert-message') as HTMLTextAreaElement | null;
    const message = messageEl?.value || '';
    if (!message) return alert('Message is required');

    await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    closeModal('alert');
    if (messageEl) messageEl.value = '';
    fetchAll();
}

async function submitUpdate() {
    const messageEl = document.getElementById('update-message') as HTMLTextAreaElement | null;
    const message = messageEl?.value || '';
    if (!message) return alert('Content is required');

    await fetch(`${API_BASE}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    closeModal('update');
    if (messageEl) messageEl.value = '';
    fetchAll();
}

async function submitAnnouncement() {
    const titleEl = document.getElementById('ann-title') as HTMLInputElement | null;
    const contentEl = document.getElementById('ann-content') as HTMLTextAreaElement | null;
    const typeEl = document.getElementById('ann-type') as HTMLSelectElement | null;

    const title = titleEl?.value || '';
    const content = contentEl?.value || '';
    const type = typeEl?.value || 'general';

    if (!title || !content) return alert('Fill all fields');

    await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type })
    });
    closeModal('ann');
    fetchAll();
}

async function submitEvent() {
    const titleEl = document.getElementById('event-title') as HTMLInputElement | null;
    const locationEl = document.getElementById('event-location') as HTMLInputElement | null;
    const timeEl = document.getElementById('event-time') as HTMLInputElement | null;
    const typeEl = document.getElementById('event-type') as HTMLSelectElement | null;

    const title = titleEl?.value || '';
    const location = locationEl?.value || '';
    const time = timeEl?.value || '';
    const type = typeEl?.value || 'academic';

    if (!title || !time) return alert('Fill required fields');

    await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, location, time, type })
    });
    closeModal('event');
    fetchAll();
}

async function deleteItem(endpoint: string, id: string, event?: Event) {
    if (event) event.stopPropagation();
    if (!confirm('Are you sure?')) return;
    await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    if (endpoint === '/users') fetchUsers();
    else if (endpoint === '/schedules') fetchSavedSchedules();
    else fetchAll();
}

async function toggleAdmin(id: string) {
    await fetch(`${API_BASE}/users/toggle-admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    fetchUsers();
}

async function saveSchedule() {
    const classIdEl = document.getElementById('sched-class-id') as HTMLInputElement | null;
    const classId = classIdEl?.value || '';
    const grid: any[][] = Array(8).fill(null).map(() => Array(5).fill({}));
    document.querySelectorAll('.sched-input').forEach(input => {
        const el = input as HTMLInputElement;
        const p = parseInt(el.getAttribute('data-p') || '0');
        const d = parseInt(el.getAttribute('data-d') || '0');
        const field = el.getAttribute('data-field') || '';
        grid[p][d] = { ...grid[p][d], [field]: el.value };
    });

    const res = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periods: grid, classId })
    });
    if (res.ok) {
        alert('Schedule saved!');
        fetchSavedSchedules();
    } else alert('Failed to save schedule');
}

// --- UI Logic ---
function setActiveNav(label: string) {
    const titleEl = document.getElementById('active-nav-title');
    if (titleEl) titleEl.textContent = label;
    document.querySelectorAll('.nav-section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(`section-${label}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.getAttribute('data-nav') === label) {
            btn.classList.add('bg-secondary', 'text-foreground');
            btn.classList.remove('text-muted-foreground', 'hover:text-foreground', 'hover:bg-secondary/50');
        } else {
            btn.classList.remove('bg-secondary', 'text-foreground');
            btn.classList.add('text-muted-foreground', 'hover:text-foreground', 'hover:bg-secondary/50');
        }
    });
}

function openModal(id: string) {
    document.getElementById(`modal-${id}`)?.classList.remove('hidden');
}

function closeModal(id: string) {
    document.getElementById(`modal-${id}`)?.classList.add('hidden');
}

// --- Expose functions to window for onclick handlers ---
(window as any).setActiveNav = setActiveNav;
(window as any).openModal = openModal;
(window as any).closeModal = closeModal;
(window as any).submitUser = submitUser;
(window as any).submitAlert = submitAlert;
(window as any).submitUpdate = submitUpdate;
(window as any).submitAnnouncement = submitAnnouncement;
(window as any).submitEvent = submitEvent;
(window as any).deleteItem = deleteItem;
(window as any).toggleAdmin = toggleAdmin;
(window as any).saveSchedule = saveSchedule;
(window as any).toggleAccordion = toggleAccordion;
(window as any).loadToEditor = loadToEditor;
(window as any).fetchSchedule = fetchSchedule;

// --- Init ---
(async () => {
    lucide.createIcons();
    setupMobileNav();
    await checkAdminAuth();
    await fetchAll();
})();

export { };
