<!-- pages/assessment.vue — Redesigned for step-by-step clarity -->
<script setup lang="ts">
import type { PositionItem, PositionSkillItem, UserSkillScore } from '~/types/Assessment';
import RadarChart from '~/components/Charts/RadarChart.vue';

useHead({ title: 'Skill Assessment — ICT Skill' });

const { getPositions, getPositionSkills, saveAssessment, resetAssessment } = useAssessment();

const positions = ref<PositionItem[]>([]);
const selectedId = ref('');
const positionSkills = ref<PositionSkillItem[]>([]);
const positionName = ref('');
const totalJobs = ref(0);
const userScores = ref<UserSkillScore[]>([]);

const loadingPositions = ref(false);
const loadingSkills = ref(false);
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle');
const showGoToDashboard = ref(false);
const resetting = ref(false);
const dashboardCountdown = ref(0);

const goToDashboard = () => navigateTo('/dashboard');

const startDashboardCountdown = (seconds = 3) => {
    dashboardCountdown.value = seconds;
    const tick = setInterval(() => {
        dashboardCountdown.value--;
        if (dashboardCountdown.value <= 0) clearInterval(tick);
    }, 1000);
};

const handleReset = async () => {
    if (!confirm('ต้องการล้างผล Assessment และเริ่มใหม่?')) return;
    resetting.value = true;
    try {
        await resetAssessment();
        selectedId.value = '';
        positionSkills.value = [];
        userScores.value = [];
        saveStatus.value = 'idle';
        showGoToDashboard.value = false;
    } finally {
        resetting.value = false;
    }
};

const scoreLabels = ['ยังไม่ถนัด', 'น้อย', 'พอใช้', 'ปานกลาง', 'เก่ง', 'เชี่ยวชาญ'];
const scoreColors = ['rgba(148,163,184,0.15)', 'rgba(239,68,68,0.15)', 'rgba(251,191,36,0.15)', 'rgba(59,130,246,0.15)', 'rgba(34,197,94,0.15)', 'rgba(76,175,80,0.25)'];
const scoreTextClrs = ['#94a3b8', '#f87171', '#fbbf24', '#60a5fa', '#4ade80', '#81c784'];

