# feature ideas

stuff that could make this app actually cool

---

## visual

**animated backgrounds** - canvas layer with particles or css gradient animations. add a toggle in display settings so you can disable it

**content transitions** - fade/slide when announcements change. just css transitions + adding/removing a class before swapping content

**emergency mode** - red flashing everything, optional sound. new alert priority field, overlay that takes over the screen

**countdown timers** - "lunch in 23 min". new countdown entity with target time, setInterval on display to update

---

## live data

**websockets** - swap polling for ws connections, server broadcasts changes. use ws package, fallback to polling if disconnected

**class schedules** - "period 3 math" with bell countdown. schedule entity in admin, endpoint returns current/next period

**transit arrivals** - integrate with local transit api (gtfs-rt or whatever). store stop id per display, show arrival times

**social feed** - twitter/instagram integration. backend cron fetches posts, display shows carousel

---

## smart stuff

**ai summaries** - openai or ollama or heck even custom model if im feeling frisky, generate summary on save, display shows short version

**content scheduling** - start/end dates, time windows. backend filters announcements before returning

**priority queue** - urgent/high/normal. urgent interrupts rotation, high shows more often

**qr codes** - qrcode npm package, add url field to events, display renders it next to content

---

## interactive

**touch kiosks** - detect touch, swap to interactive ui mode. search, calendar view, room finder

**polls** - new poll entity, public /vote page with qr code, websocket for live results

**photo carousel** - gallery uploads in admin, lazy loading, dedicated section or fullscreen mode

---

## admin stuff

**health dashboard** - store ping history, calculate uptime %, graph it with chartjs

**analytics** - display reports views, backend aggregates, show top content in admin

**bulk actions** - multi-select, apply same command to all selected or all in group

**screen preview** - html2canvas on display, upload screenshot periodically, show thumbnail in admin

---

## priority

quick wins: transitions, priority queue, qr codes, countdowns

medium effort: emergency mode, scheduling, bulk actions

complex: websockets, schedules, preview
