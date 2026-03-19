import type { Job, JobListResponse, SearchMode } from '~/types/SearchJobs';

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

    // 🔥 NEW: บอกว่า search จากอะไร
    const searchMeta = ref<string[]>([]);

    const LIMIT = 20;
    const totalPages = computed(() => Math.ceil(total.value / LIMIT));

    const fetchCategories = async () => {
        const { data, error: fetchError } = await useApiFetch<string[]>(`${BASE_URL}/categories`);
        if (!fetchError.value) subCategories.value = data.value ?? [];
    };

    function buildQuery() {
        const query: any = {
            page: page.value,
            limit: LIMIT,
        };

        if (keyword.value?.trim()) {
            query.keyword = keyword.value.trim();
        }

        if (selectedSubCategory.value !== 'all') {
            query.sub_category = selectedSubCategory.value;
        }

        return query;
    }

    const detectSearchMeta = () => {
        const kw = keyword.value.toLowerCase();
        const meta: string[] = [];

        // 🔥 heuristic ง่าย ๆ (ไม่ต้องรอ backend)
        if (!kw) return [];

        if (kw.includes('react') || kw.includes('python') || kw.includes('sql')) {
            meta.push('Skill');
        }

        if (kw.includes('developer') || kw.includes('engineer') || kw.includes('analyst')) {
            meta.push('ชื่องาน');
        }

        // default
        if (!meta.length) {
            meta.push('ชื่องาน', 'บริษัท', 'Skill');
        }

        return meta;
    };

    const searchJobs = async (resetPage = true) => {
        if (resetPage) page.value = 1;

        loading.value = true;
        error.value = null;

        const { data, error: fetchError } = await useApiFetch<JobListResponse>(`${BASE_URL}/search`, {
            query: buildQuery(),
        });

        if (fetchError.value) {
            error.value = fetchError.value.message;
            jobs.value = [];
            total.value = 0;
        } else {
            jobs.value = data.value?.data ?? [];
            total.value = data.value?.total ?? 0;

            // 🔥 SET META
            searchMeta.value = detectSearchMeta();
        }

        loading.value = false;
    };

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

    const reset = () => {
        keyword.value = '';
        selectedSubCategory.value = 'all';
        page.value = 1;
        searchMeta.value = [];
    };

    // let timeout: any;
    // watch([keyword, selectedSubCategory], () => {
    //     clearTimeout(timeout);
    //     timeout = setTimeout(() => {
    //         searchJobs();
    //     }, 400);
    // });

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
        searchMeta, // 🔥 NEW
        fetchCategories,
        searchJobs,
        prevPage,
        nextPage,
        reset,
    };
};
