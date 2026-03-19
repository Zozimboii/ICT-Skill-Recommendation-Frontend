// composables/useTrend.ts
import { ref, computed } from 'vue';
import type { CrossDataResponse, JobTrendItem, SankeyLink, SkillByCategoryItem, SkillTrendItem } from '~/types/Trend';

const BASE_URL = '/api/v1/trends';

export function useTrend() {
    const jobTrend = ref<JobTrendItem[]>([]);
    const skillTrend = ref<SkillTrendItem[]>([]);
    const crossData = ref<CrossDataResponse | null>(null);
    const skillsByCategory = ref<SkillByCategoryItem[]>([]);
    const sankeyLinks = ref<SankeyLink[]>([]);
    const sankeyLoading = ref(false);
    const sankeyLoaded = ref(false);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const selectedCategory = ref<string | null>(null);
    const selectedSkillId = ref<number | null>(null);
    const skillChartIds = computed(() => skillTrend.value.map((d) => d.id));

    // ── Fetching ─────────────────────────────────────────────────────────────

    async function fetchJobTrend() {
        const { data, error: fetchError } = await useApiFetch<JobTrendItem[]>(`${BASE_URL}/jobs`);
        if (fetchError.value) throw fetchError.value;
        jobTrend.value = data.value ?? [];
    }

    async function fetchSkillTrend(limit = 10, skillType: string | null = 'hard_skill') {
        const { data, error: fetchError } = await useApiFetch<SkillTrendItem[]>(`${BASE_URL}/skills`, {
            query: { limit, skill_type: skillType },
        });
        if (fetchError.value) throw fetchError.value;
        skillTrend.value = data.value ?? [];
    }

    async function fetchCrossData(subCategory: string | null = null, skillId: number | null = null) {
        const { data, error: fetchError } = await useApiFetch<CrossDataResponse>(`${BASE_URL}/cross`, {
            query: { sub_category: subCategory, skill_id: skillId },
        });
        if (fetchError.value) throw fetchError.value;
        crossData.value = data.value ?? null;
    }

    async function fetchSkillsByCategory(subCategory: string, limit = 30) {
        const { data, error: fetchError } = await useApiFetch<SkillByCategoryItem[]>(`${BASE_URL}/skills/by-category`, {
            query: { sub_category: subCategory, limit, skill_type: 'hard_skill' },
        });
        if (fetchError.value) throw fetchError.value;
        skillsByCategory.value = data.value ?? [];
    }

    // fetch sankey data — tracks own loading state
    async function fetchSankeyData(topCategories = 10, topSkills = 6) {
        sankeyLoading.value = true;
        try {
            const { data, error: fetchError } = await useApiFetch<SankeyLink[]>(`${BASE_URL}/sankey`, {
                query: { top_categories: topCategories, top_skills: topSkills },
            });
            if (fetchError.value) throw fetchError.value;
            sankeyLinks.value = data.value ?? [];
            sankeyLoaded.value = true;
        } catch {
            sankeyLoaded.value = false;
        } finally {
            sankeyLoading.value = false;
        }
    }

    // loadInitial — โหลดเฉพาะ job + skill trend (ไม่รวม sankey — lazy load แยก)
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

    // loadAll — โหลดทุกอย่างรวม sankey (ปุ่มรีเฟรช)
    async function loadAll() {
        loading.value = true;
        sankeyLoading.value = true;
        error.value = null;
        try {
            await Promise.all([fetchJobTrend(), fetchSkillTrend(20, 'hard_skill'), fetchSankeyData(8, 4)]);
        } catch (e: any) {
            error.value = e.message || 'Failed to fetch trend data';
        } finally {
            loading.value = false;
        }
    }

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

    async function onSkillClick(skillId: number, _skillName?: string) {
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

    // ── Computed ─────────────────────────────────────────────────────────────

    const skillBlockData = computed(() => {
        if (skillsByCategory.value.length) return skillsByCategory.value;
        return skillTrend.value.map((s) => ({ id: s.id, name: s.skill, job_count: s.count }));
    });

    const jobChartSeries = computed(() => {
        if (crossData.value?.data) {
            return [{ name: 'Sub Categories', data: crossData.value.data.map((d) => d.job_count ?? 0) }];
        }
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

    const jobsBySkill = ref<any[]>([]);
    async function fetchJobsBySkill(skillId: number) {
        const { data, error: fetchError } = await useApiFetch<any[]>(`${BASE_URL}/jobs-by-skill`, {
            query: { skill_id: skillId },
        });
        if (fetchError.value) throw fetchError.value;
        jobsBySkill.value = data.value ?? [];
    }

    // ── Jobs by category (for JobTrendChart panel) ───────────────────────────
    const jobsByCategory = ref<Record<string, any[]>>({});
    async function fetchJobsByCategory(subCategory: string): Promise<any[]> {
        if (jobsByCategory.value[subCategory]) return jobsByCategory.value[subCategory];
        const { data, error: fetchError } = await useApiFetch<any[]>('/api/v1/jobs/search', {
            query: { sub_category: subCategory, limit: 20 },
        });
        if (fetchError.value) throw fetchError.value;
        const jobs = (data.value as any)?.data ?? data.value ?? [];
        jobsByCategory.value[subCategory] = jobs;
        return jobs;
    }

    return {
        jobTrend,
        skillTrend,
        crossData,
        skillsByCategory,
        sankeyLinks,
        sankeyLoading,
        sankeyLoaded,
        loading,
        error,
        selectedCategory,
        selectedSkillId,
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
        jobsByCategory,
        fetchJobsByCategory,
    };
}
