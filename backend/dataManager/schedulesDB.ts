import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Schedule } from "../types/index.js";
let schedules: Schedule[] = []
export async function loadScheduleDB() {
    console.log("Loading schedule DB...");
    if (!existsSync("./database/schedules.json")) {
        //File does not exists
        await saveScheduleDB()
    }
    schedules = JSON.parse(await readFile("./database/schedules.json", "utf-8"))

    let fixed = false;
    schedules.forEach(s => {
        if (!s.id) {
            s.id = randomUUID();
            fixed = true;
        }
    });
    if (fixed) await saveScheduleDB();

    console.log("Schedule DB loaded!");
}

export async function saveScheduleDB() {
    console.log("Saving schedule DB...");
    await writeFile("./database/schedules.json", JSON.stringify(schedules))
    console.log("Schedule DB saved!")
}

export function getSchedules(): Schedule[] {
    return schedules
}

export function appendSchedule(schedule: Schedule) {
    schedules.push(schedule)
    saveScheduleDB()
}

export function deleteSchedule(id: string) {
    schedules = schedules.filter(s => s.id !== id);
    saveScheduleDB();
}