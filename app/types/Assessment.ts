// types/Assessment.ts
export interface PositionItem {
    id: string;
    name: string;
    job_count: number;
}

export interface PositionSkillItem {
    skill_id: number;
    skill_name: string;
    skill_type: string;
    weight: number; // 0-100
    job_count: number;
    frequency: number; // % ของ jobs ใน position
}

export interface PositionSkillsResponse {
    position_id: string;
    position_name: string;
    total_jobs: number;
    skills: PositionSkillItem[];
}

export interface UserSkillScore {
    skill_id: number;
    skill_name: string;
    score: number; // 0-5
}
