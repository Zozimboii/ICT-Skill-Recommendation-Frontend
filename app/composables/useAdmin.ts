// composables/useAdmin.ts
import type { AdminStats, AdminUserItem, AdminJobListResponse, AdminSkillItem } from '~/types/Admin';

const BASE_URL = '/api/v1/admin';

export function useAdmin() {
    async function getStats(): Promise<AdminStats | null> {
        const { data, error } = await useApiFetch<AdminStats>(`${BASE_URL}/stats`);
        if (error.value) return null;
        return data.value ?? null;
    }

    async function getUsers(): Promise<AdminUserItem[]> {
        const { data, error } = await useApiFetch<AdminUserItem[]>(`${BASE_URL}/users`);
        if (error.value) return [];
        return data.value ?? [];
    }

    async function toggleUser(userId: number, isActive: boolean): Promise<AdminUserItem | null> {
        const { data, error } = await useApiFetch<AdminUserItem>(`${BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            body: { is_active: isActive },
        });
        if (error.value) throw error.value;
        return data.value ?? null;
    }

    async function getJobs(params?: { keyword?: string; skip?: number; limit?: number }): Promise<AdminJobListResponse> {
        const { data, error } = await useApiFetch<AdminJobListResponse>(`${BASE_URL}/jobs`, {
            query: params,
        });
        if (error.value) return { total: 0, data: [] };
        return data.value ?? { total: 0, data: [] };
    }

    async function deleteJob(jobId: number): Promise<void> {
        const { error } = await useApiFetch(`${BASE_URL}/jobs/${jobId}`, { method: 'DELETE' });
        if (error.value) throw error.value;
    }

    async function getSkills(): Promise<AdminSkillItem[]> {
        const { data, error } = await useApiFetch<AdminSkillItem[]>(`${BASE_URL}/skills`);
        if (error.value) return [];
        return data.value ?? [];
    }

    async function createSkill(name: string, skillType: string): Promise<AdminSkillItem | null> {
        const { data, error } = await useApiFetch<AdminSkillItem>(`${BASE_URL}/skills`, {
            method: 'POST',
            body: { name, skill_type: skillType },
        });
        if (error.value) throw error.value;
        return data.value ?? null;
    }

    async function deleteSkill(skillId: number): Promise<void> {
        const { error } = await useApiFetch(`${BASE_URL}/skills/${skillId}`, { method: 'DELETE' });
        if (error.value) throw error.value;
    }

    async function triggerScrape(limit = 50): Promise<{ message: string; jobs_added: number } | null> {
        const { data, error } = await useApiFetch<{ message: string; jobs_added: number }>(`${BASE_URL}/scrape`, {
            method: 'POST',
            body: { limit },
        });
        if (error.value) throw error.value;
        return data.value ?? null;
    }

    return {
        getStats,
        getUsers,
        toggleUser,
        getJobs,
        deleteJob,
        getSkills,
        createSkill,
        deleteSkill,
        triggerScrape,
    };
}
