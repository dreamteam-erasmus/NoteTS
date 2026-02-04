import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { Alert } from "../types/index.js";
let alerts: Alert[] = []
export async function loadAlertDB() {
    console.log("Loading alert DB...");
    if (!existsSync("./database/alerts.json")) {
        //File does not exists
        await saveAlertDB()
    }
    alerts = JSON.parse(await readFile("./database/alerts.json","utf-8")) 
    console.log("Alert DB loaded!");
}

export async function saveAlertDB() {
    console.log("Saving alert DB...");
    await writeFile("./database/alerts.json",JSON.stringify(alerts))
    console.log("Alert DB saved!")
}

export function getAlerts(): Alert[] {
    return alerts
}

export function appendAlert(alert: Alert) {
    alerts.push(alert)
    saveAlertDB()
}

export function deleteAlert(alertId: string) {
    let alertGet: Alert | null = null
    for (const element of alerts) {
        if(alertId == element.id) {
        alertGet = element
        }
    }
    if (alertGet == null) {
        return
    }
    alerts = alerts.filter(alert => alert != alertGet)
    saveAlertDB()
}