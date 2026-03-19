// // types/Assessment.ts
// export interface PositionItem {
//     id: string;
//     name: string;
//     job_count: number;
// }

// export interface PositionSkillItem {
//     skill_id: number;
//     skill_name: string;
//     skill_type: string;
//     weight: number; // 0-100
//     job_count: number;
//     frequency: number; // % ของ jobs ใน position
// }

// export interface PositionSkillsResponse {
//     position_id: string;
//     position_name: string;
//     total_jobs: number;
//     skills: PositionSkillItem[];
// }

// export interface UserSkillScore {
//     skill_id: number;
//     skill_name: string;
//     score: number; // 0-5
// }
// types/Assessment.ts

export interface PositionItem {
    id: string;
    name: string;
    job_count: number;
}

export interface PositionSkillItem {
    skill_id: number;
    skill_name: string;
    skill_type: 'hard_skill' | 'soft_skill';
    weight: number; // 0–100  (importance ใน position)
    job_count: number; // จำนวน job ที่ต้องการ skill นี้
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
    score: number; // 0–5
}

// ── Radar types ──────────────────────────────────────────────────────
export interface RadarDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    pointBackgroundColor?: string;
}

export interface RadarProps {
    labels: string[];
    datasets: RadarDataset[];
    /** ขนาด font label รอบ radar (default 13) */
    labelFontSize?: number;
    /** แสดง legend ด้านล่างหรือไม่ (default true) */
    showLegend?: boolean;
}
