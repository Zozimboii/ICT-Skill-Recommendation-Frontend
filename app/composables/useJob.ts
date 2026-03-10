// composables/useJob.ts
import type { Ref } from 'vue';

const BASE_URL = '/api/v1/jobs';

export function useJob() {
    async function getJobs(params?: { sub_category_id?: number; skill_name?: string }) {
        const { data, error } = await useApiFetch<any[]>(BASE_URL, {
            method: 'GET',
            query: {
                sub_category_id: params?.sub_category_id,
                skill_name: params?.skill_name,
            },
        });

        if (error.value) throw error.value;

        return data.value ?? [];
    }

    async function getJobById(id: number) {
        const { data, error } = await useApiFetch<any>(`${BASE_URL}/${id}`);

        if (error.value) throw error.value;

        return data.value ?? null;
    }

    return {
        getJobs,
        getJobById,
    };
}
