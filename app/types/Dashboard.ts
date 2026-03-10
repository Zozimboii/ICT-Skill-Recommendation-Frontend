// types/Dashboard.ts

export interface DashboardSummary {
    gpa: number | null;
    university: string | null;
    major: string | null;
    hard_skill_count: number;
    soft_skill_count: number;
    recommendation_count: number;
    has_transcript: boolean;
}

export interface SkillGapItem {
    skill_name: string;
    skill_type: string;
    status: 'matched' | 'missing';
    importance: 'required' | 'recommended' | 'optional';
    frequency_score?: number | null;
}

export interface SkillGroupItem {
    group_name: string;
    skills: SkillGapItem[];
    count: number;
}

// Phase 3
export interface CareerPathStep {
    step: number;
    title: string;
    group: string;
    skills: string[];
    priority: 'required' | 'recommended' | 'optional';
}

export interface SkillGapResponse {
    job_title: string;
    company_name: string;
    sub_category: string | null;
    match_score: number;
    skill_match_percent: number;
    matched_skills: SkillGapItem[];
    missing_skills: SkillGapItem[];
    missing_by_group: SkillGroupItem[];
    career_path: CareerPathStep[];
    total_missing: number;
    total_job_skills: number;
    matched_count: number;
    missing_group_count: number;
}

export interface RecommendationItem {
    id: number;
    job_id: number;
    title: string;
    company_name: string;
    location: string | null;
    sub_category: string | null;
    match_score: number;
    skill_match_percent: number;
    matched_count: number;
    total_skill_count: number;
}
