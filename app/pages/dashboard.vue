<!-- pages/dashboard.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import RadarChart from '~/components/Charts/RadarChart.vue';
import { buildRadarData, buildRadarDataSplit } from '~/composables/useJobRadar';
import { useDashboardStore } from '~/stores/useDashboardStore';

useHead({ title: 'Dashboard — ICT Skill' });
const route = useRoute();
const router = useRouter();
const { resetAssessment } = useAssessment();

// ── ใช้ store เป็น single source of truth ──────────────────────────────────
const dashboardStore = useDashboardStore();
const { summary, skillGap, recommendations, loading } = storeToRefs(dashboardStore);
const resettingAssessment = ref(false);

type Tab = 'overview' | 'skills' | 'matches' | 'gap';
const activeTab = ref<Tab>('overview');
const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'ภาพรวม' },
    { key: 'skills', label: 'Skill Profile' },
    { key: 'matches', label: 'งานแนะนำ' },
    { key: 'gap', label: 'Skill Gap' },
];

const viewMode = ref<Record<string, 'top10' | 'grouped' | 'roadmap'>>({});
const getView = (title: string) => viewMode.value[title] ?? 'top10';
const setView = (title: string, m: 'top10' | 'grouped' | 'roadmap') => {
    viewMode.value[title] = m;
};

const importanceStyle: Record<string, string> = {
    required: 'background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171',
    recommended: 'background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25); color:#fbbf24',
    optional: 'background:rgba(148,163,184,0.08); border:1px solid rgba(148,163,184,0.2); color:#94a3b8',
};
const stepColor: Record<string, string> = {
    required: 'border-color:rgba(239,68,68,0.4); color:#f87171',
    recommended: 'border-color:rgba(251,191,36,0.4); color:#fbbf24',
    optional: 'border-color:rgba(148,163,184,0.3); color:#94a3b8',
};
const stepBg: Record<string, string> = {
    required: 'background:rgba(239,68,68,0.06)',
    recommended: 'background:rgba(251,191,36,0.05)',
    optional: 'background:rgba(148,163,184,0.04)',
};

// ── Computed จาก store ─────────────────────────────────────────────────────
const hardSkillsFromGap = computed(() => {
    const seen = new Set<string>();
    const result: { name: string }[] = [];
    skillGap.value.forEach((gap) => {
        gap.matched_skills
            .filter((s) => s.skill_type === 'hard_skill')
            .forEach((s) => {
                if (!seen.has(s.skill_name)) {
                    seen.add(s.skill_name);
                    result.push({ name: s.skill_name });
                }
            });
    });
    return result;
});
const softSkillsFromGap = computed(() => {
    const seen = new Set<string>();
    const result: { name: string }[] = [];
    skillGap.value.forEach((gap) => {
        gap.matched_skills
            .filter((s) => s.skill_type === 'soft_skill')
            .forEach((s) => {
                if (!seen.has(s.skill_name)) {
                    seen.add(s.skill_name);
                    result.push({ name: s.skill_name });
                }
            });
    });
    return result;
});
const avgMatch = computed(() => {
    if (!recommendations.value.length) return 0;
    return Math.round(recommendations.value.reduce((a, r) => a + r.skill_match_percent, 0) / recommendations.value.length);
});

// ── Radar expanded state ───────────────────────────────────────────────────
const expandedRadar = ref<Record<number, boolean>>({});
const showResetModal = ref(false);
function toggleRadar(id: number) {
    expandedRadar.value[id] = !expandedRadar.value[id];
}

// ── Reset assessment ───────────────────────────────────────────────────────
const handleReset = async () => {
    showResetModal.value = false;
    resettingAssessment.value = true;
    try {
        await resetAssessment();
        dashboardStore.clearData();
        await router.push('/assessment');
    } catch (e) {
        console.error('Reset failed:', e);
    } finally {
        resettingAssessment.value = false;
    }
};

// ── Load on mount + route change ───────────────────────────────────────────
onMounted(() => {
    dashboardStore.load();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && route.path === '/dashboard') {
            dashboardStore.load();
        }
    });
});

