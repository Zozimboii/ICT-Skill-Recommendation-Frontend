// import type { RelatedSubCategory } from "./RelatedSubCategory"
// import type { TopCategory } from "./TopCategory"

// export interface SearchJobsResult {
//   sub_category_id: number | string
//   sub_category_name: string
//   job_count: number
//   top_categories: TopCategory[]
//   related_sub_categories: RelatedSubCategory[]
// }

export interface SearchJobSummary {
    sub_category_id: number;
    sub_category_name: string;
    job_count: number;
}

export interface SearchMeta {
    min_snapshot_date: string;
    max_snapshot_date: string;
}

// export interface SearchJobItem {
//   job_id: number
//   job_title: string
//   company_name: string
//   location: string
//   salary_min: number
//   salary_max: number
//   posted_date: string
//   description: string
// }

export interface JobSkill {
    id: number;
    name: string;
    skill_type: 'hard_skill' | 'soft_skill';
}

export interface Job {
    id: number;
    title: string;
    company_name: string; // ← เปลี่ยนจาก company
    location: string | null;
    description: string | null;
    sub_category: string | null;
    job_type: string | null;
    experience_level: string | null;
    posted_date: string | null;
    url: string | null;
    skills: JobSkill[]; // ← เปลี่ยนจาก string[]
}

export interface JobListResponse {
    total: number;
    page: number;
    limit: number;
    data: Job[];
}

export interface JobSearchParams {
    keyword?: string;
    sub_category?: string;
    page?: number;
    limit?: number;
}

export type JobCategoriesResponse = string[];

export type SearchMode = 'keyword' | 'dropdown';
