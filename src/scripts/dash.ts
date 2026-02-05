// Dashboard page script

// Access lucide from window (loaded via CDN)
const lucide = (window as any).lucide;

interface User {
    id: string;
    name: string;
    email: string;
    classId?: string;
    isAdmin: boolean;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'general' | 'urgent' | 'sports';
}

interface SchedulePeriod {
    name: string;
    teacher?: string;
    room?: string;
}

interface Schedule {
    id: string;
    classId: string;
    periods: SchedulePeriod[][];
}

interface SchoolEvent {
    id: string;
    title: string;
    time: string;
    location?: string;
    eventType: string;
}

interface Alert {
    id: string;
    message: string;
}

interface SystemUpdate {
    id: string;
    message: string;
}

const API_BASE = '/api';
let currentUser: User | null = null;

// --- Core Helpers ---
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        return { error: 'Failed to fetch' };
    }
}

// --- Init ---
async function init() {
    lucide.createIcons();
    updateClock();
    setInterval(updateClock, 1000);

    await fetchUserData();
    await fetchEverything();

    // Refresh periodic data
    setInterval(fetchEverything, 30000);
}

function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock_display');
    const dateEl = document.getElementById('date_display');
    if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-US');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function fetchEverything() {
    await Promise.all([
        fetchAnnouncements(),
        fetchSchedules(),
        fetchEvents(),
        fetchAlerts(),
        fetchUpdates()
    ]);
}

// --- Data Fetching ---
async function fetchUserData() {
    const userId = getCookie('userId');
    if (!userId) {
        window.location.href = '/login.html';
        return;
    }

    const res = await apiFetch<User[]>('/users');
    if (res.data) {
        currentUser = res.data.find(u => u.id === userId) || null;
        if (currentUser) {
            const nameEl = document.getElementById('user_name_display');
            const roleEl = document.getElementById('user_role_display');
            const greetingEl = document.getElementById('greeting_display');
            const adminLink = document.getElementById('admin-nav-link');

            if (nameEl) nameEl.textContent = currentUser.name;
            if (roleEl) roleEl.textContent = currentUser.isAdmin ? 'Admin' : 'Student';

            const hours = new Date().getHours();
            let greeting = 'Good evening';
            if (hours < 5) greeting = 'Good night';
            else if (hours < 12) greeting = 'Good morning';
            else if (hours < 18) greeting = 'Good afternoon';
            else if (hours >= 21) greeting = 'Good night';

            if (greetingEl) greetingEl.textContent = `${greeting}, ${currentUser.name.split(' ')[0]}`;

            // Show admin link if user is admin
            if (currentUser.isAdmin && adminLink) {
                adminLink.classList.remove('hidden');
            }
        }
    }
}

async function fetchAnnouncements() {
    const res = await apiFetch<Announcement[]>('/announcements');
    const container = document.getElementById('announcements_container');
    const countEl = document.getElementById('ann_count');

    if (res.data && container) {
        if (countEl) countEl.textContent = String(res.data.length);
        container.innerHTML = res.data.length ? res.data.slice().reverse().map(ann => `
            <div class="p-4 rounded-xl border border-border bg-card group">
                <div class="flex items-start gap-3">
                    <div class="h-2 w-2 rounded-full mt-2 shrink-0 ${ann.type === 'urgent' ? 'bg-destructive shadow-[0_0_8px_rgba(255,0,0,0.5)]' : ann.type === 'sports' ? 'bg-chart-2' : 'bg-accent'}"></div>
                    <div class="space-y-1">
                        <h4 class="text-sm font-bold text-foreground">${ann.title}</h4>
                        <p class="text-xs text-muted-foreground leading-relaxed">${ann.content}</p>
                    </div>
                </div>
            </div>
        `).join('') : '<div class="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">No announcements</div>';
    }
}

async function fetchSchedules() {
    const userId = getCookie('userId');
    const userRes = await apiFetch<User[]>('/users');
    const user = userRes.data?.find(u => u.id === userId);
    const classId = user?.classId || '';

    const res = await apiFetch<Schedule[]>(`/schedules?classId=${classId}`);
    const container = document.getElementById('schedule_list');

    if (res.data && res.data[0] && container) {
        const day = Math.min(new Date().getDay() - 1, 4);
        if (day === -1) {
            container.innerHTML = '<div class="p-12 text-center text-muted-foreground italic"><p class="text-sm">Weekend - no classes today</p></div>';
            updateCurrentClass(null);
            return;
        }

        const dayPeriods = res.data[0].periods.map(row => row[day]).filter(p => p && p.name);

        if (dayPeriods.length === 0) {
            container.innerHTML = '<div class="p-12 text-center text-muted-foreground italic"><p class="text-sm">No schedule for today</p></div>';
            updateCurrentClass(null);
            return;
        }

        container.innerHTML = dayPeriods.map((p, i) => `
            <div class="flex items-center gap-4 p-4 border-b border-border last:border-0 group">
                <div class="h-9 w-9 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                    ${i + 1}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-foreground">${p.name}</p>
                    <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">${p.teacher || 'Unknown'} · ${p.room || '-'}</p>
                </div>
                <i data-lucide="chevron-right" class="h-4 w-4 text-muted-foreground opacity-0"></i>
            </div>
        `).join('');

        updateCurrentClass(dayPeriods);
        lucide.createIcons();
    }
}

