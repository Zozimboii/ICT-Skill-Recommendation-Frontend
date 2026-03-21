// // composables/useDashboard.ts
// import type { DashboardSummary, SkillGapResponse, RecommendationItem } from '~/types/Dashboard';
// import { useAuthStore } from '~/stores/useAuthStore';

// const BASE = '/api/v1/dashboard';

// export function useDashboard() {
//     const auth = useAuthStore();

//     function getHeaders(): Record<string, string> {
//         return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
//     }

//     function baseUrl(): string {
//         return useRuntimeConfig().public.apiBase as string;
//     }

//     async function getSummary(): Promise<DashboardSummary | null> {
//         try {
//             return await $fetch<DashboardSummary>(`${baseUrl()}${BASE}/summary`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             console.error('[useDashboard] getSummary:', e?.status ?? e);
//             return null;
//         }
//     }

//     async function getSkillGap(): Promise<SkillGapResponse[]> {
//         try {
//             return await $fetch<SkillGapResponse[]>(`${baseUrl()}${BASE}/skill-gap`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             console.error('[useDashboard] getSkillGap:', e?.status ?? e);
//             return [];
//         }
//     }

//     async function getRecommendations(): Promise<RecommendationItem[]> {
//         try {
//             return await $fetch<RecommendationItem[]>(`${baseUrl()}${BASE}/recommendations`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             console.error('[useDashboard] getRecommendations:', e?.status ?? e);
//             return [];
//         }
//     }

//     return { getSummary, getSkillGap, getRecommendations };
// }
// composables/useDashboard.ts
import type { DashboardSummary, SkillGapResponse, RecommendationItem } from '~/types/Dashboard';
import { apiFetch } from '~/composables/useApiFetch';

const BASE = '/api/v1/dashboard';

export function useDashboard() {
    async function getSummary(): Promise<DashboardSummary | null> {
        try {
            return await apiFetch<DashboardSummary>(`${BASE}/summary`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useDashboard] getSummary:', e?.status ?? e);
            return null;
        }
    }

    async function getSkillGap(): Promise<SkillGapResponse[]> {
        try {
            return await apiFetch<SkillGapResponse[]>(`${BASE}/skill-gap`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useDashboard] getSkillGap:', e?.status ?? e);
            return [];
        }
    }

    async function getRecommendations(): Promise<RecommendationItem[]> {
        try {
            return await apiFetch<RecommendationItem[]>(`${BASE}/recommendations`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useDashboard] getRecommendations:', e?.status ?? e);
            return [];
        }
    }

    return { getSummary, getSkillGap, getRecommendations };
}
