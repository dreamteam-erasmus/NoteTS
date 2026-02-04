// ===================
// User Types
// ===================

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
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
