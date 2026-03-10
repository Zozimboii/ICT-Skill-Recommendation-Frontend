// composables/useDashboard.ts
import type { DashboardSummary, SkillGapResponse, RecommendationItem } from '~/types/Dashboard';

const BASE_URL = '/api/v1/dashboard';

export function useDashboard() {
    async function getSummary(): Promise<DashboardSummary | null> {
        const { data, error } = await useApiFetch<DashboardSummary>(`${BASE_URL}/summary`);
        if (error.value) return null;
        return data.value ?? null;
    }

    async function getSkillGap(): Promise<SkillGapResponse[]> {
        const { data, error } = await useApiFetch<SkillGapResponse[]>(`${BASE_URL}/skill-gap`);
        if (error.value) return [];
        return data.value ?? [];
    }

    async function getRecommendations(): Promise<RecommendationItem[]> {
        const { data, error } = await useApiFetch<RecommendationItem[]>(`${BASE_URL}/recommendations`);
        if (error.value) return [];
        return data.value ?? [];
    }

    return { getSummary, getSkillGap, getRecommendations };
}
