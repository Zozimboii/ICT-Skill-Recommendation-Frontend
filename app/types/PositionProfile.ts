// types/PositionProfile.ts

// ====== Position list ======
export interface PositionItem {
    id: string;
    name: string;
    job_count: number;
    main_category_id?: string | null;
    main_category_name?: string | null;
}

// ====== Position Skill ======
export interface PositionSkill {
    skill_name: string;
    count: number;
    weight: number;

    // optional (เผื่ออนาคต)
    demand_level?: 'HIGH' | 'MEDIUM' | 'LOW';
    demand_label?: string;
}

// ====== Position Profile Response ======
export interface PositionSkillsResponse {
    position_id: string;
    position_name: string;
    total_jobs: number;
    skills: PositionSkill[];
}

// ====== User Score ======
export interface UserSkillScore {
    skill_name: string;
    score: number; // 0-5
}

// ====== Match Response ======
export interface MatchResponse {
    labels: string[];
    user_data: number[];
    job_data: number[];
    match_percent: number;
    gaps: {
        skill_name: string;
        gap: number;
    }[];
}
