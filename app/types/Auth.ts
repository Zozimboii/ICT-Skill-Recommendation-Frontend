export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type?: string;
    user?: any;
    token?: string; // เผื่อ backend บางทีใช้ชื่อ token
}
