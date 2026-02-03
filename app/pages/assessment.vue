<script setup lang="ts">
import PositionPicker from '~/components/Assessment/PositionPicker.vue';
import SkillRatingForm from '~/components/Assessment/SkillRatingForm.vue';
import MatchSummary from '~/components/Assessment/MatchSummary.vue';
import RadarChart from '~/components/Charts/RadarChart.vue';

import type { PositionItem, PositionSkill, PositionSkillsResponse, UserSkillScore } from '~/types/PositionProfile';
import { usePosition } from '~/composables/usePositions';
import { usePositionProfile } from '~/composables/usePositionProfile';

const selectedPositionId = ref('');

const positions = ref<PositionItem[]>([]);
const positionsLoading = ref(false);
const positionsError = ref<string | null>(null);

const userSkills = ref<UserSkillScore[]>([]); // ✅ เริ่มว่าง ให้ auto สร้างจากตำแหน่ง
const profile = ref<PositionSkillsResponse | null>(null);
const jobProfile = ref<PositionSkill[]>([]);

const loadingProfile = ref(false);
const profileError = ref<string | null>(null);

const { list } = usePosition();
const { getSkillsId } = usePositionProfile();

onMounted(async () => {
    positionsLoading.value = true;
    positionsError.value = null;
    try {
        positions.value = await list();
    } catch (e: any) {
        positionsError.value = e?.data?.detail || e?.message || 'Load positions failed';
    } finally {
        positionsLoading.value = false;
    }
});

const ensureUserSkillsFromProfile = (skills: PositionSkill[]) => {
    const prev = new Map(userSkills.value.map((s) => [s.skill_name.trim().toLowerCase(), s.score]));

    userSkills.value = skills
        .filter((s) => s.skill_name?.trim())
        .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
        .map((s) => {
            const name = s.skill_name.trim();
            const key = name.toLowerCase();
            return { skill_name: name, score: prev.get(key) ?? 0 }; //  default 0
        });
};

const handlePositionChange = async (id: string) => {
    selectedPositionId.value = id;
    profileError.value = null;
    profile.value = null;
    jobProfile.value = [];
    if (!id) return;

    loadingProfile.value = true;
    try {
        const res = await getSkillsId(id); // PositionSkillsResponse
        profile.value = res;
        jobProfile.value = res?.skills ?? []; //  set ก่อน
        ensureUserSkillsFromProfile(jobProfile.value); // แล้วค่อย auto สร้างฟอร์ม
    } catch (e: any) {
        profileError.value = e?.data?.detail || e?.message || 'Load position profile failed';
    } finally {
        loadingProfile.value = false;
    }
};

// normalize user score 1-5 -> 0-100
const normalizeUser = (scores: UserSkillScore[]) => scores.filter((s) => s.skill_name.trim()).map((s) => ({ skill_name: s.skill_name.trim(), value: s.score * 20 }));

const normalizeJob = (skills: PositionSkill[]) => skills.map((s) => ({ skill_name: s.skill_name.trim(), value: s.weight }));

const labels = computed(() => {
    const u = normalizeUser(userSkills.value).map((x) => x.skill_name);
    const j = normalizeJob(jobProfile.value).map((x) => x.skill_name);
    return Array.from(new Set([...u, ...j])).slice(0, 15);
});

const userData = computed(() => {
    const map = new Map(normalizeUser(userSkills.value).map((x) => [x.skill_name, x.value]));
    return labels.value.map((l) => map.get(l) ?? 0);
});

const jobData = computed(() => {
    const map = new Map(normalizeJob(jobProfile.value).map((x) => [x.skill_name, x.value]));
    return labels.value.map((l) => map.get(l) ?? 0);
});

const matchPercent = computed(() => {
    const job = jobData.value;
    const user = userData.value;
    if (job.length === 0) return 0;

    const ratios = job.map((j, idx) => (j <= 0 ? null : Math.min(user[idx] ?? 0, j) / j)).filter((x): x is number => x !== null);

    if (!ratios.length) return 0;
    return Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
});

const gaps = computed(() => {
    return labels.value
        .map((name, i) => ({ name, gap: Math.max((jobData.value[i] ?? 0) - (userData.value[i] ?? 0), 0) }))
        .filter((x) => x.gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 8);
});

// ✅ top demand skill (แสดง badge)
const topDemands = computed(() =>
    jobProfile.value
        .filter((s) => s.demand_level === 'HIGH')
        .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
        .slice(0, 10),
);
// ใน <script setup> assessment.vue
const demandsMap = computed(() => {
    const map: Record<string, any> = {};
    for (const s of jobProfile.value ?? []) {
        const key = s.skill_name.trim().toLowerCase();
        if (!key) continue;
        map[key] = {
            demand_level: s.demand_level,
            demand_label: s.demand_label,
            weight: s.weight,
        };
    }
    return map;
});
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div>
            <h1 class="text-3xl font-extrabold tracking-tight">Skill Assessment</h1>
            <p class="mt-2 text-slate-600">เลือกตำแหน่งงาน แล้วให้คะแนนทักษะของคุณ</p>
        </div>

        <div v-if="positionsError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ positionsError }}
        </div>

        <PositionPicker v-model="selectedPositionId" :positions="positions" :loading="positionsLoading" @change="handlePositionChange" />

        <div v-if="loadingProfile" class="rounded-xl border bg-white p-4 text-sm text-slate-600">กำลังโหลดโปรไฟล์ตำแหน่ง…</div>

        <div v-else-if="profileError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ profileError }}
        </div>

        <div v-else-if="profile" class="rounded-xl border bg-white p-4 text-sm text-slate-700">
            <div class="font-semibold">ตำแหน่ง: {{ profile.position_name }}</div>
            <div class="text-slate-500">Jobs ที่ใช้คำนวณ: {{ profile.total_jobs }}</div>
        </div>

        <!-- ✅ Show แบบทดสอบเฉพาะตอนเลือกตำแหน่งแล้ว -->
        <div v-if="jobProfile.length > 0" class="space-y-6">
            <SkillRatingForm v-model="userSkills" :demands="demandsMap" />

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientOnly>
                    <RadarChart
                        :labels="labels"
                        :datasets="[
                            {
                                label: 'คุณ',
                                data: userData,
                                borderColor: '#2563eb',
                                backgroundColor: 'rgba(37, 99, 235, 0.3)',
                                pointBackgroundColor: '#2563eb',
                            },
                            {
                                label: 'ตำแหน่งงาน',
                                data: jobData,
                                borderColor: '#f97316',
                                backgroundColor: 'rgba(249, 115, 22, 0.25)',
                                pointBackgroundColor: '#f97316',
                            },
                        ]"
                    />
                </ClientOnly>

                <MatchSummary :matchPercent="matchPercent" :gaps="gaps" :hasProfile="jobProfile.length > 0" :topDemands="topDemands" />
            </div>
        </div>
        <div v-else>กรุณาเลือกตำแหน่งงานก่อน</div>
    </div>
</template>
