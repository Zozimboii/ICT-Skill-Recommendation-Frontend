// composables/usePosition.ts
import type { PositionItem } from '~/types/PositionProfile';

const BASE_URL = '/api/v1/positions';

export function usePosition() {
    async function list(): Promise<PositionItem[]> {
        const { data, error } = await useApiFetch<PositionItem[]>(BASE_URL, {
            method: 'GET',
        });
        if (error.value) throw error.value;
        return data.value ?? [];
    }

    return { list };
}
