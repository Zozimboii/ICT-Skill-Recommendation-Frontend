export interface TrendJobsdbItem {
    snapshot_date: string;
    job_count: number;
    sub_category_name: string;
}

export interface SkillTrendItem {
    snapshot_date: string;
    skill_name: string;
    count: number;
}

export interface TrendResponse<T> {
    series: T[];
}
