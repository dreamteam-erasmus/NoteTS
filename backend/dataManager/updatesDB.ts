import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Update } from "../types/index.js";
let updates: Update[] = []
export async function loadUpdateDB() {
    console.log("Loading update DB...");
    if (!existsSync("./database/updates.json")) {
        //File does not exists
        await saveUpdateDB()
    }
    updates = JSON.parse(await readFile("./database/updates.json","utf-8")) 
    console.log("Update DB loaded!");
}

export async function saveUpdateDB() {
    console.log("Saving update DB...");
    await writeFile("./database/updates.json",JSON.stringify(updates))
    console.log("Update DB saved!")
}

export function getUpdates(): Update[] {
    return updates
}

export function appendUpdate(update: Update) {
    updates.push(update)
    saveUpdateDB()
}


export function deleteUpdate(alertId: string) {
    let updateGet: Update | null = null
    for (const element of updates) {
        if(alertId == element.id) {
        updateGet = element
        }
    }
    if (updateGet == null) {
        return
    }
    updates = updates.filter(update => update != updateGet)
    saveUpdateDB()
}