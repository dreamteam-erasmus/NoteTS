// Display page script - Public display for IoT screens

// Access lucide from window (loaded via CDN)
const lucide = (window as any).lucide;

const API_BASE = '/api';
const DISPLAY_ID_KEY = 'notets_display_id';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

// --- State ---
let announcements: any[] = [];
let events: any[] = [];
let updates: any[] = [];
let currentAnnouncementIndex = 0;
let tickerPosition = 0;
let showControls = false;
let controlsTimeout: number | null = null;
let displayId: string | null = null;
let displayName: string = 'Unnamed Display';

interface DisplaySettings {
    theme: 'light' | 'dark' | 'auto';
    showAnnouncements: boolean;
    showEvents: boolean;
    showWeather: boolean;
    showTicker: boolean;
    activeHours?: { start: string; end: string };
}

let displaySettings: DisplaySettings = {
    theme: 'auto',
    showAnnouncements: true,
    showEvents: true,
    showWeather: true,
    showTicker: true,
};

// --- Display Registration ---
async function registerDisplay(): Promise<string | null> {
    // Check if we already have a display ID
    const storedId = localStorage.getItem(DISPLAY_ID_KEY);

    if (storedId) {
        // Verify the display still exists
        try {
            const res = await fetch(`${API_BASE}/displays/${storedId}`);
            if (res.ok) {
                const data = await res.json();
                displayId = storedId;
                displayName = data.data?.name || 'Unnamed Display';
                console.log('Display reconnected:', displayId, displayName);
                return displayId;
            }
        } catch (e) {
            console.log('Stored display ID invalid, registering new display');
        }
    }

    // Register as new display
    try {
        const res = await fetch(`${API_BASE}/displays/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Display ${new Date().toLocaleDateString()}`,
                userAgent: navigator.userAgent
            })
        });
        const data = await res.json();
        displayId = data.data?.id || null;
        displayName = data.data?.name || 'Unnamed Display';
        if (displayId) {
            localStorage.setItem(DISPLAY_ID_KEY, displayId);
            console.log('Display registered:', displayId, displayName);
        }
        return displayId;
    } catch (e) {
        console.error('Failed to register display:', e);
        return null;
    }
}

async function sendHeartbeat() {
    if (!displayId) return;
    try {
        const res = await fetch(`${API_BASE}/displays/${displayId}/ping`, { method: 'POST' });
        const data = await res.json();

        // Apply settings from server
        if (data.data?.settings) {
            applySettings(data.data.settings);
        }

        // Handle any commands from the server
        if (data.commands && data.commands.length > 0) {
            data.commands.forEach((cmd: { type: string; data?: any }) => executeCommand(cmd));
        }
    } catch (e) {
        console.error('Heartbeat failed:', e);
    }
}

function applySettings(settings: DisplaySettings) {
    console.log('Applying settings:', settings);
    displaySettings = settings;

    // Apply theme
    const html = document.documentElement;
    if (settings.theme === 'light') {
        html.classList.add('light');
    } else {
        html.classList.remove('light');
    }

    // Apply section visibility
    const weather = document.querySelector('[data-section="weather"]') as HTMLElement;
    const events = document.querySelector('[data-section="events"]') as HTMLElement;
    const ticker = document.querySelector('[data-section="ticker"]') as HTMLElement;

    if (weather) weather.style.display = settings.showWeather ? '' : 'none';
    if (events) events.style.display = settings.showEvents ? '' : 'none';
    if (ticker) ticker.style.display = settings.showTicker ? '' : 'none';

    // Check active hours
    if (settings.activeHours) {
        const now = new Date();
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = settings.activeHours.start.split(':').map(Number);
        const [endH, endM] = settings.activeHours.end.split(':').map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;

        const isActive = nowTime >= startTime && nowTime <= endTime;
        const sleepOverlay = document.getElementById('sleep-overlay');

        if (!isActive && !sleepOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'sleep-overlay';
            overlay.className = 'fixed inset-0 bg-background z-[9998]';
            document.body.appendChild(overlay);
        } else if (isActive && sleepOverlay) {
            sleepOverlay.remove();
        }
    }
}

function executeCommand(command: { type: string; data?: any }) {
    console.log('Executing command:', command);
    switch (command.type) {
        case 'refresh':
            window.location.reload();
            break;
        case 'identify':
            showIdentifyOverlay();
            break;
        case 'message':
            showMessageOverlay(command.data?.text || 'No message');
            break;
        case 'fullscreen':
            toggleFullscreen();
            break;
        case 'flash':
            flashScreen();
            break;
    }
}

function showIdentifyOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'identify-overlay';
    overlay.className = 'fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]';
    overlay.innerHTML = `
        <div class="rounded-2xl bg-card border border-border p-10 max-w-lg text-center">
            <div class="mb-6 flex items-center gap-3 justify-center">
                <div class="h-3 w-3 rounded-full bg-accent"></div>
                <span class="text-sm text-muted-foreground uppercase tracking-wider">Display Identify</span>
            </div>
            <h2 class="text-5xl font-medium text-foreground mb-4 leading-tight">${displayName}</h2>
            <p class="text-lg text-muted-foreground font-mono">${displayId?.slice(0, 8) || '...'}</p>
        </div>
    `;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 5000);
}

function showMessageOverlay(text: string) {
    const overlay = document.createElement('div');
    overlay.id = 'message-overlay';
    overlay.className = 'fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999] p-8';
    overlay.innerHTML = `
        <div class="rounded-2xl bg-card border border-border p-10 max-w-4xl flex-1 flex flex-col justify-center">
            <div class="mb-8 flex items-center gap-3">
                <div class="h-3 w-3 rounded-full bg-accent animate-pulse"></div>
                <span class="text-sm text-muted-foreground uppercase tracking-wider">Message</span>
            </div>
            <p class="text-5xl font-medium text-foreground leading-tight text-balance">${text}</p>
        </div>
    `;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 10000);
}

function flashScreen() {
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 z-[9999] pointer-events-none bg-accent';
    flash.style.animation = 'flash 0.5s ease-out forwards';
    const style = document.createElement('style');
    style.textContent = '@keyframes flash{0%{opacity:0.6}100%{opacity:0}}';
    document.head.appendChild(style);
    document.body.appendChild(flash);
    setTimeout(() => {
        flash.remove();
        style.remove();
    }, 500);
}


// --- Helpers ---
function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getCategoryColor(category: string): string {
    switch (category) {
        case 'sports': return 'bg-chart-2';
        case 'academic': return 'bg-info';
        case 'arts': return 'bg-chart-4';
        case 'urgent': return 'bg-destructive';
        default: return 'bg-accent';
    }
}

// --- Clock ---
function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock_display');
    const dateEl = document.getElementById('date_display');
    if (clockEl) clockEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);
}

// --- Fetch Data ---
async function fetchAnnouncements() {
    try {
        const res = await fetch(`${API_BASE}/announcements`);
        const data = await res.json();
        announcements = data.data || [];
        renderAnnouncementDots();
        renderCurrentAnnouncement();
    } catch (e) {
        console.error('Failed to fetch announcements:', e);
    }
}

async function fetchEvents() {
    try {
        const res = await fetch(`${API_BASE}/events`);
        const data = await res.json();
        events = data.data || [];
        renderEvents();
    } catch (e) {
        console.error('Failed to fetch events:', e);
    }
}

async function fetchAlerts() {
    try {
        const res = await fetch(`${API_BASE}/alerts`);
        const data = await res.json();
        const alerts = data.data || [];
        const banner = document.getElementById('alert_banner');
        const msg = document.getElementById('alert_message');

        if (alerts.length > 0 && banner && msg) {
            msg.textContent = alerts[alerts.length - 1].message;
            banner.classList.remove('hidden');
        } else if (banner) {
            banner.classList.add('hidden');
        }
    } catch (e) {
        console.error('Failed to fetch alerts:', e);
    }
}

async function fetchUpdates() {
    try {
        const res = await fetch(`${API_BASE}/updates`);
        const data = await res.json();
        updates = data.data || [];
        initTicker();
    } catch (e) {
        console.error('Failed to fetch updates:', e);
    }
}

