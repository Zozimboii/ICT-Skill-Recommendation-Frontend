///validator/auth_validator.ts

export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm: string;
}

export interface AuthErrors {
    [key: string]: string;
}

// 📌 helper
const isEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
};

// ✅ LOGIN VALIDATE
export const validateLogin = (form: LoginForm) => {
    const errors: AuthErrors = {};

    if (!form.email.trim()) {
        errors.email = 'กรุณากรอก Email';
    } else if (!isEmail(form.email)) {
        errors.email = 'รูปแบบ Email ไม่ถูกต้อง';
    }

    if (!form.password) {
        errors.password = 'กรุณากรอก Password';
    } else if (form.password.length < 6) {
        errors.password = 'Password ต้องมีอย่างน้อย 6 ตัว';
    }

    return errors;
};

// ✅ REGISTER VALIDATE
export const validateRegister = (form: RegisterForm) => {
    const errors: AuthErrors = {};

    if (!form.first_name.trim()) {
        errors.first_name = 'กรุณากรอกชื่อ';
    }

    if (!form.last_name.trim()) {
        errors.last_name = 'กรุณากรอกนามสกุล';
    }

    if (!form.email.trim()) {
        errors.email = 'กรุณากรอก Email';
    } else if (!isEmail(form.email)) {
        errors.email = 'Email ไม่ถูกต้อง';
    }

    if (!form.password) {
        errors.password = 'กรุณากรอก Password';
    } else if (form.password.length < 6) {
        errors.password = 'Password อย่างน้อย 6 ตัว';
    }

    if (form.password !== form.confirm) {
        errors.confirm = 'Password ไม่ตรงกัน';
    }

    return errors;
};
