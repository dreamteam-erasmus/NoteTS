import { randomUUID, hash } from "crypto";

// ===================
// User Types
// ===================

export class User {
    id: string;
    email: string;
    password: string;
    name: string;
    classId: string;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean

    public constructor(email: string, name: string, password: string, isAdmin: boolean, classId: string = "") {
        this.id = randomUUID()
        this.email = email
        this.name = name;
        this.classId = classId;
        this.createdAt = new Date()
        this.updatedAt = new Date()
        this.password = hash("sha256", password)
        this.isAdmin = isAdmin
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

export class Class {
    studentsIds: string[]
    scheduleId: string
    id: string

    constructor(studentsIds: string[]) {
        this.id = randomUUID()
        this.studentsIds = studentsIds
        this.scheduleId = ""
    }

    setSchedule(scheduleId: string) {
        this.scheduleId = scheduleId
    }
}

export class Schedule {
    periods: SchedulePeriods[][]
    id: string
    classId: string

    constructor(periods: SchedulePeriods[][], classId: string = "") {
        this.periods = periods
        this.id = randomUUID()
        this.classId = classId
    }

    setClass(classId: string) {
        this.classId = classId
    }
}

export interface SchedulePeriods {
    id?: string
    name: string
    teacher: string
    room: string
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