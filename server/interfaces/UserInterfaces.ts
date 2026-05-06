export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface AuthResult {
    user: AuthUser;
    token: string;
}

export interface PasswordHasher {
    hash(password: string): Promise<string>;
    compare(password: string, hashedPassword: string): Promise<boolean>;
}

export interface TokenService {
    create(user: AuthUser): Promise<string>;
    validate(token: string): Promise<AuthUser>;
    reset(token: string): Promise<void>;
}
