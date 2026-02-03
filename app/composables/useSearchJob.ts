// app/composables/useSearchJob.ts
// import type { SearchJobsResult } from '~/types/SearchJobsResult'

// const BASE_URL = '/api/v1/jobs/searchjobs'

// export function useSearchJob() {
//   async function search(q: string): Promise<SearchJobsResult | null> {
//     const keyword = q.trim()
//     if (!keyword) return null

//     const config = useRuntimeConfig()
//     const token = useCookie<string | null>('token', { sameSite: 'lax' })

//     return await $fetch<SearchJobsResult>(BASE_URL, {
//       baseURL: config.public.apiBase,
//       method: 'GET',
//       query: { q: keyword },
//       headers: {
//         ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
//       },
//     })
//   }

//   return { search }
// }

// app/composables/useSearchJob.ts
import type { SearchJobsResult } from '~/types/SearchJobsResult';

const BASE_URL = '/api/v1/jobs/searchjobs';

export function useSearchJob() {
    async function search(q: string): Promise<SearchJobsResult | null> {
        const keyword = q.trim();
        if (!keyword) return null;

        const config = useRuntimeConfig();

        try {
            return await $fetch<SearchJobsResult>(BASE_URL, {
                baseURL: config.public.apiBase,
                method: 'GET',
                query: { q: keyword },
            });
        } catch (err) {
            console.error('Search API Error:', err);
            return null;
        }
    }

    return { search };
}
