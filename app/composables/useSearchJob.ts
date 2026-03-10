// composables/useJobSearch.ts

import type { Job, JobListResponse, JobSearchParams, SearchMode } from '~/types/SearchJobs';

const BASE_URL = '/api/v1/jobs';

export const useJobSearch = () => {
    const jobs = ref<Job[]>([]);
    const total = ref(0);
    const page = ref(1);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const searchMode = ref<SearchMode>('keyword');
    const keyword = ref('');
    const selectedSubCategory = ref('all');
    const subCategories = ref<string[]>([]); // ← เปลี่ยนเป็น string[] ตรงๆ

    const LIMIT = 20;
    const totalPages = computed(() => Math.ceil(total.value / LIMIT));

    // ─── Fetch categories ──────────────────────────────────
    const fetchCategories = async () => {
        const { data, error: fetchError } = await useApiFetch<any>(`${BASE_URL}/categories`);

        if (fetchError.value) {
            console.error('fetchCategories error:', fetchError.value);
            return;
        }
        subCategories.value = data.value ?? [];
    };

    // ─── Build query ───────────────────────────────────────
    const buildQuery = (): JobSearchParams => {
        const query: JobSearchParams = { page: page.value, limit: LIMIT };

        if (searchMode.value === 'keyword' && keyword.value.trim()) {
            query.keyword = keyword.value.trim();
        }

        if (searchMode.value === 'dropdown' && selectedSubCategory.value !== 'all') {
            query.sub_category = selectedSubCategory.value;
        }

        return query;
    };

    // ─── Search jobs ───────────────────────────────────────
    const searchJobs = async (resetPage = true) => {
        if (resetPage) page.value = 1;
        loading.value = true;
        error.value = null;

        const { data, error: fetchError } = await useApiFetch<JobListResponse>(`${BASE_URL}/search`, { query: buildQuery() });

        if (fetchError.value) {
            error.value = fetchError.value?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
            jobs.value = [];
            total.value = 0;
            loading.value = false;
            return;
        }

        jobs.value = data.value?.data ?? [];
        total.value = data.value?.total ?? 0;
        loading.value = false;
    };

    // ─── Pagination ────────────────────────────────────────
    const prevPage = async () => {
        if (page.value <= 1) return;
        page.value--;
        await searchJobs(false);
    };

    const nextPage = async () => {
        if (page.value >= totalPages.value) return;
        page.value++;
        await searchJobs(false);
    };

    // ─── Reset ─────────────────────────────────────────────
    const reset = () => {
        keyword.value = '';
        selectedSubCategory.value = 'all';
        page.value = 1;
        jobs.value = [];
        total.value = 0;
        error.value = null;
    };

    watch(searchMode, () => reset());

    return {
        jobs,
        total,
        page,
        loading,
        error,
        searchMode,
        keyword,
        selectedSubCategory,
        subCategories,
        totalPages,
        fetchCategories,
        searchJobs,
        prevPage,
        nextPage,
        reset,
    };
};
