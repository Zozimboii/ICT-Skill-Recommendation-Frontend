// composables/useJobSearch.ts

import type { Job, JobListResponse, JobSearchParams, JobDateRange, SearchMode } from '~/types/SearchJobs';

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
    const subCategories = ref<string[]>([]);
    const searchBy = ref<'all' | 'title' | 'skill'>('all'); // filter scope

    // dateRangeDb — แสดง range ใน UI (ไม่กรอง)
    const dateRangeDb = ref<JobDateRange>({ min_date: null, max_date: null });

    // searchMeta — บอก user ว่าค้นจากอะไร
    const searchMeta = ref<string[]>([]);

    const LIMIT = 20;
    const totalPages = computed(() => Math.ceil(total.value / LIMIT));

    // ─── Fetch categories ────────────────────────────────────────────────────
    const fetchCategories = async () => {
        const { data, error: e } = await useApiFetch<string[]>(`${BASE_URL}/categories`);
        if (!e.value) subCategories.value = data.value ?? [];
    };

    // ─── ข้อ 4: Fetch date range จาก DB ────────────────────────────────────
    const fetchDateRange = async () => {
        const { data, error: e } = await useApiFetch<JobDateRange>(`${BASE_URL}/date-range`);
        if (!e.value && data.value) {
            dateRangeDb.value = data.value;
        }
    };

    // ─── Build query ─────────────────────────────────────────────────────────
    const buildQuery = (): JobSearchParams => {
        const q: JobSearchParams = { page: page.value, limit: LIMIT };

        if (searchMode.value === 'keyword' && keyword.value.trim()) {
            q.keyword = keyword.value.trim();
        }
        if (searchMode.value === 'dropdown' && selectedSubCategory.value !== 'all') {
            q.sub_category = selectedSubCategory.value;
        }
        // search scope filter
        if (searchBy.value !== 'all') {
            q.search_by = searchBy.value;
        }
        return q;
    };

    // ─── detectSearchMeta ────────────────────────────────────────────────────
    const detectSearchMeta = () => {
        const kw = keyword.value.toLowerCase();
        if (!kw) return [];
        const meta: string[] = [];
        if (/react|python|java|sql|aws|docker|kubernetes/.test(kw)) meta.push('Skill');
        if (/developer|engineer|analyst|manager/.test(kw)) meta.push('ชื่องาน');
        if (!meta.length) meta.push('ชื่องาน', 'บริษัท');
        return meta;
    };

    // ─── Search ──────────────────────────────────────────────────────────────
    const searchJobs = async (resetPage = true) => {
        if (resetPage) page.value = 1;
        loading.value = true;
        error.value = null;

        const { data, error: fetchError } = await useApiFetch<JobListResponse>(`${BASE_URL}/search`, { query: buildQuery() });

        if (fetchError.value) {
            error.value = fetchError.value?.message ?? 'เกิดข้อผิดพลาด';
            jobs.value = [];
            total.value = 0;
            loading.value = false;
            return;
        }

        jobs.value = data.value?.data ?? [];
        total.value = data.value?.total ?? 0;
        searchMeta.value = detectSearchMeta();
        loading.value = false;
    };

    // ─── Pagination ──────────────────────────────────────────────────────────
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

    // ─── Reset ───────────────────────────────────────────────────────────────
    const reset = () => {
        keyword.value = '';
        selectedSubCategory.value = 'all';
        page.value = 1;
        jobs.value = [];
        total.value = 0;
        error.value = null;
        searchMeta.value = [];
    };

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
        searchMeta,
        dateRangeDb,
        searchBy,
        fetchCategories,
        fetchDateRange,
        searchJobs,
        prevPage,
        nextPage,
        reset,
    };
};