// --- Weather ---
// WMO Weather interpretation codes mapping
function getWeatherInfo(code: number): { condition: string; icon: string } {
    const weatherCodes: Record<number, { condition: string; icon: string }> = {
        0: { condition: 'Clear Sky', icon: 'sun' },
        1: { condition: 'Mainly Clear', icon: 'sun' },
        2: { condition: 'Partly Cloudy', icon: 'cloud-sun' },
        3: { condition: 'Overcast', icon: 'cloud' },
        45: { condition: 'Foggy', icon: 'cloud-fog' },
        48: { condition: 'Rime Fog', icon: 'cloud-fog' },
        51: { condition: 'Light Drizzle', icon: 'cloud-drizzle' },
        53: { condition: 'Drizzle', icon: 'cloud-drizzle' },
        55: { condition: 'Dense Drizzle', icon: 'cloud-drizzle' },
        61: { condition: 'Light Rain', icon: 'cloud-rain' },
        63: { condition: 'Rain', icon: 'cloud-rain' },
        65: { condition: 'Heavy Rain', icon: 'cloud-rain' },
        66: { condition: 'Freezing Rain', icon: 'cloud-hail' },
        67: { condition: 'Heavy Freezing Rain', icon: 'cloud-hail' },
        71: { condition: 'Light Snow', icon: 'cloud-snow' },
        73: { condition: 'Snow', icon: 'cloud-snow' },
        75: { condition: 'Heavy Snow', icon: 'cloud-snow' },
        77: { condition: 'Snow Grains', icon: 'cloud-snow' },
        80: { condition: 'Light Showers', icon: 'cloud-rain' },
        81: { condition: 'Showers', icon: 'cloud-rain' },
        82: { condition: 'Heavy Showers', icon: 'cloud-rain' },
        85: { condition: 'Snow Showers', icon: 'cloud-snow' },
        86: { condition: 'Heavy Snow Showers', icon: 'cloud-snow' },
        95: { condition: 'Thunderstorm', icon: 'cloud-lightning' },
        96: { condition: 'Thunderstorm + Hail', icon: 'cloud-lightning' },
        99: { condition: 'Heavy Thunderstorm', icon: 'cloud-lightning' },
    };
    return weatherCodes[code] || { condition: 'Unknown', icon: 'cloud' };
}

async function fetchWeather() {
    const tempEl = document.getElementById('weather_temp');
    const conditionEl = document.getElementById('weather_condition');
    const iconEl = document.getElementById('weather_icon');
    const locationEl = document.getElementById('weather_location');

    try {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: false
            });
        });

        const { latitude, longitude } = position.coords;

        // Fetch weather from Open-Meteo (free, no API key needed)
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        const temp = Math.round(weatherData.current.temperature_2m);
        const weatherCode = weatherData.current.weather_code;
        const { condition, icon } = getWeatherInfo(weatherCode);

        // Reverse geocode for location name
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Unknown Location';

        // Update UI
        if (tempEl) tempEl.textContent = `${temp}°`;
        if (conditionEl) conditionEl.textContent = condition;
        if (locationEl) locationEl.textContent = city;
        if (iconEl) {
            iconEl.setAttribute('data-lucide', icon);
            lucide.createIcons();
        }
    } catch (e) {
        console.error('Failed to fetch weather:', e);
        // Show fallback
        if (tempEl) tempEl.textContent = '--°';
        if (conditionEl) conditionEl.textContent = 'Weather unavailable';
        if (locationEl) locationEl.textContent = 'Location unavailable';
    }
}

// --- Render Functions ---
function renderAnnouncementDots() {
    const container = document.getElementById('announcement_dots');
    if (!container || announcements.length === 0) return;

    container.innerHTML = announcements.map((_, idx) => `
        <button 
            onclick="goToAnnouncement(${idx})" 
            class="h-2 rounded-full transition-all duration-300 ${idx === currentAnnouncementIndex ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-muted-foreground/30'}"
        ></button>
    `).join('');
}

function renderCurrentAnnouncement() {
    if (announcements.length === 0) {
        const title = document.getElementById('announcement_title');
        const body = document.getElementById('announcement_body');
        if (title) title.textContent = 'No Announcements';
        if (body) body.textContent = 'Check back later for updates.';
        return;
    }

    const ann = announcements[currentAnnouncementIndex];
    const dot = document.getElementById('announcement_dot');
    const category = document.getElementById('announcement_category');
    const title = document.getElementById('announcement_title');
    const body = document.getElementById('announcement_body');
    const progress = document.getElementById('progress_bar');

    if (dot) {
        dot.className = `h-3 w-3 rounded-full ${getCategoryColor(ann.type || 'general')}`;
    }
    if (category) category.textContent = ann.type || 'general';
    if (title) title.textContent = ann.title;
    if (body) body.textContent = ann.content;

    // Reset progress bar animation
    if (progress) {
        progress.classList.remove('progress-bar');
        void progress.offsetWidth; // Trigger reflow
        progress.classList.add('progress-bar');
    }

    renderAnnouncementDots();
}

