// // types/SearchJob.ts

// export interface SearchJobSummary {
//     sub_category_id: number;
//     sub_category_name: string;
//     job_count: number;
// }

// export interface SearchMeta {
//     min_snapshot_date: string;
//     max_snapshot_date: string;
// }

// export interface JobSkill {
//     id: number;
//     name: string;
//     skill_type: 'hard_skill' | 'soft_skill';
// }
// export interface JobListItem {
//     id: number;
//     job_title: string; // ← ที่ SearchResultCard ใช้
//     company_name: string;
//     location: string | null;
//     description: string | null;
//     sub_category_name: string; // ← ที่ SearchResultCard ใช้
//     posted_date: string | null;
//     hard_skills: { skill_name: string }[]; // ← ที่ SearchResultCard ใช้
// }
// export interface Job {
//     id: number;
//     title: string;
//     company_name: string; // ← เปลี่ยนจาก company
//     location: string | null;
//     description: string | null;
//     sub_category: string | null;
//     job_type: string | null;
//     experience_level: string | null;
//     posted_date: string | null;
//     url: string | null;
//     skills: JobSkill[]; // ← เปลี่ยนจาก string[]
// }

// export interface JobListResponse {
//     total: number;
//     page: number;
//     limit: number;
//     data: Job[];
// }

// export interface JobSearchParams {
//     keyword?: string;
//     sub_category?: string;
//     page?: number;
//     limit?: number;
// }

// export type JobCategoriesResponse = string[];

// export type SearchMode = 'keyword' | 'dropdown';
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
    min_date?: string; // YYYY-MM-DD
    max_date?: string; // YYYY-MM-DD
}

export interface JobDateRange {
    min_date: string | null;
    max_date: string | null;
}
