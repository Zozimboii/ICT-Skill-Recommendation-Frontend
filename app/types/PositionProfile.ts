export interface PositionItem {
    id: string;
    name: string;
    main_category_id: number;
    main_category_name: string;
    job_count: number;
}

export interface PositionSkill {
    skill_name: string;
    count: number;
    weight: number; // 0-100
    demand_level?: 'HIGH' | 'MEDIUM' | 'LOW';
    demand_label?: string;
}

export interface PositionSkillsResponse {
    position_id: string;
    position_name: string;
    total_jobs: number;
    skills: PositionSkill[];
}

export interface UserSkillScore {
    skill_name: string;
    score: number; // 0-5
}

export interface GapItem {
    skill_name: string;
    gap: number;
}

export interface MatchResponse {
    position_id: string;
    position_name: string;
    match_percent: number;
    labels: string[];
    user_data: number[];
    job_data: number[];
    gaps: GapItem[];
}
