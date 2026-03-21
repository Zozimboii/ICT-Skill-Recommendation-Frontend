// // composables/useTranscript.ts
// import type { TranscriptDetail, ExtractedSkill, JobRecommendation } from '~/types/transcript';
// import { useAuthStore } from '~/stores/useAuthStore';

// const BASE = '/api/v1/transcript';

// export function useTranscript() {
//     const auth = useAuthStore();

//     function getHeaders(): Record<string, string> {
//         return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
//     }

//     function baseUrl(): string {
//         return useRuntimeConfig().public.apiBase as string;
//     }

//     async function uploadTranscript(formData: FormData) {
//         return await $fetch(`${baseUrl()}${BASE}/upload-transcript`, {
//             method: 'POST',
//             headers: getHeaders(),
//             body: formData,
//         });
//     }

//     async function getTranscript(): Promise<TranscriptDetail | null> {
//         try {
//             return await $fetch<TranscriptDetail>(`${baseUrl()}${BASE}/profile`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             if (e?.status === 404) return null;
//             console.error('[useTranscript] getTranscript:', e?.status ?? e);
//             return null;
//         }
//     }

//     async function getExtractedSkills(): Promise<ExtractedSkill[]> {
//         try {
//             return await $fetch<ExtractedSkill[]>(`${baseUrl()}${BASE}/profile/skills`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             console.error('[useTranscript] getExtractedSkills:', e?.status ?? e);
//             return [];
//         }
//     }

//     async function getRecommendations(): Promise<JobRecommendation[]> {
//         try {
//             return await $fetch<JobRecommendation[]>(`${baseUrl()}${BASE}/profile/recommendations`, {
//                 headers: getHeaders(),
//             });
//         } catch (e: any) {
//             console.error('[useTranscript] getRecommendations:', e?.status ?? e);
//             return [];
//         }
//     }

//     return { uploadTranscript, getTranscript, getExtractedSkills, getRecommendations };
// }
// composables/useTranscript.ts
import type { TranscriptDetail, ExtractedSkill, JobRecommendation } from '~/types/transcript';
import { apiFetch } from '~/composables/useApiFetch';

const BASE = '/api/v1/transcript';

export function useTranscript() {
    async function uploadTranscript(formData: FormData) {
        // FormData ไม่ใส่ Content-Type — browser set boundary อัตโนมัติ
        return await apiFetch(`${BASE}/upload-transcript`, {
            method: 'POST',
            body: formData as any,
        });
    }

    async function getTranscript(): Promise<TranscriptDetail | null> {
        try {
            return await apiFetch<TranscriptDetail>(`${BASE}/profile`);
        } catch (e: any) {
            if (e?.status === 404) return null;
            if (e?.status !== 401) console.error('[useTranscript] getTranscript:', e?.status ?? e);
            return null;
        }
    }

    async function getExtractedSkills(): Promise<ExtractedSkill[]> {
        try {
            return await apiFetch<ExtractedSkill[]>(`${BASE}/profile/skills`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useTranscript] getExtractedSkills:', e?.status ?? e);
            return [];
        }
    }

    async function getRecommendations(): Promise<JobRecommendation[]> {
        try {
            return await apiFetch<JobRecommendation[]>(`${BASE}/profile/recommendations`);
        } catch (e: any) {
            if (e?.status !== 401) console.error('[useTranscript] getRecommendations:', e?.status ?? e);
            return [];
        }
    }

    return { uploadTranscript, getTranscript, getExtractedSkills, getRecommendations };
}
