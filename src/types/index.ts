export interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    avatar_url?: string;
    role: 'USER' | 'ADMIN';
    created_at: string;
}

export interface Course {
    id: number;
    name: string;
    type: string;
    price: number;
    description: string;
    icon: string;
    duration: string;
    lessons: number;
    progress?: number;
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: number;
    progress: number;
    payment_status: 'pending' | 'verified' | 'failed';
    created_at: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
}
