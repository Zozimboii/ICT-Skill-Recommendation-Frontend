// composables/useTrend.ts
import { ref, computed } from 'vue';
import type { CrossDataResponse, JobTrendItem, SankeyLink, SkillByCategoryItem, SkillTrendItem } from '~/types/Trend';

const BASE_URL = '/api/v1/trends';

export function useTrend() {
    const jobTrend = ref<JobTrendItem[]>([]);
    const skillTrend = ref<SkillTrendItem[]>([]);
    const crossData = ref<CrossDataResponse | null>(null);
    const skillsByCategory = ref<SkillByCategoryItem[]>([]);
    const loading = ref(false);
    const sankeyLoading = ref(false); // แยก loading ของ sankey
    const error = ref<string | null>(null);
    const selectedCategory = ref<string | null>(null);
    const selectedSkillId = ref<number | null>(null);
    const sankeyLinks = ref<SankeyLink[]>([]);
    const sankeyLoaded = ref(false); // ป้องกัน fetch ซ้ำ
    const jobsBySkill = ref<any[]>([]);
    const skillChartIds = computed(() => skillTrend.value.map((d) => d.id));

    // ── Fetch functions ──────────────────────────────────────────────

    async function fetchJobTrend() {
        const { data, error: e } = await useApiFetch<JobTrendItem[]>(`${BASE_URL}/jobs`);
        if (e.value) throw e.value;
        jobTrend.value = data.value ?? [];
    }

    async function fetchSkillTrend(limit = 20, skillType: string | null = 'hard_skill') {
        const { data, error: e } = await useApiFetch<SkillTrendItem[]>(`${BASE_URL}/skills`, {
            query: { limit, skill_type: skillType },
        });
        if (e.value) throw e.value;
        skillTrend.value = data.value ?? [];
    }

    async function fetchCrossData(subCategory: string | null = null, skillId: number | null = null) {
        const { data, error: e } = await useApiFetch<CrossDataResponse>(`${BASE_URL}/cross`, {
            query: { sub_category: subCategory, skill_id: skillId },
        });
        if (e.value) throw e.value;
        crossData.value = data.value ?? null;
    }

    async function fetchSkillsByCategory(subCategory: string, limit = 30) {
        const { data, error: e } = await useApiFetch<SkillByCategoryItem[]>(`${BASE_URL}/skills/by-category`, {
            query: { sub_category: subCategory, limit, skill_type: 'hard_skill' },
        });
        if (e.value) throw e.value;
        skillsByCategory.value = data.value ?? [];
    }

    async function fetchSankeyData(topCategories = 8, topSkills = 4) {
        if (sankeyLoaded.value) return; // cache: ถ้าโหลดแล้วไม่โหลดซ้ำ
        sankeyLoading.value = true;
        try {
            const { data, error: e } = await useApiFetch<SankeyLink[]>(`${BASE_URL}/sankey`, {
                query: { top_categories: topCategories, top_skills: topSkills },
            });
            if (e.value) throw e.value;
            sankeyLinks.value = data.value ?? [];
            sankeyLoaded.value = true;
        } finally {
            sankeyLoading.value = false;
        }
    }

    async function fetchJobsBySkill(skillId: number) {
        const { data, error: e } = await useApiFetch<any[]>(`${BASE_URL}/jobs-by-skill`, {
            query: { skill_id: skillId },
        });
        if (e.value) throw e.value;
        jobsBySkill.value = data.value ?? [];
    }

    // ── loadInitial: โหลดแค่ job + skill ก่อน (ไม่รวม Sankey) ─────────
    async function loadInitial() {
        loading.value = true;
        error.value = null;
        try {
            await Promise.all([fetchJobTrend(), fetchSkillTrend(20, 'hard_skill')]);
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch trend data';
        } finally {
            loading.value = false;
        }
    }

    // ── loadAll: ใช้ตอนกด Refresh เท่านั้น ──────────────────────────
    async function loadAll() {
        loading.value = true;
        error.value = null;
        sankeyLoaded.value = false; // force reload sankey
        try {
            await Promise.all([fetchJobTrend(), fetchSkillTrend(20, 'hard_skill'), fetchSankeyData(8, 4)]);
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch trend data';
        } finally {
            loading.value = false;
        }
    }

    // ── Actions ──────────────────────────────────────────────────────

    async function onCategoryClick(category: string) {
        selectedCategory.value = category;
        selectedSkillId.value = null;
        loading.value = true;
        try {
            await fetchSkillsByCategory(category);
        } finally {
            loading.value = false;
        }
    }

    async function onSkillClick(skillId: number) {
        selectedSkillId.value = skillId;
        selectedCategory.value = null;
        skillsByCategory.value = [];
        loading.value = true;
        try {
            await fetchCrossData(null, skillId);
        } finally {
            loading.value = false;
        }
    }

    function clearFilter() {
        selectedCategory.value = null;
        selectedSkillId.value = null;
        crossData.value = null;
        skillsByCategory.value = [];
    }

    // ── Computed ─────────────────────────────────────────────────────

    const skillBlockData = computed(() => {
        if (skillsByCategory.value.length) return skillsByCategory.value;
        return skillTrend.value.map((s) => ({ id: s.id, name: s.skill, job_count: s.count }));
    });

    const jobChartSeries = computed(() => {
        if (crossData.value?.data) return [{ name: 'Sub Categories', data: crossData.value.data.map((d) => d.job_count ?? 0) }];
        return [{ name: 'จำนวนงาน', data: jobTrend.value.map((d) => d.job_count) }];
    });

    const jobChartCategories = computed(() => {
        if (crossData.value?.data) return crossData.value.data.map((d) => d.sub_category ?? '');
        return jobTrend.value.map((d) => d.sub_category);
    });

    const skillChartSeries = computed(() => [{ name: 'ความต้องการ', data: skillTrend.value.map((d) => d.count) }]);
    const skillChartCategories = computed(() => skillTrend.value.map((d) => d.skill));

    const drillChartSeries = computed(() => {
        if (skillsByCategory.value.length) return [{ name: 'งานในหมวดนี้', data: skillsByCategory.value.map((d) => d.job_count) }];
        if (crossData.value?.data) return [{ name: 'จำนวนงาน', data: crossData.value.data.map((d) => d.job_count ?? d.count ?? 0) }];
        return [];
    });

    const drillChartCategories = computed(() => {
        if (skillsByCategory.value.length) return skillsByCategory.value.map((d) => d.name);
        if (crossData.value?.data) return crossData.value.data.map((d) => d.sub_category ?? d.skill ?? '');
        return [];
    });

    const drillTitle = computed(() => {
        if (selectedCategory.value) return `Skills ในสายงาน "${selectedCategory.value}"`;
        if (selectedSkillId.value) return `สายงานที่ต้องการ Skill นี้`;
        return '';
    });

    return {
        jobTrend,
        skillTrend,
        crossData,
        skillsByCategory,
        loading,
        sankeyLoading,
        error,
        selectedCategory,
        selectedSkillId,
        sankeyLinks,
        sankeyLoaded,
        loadInitial,
        loadAll,
        fetchSankeyData,
        onCategoryClick,
        onSkillClick,
        clearFilter,
        jobChartSeries,
        jobChartCategories,
        skillChartSeries,
        skillChartCategories,
        drillChartSeries,
        drillChartCategories,
        drillTitle,
        skillBlockData,
        skillChartIds,
        jobsBySkill,
        fetchJobsBySkill,
    };
}