// reload ทุกครั้งที่ navigate มาหน้านี้
watch(
    () => route.path,
    (p) => {
        if (p === '/dashboard') dashboardStore.load();
    },
);
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
                <h1 class="text-4xl font-bold text-white">Dashboard</h1>
                <p class="text-lg text-slate-300 mt-0.5">ติดตามทักษะและโอกาสงานในสายงาน ICT</p>
            </div>

            <!-- Source indicator — ขวาบน -->
            <Transition name="fade">
                <div v-if="!loading && summary?.has_transcript" class="flex flex-col items-end gap-1.5">
                    <!-- Case A: มี Transcript -->
                    <template v-if="summary?.university">
                        <div class="flex items-center gap-2 flex-wrap justify-end">
                            <div
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold"
                                style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.25); color: #4caf50"
                            >
                                <div class="w-1.5 h-1.5 rounded-full shrink-0" style="background: #4caf50; box-shadow: 0 0 5px #4caf50" />
                                Transcript
                            </div>
                            <NuxtLink
                                to="/assessment"
                                class="px-3 py-1.5 rounded-xl text-base font-semibold transition-all"
                                style="background: rgba(13, 95, 163, 0.12); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.25)')"
                            >
                                + Assessment
                            </NuxtLink>
                            <NuxtLink
                                to="/transcript"
                                class="px-3 py-1.5 rounded-xl text-base font-semibold transition-all"
                                style="background: rgba(76, 175, 80, 0.12); border: 1px solid rgba(76, 175, 80, 0.3); color: #4caf50"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,175,80,0.55)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,175,80,0.3)')"
                            >
                                อัปเดต Transcript
                            </NuxtLink>
                        </div>
                        <p class="text-base text-slate-400">ข้อมูลอ้างอิงจากผลการเรียน - แม่นยำสูงสุด</p>
                    </template>

                    <!-- Case B: มีแค่ Assessment -->
                    <template v-else>
                        <div class="flex items-center gap-2 flex-wrap justify-end">
                            <div
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold"
                                style="background: rgba(42, 127, 212, 0.1); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                            >
                                <div class="w-1.5 h-1.5 rounded-full shrink-0" style="background: #5bc4f5; box-shadow: 0 0 5px #5bc4f5" />
                                Assessment
                            </div>
                            <button
                                class="px-3 py-1.5 rounded-xl text-base font-semibold transition-all"
                                style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2); color: #64748b"
                                :disabled="resettingAssessment"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = '#f87171')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = '#64748b')"
                                @click="showResetModal = true"
                            >
                                {{ resettingAssessment ? 'กำลังรีเซ็ต...' : 'ทำใหม่' }}
                            </button>
                            <NuxtLink
                                to="/transcript"
                                class="px-3 py-1.5 rounded-xl text-base font-semibold transition-all"
                                style="background: rgba(13, 95, 163, 0.15); border: 1px solid rgba(42, 127, 212, 0.35); color: #5bc4f5"
                                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.6)')"
                                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.35)')"
                            >
                                อัปโหลด Transcript
                            </NuxtLink>
                        </div>
                        <p class="text-base text-slate-600">อิงจากคะแนนที่ให้ไว้ — อัปโหลด Transcript เพื่อความแม่นยำมากขึ้น</p>
                    </template>
                </div>
            </Transition>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-2/3" style="background: rgba(42, 127, 212, 0.1)" />
            </div>
        </div>

        <template v-else>
            <!-- No Skills yet -->
            <div v-if="!summary?.has_transcript" class="space-y-4">
                <div class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <svg class="w-14 h-14 mx-auto mb-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p class="text-2xl font-bold text-white mb-2">ยังไม่มีข้อมูล Skills</p>
                    <p class="text-slate-400 mb-6 text-lg leading-relaxed">
                        เริ่มต้นด้วยการอัปโหลด Transcript หรือทำ Skill Assessment<br />
                        ระบบจะวิเคราะห์และแนะนำงานที่เหมาะกับคุณ
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <NuxtLink
                            to="/assessment"
                            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                            style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                        >
                            เริ่ม Assessment
                        </NuxtLink>
                        <NuxtLink
                            to="/transcript"
                            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300"
                            style="border: 1px solid rgba(42, 127, 212, 0.3)"
                        >
                            อัปโหลด Transcript
                        </NuxtLink>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="rounded-xl p-4" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12)">
                        <p class="text-lg font-bold text-white mb-1">Assessment</p>
                        <p class="text-base text-slate-400 leading-relaxed">ให้คะแนนทักษะตัวเองทีละ skill ระบบจะบันทึกและแนะนำงานให้ทันที</p>
                    </div>
                    <div class="rounded-xl p-4" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12)">
                        <p class="text-lg font-bold text-white mb-1">Transcript</p>
                        <p class="text-base text-slate-400 leading-relaxed">อัปโหลดผลการเรียน ระบบจะดึง skills จากวิชาที่เรียนโดยอัตโนมัติ</p>
                    </div>
                </div>
            </div>

            <template v-else>
                <!-- Stat Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        v-for="card in [
                            { label: 'GPA', value: summary?.gpa?.toFixed(2) ?? '-', sub: summary?.university ?? 'ไม่มีข้อมูล' },
                            { label: 'Hard Skills', value: String(summary?.hard_skill_count ?? 0), sub: 'ทักษะเทคนิค' },
                            { label: 'Soft Skills', value: String(summary?.soft_skill_count ?? 0), sub: 'ทักษะสังคม' },
                            { label: 'Match เฉลี่ย', value: `${avgMatch}%`, sub: `${recommendations.length} งานแนะนำ` },
                        ]"
                        :key="card.label"
                        class="rounded-2xl p-5 hover:-translate-y-0.5 transition-all cursor-default"
                        style="background: rgba(8, 18, 36, 0.7); border: 1px solid rgba(42, 127, 212, 0.15)"
                    >
                        <p class="text-4xl font-extrabold text-white">{{ card.value }}</p>
                        <p class="text-base uppercase tracking-widest text-slate-500 mt-0.5">{{ card.label }}</p>
                        <p class="text-base text-slate-600 mt-1 truncate">{{ card.sub }}</p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex gap-1 p-1 rounded-2xl" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        class="flex-1 px-3 py-2.5 rounded-xl text-base font-semibold transition-all"
                        :style="activeTab === tab.key ? 'background:rgba(13,95,163,0.3); color:#5bc4f5; border:1px solid rgba(42,159,214,0.3)' : 'color:#64748b; border:1px solid transparent'"
                        @click="activeTab = tab.key"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- ── TAB: OVERVIEW ── -->
                <template v-if="activeTab === 'overview'">
                    <div v-if="summary?.university" class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div class="h-0.5 w-12 rounded-full mb-4" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                        <div class="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <p class="text-base uppercase tracking-widest text-slate-500 mb-1">มหาวิทยาลัย</p>
                                <p class="text-2xl font-bold text-white">{{ summary.university }}</p>
                                <p class="text-slate-400 mt-0.5">{{ summary.major ?? '-' }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-base uppercase tracking-widest text-slate-500 mb-1">เกรดเฉลี่ย</p>
                                <p class="text-5xl font-extrabold" style="background: linear-gradient(135deg, #2a9fd6, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
                                    {{ summary.gpa?.toFixed(2) ?? '-' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-2xl p-5 space-y-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-lg font-bold text-white">Skills ที่มี</p>
                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between text-base mb-1.5">
                                        <span class="text-slate-400">Hard Skills</span>
                                        <span style="color: #5bc4f5">{{ summary?.hard_skill_count ?? 0 }} ทักษะ</span>
                                    </div>
                                    <div class="w-full h-2 rounded-full" style="background: rgba(42, 127, 212, 0.1)">
                                        <div
                                            class="h-2 rounded-full transition-all duration-700"
                                            :style="`width:${Math.min(((summary?.hard_skill_count ?? 0) / 30) * 100, 100)}%; background:linear-gradient(90deg,#0d5fa3,#2a9fd6)`"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-base mb-1.5">
                                        <span class="text-slate-400">Soft Skills</span>
                                        <span style="color: #81c784">{{ summary?.soft_skill_count ?? 0 }} ทักษะ</span>
                                    </div>
                                    <div class="w-full h-2 rounded-full" style="background: rgba(76, 175, 80, 0.1)">
                                        <div
                                            class="h-2 rounded-full transition-all duration-700"
                                            :style="`width:${Math.min(((summary?.soft_skill_count ?? 0) / 15) * 100, 100)}%; background:linear-gradient(90deg,#1a8c3e,#4caf50)`"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button class="text-base text-slate-500 hover:text-white transition-colors" @click="activeTab = 'skills'">ดู Skill Profile ทั้งหมด →</button>
                        </div>

                        <div class="rounded-2xl p-5 space-y-3" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-lg font-bold text-white">งานที่ตรงที่สุด</p>
                            <template v-if="recommendations.length">
                                <div
                                    v-for="rec in recommendations.slice(0, 3)"
                                    :key="rec.id"
                                    class="flex items-center justify-between gap-3 p-3 rounded-xl"
                                    style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)"
                                >
                                    <div class="min-w-0">
                                        <p class="text-lg font-semibold text-white truncate">{{ rec.title }}</p>
                                        <p class="text-base text-slate-500 truncate">{{ rec.company_name }}</p>
                                    </div>
                                    <div class="shrink-0 text-right">
                                        <p class="text-lg font-bold" style="color: #5bc4f5">{{ Math.round(rec.skill_match_percent) }}%</p>
                                        <p class="text-base text-slate-600">match</p>
                                    </div>
                                </div>
                                <button class="text-base text-slate-500 hover:text-white transition-colors" @click="activeTab = 'matches'">ดูงานแนะนำทั้งหมด →</button>
                            </template>
                            <p v-else class="text-lg text-slate-500">ยังไม่มีงานแนะนำ</p>
                        </div>
                    </div>
                </template>

                <!-- ── TAB: SKILL PROFILE ── -->
                <template v-else-if="activeTab === 'skills'">
                    <div class="space-y-4">
                        <!-- Context note: อธิบายว่า skills ที่แสดงมาจากไหน -->
                        <div class="px-4 py-3 rounded-xl text-base leading-relaxed" style="background: rgba(42, 127, 212, 0.05); border: 1px solid rgba(42, 127, 212, 0.12); color: #64748b">
                            <template v-if="hardSkillsFromGap.length + softSkillsFromGap.length > 0">
                                Skills ด้านล่างคือ
                                <span class="text-slate-300">skills ที่คุณมี และตรงกับงานแนะนำ</span>
                                — คุณมีทั้งหมด
                                <span class="text-white font-semibold">{{ (summary?.hard_skill_count ?? 0) + (summary?.soft_skill_count ?? 0) }} skills</span>
                                แต่ที่แสดงได้คือ
                                <span class="text-white font-semibold">{{ hardSkillsFromGap.length + softSkillsFromGap.length }}</span>
                                ที่เทียบกับงานในระบบแล้ว
                            </template>
                            <template v-else>
                                คุณมีทั้งหมด
                                <span class="text-white font-semibold">{{ (summary?.hard_skill_count ?? 0) + (summary?.soft_skill_count ?? 0) }} skills</span>
                                แต่ยังไม่สามารถแสดงรายละเอียดได้เพราะยังไม่มีงานแนะนำมาเทียบ
                            </template>
                        </div>

                        <!-- Hard Skills -->
                        <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex items-start justify-between mb-4 gap-3">
                                <div>
                                    <p class="font-bold text-white text-lg">Hard Skills — ทักษะเทคนิค</p>
                                    <p class="text-base text-slate-500 mt-0.5">
                                        ที่ตรงกับงานแนะนำ {{ hardSkillsFromGap.length }}
                                        <span class="text-slate-600 mx-1">·</span>
                                        มีทั้งหมด {{ summary?.hard_skill_count ?? 0 }}
                                    </p>
                                </div>
                                <span class="shrink-0 text-base px-2.5 py-1 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5">
                                    {{ summary?.hard_skill_count ?? 0 }} ทักษะ
                                </span>
                            </div>
                            <div v-if="hardSkillsFromGap.length" class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in hardSkillsFromGap"
                                    :key="s.name"
                                    class="px-3 py-1.5 rounded-full text-base font-semibold"
                                    style="background: rgba(13, 95, 163, 0.15); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5"
                                >
                                    {{ s.name }}
                                </span>
                            </div>
                            <p v-else class="text-base text-slate-500">ยังไม่มี Hard Skills ที่เทียบกับงานแนะนำได้</p>
                        </div>

                        <!-- Soft Skills -->
                        <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex items-start justify-between mb-4 gap-3">
                                <div>
                                    <p class="font-bold text-white text-lg">Soft Skills — ทักษะสังคม</p>
                                    <p class="text-base text-slate-500 mt-0.5">
                                        ที่ตรงกับงานแนะนำ {{ softSkillsFromGap.length }}
                                        <span class="text-slate-600 mx-1">·</span>
                                        มีทั้งหมด {{ summary?.soft_skill_count ?? 0 }}
                                    </p>
                                </div>
                                <span class="shrink-0 text-base px-2.5 py-1 rounded-full" style="background: rgba(76, 175, 80, 0.15); color: #81c784">
                                    {{ summary?.soft_skill_count ?? 0 }} ทักษะ
                                </span>
                            </div>
                            <div v-if="softSkillsFromGap.length" class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in softSkillsFromGap"
                                    :key="s.name"
                                    class="px-3 py-1.5 rounded-full text-base font-semibold"
                                    style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                                >
                                    {{ s.name }}
                                </span>
                            </div>
                            <p v-else class="text-base text-slate-500">ยังไม่มี Soft Skills ที่เทียบกับงานแนะนำได้</p>
                        </div>

                        <!-- Upgrade hint -->
                        <div v-if="!summary?.university" class="flex items-center gap-4 p-5 rounded-2xl" style="background: rgba(124, 58, 237, 0.06); border: 1px solid rgba(124, 58, 237, 0.2)">
                            <div class="flex-1">
                                <p class="text-lg font-bold text-white">เพิ่มความแม่นยำด้วย Transcript</p>
                                <p class="text-base text-slate-400 mt-0.5">อัปโหลดผลการเรียนเพื่อให้ระบบดึง skills จากวิชาที่เรียนโดยตรง</p>
                            </div>
                            <NuxtLink
                                to="/transcript"
                                class="shrink-0 px-4 py-2 rounded-xl text-base font-semibold text-white"
                                style="background: rgba(124, 58, 237, 0.3); border: 1px solid rgba(124, 58, 237, 0.4)"
                            >
                                อัปโหลด
                            </NuxtLink>
                        </div>
                    </div>
                </template>

                <!-- ── TAB: JOB MATCHES ── -->
                <template v-else-if="activeTab === 'matches'">
                    <div v-if="recommendations.length" class="space-y-3">
                        <p class="text-base text-slate-500">งานที่ตรงกับทักษะของคุณ {{ recommendations.length }} ตำแหน่ง</p>
                        <div
                            v-for="(rec, i) in recommendations"
                            :key="rec.id"
                            class="rounded-2xl p-5 transition-all"
                            style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.3)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.15)')"
                        >
                            <div class="flex items-start gap-4">
                                <div
                                    class="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                                    style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.3); color: #5bc4f5"
                                >
                                    {{ i + 1 }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-bold text-white text-xl">{{ rec.title }}</p>
                                    <p class="text-lg text-slate-400 mt-0.5">
                                        {{ rec.company_name }}
                                        <span v-if="rec.location" class="mx-1.5 text-slate-600">·</span>
                                        <span v-if="rec.location" class="text-slate-500">{{ rec.location }}</span>
                                        <span v-if="rec.sub_category" class="mx-1.5 text-slate-600">·</span>
                                        <span v-if="rec.sub_category" style="color: #4caf50">{{ rec.sub_category }}</span>
                                    </p>
                                    <div class="mt-3 flex items-center gap-3">
                                        <div class="flex-1 h-1.5 rounded-full" style="background: rgba(42, 127, 212, 0.1)">
                                            <div
                                                class="h-1.5 rounded-full transition-all duration-700"
                                                :style="`width:${Math.min(rec.skill_match_percent, 100)}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`"
                                            />
                                        </div>
                                        <span class="text-base font-bold shrink-0" style="color: #5bc4f5"> {{ Math.round(rec.skill_match_percent) }}% </span>
                                    </div>
                                    <p class="text-base text-slate-500 mt-2">
                                        มีทักษะตรง <span class="font-semibold text-white">{{ rec.matched_count }}</span> จาก
                                        <span class="font-semibold text-white">{{ rec.total_skill_count }}</span> ทักษะหลัก
                                        <span
                                            class="ml-1.5 px-2 py-0.5 rounded-full text-base"
                                            :style="
                                                rec.skill_match_percent >= 60
                                                    ? 'background:rgba(76,175,80,0.1);color:#4caf50'
                                                    : rec.skill_match_percent >= 30
                                                      ? 'background:rgba(251,191,36,0.1);color:#fbbf24'
                                                      : 'background:rgba(148,163,184,0.1);color:#94a3b8'
                                            "
                                        >
                                            {{ rec.skill_match_percent >= 60 ? 'ตรงมาก' : rec.skill_match_percent >= 30 ? 'ตรงดี' : 'กำลังพัฒนา' }}
                                        </span>
                                    </p>
                                </div>
                                <div class="shrink-0 relative w-14 h-14">
                                    <svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0d1f35" stroke-width="3.5" />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.9"
                                            fill="none"
                                            stroke="url(#grad)"
                                            stroke-width="3.5"
                                            stroke-dasharray="100"
                                            :stroke-dashoffset="100 - Math.min(rec.skill_match_percent, 100)"
                                            stroke-linecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stop-color="#0d5fa3" />
                                                <stop offset="100%" stop-color="#4caf50" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <span class="absolute inset-0 flex items-center justify-center text-base font-bold" style="color: #5bc4f5"> {{ Math.round(rec.skill_match_percent) }}% </span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 mt-3">
                                <button class="text-base px-3 py-1.5 rounded-lg transition-all" style="border: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5" @click="activeTab = 'gap'">
                                    ดู Skill Gap →
                                </button>
                                <!-- toggle radar — แสดงทุก rec ที่มีข้อมูลพอ -->
                                <button
                                    v-if="buildRadarData(rec, skillGap)"
                                    class="text-base px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                                    :style="
                                        expandedRadar[rec.id]
                                            ? 'background:rgba(13,95,163,0.2); border:1px solid rgba(42,159,214,0.35); color:#5bc4f5'
                                            : 'border:1px solid rgba(42,127,212,0.15); color:#64748b'
                                    "
                                    @click="toggleRadar(rec.id)"
                                >
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                                        <line x1="12" y1="2" x2="12" y2="22" />
                                        <line x1="2" y1="8.5" x2="22" y2="8.5" />
                                        <line x1="2" y1="15.5" x2="22" y2="15.5" />
                                    </svg>
                                    {{ expandedRadar[rec.id] ? 'ซ่อน Radar' : 'Radar' }}
                                </button>
                            </div>

                            <!-- Radar chart — hard/soft split -->
                            <Transition name="slide-down">
                                <div
                                    v-if="expandedRadar[rec.id] && (buildRadarDataSplit(rec, skillGap) || buildRadarData(rec, skillGap))"
                                    class="mt-3 rounded-xl p-3"
                                    style="background: rgba(8, 18, 36, 0.5); border: 1px solid rgba(42, 127, 212, 0.15)"
                                >
                                    <ClientOnly>
                                        <!-- มี split data: แสดง hard + soft แยกกัน -->
                                        <template v-if="buildRadarDataSplit(rec, skillGap)">
                                            <div class="grid grid-cols-2 gap-3">
                                                <!-- Hard Skills -->
                                                <div v-if="buildRadarDataSplit(rec, skillGap)!.hardLabels.length >= 3">
                                                    <p class="text-base font-semibold mb-1 text-center" style="color: #5bc4f5">Hard Skills</p>
                                                    <RadarChart
                                                        :compact="true"
                                                        :label-font-size="10"
                                                        :show-legend="false"
                                                        :labels="buildRadarDataSplit(rec, skillGap)!.hardLabels"
                                                        :datasets="[
                                                            {
                                                                label: 'คุณ',
                                                                data: buildRadarDataSplit(rec, skillGap)!.hardYou,
                                                                borderColor: '#2a9fd6',
                                                                backgroundColor: 'rgba(42,159,214,0.2)',
                                                                pointBackgroundColor: '#2a9fd6',
                                                            },
                                                            {
                                                                label: 'งานต้องการ',
                                                                data: buildRadarDataSplit(rec, skillGap)!.hardJob,
                                                                borderColor: '#4caf50',
                                                                backgroundColor: 'rgba(76,175,80,0.08)',
                                                                pointBackgroundColor: '#4caf50',
                                                            },
                                                        ]"
                                                    />
                                                </div>
                                                <!-- Soft Skills -->
                                                <div v-if="buildRadarDataSplit(rec, skillGap)!.softLabels.length >= 3">
                                                    <p class="text-base font-semibold mb-1 text-center" style="color: #81c784">Soft Skills</p>
                                                    <RadarChart
                                                        :compact="true"
                                                        :label-font-size="10"
                                                        :show-legend="false"
                                                        :labels="buildRadarDataSplit(rec, skillGap)!.softLabels"
                                                        :datasets="[
                                                            {
                                                                label: 'คุณ',
                                                                data: buildRadarDataSplit(rec, skillGap)!.softYou,
                                                                borderColor: '#2a9fd6',
                                                                backgroundColor: 'rgba(42,159,214,0.2)',
                                                                pointBackgroundColor: '#2a9fd6',
                                                            },
                                                            {
                                                                label: 'งานต้องการ',
                                                                data: buildRadarDataSplit(rec, skillGap)!.softJob,
                                                                borderColor: '#81c784',
                                                                backgroundColor: 'rgba(129,199,132,0.08)',
                                                                pointBackgroundColor: '#81c784',
                                                            },
                                                        ]"
                                                    />
                                                </div>
                                            </div>
                                            <!-- legend รวม -->
                                            <div class="flex items-center justify-center gap-4 mt-2 text-base" style="color: #64748b">
                                                <span> <span class="inline-block w-2.5 h-2.5 rounded-sm mr-1" style="background: #2a9fd6" />คุณ </span>
                                                <span> <span class="inline-block w-2.5 h-2.5 rounded-sm mr-1" style="background: #4caf50" />งานต้องการ (Hard) </span>
                                                <span> <span class="inline-block w-2.5 h-2.5 rounded-sm mr-1" style="background: #81c784" />งานต้องการ (Soft) </span>
                                            </div>
                                        </template>

                                        <!-- fallback: ไม่มี gap data แสดง simple chart -->
                                        <template v-else>
                                            <p class="text-base font-semibold text-white mb-2">Skill Radar</p>
                                            <div class="max-w-xs mx-auto">
                                                <RadarChart
                                                    :compact="true"
                                                    :label-font-size="11"
                                                    :labels="buildRadarData(rec, skillGap)!.labels"
                                                    :datasets="[
                                                        {
                                                            label: 'คุณ',
                                                            data: buildRadarData(rec, skillGap)!.youData,
                                                            borderColor: '#2a9fd6',
                                                            backgroundColor: 'rgba(42,159,214,0.18)',
                                                            pointBackgroundColor: '#2a9fd6',
                                                        },
                                                        {
                                                            label: 'งานต้องการ',
                                                            data: buildRadarData(rec, skillGap)!.jobData,
                                                            borderColor: '#4caf50',
                                                            backgroundColor: 'rgba(76,175,80,0.08)',
                                                            pointBackgroundColor: '#4caf50',
                                                        },
                                                    ]"
                                                />
                                            </div>
                                            <p class="text-base text-center mt-1" style="color: #64748b">แสดงสัดส่วน {{ rec.matched_count }}/{{ rec.total_skill_count }} skills</p>
                                        </template>
                                    </ClientOnly>
                                </div>
                            </Transition>
                        </div>
                    </div>
                    <div v-else class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                        <p class="text-slate-400">ยังไม่มีงานแนะนำ</p>
                    </div>
                </template>

                <!-- ── TAB: SKILL GAP ── -->
                <template v-else-if="activeTab === 'gap'">
                    <div v-if="skillGap.length" class="space-y-4">
                        <div v-for="gap in skillGap" :key="gap.job_title" class="rounded-2xl p-6 space-y-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                    <p class="font-bold text-white text-xl">{{ gap.job_title }}</p>
                                    <p class="text-lg text-slate-400">
                                        {{ gap.company_name }}
                                        <span v-if="gap.sub_category">
                                            · <span style="color: #4caf50">{{ gap.sub_category }}</span></span
                                        >
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-base text-slate-500">ทักษะที่มีตรง</p>
                                    <p class="text-3xl font-extrabold" style="color: #5bc4f5">{{ gap.matched_count }}/{{ gap.total_job_skills }}</p>
                                    <p
                                        class="text-base mt-1"
                                        :style="gap.matched_count >= gap.total_job_skills * 0.6 ? 'color:#4caf50' : gap.matched_count >= gap.total_job_skills * 0.3 ? 'color:#fbbf24' : 'color:#94a3b8'"
                                    >
                                        {{ gap.matched_count >= gap.total_job_skills * 0.6 ? 'ตรงมาก' : gap.matched_count >= gap.total_job_skills * 0.3 ? 'เริ่มต้นดี' : 'ยังต้องเรียนเพิ่ม' }}
                                    </p>
                                </div>
                            </div>

                            <div class="w-full h-2 rounded-full" style="background: rgba(13, 95, 163, 0.15)">
                                <div
                                    class="h-2 rounded-full transition-all duration-700"
                                    :style="`width:${Math.min(gap.skill_match_percent, 100)}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`"
                                />
                            </div>

                            <div class="flex flex-wrap gap-3">
                                <div class="rounded-xl px-4 py-2 text-base" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2)">
                                    <span class="text-red-400 font-semibold">ขาด</span>
                                    <span class="text-white font-bold mx-1">{{ gap.missing_group_count }}</span>
                                    <span class="text-slate-400">กลุ่มทักษะ</span>
                                </div>
                                <div class="rounded-xl px-4 py-2 text-base" style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)">
                                    <span style="color: #5bc4f5">ควรเรียนก่อน</span>
                                    <span class="text-white font-bold mx-1">{{ gap.missing_skills.filter((s) => s.importance === 'required').length }}</span>
                                    <span class="text-slate-400">ทักษะสำคัญ</span>
                                </div>
                            </div>

                            <!-- View tabs -->
                            <div class="flex gap-2 flex-wrap">
                                <button
                                    v-for="m in [
                                        { key: 'top10', label: 'สำคัญที่สุด' },
                                        { key: 'grouped', label: 'แบ่งกลุ่ม' },
                                        { key: 'roadmap', label: 'แผนการเรียน' },
                                    ]"
                                    :key="m.key"
                                    class="px-3 py-1.5 rounded-lg text-base font-semibold border transition-all"
                                    :style="
                                        getView(gap.job_title) === m.key
                                            ? 'background:rgba(13,95,163,0.2); border-color:rgba(42,159,214,0.4); color:#5bc4f5'
                                            : 'border-color:rgba(255,255,255,0.1); color:#94a3b8'
                                    "
                                    @click="setView(gap.job_title, m.key as any)"
                                >
                                    {{ m.label }}
                                </button>
                            </div>

                            <!-- Top 10 -->
                            <div v-if="getView(gap.job_title) === 'top10'">
                                <p class="text-base font-semibold uppercase tracking-widest mb-3 text-slate-400">
                                    ทักษะที่ควรเรียนเพิ่ม
                                    <span class="font-normal normal-case ml-1 text-slate-600">({{ gap.total_missing }} ทักษะทั้งหมด)</span>
                                </p>
                                <div v-for="tier in ['required', 'recommended', 'optional']" :key="tier" class="mb-3">
                                    <template v-if="gap.missing_skills.filter((s) => s.importance === tier).length">
                                        <p class="text-base font-semibold mb-2" :style="tier === 'required' ? 'color:#f87171' : tier === 'recommended' ? 'color:#fbbf24' : 'color:#94a3b8'">
                                            {{ tier === 'required' ? 'จำเป็นต้องมี' : tier === 'recommended' ? 'ควรมี' : 'มีก็ดี' }}
                                        </p>
                                        <div class="flex flex-wrap gap-2">
                                            <span
                                                v-for="s in gap.missing_skills.filter((s) => s.importance === tier)"
                                                :key="s.skill_name"
                                                class="px-3 py-1.5 rounded-full text-base font-semibold"
                                                :style="importanceStyle[tier]"
                                            >
                                                {{ s.skill_name }}
                                            </span>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- Grouped -->
                            <div v-else-if="getView(gap.job_title) === 'grouped'" class="space-y-3">
                                <p class="text-base font-semibold uppercase tracking-widest text-slate-400">
                                    ทักษะที่ขาดแบ่งตามหมวด
                                    <span class="font-normal normal-case ml-1 text-slate-600">{{ gap.missing_group_count }} หมวด · {{ gap.total_missing }} ทักษะ</span>
                                </p>
                                <div
                                    v-for="group in gap.missing_by_group"
                                    :key="group.group_name"
                                    class="rounded-xl p-4"
                                    style="background: rgba(13, 95, 163, 0.05); border: 1px solid rgba(42, 127, 212, 0.12)"
                                >
                                    <div class="flex items-center justify-between mb-3">
                                        <p class="text-lg font-semibold text-white">{{ group.group_name }}</p>
                                        <span class="text-base px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5"> {{ group.count }} ทักษะ </span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="s in group.skills" :key="s.skill_name" class="px-2.5 py-1 rounded-full text-base font-medium" :style="importanceStyle[s.importance]">
                                            {{ s.skill_name }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Roadmap -->
                            <div v-else class="space-y-3">
                                <p class="text-base font-semibold uppercase tracking-widest mb-4 text-slate-400">
                                    แผนการเรียนรู้
                                    <span class="font-normal normal-case ml-1 text-slate-600">{{ gap.career_path.length }} ขั้นตอน</span>
                                </p>
                                <div v-if="!gap.career_path.length" class="text-slate-500 text-lg py-4 text-center">ไม่มีข้อมูล</div>
                                <div class="relative">
                                    <div class="absolute left-5 top-0 bottom-0 w-0.5" style="background: linear-gradient(180deg, rgba(13, 95, 163, 0.4), rgba(76, 175, 80, 0.2))" />
                                    <div v-for="step in gap.career_path" :key="step.step" class="relative flex gap-4 pb-6 last:pb-0">
                                        <div
                                            class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg z-10 border-2"
                                            :style="`background:rgba(8,18,36,0.9); ${stepColor[step.priority]}`"
                                        >
                                            {{ step.step }}
                                        </div>
                                        <div class="flex-1 rounded-xl p-4 min-w-0" :style="`border:1px solid rgba(42,127,212,0.15); ${stepBg[step.priority]}`">
                                            <div class="flex items-start justify-between gap-2 flex-wrap mb-2">
                                                <div>
                                                    <p class="text-lg font-bold text-white">{{ step.title }}</p>
                                                    <p class="text-base text-slate-500 mt-0.5">{{ step.group }}</p>
                                                </div>
                                                <span class="text-base px-2 py-0.5 rounded-full shrink-0" :style="importanceStyle[step.priority]">
                                                    {{ step.priority === 'required' ? 'จำเป็น' : step.priority === 'recommended' ? 'แนะนำ' : 'เสริม' }}
                                                </span>
                                            </div>
                                            <div class="flex flex-wrap gap-1.5">
                                                <span
                                                    v-for="skill in step.skills"
                                                    :key="skill"
                                                    class="px-2 py-1 rounded-lg text-base"
                                                    style="background: rgba(42, 127, 212, 0.1); border: 1px solid rgba(42, 127, 212, 0.2); color: #7dd3fc"
                                                >
                                                    {{ skill }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 mt-2 p-4 rounded-xl" style="background: rgba(76, 175, 80, 0.08); border: 1px solid rgba(76, 175, 80, 0.2)">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background: rgba(76, 175, 80, 0.15); border: 2px solid rgba(76, 175, 80, 0.4)">
                                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#81c784" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-lg font-bold" style="color: #81c784">เป้าหมาย</p>
                                        <p class="text-base text-slate-400">{{ gap.job_title }} ที่ {{ gap.company_name }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Matched skills -->
                            <div v-if="gap.matched_skills.length">
                                <p class="text-base font-semibold uppercase tracking-widest mb-2" style="color: #4caf50">ทักษะที่มีอยู่แล้ว ({{ gap.matched_skills.length }})</p>
                                <div class="flex flex-wrap gap-2">
                                    <span
                                        v-for="s in gap.matched_skills"
                                        :key="s.skill_name"
                                        class="px-3 py-1.5 rounded-full text-base font-semibold"
                                        style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                                    >
                                        {{ s.skill_name }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        <p class="text-slate-400">ยังไม่มีข้อมูล Skill Gap</p>
                    </div>
                </template>
            </template>
        </template>
    </div>

    <!-- Reset Assessment Modal -->
    <Transition name="fade">
        <div
            v-if="showResetModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
            style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px)"
            @click.self="showResetModal = false"
        >
            <div class="w-full max-w-sm rounded-2xl p-6 space-y-4" style="background: #0c1524; border: 1px solid rgba(239, 68, 68, 0.3)">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3)">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2">
                            <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-lg font-bold text-white">ล้างผล Assessment</p>
                        <p class="text-base text-slate-400 mt-0.5">คะแนนทั้งหมดจะถูกลบ ไม่สามารถกู้คืนได้</p>
                    </div>
                </div>
                <div class="rounded-xl px-4 py-3 text-base" style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171">
                    หากมี Transcript อยู่ ระบบจะยังคง Skill Profile จาก Transcript ไว้
                </div>
                <div class="flex gap-3 pt-1">
                    <button class="flex-1 py-2.5 rounded-xl text-base font-semibold transition-all" style="border: 1px solid rgba(255, 255, 255, 0.1); color: #64748b" @click="showResetModal = false">
                        ยกเลิก
                    </button>
                    <button
                        class="flex-1 py-2.5 rounded-xl text-base font-bold text-white transition-all"
                        style="background: rgba(239, 68, 68, 0.8); border: 1px solid rgba(239, 68, 68, 0.5)"
                        :disabled="resettingAssessment"
                        @click="handleReset"
                    >
                        {{ resettingAssessment ? 'กำลังล้าง...' : 'ยืนยัน ล้างผล' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
    opacity: 1;
    max-height: 500px;
}
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.25s,
        transform 0.25s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
