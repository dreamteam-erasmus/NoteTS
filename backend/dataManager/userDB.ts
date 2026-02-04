import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { User } from "../types/index.js";
let users: User[] = []
export async function loadUserDB() {
    console.log("Loading user DB...");
    if (!existsSync("./database/users.json")) {
        //File does not exists
        await saveUserDB()
    }
    users = JSON.parse(await readFile("./database/users.json","utf-8")) 
    console.log("User DB loaded!");
}

export async function saveUserDB() {
    console.log("Saving user DB...");
    await writeFile("./database/users.json",JSON.stringify(users))
    console.log("User DB saved!")
}

export function getUsers(): User[] {
    return users
}

export function getUserByName(name: string): User | null {
    for (const element of users) {
        if(element.name == name) {
            return element
        }
    }
    return null;
}

export function appendUser(user: User) {
    users.push(user)
    saveUserDB()
}