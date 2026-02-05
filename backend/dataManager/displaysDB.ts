import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Display } from "../types/index.js";

let displays: Display[] = [];

// Consider a display offline after 60 seconds without ping
const OFFLINE_THRESHOLD_MS = 60000;

export async function loadDisplayDB() {
    console.log("Loading display DB...");
    if (!existsSync("./database/displays.json")) {
        await saveDisplayDB();
    }
    const raw = JSON.parse(await readFile("./database/displays.json", "utf-8"));
    displays = raw.map((d: any) => {
        const display = new Display(d.name, d.userAgent);
        display.id = d.id;
        display.lastSeen = new Date(d.lastSeen);
        display.isOnline = d.isOnline;
        display.createdAt = new Date(d.createdAt || d.lastSeen);
        display.group = d.group;
        if (d.settings) {
            display.settings = { ...display.settings, ...d.settings };
        }
        return display;
    });

    // Fix any missing IDs
    let fixed = false;
    displays.forEach(d => {
        if (!d.id) {
            d.id = randomUUID();
            fixed = true;
        }
    });
    if (fixed) await saveDisplayDB();

    console.log("Display DB loaded!");
}

export async function saveDisplayDB() {
    console.log("Saving display DB...");
    await writeFile("./database/displays.json", JSON.stringify(displays));
    console.log("Display DB saved!");
}

export function getDisplays(): Display[] {
    // Update online status based on last seen time
    const now = Date.now();
    displays.forEach(d => {
        d.isOnline = (now - new Date(d.lastSeen).getTime()) < OFFLINE_THRESHOLD_MS;
    });
    return displays;
}

export function getDisplay(id: string): Display | undefined {
    const display = displays.find(d => d.id === id);
    if (display) {
        display.isOnline = (Date.now() - new Date(display.lastSeen).getTime()) < OFFLINE_THRESHOLD_MS;
    }
    return display;
}

export function registerDisplay(name: string, userAgent?: string): Display {
    const display = new Display(name, userAgent);
    displays.push(display);
    saveDisplayDB();
    return display;
}

export function pingDisplay(id: string): Display | undefined {
    const display = displays.find(d => d.id === id);
    if (display) {
        display.lastSeen = new Date();
        display.isOnline = true;
        saveDisplayDB();
    }
    return display;
}

export function updateDisplay(id: string, updates: { name?: string; group?: string; settings?: Partial<Display['settings']> }): Display | undefined {
    const display = displays.find(d => d.id === id);
    if (display) {
        if (updates.name !== undefined) display.name = updates.name;
        if (updates.group !== undefined) display.group = updates.group;
        if (updates.settings) {
            display.settings = { ...display.settings, ...updates.settings };
        }
        saveDisplayDB();
    }
    return display;
}

export function deleteDisplay(displayId: string) {
    displays = displays.filter(d => d.id !== displayId);
    saveDisplayDB();
}

// --- Command Queue (in-memory, not persisted) ---
interface DisplayCommand {
    type: string;
    data?: any;
}

const commandQueue: Map<string, DisplayCommand[]> = new Map();

export function queueCommand(displayId: string, command: string, data?: any) {
    const queue = commandQueue.get(displayId) || [];
    queue.push({ type: command, data });
    commandQueue.set(displayId, queue);
}

export function getAndClearCommands(displayId: string): DisplayCommand[] {
    const commands = commandQueue.get(displayId) || [];
    commandQueue.delete(displayId);
    return commands;
}
