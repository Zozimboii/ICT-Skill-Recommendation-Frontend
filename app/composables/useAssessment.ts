// // composables/useAssessment.ts
// import type { PositionItem, PositionSkillsResponse } from '~/types/Assessment';
// import { useAuthStore } from '~/stores/useAuthStore';

// const BASE = '/api/v1/assessment';

// export function useAssessment() {
//     const auth = useAuthStore();

//     function getHeaders(): Record<string, string> {
//         return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
//     }

//     function baseUrl(): string {
//         return useRuntimeConfig().public.apiBase as string;
//     }

//     async function getPositions(): Promise<PositionItem[]> {
//         try {
//             return await $fetch<PositionItem[]>(`${baseUrl()}${BASE}/positions`, {
//                 headers: getHeaders(),
//             });
//         } catch (e) {
//             console.error('[useAssessment] getPositions:', e);
//             return [];
//         }
//     }

//     async function getPositionSkills(subCategoryId: string): Promise<PositionSkillsResponse> {
//         return await $fetch<PositionSkillsResponse>(`${baseUrl()}${BASE}/positions/${subCategoryId}/skills`, { headers: getHeaders() });
//     }

//     async function saveAssessment(subCategoryId: string, skillScores: { skill_id: number; score: number }[]) {
//         return await $fetch(`${baseUrl()}${BASE}/save`, {
//             method: 'POST',
//             headers: getHeaders(),
//             body: { sub_category_id: Number(subCategoryId), skill_scores: skillScores },
//         });
//     }

//     async function resetAssessment() {
//         return await $fetch(`${baseUrl()}${BASE}/reset`, {
//             method: 'DELETE',
//             headers: getHeaders(),
//         });
//     }

//     return { getPositions, getPositionSkills, saveAssessment, resetAssessment };
// }
// composables/useAssessment.ts
import type { PositionItem, PositionSkillsResponse } from '~/types/Assessment';
import { apiFetch } from '~/composables/useApiFetch';

const BASE = '/api/v1/assessment';

export function useAssessment() {
    async function getPositions(): Promise<PositionItem[]> {
        try {
            return await apiFetch<PositionItem[]>(`${BASE}/positions`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useAssessment] getPositions:', e?.status ?? e);
            return [];
        }
    }

    async function getPositionSkills(subCategoryId: string): Promise<PositionSkillsResponse> {
        return await apiFetch<PositionSkillsResponse>(`${BASE}/positions/${subCategoryId}/skills`);
    }

    async function saveAssessment(subCategoryId: string, skillScores: { skill_id: number; score: number }[]) {
        return await apiFetch(`${BASE}/save`, {
            method: 'POST',
            body: JSON.stringify({ sub_category_id: Number(subCategoryId), skill_scores: skillScores }),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async function resetAssessment() {
        return await apiFetch(`${BASE}/reset`, { method: 'DELETE' });
    }

    return { getPositions, getPositionSkills, saveAssessment, resetAssessment };
}
