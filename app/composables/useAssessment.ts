// composables/useAssessment.ts
import type { PositionItem, PositionSkillsResponse } from '~/types/Assessment';

const BASE = '/api/v1/assessment';

export function useAssessment() {
    async function getPositions(): Promise<PositionItem[]> {
        const { data, error } = await useApiFetch<PositionItem[]>(`${BASE}/positions`);
        if (error.value) throw error.value;
        return data.value ?? [];
    }

    async function getPositionSkills(subCategoryId: string): Promise<PositionSkillsResponse> {
        const { data, error } = await useApiFetch<PositionSkillsResponse>(`${BASE}/positions/${subCategoryId}/skills`);
        if (error.value) throw error.value;
        if (!data.value) throw new Error('No data');
        return data.value;
    }

    async function saveAssessment(subCategoryId: string, skillScores: { skill_id: number; score: number }[]) {
        const { data, error } = await useApiFetch(`${BASE}/save`, {
            method: 'POST',
            body: { sub_category_id: Number(subCategoryId), skill_scores: skillScores },
        });
        if (error.value) throw error.value;
        return data.value;
    }

    async function resetAssessment() {
        const { error } = await useApiFetch(`${BASE}/reset`, { method: 'DELETE' });
        if (error.value) throw error.value;
    }

    return { getPositions, getPositionSkills, saveAssessment, resetAssessment };
}
