import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Announcement } from "../types/index.js";
let announcements: Announcement[] = []
export async function loadAnnouncementsDB() {
    console.log("Loading announcements DB...");
    if (!existsSync("./database/announcements.json")) {
        //File does not exists
        await saveAnnouncementsDB()
    }
    announcements = JSON.parse(await readFile("./database/announcements.json","utf-8")) 
    console.log("Announcements DB loaded!");
}

export async function saveAnnouncementsDB() {
    console.log("Saving announcements DB...");
    await writeFile("./database/announcements.json",JSON.stringify(announcements))
    console.log("Announcements DB saved!")
}

export function getAnnouncements(): Announcement[] {
    return announcements
}

export function appendAnnouncement(announcement: Announcement) {
    announcements.push(announcement)
    saveAnnouncementsDB()
}


export function deleteAnnouncement(announcementId: string) {
    let announcementGet: Announcement | null = null
    for (const element of announcements) {
        if(announcementId == element.id) {
        announcementGet = element
        }
    }
    if (announcementGet == null) {
        return
    }
    announcements = announcements.filter(announcement => announcement != announcementGet)
    saveAnnouncementsDB()
}