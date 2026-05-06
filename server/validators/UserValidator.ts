import type {
    LoginData,
    RegisterData,
} from '../interfaces/UserInterfaces.ts';
import { isObject } from '../utils/isObject.ts';

const minimumPasswordLength = 8;

export function assertRegisterData(data: unknown): asserts data is RegisterData {
    if (!isObject(data)) {
        throw new Error('Register data must be an object.');
    }

    assertName(data.name);
    assertEmail(data.email);
    assertPassword(data.password);
}

export function assertLoginData(data: unknown): asserts data is LoginData {
    if (!isObject(data)) {
        throw new Error('Login data must be an object.');
    }

    assertEmail(data.email);
    assertPassword(data.password);
}

function assertName(name: unknown): asserts name is string {
    if (typeof name !== 'string') {
        throw new Error('Name must be a string.');
    }

    if (name.trim().length === 0) {
        throw new Error('Name is required.');
    }
}

function assertEmail(email: unknown): asserts email is string {
    if (typeof email !== 'string') {
        throw new Error('Email must be a string.');
    }

    if (email.trim().length === 0) {
        throw new Error('Email is required.');
    }

    if (!email.includes('@')) {
        throw new Error('Email must be valid.');
    }
}

function assertPassword(password: unknown): asserts password is string {
    if (typeof password !== 'string') {
        throw new Error('Password must be a string.');
    }

    if (password.length < minimumPasswordLength) {
        throw new Error(`Password must be at least ${minimumPasswordLength} characters.`);
    }
}
