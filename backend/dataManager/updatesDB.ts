import { randomUUID } from "crypto";
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
    updates = JSON.parse(await readFile("./database/updates.json", "utf-8"))

    let fixed = false;
    updates.forEach(up => {
        if (!up.id) {
            up.id = randomUUID();
            fixed = true;
        }
    });
    if (fixed) await saveUpdateDB();

    console.log("Update DB loaded!");
}

export async function saveUpdateDB() {
    console.log("Saving update DB...");
    await writeFile("./database/updates.json", JSON.stringify(updates))
    console.log("Update DB saved!")
}

export function getUpdates(): Update[] {
    return updates
}

export function appendUpdate(update: Update) {
    updates.push(update)
    saveUpdateDB()
}


export function deleteUpdate(updateId: string) {
    updates = updates.filter(update => update.id !== updateId)
    saveUpdateDB()
}