// composables/usePositionMatch.ts
import type { MatchResponse, UserSkillScore } from '~/types/PositionProfile';

const BASE_URL = '/api/v1/positions';

export function usePositionMatch() {
    async function match(positionId: string, userSkills: UserSkillScore[]): Promise<MatchResponse | null> {
        const id = positionId.trim();
        if (!id) return null;

        const { data, error } = await useApiFetch<MatchResponse>(`${BASE_URL}/${id}/match`, {
            method: 'POST',
            body: userSkills,
        });

        if (error.value) throw error.value;
        return data.value ?? null;
    }

    return { match };
}
