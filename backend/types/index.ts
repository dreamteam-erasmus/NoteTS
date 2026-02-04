import { randomUUID, hash } from "crypto";

// ===================
// User Types
// ===================

export class User {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;

    public constructor(email: string, name: string, password: string) {
        this.id = randomUUID()
        this.email = email
        this.name = name;
        this.createdAt = new Date()
        this.updatedAt = new Date()
        this.password = hash("sha256",password) 
    }
}

export class Announcement {
    title: string
    type: string
    content: string
    id: string

    public constructor(title: string, content: string, type: string) {
        this.title = title
        this.content = content
        this.type = type
        this.id = randomUUID()
    }
}

export class Event {
    title: string
    type: string
    time: Date
    location?: string
    id: string

    public constructor(title: string, type: string, time: Date, location?: string) {
        this.title = title
        this.type = type
        this.location = location
        this.time = time
        this.id = randomUUID()
    }
}

export class Update {
    id: string
    message: string

    constructor(message: string) {
        this.id = randomUUID()
        this.message = message
    }
}

export class Alert {
    id: string
    message: string

    constructor(message: string) {
        this.id = randomUUID()
        this.message = message
    }
}


export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
}

export interface UpdateUserDto {
    email?: string;
    name?: string;
}


// ===================
// API Response Types
// ===================

export interface ApiResponse<T> {
    data?: T;
    message: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number;
    limit: number;
    total: number;
}
