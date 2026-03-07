// export interface TrendJobsdbItem {
//     job_count: number;
//     sub_category_id: number;
//     sub_category_name: string;
//     main_category_name: string;
// }

// export interface SkillTrendItem {
//     skill_name: string;
//     skill_type: 'hard_skill' | 'soft_skill';
//     sub_category_id: number; // เปลี่ยนเป็น number
//     count: number;
// }

// export interface TrendResponse<T> {
//     series: T[];
// }

// export interface AggregatedSkill extends SkillTrendItem {
//     mention_count: number;
// }

// ── Types ─────────────────────────────────────────────────────────
export interface JobTrendItem {
    sub_category: string;
    job_count: number;
}

export interface SkillTrendItem {
    id: number;
    skill: string;
    skill_type: string;
    count: number;
}

export interface SkillByCategoryItem {
    id: number;
    name: string;
    job_count: number;
}

export interface CrossDataItem {
    sub_category?: string;
    skill?: string;
    job_count?: number;
    count?: number;
}

export interface CrossDataResponse {
    filter: Record<string, unknown> | null;
    type: string;
    data?: CrossDataItem[];
    job_trend?: JobTrendItem[];
    skill_trend?: SkillTrendItem[];
}

export interface SankeyLink {
    from: string;
    to: string;
    weight: number;
}
