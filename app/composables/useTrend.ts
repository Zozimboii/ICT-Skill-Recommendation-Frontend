//composable/useTrend.ts

import type { SkillTrendItem, TrendJobsdbItem, TrendResponse } from '~/types/Trend';

const BASE_URL = '/api/v1/trends';

export function useTrend() {
    async function getCategoryTrend(days = 60): Promise<TrendResponse<TrendJobsdbItem> | null> {
        const { data, error } = await useApiFetch<TrendResponse<TrendJobsdbItem>>(`${BASE_URL}/jobsdb`, {
            method: 'GET',
            query: { days },
        });
        if (error.value) throw error.value;
        return data.value ?? null;
    }

    async function getSkillsTrend(days = 60): Promise<TrendResponse<SkillTrendItem> | null> {
        const { data, error } = await useApiFetch<TrendResponse<SkillTrendItem>>(`${BASE_URL}/skills`, {
            method: 'GET',
            query: { days },
        });
        if (error.value) throw error.value;
        return data.value ?? null;
    }

    return { getCategoryTrend, getSkillsTrend };
}