const demandStyle = (weight: number) => {
    if (weight >= 70) return { label: 'ต้องการสูง', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
    if (weight >= 40) return { label: 'ต้องการปานกลาง', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' };
    return { label: 'ต้องการน้อย', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
};

onMounted(async () => {
    loadingPositions.value = true;
    try {
        positions.value = await getPositions();
    } finally {
        loadingPositions.value = false;
    }
});

const handleSelect = async (id: string) => {
    selectedId.value = id;
    saveStatus.value = 'idle';
    showGoToDashboard.value = false;
    if (!id) {
        positionSkills.value = [];
        userScores.value = [];
        return;
    }
    loadingSkills.value = true;
    try {
        const res = await getPositionSkills(id);
        positionSkills.value = res.skills;
        positionName.value = res.position_name;
        totalJobs.value = res.total_jobs;
        userScores.value = res.skills.map((s) => ({ skill_id: s.skill_id, skill_name: s.skill_name, score: 0 }));
    } finally {
        loadingSkills.value = false;
    }
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const setScore = (skillId: number, score: number) => {
    const item = userScores.value.find((s) => s.skill_id === skillId);
    if (item) item.score = score;
    saveStatus.value = 'idle';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => autoSave(), 1500);
};

const autoSave = async () => {
    if (!selectedId.value) return;
    const scores = userScores.value.filter((s) => s.score > 0).map((s) => ({ skill_id: s.skill_id, score: s.score }));
    if (!scores.length) return;
    saveStatus.value = 'saving';
    try {
        await saveAssessment(selectedId.value, scores);
        saveStatus.value = 'saved';
        showGoToDashboard.value = true;
        startDashboardCountdown(3);
        setTimeout(() => {
            if (saveStatus.value === 'saved') saveStatus.value = 'idle';
        }, 3000);
    } catch {
        saveStatus.value = 'idle';
    }
};

const radarLabels = computed(() => positionSkills.value.slice(0, 12).map((s) => s.skill_name));
const jobData = computed(() => positionSkills.value.slice(0, 12).map((s) => s.weight));
const userData = computed(() => {
    const map = new Map(userScores.value.map((s) => [s.skill_id, s.score * 20]));
    return positionSkills.value.slice(0, 12).map((s) => map.get(s.skill_id) ?? 0);
});
const matchPercent = computed(() => {
    const j = jobData.value,
        u = userData.value;
    if (!j.length) return 0;
    const ratios = j.map((jv, i) => (jv <= 0 ? null : Math.min(u[i] ?? 0, jv) / jv)).filter((x): x is number => x !== null);
    return ratios.length ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) : 0;
});
const matchColor = computed(() => (matchPercent.value >= 70 ? '#4caf50' : matchPercent.value >= 40 ? '#fbbf24' : '#f87171'));
const gaps = computed(() =>
    positionSkills.value
        .slice(0, 12)
        .map((s, i) => ({ name: s.skill_name, gap: Math.max((jobData.value[i] ?? 0) - (userData.value[i] ?? 0), 0), weight: s.weight }))
        .filter((x) => x.gap > 5)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5),
);
const topDemands = computed(() => positionSkills.value.filter((s) => s.weight >= 70).slice(0, 6));
const answeredCount = computed(() => userScores.value.filter((s) => s.score > 0).length);
const progressPct = computed(() => (positionSkills.value.length ? Math.round((answeredCount.value / positionSkills.value.length) * 100) : 0));
</script>

<template>
    <div class="space-y-6">
        <!-- ── Header ── -->
        <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
                <h1 class="text-3xl font-bold text-white">Skill Assessment</h1>
                <p class="text-sm text-slate-400 mt-1">ให้คะแนนทักษะ เพื่อให้ระบบแนะนำงานที่เหมาะกับคุณ</p>
            </div>
            <div class="flex items-center gap-2">
                <!-- Save status -->
                <Transition name="fade">
                    <div
                        v-if="saveStatus !== 'idle'"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        :style="
                            saveStatus === 'saved'
                                ? 'background:rgba(76,175,80,0.1); border:1px solid rgba(76,175,80,0.3); color:#81c784'
                                : 'background:rgba(42,127,212,0.1); border:1px solid rgba(42,127,212,0.2); color:#5bc4f5'
                        "
                    >
                        <span :class="saveStatus === 'saving' ? 'animate-spin' : ''">{{ saveStatus === 'saving' ? '⏳' : '✅' }}</span>
                        {{ saveStatus === 'saving' ? 'กำลังบันทึก...' : 'บันทึกแล้ว' }}
                    </div>
                </Transition>
                <button
                    v-if="showGoToDashboard"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style="border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171"
                    :disabled="resetting"
                    @click="handleReset"
                >
                    {{ resetting ? '⏳' : '🔄' }} เริ่มใหม่
                </button>
            </div>
        </div>

        <!-- ── Step 1: Choose position ── -->
        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
            <div class="flex items-center gap-2 mb-3">
                <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style="background: rgba(13, 95, 163, 0.3); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.4)"
                >
                    1
                </div>
                <p class="text-sm font-bold text-white">เลือกตำแหน่งงานที่คุณสนใจ</p>
            </div>
            <div v-if="loadingPositions" class="text-sm text-slate-500 py-1">กำลังโหลด...</div>
            <select
                v-else
                class="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.25)"
                :value="selectedId"
                @change="handleSelect(($event.target as HTMLSelectElement).value)"
            >
                <option value="" disabled :selected="!selectedId" style="background: #0a1628">— เลือกตำแหน่งงาน —</option>
                <option v-for="p in positions" :key="p.id" :value="p.id" style="background: #0a1628">{{ p.name }} ({{ p.job_count }} งาน)</option>
            </select>
        </div>

        <!-- ── Step 2: Rate skills (when position selected) ── -->
        <template v-if="loadingSkills">
            <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="rounded-xl p-4 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                    <div class="h-4 rounded w-1/3" style="background: rgba(42, 127, 212, 0.15)" />
                </div>
            </div>
        </template>

        <template v-else-if="positionSkills.length">
            <!-- Position meta + progress -->
            <div class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.5); border: 1px solid rgba(42, 127, 212, 0.12)">
                <div class="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style="background: rgba(13, 95, 163, 0.3); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.4)"
                        >
                            2
                        </div>
                        <p class="text-sm font-bold text-white">ให้คะแนน Skills</p>
                        <span class="text-xs px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.12); color: #5bc4f5"> {{ positionName }} · {{ totalJobs }} งาน </span>
                    </div>
                    <span class="text-xs text-slate-500">{{ answeredCount }}/{{ positionSkills.length }} skills</span>
                </div>
                <!-- Progress bar -->
                <div class="w-full h-1.5 rounded-full" style="background: rgba(42, 127, 212, 0.1)">
                    <div class="h-1.5 rounded-full transition-all duration-500" :style="`width:${progressPct}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`" />
                </div>
                <p class="text-xs text-slate-600 mt-1.5">{{ progressPct }}% เสร็จแล้ว · บันทึกอัตโนมัติหลังให้คะแนน</p>
            </div>

            <!-- Main 2-col layout -->
            <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <!-- LEFT: Skill list (3 cols) -->
                <div class="xl:col-span-3 rounded-2xl p-5 space-y-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <!-- Score legend -->
                    <div class="flex flex-wrap gap-1.5 pb-3" style="border-bottom: 1px solid rgba(42, 127, 212, 0.1)">
                        <span
                            v-for="(label, n) in scoreLabels"
                            :key="n"
                            class="px-2 py-0.5 rounded-full text-xs font-medium"
                            :style="`background:${scoreColors[n]}; color:${scoreTextClrs[n]}; border:1px solid ${scoreTextClrs[n]}33`"
                        >
                            {{ n }} — {{ label }}
                        </span>
                    </div>

                    <!-- Skill items -->
                    <div class="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                        <div v-for="skill in positionSkills" :key="skill.skill_id" class="rounded-xl p-3.5" style="background: rgba(13, 95, 163, 0.04); border: 1px solid rgba(42, 127, 212, 0.1)">
                            <!-- Skill header -->
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-sm font-semibold text-white truncate">{{ skill.skill_name }}</span>
                                    <span
                                        class="shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium"
                                        :style="`background:${demandStyle(skill.weight).bg}; color:${demandStyle(skill.weight).color}; border:1px solid ${demandStyle(skill.weight).border}`"
                                    >
                                        {{ demandStyle(skill.weight).label }}
                                    </span>
                                </div>
                                <span class="text-xs text-slate-500 shrink-0">{{ skill.frequency }}% jobs</span>
                            </div>
                            <!-- Weight bar -->
                            <div class="w-full h-1 rounded-full mb-2.5" style="background: rgba(42, 127, 212, 0.08)">
                                <div class="h-1 rounded-full" :style="`width:${skill.weight}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`" />
                            </div>
                            <!-- Score buttons -->
                            <div class="flex gap-1">
                                <button
                                    v-for="n in 6"
                                    :key="n"
                                    class="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    :style="
                                        (userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0) === n - 1
                                            ? `background:${scoreColors[n - 1]}; color:${scoreTextClrs[n - 1]}; border:1px solid ${scoreTextClrs[n - 1]}`
                                            : 'background:rgba(255,255,255,0.03); color:#475569; border:1px solid rgba(255,255,255,0.05)'
                                    "
                                    @click="setScore(skill.skill_id, n - 1)"
                                >
                                    {{ n - 1 }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Go to dashboard CTA -->
                    <Transition name="fade">
                        <button
                            v-if="showGoToDashboard"
                            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                            :disabled="dashboardCountdown > 0"
                            @click="goToDashboard"
                        >
                            <span v-if="dashboardCountdown > 0">⏳ รอสักครู่... ({{ dashboardCountdown }}s)</span>
                            <span v-else>🎯 ดูผลใน Dashboard →</span>
                        </button>
                    </Transition>
                </div>

                <!-- RIGHT: Live results (2 cols) -->
                <div class="xl:col-span-2 space-y-4">
                    <!-- Match score -->
                    <div class="rounded-2xl p-5 flex items-center gap-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div class="relative w-20 h-20 shrink-0">
                            <svg class="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0d1f35" stroke-width="4" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9"
                                    fill="none"
                                    stroke="url(#mGrad)"
                                    stroke-width="4"
                                    stroke-dasharray="100"
                                    :stroke-dashoffset="100 - matchPercent"
                                    stroke-linecap="round"
                                />
                                <defs>
                                    <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stop-color="#0d5fa3" />
                                        <stop offset="100%" stop-color="#4caf50" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span class="absolute inset-0 flex items-center justify-center text-lg font-extrabold" :style="`color:${matchColor}`">{{ matchPercent }}%</span>
                        </div>
                        <div>
                            <p class="font-bold text-white">Match Score</p>
                            <p class="text-xs text-slate-400 mt-1">
                                {{
                                    matchPercent >= 70
                                        ? '🔥 โปรไฟล์แข็งแกร่งมาก!'
                                        : matchPercent >= 40
                                          ? '⚡ เริ่มต้นดี เติมอีกนิด'
                                          : answeredCount === 0
                                            ? 'ให้คะแนน skills เพื่อดูผล'
                                            : '📚 ยังมี gap อยู่'
                                }}
                            </p>
                            <p v-if="answeredCount > 0" class="text-xs text-slate-600 mt-0.5">จาก {{ answeredCount }} skills</p>
                        </div>
                    </div>

                    <!-- Top demands -->
                    <div v-if="topDemands.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-xs font-bold uppercase tracking-widest mb-2.5" style="color: rgba(148, 163, 184, 0.5)">🔥 Skills สำคัญสำหรับ{{ positionName }}</p>
                        <div class="flex flex-wrap gap-1.5">
                            <span
                                v-for="s in topDemands"
                                :key="s.skill_id"
                                class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171"
                            >
                                {{ s.skill_name }} <span class="opacity-50">{{ s.weight }}%</span>
                            </span>
                        </div>
                    </div>

                    <!-- Skill gaps -->
                    <div v-if="gaps.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: rgba(148, 163, 184, 0.5)">📈 Skills ที่ควรพัฒนาก่อน</p>
                        <div class="space-y-2.5">
                            <div v-for="g in gaps" :key="g.name">
                                <div class="flex justify-between text-xs mb-1">
                                    <span class="text-white font-medium">{{ g.name }}</span>
                                    <span class="text-slate-500">ขาด {{ Math.round(g.gap) }}%</span>
                                </div>
                                <div class="w-full h-1.5 rounded-full overflow-hidden" style="background: rgba(42, 127, 212, 0.1)">
                                    <div class="h-1.5 rounded-full transition-all duration-500" :style="`width:${Math.max(g.weight - g.gap, 0)}%; background:rgba(13,95,163,0.6)`" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="matchPercent > 0" class="rounded-2xl p-4 text-center" style="background: rgba(76, 175, 80, 0.05); border: 1px solid rgba(76, 175, 80, 0.2)">
                        <p class="text-2xl mb-1">🎉</p>
                        <p class="text-xs font-semibold" style="color: #81c784">ไม่มี skill gap ชัดเจน</p>
                    </div>

                    <!-- Radar -->
                    <div v-if="radarLabels.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: rgba(148, 163, 184, 0.5)">📊 Skill Radar</p>
                        <ClientOnly>
                            <RadarChart
                                :labels="radarLabels"
                                :datasets="[
                                    { label: 'คุณ', data: userData, borderColor: '#2a9fd6', backgroundColor: 'rgba(42,159,214,0.2)', pointBackgroundColor: '#2a9fd6' },
                                    { label: 'ตำแหน่งงาน', data: jobData, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.15)', pointBackgroundColor: '#4caf50' },
                                ]"
                            />
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </template>

        <!-- ── Empty (not selected yet) ── -->
        <div v-else-if="!loadingPositions && !selectedId" class="py-16 text-center rounded-2xl" style="background: rgba(8, 18, 36, 0.5); border: 1px solid rgba(42, 127, 212, 0.1)">
            <p class="text-4xl mb-3">🎯</p>
            <p class="font-semibold text-white mb-1">เลือกตำแหน่งที่คุณสนใจ</p>
            <p class="text-sm text-slate-500">จากนั้นให้คะแนน skills ด้านบน ระบบจะบันทึกอัตโนมัติ</p>
        </div>
    </div>
</template>

<style scoped>
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
