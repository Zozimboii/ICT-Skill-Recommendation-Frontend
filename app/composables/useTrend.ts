// composables/useTrend.ts
import { ref, computed } from 'vue';
import type { CrossDataResponse, JobTrendItem, SankeyLink, SkillByCategoryItem, SkillTrendItem } from '~/types/Trend';

const BASE_URL = '/api/v1/trends'; // ปรับให้ตรงกับ Backend ของคุณ

export function useTrend() {
    const jobTrend = ref<JobTrendItem[]>([]);
    const skillTrend = ref<SkillTrendItem[]>([]);
    const crossData = ref<CrossDataResponse | null>(null);
    const skillsByCategory = ref<SkillByCategoryItem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const selectedCategory = ref<string | null>(null);
    const selectedSkillId = ref<number | null>(null);
    const sankeyLinks = ref<SankeyLink[]>([]);
    const skillChartIds = computed(() => skillTrend.value.map((d) => d.id));
    // ── Core Fetching Logic (Using useApiFetch) ──────────────────────

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
            query: {
                sub_category: subCategory,
                skill_id: skillId,
            },
        });
        if (fetchError.value) throw fetchError.value;
        crossData.value = data.value ?? null;
    }

    async function fetchSkillsByCategory(subCategory: string, limit = 30) {
        const { data, error: fetchError } = await useApiFetch<SkillByCategoryItem[]>(`${BASE_URL}/skills/by-category`, {
            query: {
                sub_category: subCategory,
                limit,
                skill_type: 'hard_skill',
            },
        });
        if (fetchError.value) throw fetchError.value;
        skillsByCategory.value = data.value ?? [];
    }
    // ✅ ใหม่ — fetch sankey data
    async function fetchSankeyData(topCategories = 10, topSkills = 6) {
        const { data, error: fetchError } = await useApiFetch<SankeyLink[]>(`${BASE_URL}/sankey`, {
            query: { top_categories: topCategories, top_skills: topSkills },
        });
        if (fetchError.value) throw fetchError.value;
        sankeyLinks.value = data.value ?? [];
    }
    // ── Actions ─────────────────────────────────────────────────────

    async function loadAll() {
        loading.value = true;
        error.value = null;
        try {
            // ใช้ Promise.all เพื่อเรียกข้อมูลพร้อมกัน (ลดเวลาโหลดรวม)
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

    // ── Computed Charts Data (Same as before) ────────────────────────
    const skillBlockData = computed(() => {
        // ถ้ากด Job → show skills ของ job นั้น
        if (skillsByCategory.value.length) {
            return skillsByCategory.value;
        }

        // default → show hard skill trend
        return skillTrend.value.map((s) => ({
            id: s.id,
            name: s.skill,
            job_count: s.count,
        }));
    });
    const jobChartSeries = computed(() => {
        if (crossData.value?.data) {
            return [
                {
                    name: 'Sub Categories',
                    data: crossData.value.data.map((d) => d.job_count ?? 0),
                },
            ];
        }

        return [
            {
                name: 'จำนวนงาน',
                data: jobTrend.value.map((d) => d.job_count),
            },
        ];
    });

    const jobChartCategories = computed(() => {
        if (crossData.value?.data) {
            return crossData.value.data.map((d) => d.sub_category ?? '');
        }

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
    return {
        jobTrend,
        skillTrend,
        crossData,
        skillsByCategory,
        loading,
        error,
        selectedCategory,
        selectedSkillId,
        loadAll,
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
        sankeyLinks,
    };
}
