// types/SearchJobs.ts

export type SearchMode = 'keyword' | 'dropdown';

export interface SkillItem {
    id: number;
    name: string;
    skill_type: string;
}

export interface Job {
    id: number;
    title: string;
    company_name: string;
    location?: string | null;
    description?: string | null;
    sub_category?: string | null;
    sub_category_id?: number | null;
    job_type?: string | null;
    experience_level?: string | null;
    posted_date?: string | null;
    url?: string | null;
    skills?: SkillItem[];
}

export interface JobListResponse {
    total: number;
    page: number;
    limit: number;
    data: Job[];
}

export interface JobSearchParams {
    page?: number;
    limit?: number;
    keyword?: string;
    sub_category?: string;
    job_type?: string;
    experience_level?: string;
    search_by?: 'title' | 'skill';
    min_date?: string; // YYYY-MM-DD
    max_date?: string; // YYYY-MM-DD
}

export interface JobDateRange {
    min_date: string | null;
    max_date: string | null;
}
