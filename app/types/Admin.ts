// types/Admin.ts

export interface AdminStats {
    total_users: number;
    total_jobs: number;
    total_skills: number;
    total_transcripts: number;
}

export interface AdminUserItem {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string | null;
}

export interface AdminJobItem {
    id: number;
    title: string;
    company_name: string;
    location: string | null;
    sub_category: string | null;
    posted_date: string | null;
    skill_count: number;
}

export interface AdminSkillItem {
    id: number;
    name: string;
    skill_type: string;
    job_count: number;
}

export interface AdminJobListResponse {
    total: number;
    data: AdminJobItem[];
}
