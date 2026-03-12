<!-- pages/dashboard.vue -->
<script setup lang="ts">
import type { DashboardSummary, SkillGapResponse, RecommendationItem } from '~/types/Dashboard';

useHead({ title: 'Dashboard — ICT Skill' });
const route = useRoute();
const { getSummary, getSkillGap, getRecommendations } = useDashboard();
const { resetAssessment } = useAssessment();

const summary = ref<DashboardSummary | null>(null);
const skillGap = ref<SkillGapResponse[]>([]);
const recommendations = ref<RecommendationItem[]>([]);
const loading = ref(true);
const resettingAssessment = ref(false);

// ── Tabs ──────────────────────────────────────────────────────────
type Tab = 'overview' | 'skills' | 'matches' | 'gap';
const activeTab = ref<Tab>('overview');
const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'ภาพรวม', icon: '📊' },
    { key: 'skills', label: 'Skill Profile', icon: '💡' },
    { key: 'matches', label: 'งานแนะนำ', icon: '💼' },
    { key: 'gap', label: 'Skill Gap', icon: '🎯' },
];

// ── Skill Gap view mode ───────────────────────────────────────────
const viewMode = ref<Record<string, 'top10' | 'grouped' | 'roadmap'>>({});
const getView = (title: string) => viewMode.value[title] ?? 'top10';
const setView = (title: string, m: 'top10' | 'grouped' | 'roadmap') => {
    viewMode.value[title] = m;
};