function renderEvents() {
    const container = document.getElementById('events_list');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-muted-foreground text-sm italic">No upcoming events</div>';
        return;
    }

    container.innerHTML = events.map((event, idx) => {
        const eventDate = new Date(event.time);
        const isToday = new Date().toDateString() === eventDate.toDateString();
        const dateStr = isToday ? 'Today' : eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return `
            <div class="p-4 rounded-xl ${idx === 0 ? 'bg-accent/10 border border-accent/20' : 'hover:bg-secondary/50'}">
                <div class="flex items-start gap-3">
                    <div class="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${getCategoryColor(event.type || 'general')}"></div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium mb-1 ${idx === 0 ? 'text-foreground' : 'text-foreground/80'}">${event.title}</p>
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                            <i data-lucide="clock" class="h-3.5 w-3.5"></i>
                            <span>${dateStr} at ${timeStr}</span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">${event.location || 'TBD'}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// --- Ticker ---
function initTicker() {
    const container = document.getElementById('ticker_content');
    const wrapper = container?.parentElement;
    if (!container || !wrapper) return;

    if (updates.length === 0) {
        container.textContent = 'No system updates at this time.';
        return;
    }

    const tickerText = updates.map(u => u.message).join('     •     ') + '     •     ';

    // Create a temp span to measure one copy width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.textContent = tickerText;
    document.body.appendChild(tempSpan);
    const oneUnitWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);

    // Calculate how many copies we need to fill the container + 1 for seamless loop
    const containerWidth = wrapper.offsetWidth;
    const copies = Math.ceil((containerWidth / oneUnitWidth) + 2);

    // Build content with enough copies
    container.innerHTML = Array(copies).fill(`<span>${tickerText}</span>`).join('');
    tickerPosition = 0;
}

function animateTicker() {
    const container = document.getElementById('ticker_content');
    if (!container || updates.length === 0) return;

    const firstSpan = container.querySelector('span');
    if (!firstSpan) return;

    tickerPosition -= 1;

    // Reset when first span scrolls off
    const spanWidth = firstSpan.offsetWidth;
    if (Math.abs(tickerPosition) >= spanWidth) {
        tickerPosition = 0;
    }

    container.style.transform = `translateX(${tickerPosition}px)`;
}

// --- Announcement Rotation ---
function nextAnnouncement() {
    if (announcements.length === 0) return;
    currentAnnouncementIndex = (currentAnnouncementIndex + 1) % announcements.length;
    renderCurrentAnnouncement();
}

// --- Controls Visibility ---
function handleMouseMove() {
    const leftControls = document.getElementById('controls_left');
    const rightControls = document.getElementById('controls_right');
    const dismissBtn = document.getElementById('dismiss_btn');

    if (leftControls) leftControls.style.opacity = '1';
    if (rightControls) rightControls.style.opacity = '1';
    if (dismissBtn) dismissBtn.style.opacity = '1';
    document.body.style.cursor = 'default';

    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsTimeout = window.setTimeout(() => {
        if (leftControls) leftControls.style.opacity = '0';
        if (rightControls) rightControls.style.opacity = '0';
        if (dismissBtn) dismissBtn.style.opacity = '0';
        document.body.style.cursor = 'none';
    }, 3000);
}

// --- Connection Status ---
function updateConnectionStatus() {
    const container = document.getElementById('connection_status');
    if (!container) return;

    const isOnline = navigator.onLine;
    container.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isOnline ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`;
    container.innerHTML = `
        <i data-lucide="${isOnline ? 'wifi' : 'wifi-off'}" class="h-4 w-4"></i>
        <span>${isOnline ? 'Connected' : 'Offline'}</span>
    `;
    lucide.createIcons();
}

// --- Fullscreen Toggle ---
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// --- Dismiss Alert ---
(window as any).dismissAlert = function () {
    const banner = document.getElementById('alert_banner');
    if (banner) banner.classList.add('hidden');
};

// --- Go to specific announcement ---
(window as any).goToAnnouncement = function (idx: number) {
    currentAnnouncementIndex = idx;
    renderCurrentAnnouncement();
};

// --- Init ---
async function init() {
    lucide.createIcons();

    // Register this display with the backend
    await registerDisplay();

    // Send heartbeat every 30 seconds
    setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Initial data fetch
    await Promise.all([
        fetchAnnouncements(),
        fetchEvents(),
        fetchAlerts(),
        fetchUpdates(),
        fetchWeather()
    ]);

    // Clock update every second
    updateClock();
    setInterval(updateClock, 1000);

    // Announcement rotation every 8 seconds
    setInterval(nextAnnouncement, 8000);

    // Ticker animation every 30ms
    setInterval(animateTicker, 30);

    // Refresh data every 30 seconds
    setInterval(async () => {
        await Promise.all([
            fetchAnnouncements(),
            fetchEvents(),
            fetchAlerts(),
            fetchUpdates()
        ]);
    }, 30000);

    // Refresh weather every 5 minutes
    setInterval(fetchWeather, 300000);

    // Mouse move handler for controls
    document.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    // Connection status
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Fullscreen on 'F' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    });
}

init();

export { };
