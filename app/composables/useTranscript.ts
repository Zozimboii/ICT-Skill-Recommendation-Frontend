// import type { TranscriptResponse } from '~/types/transcript';

// const BASE_URL = '/api/v1/transcript';

// export function useTranscript() {
//     async function uploadTranscript(formData: FormData): Promise<TranscriptResponse> {
//         // 1. เรียกใช้ useApiFetch
//         const { data, error } = await useApiFetch<TranscriptResponse>(`${BASE_URL}/upload-transcript`, {
//             method: 'POST',
//             body: formData,
//             // สำหรับ FormData ไม่ต้องตั้ง Content-Type เอง
//             // Browser จะจัดการให้พร้อม boundary อัตโนมัติครับ
//         });

//         // 2. เช็ค Error
//         if (error.value) {
//             throw error.value;
//         }

//         // 3. เข้าถึงค่าผ่าน .value และเช็คว่าเป็น undefined หรือไม่
//         const res = data.value;

//         if (!res) {
//             throw new Error('Upload failed: No response data');
//         }

//         // ตอนนี้ res จะมี Type เป็น TranscriptResponse (ไม่ใช่ Ref แล้ว)
//         return res;
//     }

//     return { uploadTranscript };
// }

// composables/useTranscript.ts

import type { TranscriptResponse, TranscriptDetail, ExtractedSkill, JobRecommendation } from '~/types/transcript';

const BASE_URL = '/api/v1/transcript';

export function useTranscript() {
    async function uploadTranscript(formData: FormData): Promise<TranscriptResponse> {
        const { data, error } = await useApiFetch<TranscriptResponse>(`${BASE_URL}/upload-transcript`, { method: 'POST', body: formData });
        if (error.value) throw error.value;
        if (!data.value) throw new Error('Upload failed: No response data');
        return data.value;
    }

    async function getTranscript(): Promise<TranscriptDetail | null> {
        const { data, error } = await useApiFetch<TranscriptDetail>(`${BASE_URL}/profile`);
        if (error.value) return null;
        return data.value ?? null;
    }

    async function getExtractedSkills(): Promise<ExtractedSkill[]> {
        const { data, error } = await useApiFetch<ExtractedSkill[]>(`${BASE_URL}/profile/skills`);
        if (error.value) return [];
        return data.value ?? [];
    }
    async function getRecommendations(): Promise<JobRecommendation[]> {
        const { data, error } = await useApiFetch<JobRecommendation[]>(`${BASE_URL}/profile/recommendations`);
        if (error.value) return [];
        return data.value ?? [];
    }
    return { uploadTranscript, getTranscript, getExtractedSkills, getRecommendations };
}
