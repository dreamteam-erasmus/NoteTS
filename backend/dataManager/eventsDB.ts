import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Event } from "../types/index.js";
let events: Event[] = []
export async function loadEventsDB() {
    console.log("Loading events DB...");
    if (!existsSync("./database/events.json")) {
        //File does not exists
        await saveEventsDB()
    }
    events = JSON.parse(await readFile("./database/events.json", "utf-8"))
    console.log("Events DB loaded!");
}

export async function saveEventsDB() {
    console.log("Saving events DB...");
    await writeFile("./database/events.json", JSON.stringify(events))
    console.log("Events DB saved!")
}

export function getEvents(): Event[] {
    return events
}

export function appendEvent(event: Event) {
    events.push(event)
    saveEventsDB()
}

export function deleteEvent(eventId: string) {
    events = events.filter(event => event.id !== eventId)
    saveEventsDB()
}