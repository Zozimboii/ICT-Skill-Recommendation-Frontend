// composables/usePositionProfile.ts
import type { PositionSkillsResponse } from '~/types/PositionProfile';

const BASE_URL = '/api/v1/positions';

export function usePositionProfile() {
    async function getSkills(positionId: string): Promise<PositionSkillsResponse[]> {
        const id = positionId.trim();
        if (!id) return [];

        const { data, error } = await useApiFetch<PositionSkillsResponse[]>(`${BASE_URL}/${id}/skills`, {
            method: 'GET',
        });

        if (error.value) throw error.value;
        return data.value ?? [];
    }

    async function getSkillsId(positionId: string): Promise<PositionSkillsResponse | null> {
        const id = positionId.trim();
        if (!id) return null;

        const { data, error } = await useApiFetch<PositionSkillsResponse>(`${BASE_URL}/${id}/skills`, {
            method: 'GET',
        });

        if (error.value) throw error.value;
        return data.value ?? null;
    }
    return { getSkills, getSkillsId };
}