function updateCurrentClass(periods: SchedulePeriod[] | null) {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const timeVal = hour * 60 + min;

    const slots = [
        { s: 480, e: 525 },
        { s: 535, e: 580 },
        { s: 600, e: 645 },
        { s: 655, e: 700 },
        { s: 710, e: 755 },
        { s: 765, e: 810 },
        { s: 820, e: 865 },
        { s: 875, e: 920 }
    ];

    const currentIdx = slots.findIndex(s => timeVal >= s.s && timeVal <= s.e);
    const subjectEl = document.getElementById('current_subject');
    const teacherEl = document.getElementById('current_teacher');
    const roomEl = document.getElementById('current_room');

    if (periods && currentIdx !== -1 && periods[currentIdx]) {
        const current = periods[currentIdx];
        if (subjectEl) subjectEl.textContent = current.name || 'Free Period';
        if (teacherEl) teacherEl.textContent = current.teacher || '-';
        if (roomEl) roomEl.textContent = current.room || '-';
    } else {
        if (subjectEl) subjectEl.textContent = 'No ongoing classes';
        if (teacherEl) teacherEl.textContent = '-';
        if (roomEl) roomEl.textContent = '-';
    }
}

async function fetchAlerts() {
    const res = await apiFetch<Alert[]>('/alerts');
    const banner = document.getElementById('alert_banner');
    const msg = document.getElementById('alert_message');

    if (res.data && res.data.length > 0 && banner && msg) {
        const latest = res.data[res.data.length - 1];
        msg.textContent = latest.message || 'System Notification';
        banner.classList.remove('hidden');
        lucide.createIcons();
    } else if (banner) {
        banner.classList.add('hidden');
    }
}

async function fetchEvents() {
    const res = await apiFetch<SchoolEvent[]>('/events');
    const container = document.getElementById('events_container');
    const section = document.getElementById('events_section');
    const countEl = document.getElementById('event_count');

    if (res.data && container && section) {
        if (countEl) countEl.textContent = String(res.data.length);
        if (res.data.length === 0) {
            section.classList.add('hidden');
            container.innerHTML = '<div class="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">No upcoming events</div>';
            return;
        }
        section.classList.remove('hidden');
        container.innerHTML = res.data.map(ev => `
            <div class="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/50 hover:bg-card group cursor-default">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                            ${new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(':')[0]}
                        </div>
                        <div class="space-y-0.5">
                            <h4 class="text-sm font-bold text-foreground line-clamp-1">${ev.title}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span class="flex items-center gap-1"><i data-lucide="clock" class="h-3 w-3"></i> ${new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span class="flex items-center gap-1 text-accent/80"><i data-lucide="map-pin" class="h-3 w-3"></i> ${ev.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <i data-lucide="chevron-right" class="h-4 w-4 text-muted-foreground opacity-0"></i>
            </div>
        `).join('');
        lucide.createIcons();
    }
}

async function fetchUpdates() {
    const res = await apiFetch<SystemUpdate[]>('/updates');
    const container = document.getElementById('updates_container');
    const section = document.getElementById('updates_section');

    if (res.data && container && section) {
        if (res.data.length === 0) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');
        container.innerHTML = res.data.slice().reverse().map(up => `
            <div class="p-3 rounded-lg bg-success/15 border border-success/30 flex items-start gap-3 hover:bg-success/20">
                <i data-lucide="check-circle-2" class="h-3.5 w-3.5 text-success mt-0.5 shrink-0"></i>
                <p class="text-[11px] text-foreground/90 leading-normal font-medium">${up.message || 'Update without description'}</p>
            </div>
        `).join('');
        lucide.createIcons();
    }
}

// Global function for closing alert
(window as any).closeAlert = function () {
    document.getElementById('alert_banner')?.classList.add('hidden');
};

// Start the app
init();

export { };