const groupIcons: Record<string, string> = {
    'Cloud & Infrastructure': '☁️',
    Programming: '💻',
    'Data & Analytics': '📊',
    Security: '🔒',
    'Management & Soft Skills': '🤝',
    'Design & UX': '🎨',
    Other: '🔧',
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

// ── Load ──────────────────────────────────────────────────────────
const loadDashboard = async () => {
    loading.value = true;
    summary.value = await getSummary();
    if (summary.value?.has_transcript) {
        [skillGap.value, recommendations.value] = await Promise.all([getSkillGap(), getRecommendations()]);
    }
    loading.value = false;
};

const handleResetAssessment = async () => {
    if (!confirm('ต้องการล้างผล Assessment ทั้งหมดและทำใหม่ใช่ไหม?')) return;
    resettingAssessment.value = true;
    try {
        await resetAssessment();
        await navigateTo('/assessment');
    } finally {
        resettingAssessment.value = false;
    }
};

onMounted(async () => {
    await nextTick();
    await loadDashboard();
});
watch(
    () => route.path,
    async (p) => {
        if (p === '/dashboard') await loadDashboard();
    },
);

// ── Computed ──────────────────────────────────────────────────────
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
</script>

<template>
    <div class="space-y-6">
        <!-- ── Header ── -->
        <div class="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <h1 class="text-3xl font-bold text-white">Dashboard</h1>
                <p class="text-sm text-slate-500 mt-0.5">ติดตามความก้าวหน้าและโอกาสในสายงาน ICT</p>
            </div>
            <div class="flex gap-2 flex-wrap">
                <button
                    v-if="!loading && summary?.has_transcript && !summary?.university"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style="border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171"
                    :disabled="resettingAssessment"
                    @click="handleResetAssessment"
                >
                    {{ resettingAssessment ? '⏳' : '🔄' }} ทำ Assessment ใหม่
                </button>
                <NuxtLink to="/transcript" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)">
                    📄 อัปเดต Transcript
                </NuxtLink>
            </div>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-2/3" style="background: rgba(42, 127, 212, 0.1)" />
            </div>
        </div>

        <template v-else>
            <!-- ── No Skills ── -->
            <div v-if="!summary?.has_transcript" class="space-y-4">
                <div class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="text-5xl mb-4">🎯</div>
                    <p class="text-xl font-bold text-white mb-2">ยังไม่มีข้อมูล Skills</p>
                    <p class="text-slate-400 mb-6 text-sm leading-relaxed">
                        เริ่มต้นด้วยการอัปโหลด Transcript หรือทำ Skill Assessment<br />
                        ระบบจะวิเคราะห์และแนะนำงานที่เหมาะสมกับคุณ
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <NuxtLink
                            to="/assessment"
                            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                            style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                        >
                            🎯 เริ่ม Assessment
                        </NuxtLink>
                        <NuxtLink
                            to="/transcript"
                            class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300"
                            style="border: 1px solid rgba(42, 127, 212, 0.3)"
                        >
                            📄 อัปโหลด Transcript
                        </NuxtLink>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="rounded-xl p-4" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12)">
                        <p class="text-sm font-bold text-white mb-1">🎯 Assessment</p>
                        <p class="text-xs text-slate-400 leading-relaxed">ให้คะแนนทักษะตัวเองทีละ skill ระบบจะบันทึกและแนะนำงานให้ทันที</p>
                    </div>
                    <div class="rounded-xl p-4" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12)">
                        <p class="text-sm font-bold text-white mb-1">📄 Transcript</p>
                        <p class="text-xs text-slate-400 leading-relaxed">อัปโหลด Transcript ระบบจะ extract skills จากวิชาที่เรียนโดยอัตโนมัติ</p>
                    </div>
                </div>
            </div>

            <template v-else>
                <!-- ── Stat Cards ── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        v-for="card in [
                            { icon: '🎓', label: 'GPA', value: summary?.gpa?.toFixed(2) ?? '-', sub: summary?.university ?? 'ไม่มีข้อมูล' },
                            { icon: '💡', label: 'Hard Skills', value: String(summary?.hard_skill_count ?? 0), sub: 'ทักษะเทคนิค' },
                            { icon: '🤝', label: 'Soft Skills', value: String(summary?.soft_skill_count ?? 0), sub: 'ทักษะสังคม' },
                            { icon: '💼', label: 'Match เฉลี่ย', value: `${avgMatch}%`, sub: `${recommendations.length} งานแนะนำ` },
                        ]"
                        :key="card.label"
                        class="rounded-2xl p-5 hover:-translate-y-0.5 transition-all cursor-default"
                        style="background: rgba(8, 18, 36, 0.7); border: 1px solid rgba(42, 127, 212, 0.15)"
                    >
                        <div class="text-2xl mb-2">{{ card.icon }}</div>
                        <p class="text-2xl font-extrabold text-white">{{ card.value }}</p>
                        <p class="text-xs uppercase tracking-widest text-slate-500 mt-0.5">{{ card.label }}</p>
                        <p class="text-xs text-slate-600 mt-1 truncate">{{ card.sub }}</p>
                    </div>
                </div>

                <!-- ── Assessment banner ── -->
                <div
                    v-if="!summary?.university"
                    class="flex items-center justify-between gap-4 px-5 py-4 rounded-xl flex-wrap"
                    style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.15)"
                >
                    <div class="flex items-center gap-3">
                        <span class="text-xl">🎯</span>
                        <div>
                            <p class="text-sm font-semibold text-white">ข้อมูลจาก Assessment</p>
                            <p class="text-xs text-slate-400">อัปโหลด Transcript เพื่อความแม่นยำสูงกว่า</p>
                        </div>
                    </div>
                    <NuxtLink to="/transcript" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)">
                        📄 อัปโหลด Transcript
                    </NuxtLink>
                </div>

                <!-- ── Tabs ── -->
                <div class="flex gap-1 p-1 rounded-2xl" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <button
                        v-for="tab in tabs"
                        :key="tab.key"
                        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        :style="activeTab === tab.key ? 'background:rgba(13,95,163,0.3); color:#5bc4f5; border:1px solid rgba(42,159,214,0.3)' : 'color:#64748b; border:1px solid transparent'"
                        @click="activeTab = tab.key"
                    >
                        <span>{{ tab.icon }}</span>
                        <span class="hidden sm:inline">{{ tab.label }}</span>
                    </button>
                </div>

                <!-- ═══════════════ TAB: OVERVIEW ═══════════════ -->
                <template v-if="activeTab === 'overview'">
                    <!-- Profile card -->
                    <div v-if="summary?.university" class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div class="h-0.5 w-12 rounded-full mb-4" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                        <div class="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">มหาวิทยาลัย</p>
                                <p class="text-xl font-bold text-white">{{ summary.university }}</p>
                                <p class="text-slate-400 mt-0.5">{{ summary.major ?? '-' }}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">เกรดเฉลี่ย</p>
                                <p class="text-5xl font-extrabold" style="background: linear-gradient(135deg, #2a9fd6, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
                                    {{ summary.gpa?.toFixed(2) ?? '-' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Progress + Top match -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="rounded-2xl p-5 space-y-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-sm font-bold text-white">💡 Skill Breakdown</p>
                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between text-xs mb-1.5">
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
                                    <div class="flex justify-between text-xs mb-1.5">
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
                            <button class="text-xs text-slate-500 hover:text-white transition-colors" @click="activeTab = 'skills'">ดู Skill Profile ทั้งหมด →</button>
                        </div>

                        <div class="rounded-2xl p-5 space-y-3" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-sm font-bold text-white">💼 งานที่ตรงที่สุด</p>
                            <template v-if="recommendations.length">
                                <div
                                    v-for="rec in recommendations.slice(0, 3)"
                                    :key="rec.id"
                                    class="flex items-center justify-between gap-3 p-3 rounded-xl"
                                    style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)"
                                >
                                    <div class="min-w-0">
                                        <p class="text-sm font-semibold text-white truncate">{{ rec.title }}</p>
                                        <p class="text-xs text-slate-500 truncate">{{ rec.company_name }}</p>
                                    </div>
                                    <div class="shrink-0 text-right">
                                        <p class="text-sm font-bold" style="color: #5bc4f5">{{ Math.round(rec.skill_match_percent) }}%</p>
                                        <p class="text-xs text-slate-600">match</p>
                                    </div>
                                </div>
                                <button class="text-xs text-slate-500 hover:text-white transition-colors" @click="activeTab = 'matches'">ดูงานแนะนำทั้งหมด →</button>
                            </template>
                            <p v-else class="text-sm text-slate-500">ยังไม่มีงานแนะนำ</p>
                        </div>
                    </div>

                    <!-- Quick actions -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <NuxtLink
                            v-for="action in [
                                { icon: '📄', label: 'อัปโหลด Transcript', to: '/transcript', color: '#0d5fa3' },
                                { icon: '🔍', label: 'ค้นหางาน', to: '/searchJob', color: '#1a8c3e' },
                                { icon: '🎯', label: 'ทำ Assessment', to: '/assessment', color: '#7c3aed' },
                                { icon: '📊', label: 'ดู Skill Trends', to: '/', color: '#b45309' },
                            ]"
                            :key="action.to"
                            :to="action.to"
                            class="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all hover:-translate-y-0.5"
                            :style="`background:rgba(8,18,36,0.6); border:1px solid ${action.color}33`"
                        >
                            <span class="text-2xl">{{ action.icon }}</span>
                            <span class="text-xs font-semibold text-slate-300">{{ action.label }}</span>
                        </NuxtLink>
                    </div>
                </template>

                <!-- ═══════════════ TAB: SKILL PROFILE ═══════════════ -->
                <template v-else-if="activeTab === 'skills'">
                    <div class="space-y-4">
                        <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex items-center justify-between mb-4">
                                <p class="font-bold text-white">💻 Hard Skills</p>
                                <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5"> {{ summary?.hard_skill_count ?? 0 }} ทักษะ </span>
                            </div>
                            <div v-if="hardSkillsFromGap.length" class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in hardSkillsFromGap"
                                    :key="s.name"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                    style="background: rgba(13, 95, 163, 0.15); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5"
                                >
                                    ✓ {{ s.name }}
                                </span>
                            </div>
                            <p v-else class="text-sm text-slate-500">ยังไม่มีข้อมูล Hard Skills</p>
                        </div>

                        <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex items-center justify-between mb-4">
                                <p class="font-bold text-white">🤝 Soft Skills</p>
                                <span class="text-xs px-2 py-1 rounded-full" style="background: rgba(76, 175, 80, 0.15); color: #81c784"> {{ summary?.soft_skill_count ?? 0 }} ทักษะ </span>
                            </div>
                            <div v-if="softSkillsFromGap.length" class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in softSkillsFromGap"
                                    :key="s.name"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                    style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                                >
                                    ✓ {{ s.name }}
                                </span>
                            </div>
                            <p v-else class="text-sm text-slate-500">ยังไม่มีข้อมูล Soft Skills</p>
                        </div>

                        <!-- Upgrade hint -->
                        <div v-if="!summary?.university" class="flex items-center gap-4 p-5 rounded-2xl" style="background: rgba(124, 58, 237, 0.06); border: 1px solid rgba(124, 58, 237, 0.2)">
                            <span class="text-3xl">💎</span>
                            <div class="flex-1">
                                <p class="text-sm font-bold text-white">อัปเกรดด้วย Transcript</p>
                                <p class="text-xs text-slate-400 mt-0.5">Transcript จะเพิ่ม Confidence Score ให้แต่ละ skill และ extract skills จากวิชาที่เรียนโดยตรง</p>
                            </div>
                            <NuxtLink
                                to="/transcript"
                                class="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                style="background: rgba(124, 58, 237, 0.3); border: 1px solid rgba(124, 58, 237, 0.4)"
                            >
                                อัปโหลด
                            </NuxtLink>
                        </div>
                    </div>
                </template>

                <!-- ═══════════════ TAB: JOB MATCHES ═══════════════ -->
                <template v-else-if="activeTab === 'matches'">
                    <div v-if="recommendations.length" class="space-y-3">
                        <p class="text-xs text-slate-500">Top {{ recommendations.length }} ตำแหน่งที่ตรงกับทักษะของคุณ</p>
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
                                    class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                                    style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.3); color: #5bc4f5"
                                >
                                    {{ i + 1 }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-bold text-white text-base">{{ rec.title }}</p>
                                    <p class="text-sm text-slate-400 mt-0.5">
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
                                        <span class="text-xs font-bold shrink-0" style="color: #5bc4f5">{{ Math.round(rec.skill_match_percent) }}%</span>
                                    </div>
                                    <p class="text-xs text-slate-500 mt-2">
                                        มีทักษะตรง <span class="font-semibold text-white">{{ rec.matched_count }}</span> จาก
                                        <span class="font-semibold text-white">{{ rec.total_skill_count }}</span> ทักษะหลัก
                                        <span
                                            class="ml-1.5 px-2 py-0.5 rounded-full text-xs"
                                            :style="
                                                rec.skill_match_percent >= 60
                                                    ? 'background:rgba(76,175,80,0.1);color:#4caf50'
                                                    : rec.skill_match_percent >= 30
                                                      ? 'background:rgba(251,191,36,0.1);color:#fbbf24'
                                                      : 'background:rgba(148,163,184,0.1);color:#94a3b8'
                                            "
                                        >
                                            {{ rec.skill_match_percent >= 60 ? '🔥 Strong' : rec.skill_match_percent >= 30 ? '⚡ Good' : '📚 Growing' }}
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
                                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color: #5bc4f5"> {{ Math.round(rec.skill_match_percent) }}% </span>
                                </div>
                            </div>
                            <button class="mt-3 text-xs px-3 py-1.5 rounded-lg transition-all" style="border: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5" @click="activeTab = 'gap'">
                                ดู Skill Gap สำหรับงานนี้ →
                            </button>
                        </div>
                    </div>
                    <div v-else class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-3xl mb-3">💼</p>
                        <p class="text-slate-400">ยังไม่มีงานแนะนำ</p>
                    </div>
                </template>

                <!-- ═══════════════ TAB: SKILL GAP ═══════════════ -->
                <template v-else-if="activeTab === 'gap'">
                    <div v-if="skillGap.length" class="space-y-4">
                        <div v-for="gap in skillGap" :key="gap.job_title" class="rounded-2xl p-6 space-y-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <div class="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                    <p class="font-bold text-white text-base">{{ gap.job_title }}</p>
                                    <p class="text-sm text-slate-400">
                                        {{ gap.company_name
                                        }}<span v-if="gap.sub_category">
                                            · <span style="color: #4caf50">{{ gap.sub_category }}</span></span
                                        >
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-xs text-slate-500">Key skills matched</p>
                                    <p class="text-xl font-extrabold" style="color: #5bc4f5">{{ gap.matched_count }}/{{ gap.total_job_skills }}</p>
                                    <p
                                        class="text-xs mt-1"
                                        :style="gap.matched_count >= gap.total_job_skills * 0.6 ? 'color:#4caf50' : gap.matched_count >= gap.total_job_skills * 0.3 ? 'color:#fbbf24' : 'color:#94a3b8'"
                                    >
                                        {{
                                            gap.matched_count >= gap.total_job_skills * 0.6 ? '🔥 Strong match' : gap.matched_count >= gap.total_job_skills * 0.3 ? '⚡ Good start' : '📚 Keep learning'
                                        }}
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
                                <div class="rounded-xl px-4 py-2 text-sm" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2)">
                                    <span class="text-red-400 font-semibold">⚠️ Missing</span>
                                    <span class="text-white font-bold mx-1">{{ gap.missing_group_count }}</span>
                                    <span class="text-slate-400">areas</span>
                                </div>
                                <div class="rounded-xl px-4 py-2 text-sm" style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)">
                                    <span style="color: #5bc4f5">💡 Focus on</span>
                                    <span class="text-white font-bold mx-1">{{ gap.missing_skills.filter((s) => s.importance === 'required').length }}</span>
                                    <span class="text-slate-400">required first</span>
                                </div>
                            </div>
                            <div class="flex gap-2 flex-wrap">
                                <button
                                    v-for="m in [
                                        { key: 'top10', label: '🎯 Top 10' },
                                        { key: 'grouped', label: '📂 By Area' },
                                        { key: 'roadmap', label: '🗺️ Roadmap' },
                                    ]"
                                    :key="m.key"
                                    class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
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

                            <!-- TOP 10 -->
                            <div v-if="getView(gap.job_title) === 'top10'">
                                <p class="text-xs font-semibold uppercase tracking-widest mb-3 text-slate-400">
                                    🎯 Top Skills to Learn <span class="font-normal normal-case ml-1 text-slate-600">(top 10 of {{ gap.total_missing }})</span>
                                </p>
                                <div v-for="tier in ['required', 'recommended', 'optional']" :key="tier" class="mb-3">
                                    <template v-if="gap.missing_skills.filter((s) => s.importance === tier).length">
                                        <p class="text-xs font-semibold mb-2" :style="tier === 'required' ? 'color:#f87171' : tier === 'recommended' ? 'color:#fbbf24' : 'color:#94a3b8'">
                                            {{ tier === 'required' ? '🔥 Required' : tier === 'recommended' ? '⭐ Recommended' : '💡 Optional' }}
                                        </p>
                                        <div class="flex flex-wrap gap-2">
                                            <span
                                                v-for="s in gap.missing_skills.filter((s) => s.importance === tier)"
                                                :key="s.skill_name"
                                                class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                                :style="importanceStyle[tier]"
                                            >
                                                {{ s.skill_name }}
                                            </span>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <!-- GROUPED -->
                            <div v-else-if="getView(gap.job_title) === 'grouped'" class="space-y-3">
                                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                    📂 Missing by Skill Area <span class="font-normal normal-case ml-1 text-slate-600">{{ gap.missing_group_count }} areas · {{ gap.total_missing }} skills</span>
                                </p>
                                <div
                                    v-for="group in gap.missing_by_group"
                                    :key="group.group_name"
                                    class="rounded-xl p-4"
                                    style="background: rgba(13, 95, 163, 0.05); border: 1px solid rgba(42, 127, 212, 0.12)"
                                >
                                    <div class="flex items-center justify-between mb-3">
                                        <p class="text-sm font-semibold text-white">{{ groupIcons[group.group_name] ?? '🔧' }} {{ group.group_name }}</p>
                                        <span class="text-xs px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5">{{ group.count }} skills</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <span v-for="s in group.skills" :key="s.skill_name" class="px-2.5 py-1 rounded-full text-xs font-medium" :style="importanceStyle[s.importance]">
                                            {{ s.skill_name }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- ROADMAP -->
                            <div v-else class="space-y-3">
                                <p class="text-xs font-semibold uppercase tracking-widest mb-4 text-slate-400">
                                    🗺️ Your Learning Roadmap <span class="font-normal normal-case ml-1 text-slate-600">{{ gap.career_path.length }} steps</span>
                                </p>
                                <div v-if="!gap.career_path.length" class="text-slate-500 text-sm py-4 text-center">ไม่มีข้อมูล roadmap</div>
                                <div class="relative">
                                    <div class="absolute left-5 top-0 bottom-0 w-0.5" style="background: linear-gradient(180deg, rgba(13, 95, 163, 0.4), rgba(76, 175, 80, 0.2))" />
                                    <div v-for="step in gap.career_path" :key="step.step" class="relative flex gap-4 pb-6 last:pb-0">
                                        <div
                                            class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2"
                                            :style="`background:rgba(8,18,36,0.9); ${stepColor[step.priority]}`"
                                        >
                                            {{ step.step }}
                                        </div>
                                        <div class="flex-1 rounded-xl p-4 min-w-0" :style="`border:1px solid rgba(42,127,212,0.15); ${stepBg[step.priority]}`">
                                            <div class="flex items-start justify-between gap-2 flex-wrap mb-2">
                                                <div>
                                                    <p class="text-sm font-bold text-white">{{ step.title }}</p>
                                                    <p class="text-xs text-slate-500 mt-0.5">{{ groupIcons[step.group] ?? '🔧' }} {{ step.group }}</p>
                                                </div>
                                                <span class="text-xs px-2 py-0.5 rounded-full shrink-0" :style="importanceStyle[step.priority]">
                                                    {{ step.priority === 'required' ? '🔥 Required' : step.priority === 'recommended' ? '⭐ Recommended' : '💡 Optional' }}
                                                </span>
                                            </div>
                                            <div class="flex flex-wrap gap-1.5">
                                                <span
                                                    v-for="skill in step.skills"
                                                    :key="skill"
                                                    class="px-2 py-1 rounded-lg text-xs"
                                                    style="background: rgba(42, 127, 212, 0.1); border: 1px solid rgba(42, 127, 212, 0.2); color: #7dd3fc"
                                                    >{{ skill }}</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3 mt-2 p-4 rounded-xl" style="background: rgba(76, 175, 80, 0.08); border: 1px solid rgba(76, 175, 80, 0.2)">
                                    <div
                                        class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                                        style="background: rgba(76, 175, 80, 0.15); border: 2px solid rgba(76, 175, 80, 0.4)"
                                    >
                                        🎯
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold" style="color: #81c784">Goal Achieved</p>
                                        <p class="text-xs text-slate-400">{{ gap.job_title }} at {{ gap.company_name }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Matched -->
                            <div v-if="gap.matched_skills.length">
                                <p class="text-xs font-semibold uppercase tracking-widest mb-2" style="color: #4caf50">✅ Skills you already have ({{ gap.matched_skills.length }})</p>
                                <div class="flex flex-wrap gap-2">
                                    <span
                                        v-for="s in gap.matched_skills"
                                        :key="s.skill_name"
                                        class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                        style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                                    >
                                        {{ s.skill_name }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="rounded-2xl p-8 text-center" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-3xl mb-3">🎯</p>
                        <p class="text-slate-400">ยังไม่มีข้อมูล Skill Gap</p>
                    </div>
                </template>
            </template>
        </template>
    </div>
</template>
