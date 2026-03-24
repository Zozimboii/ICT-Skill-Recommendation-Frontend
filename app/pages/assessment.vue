<!-- pages/assessment.vue -->
<script setup lang="ts">
import type { PositionItem, PositionSkillItem, UserSkillScore } from '~/types/Assessment';
import RadarChart from '~/components/Charts/RadarChart.vue';
import { storeToRefs } from 'pinia';
const router = useRouter();
import { useAuthStore } from '~/stores/useAuthStore';
import { useDashboardStore } from '~/stores/useDashboardStore';

useHead({ title: 'Skill Assessment — ICT Skill' });

const { getPositions, getPositionSkills, saveAssessment, resetAssessment } = useAssessment();
const auth = useAuthStore();
const { isLoggedIn } = storeToRefs(auth);
const dashboardStore = useDashboardStore();

const positions = ref<PositionItem[]>([]);
const selectedId = ref('');
const positionSkills = ref<PositionSkillItem[]>([]);
const positionName = ref('');
const totalJobs = ref(0);
const userScores = ref<UserSkillScore[]>([]);
const loadingPositions = ref(false);
const loadingSkills = ref(false);
const saving = ref(false);
const saved = ref(false);
const resetting = ref(false);
const savedOnce = ref(false); // เคย save แล้วหรือยัง

const handleReset = async () => {
    if (!confirm('ต้องการล้างผลและเริ่มใหม่?')) return;
    resetting.value = true;
    try {
        await resetAssessment();
        selectedId.value = '';
        positionSkills.value = [];
        userScores.value = [];
        saved.value = false;
        savedOnce.value = false;
    } finally {
        resetting.value = false;
    }
};

const scoreLabels = ['ไม่ถนัด', 'น้อย', 'พอใช้', 'ปานกลาง', 'เก่ง', 'เชี่ยวชาญ'];
const scoreColors = ['rgba(148,163,184,0.15)', 'rgba(239,68,68,0.15)', 'rgba(251,191,36,0.15)', 'rgba(59,130,246,0.15)', 'rgba(34,197,94,0.15)', 'rgba(76,175,80,0.25)'];
const scoreTextClrs = ['#94a3b8', '#f87171', '#fbbf24', '#60a5fa', '#4ade80', '#81c784'];

const demandStyle = (weight: number) => {
    if (weight >= 70) return { label: 'ต้องการทักษะสูง', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
    if (weight >= 40) return { label: 'ต้องการทักษะปานกลาง', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' };
    return { label: 'ต้องการทักษะน้อย', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' };
};

const route = useRoute();

// ── โหลด positions ──────────────────────────────────────────────────────────
const loadPositions = async () => {
    if (positions.value.length > 0) return; // โหลดแล้วไม่โหลดซ้ำ
    loadingPositions.value = true;
    try {
        positions.value = await getPositions();
    } finally {
        loadingPositions.value = false;
    }
};

onMounted(async () => {
    await loadPositions();

    // reload เมื่อ user กลับมาที่ tab
    document.addEventListener('visibilitychange', async () => {
        if (!document.hidden) await loadPositions();
    });
});

// reload เมื่อ navigate กลับมาหน้า assessment
watch(
    () => route.path,
    async (p) => {
        if (p === '/assessment') await loadPositions();
    },
);

const handleSelect = async (id: string) => {
    selectedId.value = id;
    saved.value = false;
    savedOnce.value = false;
    if (!id) {
        positionSkills.value = [];
        userScores.value = [];
        return;
    }
    loadingSkills.value = true;
    try {
        const res = await getPositionSkills(id);

        // ── DEBUG: ดูข้อมูลดิบจาก backend ─────────────────────────────
        const hard = res.skills.filter((s) => s.skill_type === 'hard_skill');
        const soft = res.skills.filter((s) => s.skill_type === 'soft_skill');

        console.group(`📊 Position Skills — ${res.position_name} (${res.total_jobs} jobs)`);
        console.log(`รวมทั้งหมด: ${res.skills.length} skills  |  Hard: ${hard.length}  Soft: ${soft.length}`);

        console.group('🔵 Hard Skills (จาก backend)');
        console.table(
            hard.map((s) => ({
                name: s.skill_name,
                weight: s.weight,
                frequency: s.frequency + '%',
                job_count: s.job_count,
            })),
        );
        console.groupEnd();

        console.group('🟢 Soft Skills (จาก backend)');
        console.table(
            soft.map((s) => ({
                name: s.skill_name,
                weight: s.weight,
                frequency: s.frequency + '%',
                job_count: s.job_count,
            })),
        );
        console.groupEnd();
        console.groupEnd();
        // ── END DEBUG ──────────────────────────────────────────────────

        positionSkills.value = res.skills;
        positionName.value = res.position_name;
        totalJobs.value = res.total_jobs;
        userScores.value = res.skills.map((s) => ({ skill_id: s.skill_id, skill_name: s.skill_name, score: 0 }));
    } finally {
        loadingSkills.value = false;
    }
};

// กดปุ่มเลือกคะแนน — แค่ update state ไม่ save
const setScore = (skillId: number, score: number) => {
    const item = userScores.value.find((s) => s.skill_id === skillId);
    if (item) item.score = score;
    saved.value = false; // ถ้าเปลี่ยนคะแนน = ต้อง save ใหม่
};

// กดปุ่ม "บันทึกผล" ครั้งเดียว
const handleSave = async () => {
    if (!selectedId.value || !isLoggedIn.value) return;
    const scores = userScores.value.filter((s) => s.score > 0).map((s) => ({ skill_id: s.skill_id, score: s.score }));
    if (!scores.length) return;
    saving.value = true;
    try {
        await saveAssessment(selectedId.value, scores);
        saved.value = true;
        savedOnce.value = true;
        // reload dashboard store ด้วย $fetch (ไม่ต้องรอ)
        dashboardStore.reload();
    } catch {
        // error silently — user can retry
    } finally {
        saving.value = false;
    }
};

// ── Live computed (ไม่ต้อง save ก็ดูได้) ──────────────────────────
// ── Radar: กรอง skill ชื่อสั้นเกิน (เช่น "R", "C") ออก + limit 16 ──
// กรอง skill ชื่อสั้น/ไม่มีความหมาย เช่น "R", "C", "VB"
function isValidSkill(name: string): boolean {
    const n = name.trim();
    if (n.length <= 1) return false;
    if (/^[A-Z]$/.test(n)) return false; // R, C, F (uppercase เดี่ยว)
    if (/^[A-Z]{2}$/.test(n)) return false; // VB, VB (2 uppercase)
    return true;
}

// filteredPositionSkills:
// - กรอง skill ชื่อสั้น/ไม่มีความหมาย
// - กรองเฉพาะ frequency >= 10 (ต้องการน้อยเกินออก)
// - เรียง weight desc เพื่อให้ skill สำคัญขึ้นก่อนเสมอ
const filteredPositionSkills = computed(() => positionSkills.value.filter((s) => isValidSkill(s.skill_name) && s.frequency >= 10).sort((a, b) => b.weight - a.weight));

// ── DEBUG: log เมื่อ computed เปลี่ยน ─────────────────────────────────────
watchEffect(() => {
    if (!positionSkills.value.length) return;

    const removed = positionSkills.value.filter((s) => !isValidSkill(s.skill_name) || s.frequency < 10);
    if (removed.length) {
        console.group('🚫 Skills ที่ถูก filter ออก (isValidSkill=false หรือ frequency<10%)');
        console.table(
            removed.map((s) => ({
                name: s.skill_name,
                type: s.skill_type,
                frequency: s.frequency + '%',
                weight: s.weight,
                reason: !isValidSkill(s.skill_name) ? 'ชื่อสั้น/ไม่ valid' : 'frequency ต่ำ',
            })),
        );
        console.groupEnd();
    }

    console.group('✅ filteredPositionSkills (ที่แสดงฝั่งซ้าย)');
    console.table(
        filteredPositionSkills.value.map((s) => ({
            name: s.skill_name,
            type: s.skill_type,
            weight: s.weight,
            frequency: s.frequency + '%',
        })),
    );
    console.groupEnd();

    console.group('🔵 hardSkillItems (Hard Radar)');
    console.table(
        hardSkillItems.value.map((s) => ({
            name: s.skill_name,
            weight: s.weight,
            frequency: s.frequency + '%',
        })),
    );
    console.groupEnd();

    console.group('🟢 softSkillItems (Soft Radar)');
    console.table(
        softSkillItems.value.map((s) => ({
            name: s.skill_name,
            weight: s.weight,
            frequency: s.frequency + '%',
        })),
    );
    console.groupEnd();
});

const RADAR_MAX = 16;
const radarSkills = computed(() => filteredPositionSkills.value.slice(0, RADAR_MAX));
const radarLabels = computed(() => radarSkills.value.map((s) => s.skill_name));
const jobData = computed(() => radarSkills.value.map((s) => s.weight));
const userData = computed(() => {
    // score 0-5 → แปลงเป็น % ที่เทียบกับ weight ของงาน
    // เช่น score=4/5 บน skill weight=80 → 64 (แสดงว่าครอบคลุม 80% ของที่งานต้องการ)
    const map = new Map(userScores.value.map((s) => [s.skill_id, s.score]));
    return radarSkills.value.map((s) => {
        const score = map.get(s.skill_id) ?? 0;
        return Math.round((score / 5) * s.weight);
    });
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
    filteredPositionSkills.value
        .slice(0, RADAR_MAX)
        .map((s, i) => ({ name: s.skill_name, gap: Math.max((jobData.value[i] ?? 0) - (userData.value[i] ?? 0), 0), weight: s.weight }))
        .filter((x) => x.gap > 5)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5),
);
const topDemands = computed(() => filteredPositionSkills.value.filter((s) => s.weight >= 70).slice(0, 6));

// ── Priority Score = (frequency*0.7) + (gap_normalized*0.3) ──────────────
// เรียง skill ที่ควรพัฒนาก่อนโดยรวม market demand + ช่องว่างของ user
const prioritySkills = computed(() => {
    const scoreMap = new Map(userScores.value.map((s) => [s.skill_id, s.score]));
    return (
        filteredPositionSkills.value
            .map((s) => {
                const userScore = scoreMap.get(s.skill_id) ?? 0;
                const userPct = (userScore / 5) * 100; // 0-100
                const gap = Math.max(100 - userPct, 0) / 100; // normalized 0-1
                const freq = s.frequency / 100; // normalized 0-1
                const priority = freq * 0.7 + gap * 0.3;
                return {
                    skill_id: s.skill_id,
                    skill_name: s.skill_name,
                    skill_type: s.skill_type,
                    weight: s.weight,
                    frequency: s.frequency,
                    userScore,
                    priority: Math.round(priority * 100), // 0-100
                    label: s.frequency >= 70 ? 'Must Have' : s.frequency >= 40 ? 'Good to Have' : 'Optional',
                    labelColor: s.frequency >= 70 ? '#f87171' : s.frequency >= 40 ? '#fbbf24' : '#94a3b8',
                };
            })
            // เฉพาะที่ user ยังไม่ถึงระดับดี (score < 4) และ priority สูง
            .filter((s) => s.userScore < 4)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 8)
    );
});

// ── Hard / Soft แยก สำหรับ 2 radar charts ────────────────────────────────
// ใช้ positionSkills โดยตรง (ไม่ผ่าน filteredPositionSkills) เพื่อให้ hard skills ไม่หายไป
// sort ตาม weight desc + กรอง isValidSkill
const hardSkillItems = computed(() =>
    positionSkills.value
        .filter((s) => s.skill_type === 'hard_skill' && isValidSkill(s.skill_name) && s.frequency >= 5)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, RADAR_MAX),
);
const softSkillItems = computed(() =>
    positionSkills.value
        .filter((s) => s.skill_type === 'soft_skill' && isValidSkill(s.skill_name) && s.frequency >= 5)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, RADAR_MAX),
);

const hardLabels = computed(() => hardSkillItems.value.map((s) => s.skill_name));
const hardJobData = computed(() => hardSkillItems.value.map((s) => s.weight));
const hardUserData = computed(() => {
    const m = new Map(userScores.value.map((s) => [s.skill_id, s.score]));
    return hardSkillItems.value.map((s) => Math.round(((m.get(s.skill_id) ?? 0) / 5) * s.weight));
});

const softLabels = computed(() => softSkillItems.value.map((s) => s.skill_name));
const softJobData = computed(() => softSkillItems.value.map((s) => s.weight));
const softUserData = computed(() => {
    const m = new Map(userScores.value.map((s) => [s.skill_id, s.score]));
    return softSkillItems.value.map((s) => Math.round(((m.get(s.skill_id) ?? 0) / 5) * s.weight));
});
const answeredCount = computed(() => userScores.value.filter((s) => s.score > 0 && filteredPositionSkills.value.some((p) => p.skill_id === s.skill_id)).length);
const progressPct = computed(() => (filteredPositionSkills.value.length ? Math.round((answeredCount.value / filteredPositionSkills.value.length) * 100) : 0));
const canSave = computed(() => isLoggedIn.value && answeredCount.value > 0 && !saving.value);
const hasChanges = computed(() => !saved.value && answeredCount.value > 0);

// ไปที่ dashboard — reload ก่อน navigate เพื่อให้ข้อมูลพร้อมทันที
const goDashboard = async () => {
    await dashboardStore.reload();
    await router.push('/dashboard');
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
                <h1 class="text-4xl font-bold text-white">Skill Assessment</h1>
                <p class="text-lg text-slate-400 mt-1">ให้คะแนนทักษะของคุณ แล้วกดบันทึกเพื่อดูงานที่แนะนำ</p>
            </div>
            <div class="flex items-center gap-2">
                <!-- Saved badge -->
                <Transition name="fade">
                    <div
                        v-if="saved"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-base font-semibold"
                        style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        บันทึกแล้ว
                    </div>
                </Transition>
                <!-- Reset -->
                <button
                    v-if="savedOnce"
                    class="px-3 py-1.5 rounded-xl text-base font-semibold transition-all"
                    style="border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171"
                    :disabled="resetting"
                    @click="handleReset"
                >
                    {{ resetting ? 'กำลังรีเซ็ต...' : 'เริ่มใหม่' }}
                </button>
            </div>
        </div>

        <!-- Guest banner -->
        <Transition name="fade">
            <div
                v-if="!isLoggedIn"
                class="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl flex-wrap"
                style="background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2)"
            >
                <div>
                    <p class="text-lg font-bold text-white">ทดลองทำ Assessment</p>
                    <p class="text-base text-slate-400 mt-0.5">
                        ดูผล match score และ skill gap ได้ทันที ·
                        <span style="color: #fbbf24">Login เพื่อบันทึกผลและดูงานแนะนำ</span>
                    </p>
                </div>
                <NuxtLink to="/login" class="shrink-0 px-4 py-2 rounded-xl text-base font-semibold text-white" style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)">
                    Login / สมัครสมาชิก
                </NuxtLink>
            </div>
        </Transition>

        <!-- Info: Assessment ทำเพิ่มได้แม้มี Transcript -->
        <div class="flex items-start gap-3 px-4 py-3.5 rounded-xl text-base" style="background: rgba(42, 127, 212, 0.06); border: 1px solid rgba(42, 127, 212, 0.18); color: #94a3b8">
            <svg class="w-5 h-5 shrink-0 mt-0.5" style="color: #5bc4f5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
            <div>
                <span class="text-slate-300 font-semibold">ทำ Assessment ควบคู่กับ Transcript ได้</span>
                — ระบบจะรวมคะแนนเข้าด้วยกัน ผลลัพธ์จะแม่นยำขึ้น
            </div>
        </div>

        <!-- Step 1 -->
        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
            <div class="flex items-center gap-2 mb-3">
                <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                    style="background: rgba(13, 95, 163, 0.3); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.4)"
                >
                    1
                </div>
                <p class="text-lg font-bold text-white">เลือกตำแหน่งงานที่สนใจ</p>
            </div>
            <div v-if="loadingPositions" class="text-lg text-slate-300 py-1">กำลังโหลด...</div>
            <select
                v-else
                class="w-full px-4 py-3 rounded-xl text-white text-lg outline-none"
                style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.25)"
                :value="selectedId"
                @change="handleSelect(($event.target as HTMLSelectElement).value)"
            >
                <option value="" disabled :selected="!selectedId" style="background: #0a1628">— เลือกตำแหน่งงาน —</option>
                <option v-for="p in positions" :key="p.id" :value="p.id" style="background: #0a1628">{{ p.name }} ({{ p.job_count }} งาน)</option>
            </select>
        </div>

        <!-- Loading skills -->
        <template v-if="loadingSkills">
            <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="rounded-xl p-4 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                    <div class="h-4 rounded w-1/3" style="background: rgba(42, 127, 212, 0.15)" />
                </div>
            </div>
        </template>

        <!-- Step 2 -->
        <template v-else-if="positionSkills.length">
            <!-- Progress -->
            <div class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.5); border: 1px solid rgba(42, 127, 212, 0.12)">
                <div class="flex items-center justify-between gap-3 flex-wrap mb-2">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-6 h-6 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                            style="background: rgba(13, 95, 163, 0.3); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.4)"
                        >
                            2
                        </div>
                        <p class="text-lg font-bold text-white">ให้คะแนน Skills</p>
                        <span class="text-base px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.12); color: #5bc4f5"> {{ positionName }} · {{ totalJobs }} งาน </span>
                    </div>
                    <span class="text-base text-slate-300">{{ answeredCount }}/{{ filteredPositionSkills.length }} skills ที่ให้คะแนนแล้ว</span>
                </div>
                <div class="w-full h-2 rounded-full" style="background: rgba(42, 127, 212, 0.1)">
                    <div class="h-2 rounded-full transition-all duration-500" :style="`width:${progressPct}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`" />
                </div>
            </div>

            <!-- Main layout: skill list (left) + live preview (right) -->
            <div class="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <!-- LEFT: Skill list -->
                <div class="xl:col-span-3 space-y-4">
                    <!-- Score legend -->
                    <div class="rounded-2xl px-5 py-3" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <p class="text-base text-slate-300 mb-2 uppercase tracking-widest font-semibold">ระดับคะแนน</p>
                        <div class="flex flex-wrap gap-1.5">
                            <span
                                v-for="(label, n) in scoreLabels"
                                :key="n"
                                class="px-2.5 py-1 rounded-full text-base font-medium"
                                :style="`background:${scoreColors[n]}; color:${scoreTextClrs[n]}; border:1px solid ${scoreTextClrs[n]}33`"
                            >
                                {{ n }} — {{ label }}
                            </span>
                        </div>
                    </div>

                    <!-- Skills -->
                    <div class="rounded-2xl p-5 space-y-2.5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div
                            v-for="skill in filteredPositionSkills"
                            :key="skill.skill_id"
                            class="rounded-xl p-4 transition-all"
                            :style="
                                (userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0) > 0
                                    ? 'background:rgba(13,95,163,0.08); border:1px solid rgba(42,127,212,0.2)'
                                    : 'background:rgba(13,95,163,0.03); border:1px solid rgba(42,127,212,0.08)'
                            "
                        >
                            <!-- Skill name + demand -->
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-lg font-semibold text-white truncate">{{ skill.skill_name }}</span>
                                    <span
                                        class="shrink-0 text-base px-1.5 py-0.5 rounded-full font-medium"
                                        :style="`background:${demandStyle(skill.weight).bg}; color:${demandStyle(skill.weight).color}; border:1px solid ${demandStyle(skill.weight).border}`"
                                    >
                                        {{ demandStyle(skill.weight).label }}
                                    </span>
                                </div>
                                <!-- Current score indicator -->
                                <span
                                    class="shrink-0 text-base font-bold transition-all"
                                    :style="
                                        (userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0) > 0
                                            ? `color:${scoreTextClrs[userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0]}`
                                            : 'color:#94a3b8'
                                    "
                                >
                                    {{ scoreLabels[userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0] }}
                                </span>
                            </div>
                            <!-- Demand bar -->
                            <div class="w-full h-1 rounded-full mb-3" style="background: rgba(42, 127, 212, 0.08)">
                                <div class="h-1 rounded-full" :style="`width:${skill.weight}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`" />
                            </div>
                            <!-- Score buttons -->
                            <div class="flex gap-1">
                                <button
                                    v-for="n in 6"
                                    :key="n"
                                    class="flex-1 py-2 rounded-lg text-base font-bold transition-all"
                                    :style="
                                        (userScores.find((s) => s.skill_id === skill.skill_id)?.score ?? 0) === n - 1
                                            ? `background:${scoreColors[n - 1]}; color:#fff; border:2px solid ${scoreTextClrs[n - 1]}`
                                            : 'background:rgba(255,255,255,0.03); color:#64748b; border:1px solid rgba(255,255,255,0.06)'
                                    "
                                    @click="setScore(skill.skill_id, n - 1)"
                                >
                                    {{ n - 1 }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Save button area -->
                    <div class="rounded-2xl p-5 space-y-3" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <!-- Progress summary -->
                        <div class="flex items-center justify-between text-base">
                            <span class="text-slate-400">ให้คะแนนแล้ว {{ answeredCount }} จาก {{ filteredPositionSkills.length }} skills</span>
                            <span class="font-semibold" :style="progressPct === 100 ? 'color:#4caf50' : 'color:#5bc4f5'"> {{ progressPct }}% </span>
                        </div>
                        <div class="w-full h-1.5 rounded-full" style="background: rgba(42, 127, 212, 0.1)">
                            <div class="h-1.5 rounded-full transition-all duration-500" :style="`width:${progressPct}%; background:linear-gradient(90deg,#0d5fa3,#4caf50)`" />
                        </div>

                        <!-- Save / Login CTA -->
                        <template v-if="isLoggedIn">
                            <button
                                :disabled="!canSave || !hasChanges"
                                class="w-full py-3 rounded-xl text-base font-bold text-white transition-all flex items-center justify-center gap-2"
                                :style="canSave && hasChanges ? 'background:linear-gradient(135deg,#0d5fa3,#1a8c3e); opacity:1' : 'background:rgba(13,95,163,0.2); opacity:0.5; cursor:not-allowed'"
                                @click="handleSave"
                            >
                                <template v-if="saving">
                                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    กำลังบันทึก...
                                </template>
                                <template v-else-if="saved">
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    บันทึกแล้ว
                                </template>
                                <template v-else>
                                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                        <polyline points="17 21 17 13 7 13 7 21" />
                                        <polyline points="7 3 7 8 15 8" />
                                    </svg>
                                    บันทึกผล{{ answeredCount > 0 ? ` (${answeredCount} skills)` : '' }}
                                </template>
                            </button>

                            <!-- Go to dashboard after save -->
                            <Transition name="fade">
                                <button
                                    v-if="saved"
                                    class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-base font-semibold text-white transition-all"
                                    style="background: rgba(76, 175, 80, 0.15); border: 1px solid rgba(76, 175, 80, 0.3)"
                                    @click="goDashboard"
                                >
                                    ดูผลใน Dashboard →
                                </button>
                            </Transition>
                        </template>

                        <!-- Guest nudge -->
                        <template v-else>
                            <div class="flex items-center justify-between gap-3 flex-wrap">
                                <div>
                                    <p class="text-base font-semibold text-white">Login เพื่อบันทึกผล</p>
                                    <p class="text-base text-slate-500 mt-0.5">ผลที่ให้คะแนนไว้จะถูกบันทึกทันทีหลัง Login</p>
                                </div>
                                <NuxtLink to="/login" class="shrink-0 px-4 py-2 rounded-xl text-base font-semibold text-white" style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)">
                                    Login
                                </NuxtLink>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- RIGHT: Live preview -->
                <div class="xl:col-span-2 space-y-4">
                    <!-- Match score -->
                    <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest text-slate-500 mb-4">ผลลัพธ์แบบ Real-time</p>
                        <div class="flex items-center gap-4">
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
                                <span class="absolute inset-0 flex items-center justify-center text-xl font-extrabold" :style="`color:${matchColor}`">{{ matchPercent }}%</span>
                            </div>
                            <div>
                                <p class="font-bold text-white text-lg">ความเข้ากันของตำแหน่งงาน</p>
                                <p class="text-base text-slate-400 mt-1">
                                    {{
                                        matchPercent >= 70 ? 'โปรไฟล์แข็งแกร่ง' : matchPercent >= 40 ? 'เริ่มต้นดี เติมอีกนิด' : answeredCount === 0 ? 'ให้คะแนน skills เพื่อดูผล' : 'ยังมีช่องว่างอยู่'
                                    }}
                                </p>
                                <p v-if="answeredCount > 0" class="text-base text-slate-600 mt-0.5">จาก {{ answeredCount }} skills ที่ให้คะแนน</p>
                            </div>
                        </div>
                    </div>

                    <!-- Top demands -->
                    <div v-if="topDemands.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest mb-2.5 text-slate-500">Skills สำคัญสำหรับตำแหน่งนี้</p>
                        <div class="flex flex-wrap gap-1.5">
                            <span
                                v-for="s in topDemands"
                                :key="s.skill_id"
                                class="px-2.5 py-1 rounded-full text-base font-semibold"
                                style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171"
                            >
                                {{ s.skill_name }}
                                <span class="opacity-50 text-base">{{ s.weight }}%</span>
                            </span>
                        </div>
                    </div>

                    <!-- Skill gaps -->
                    <div v-if="gaps.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest mb-3 text-slate-500">ทักษะที่ควรพัฒนา</p>
                        <div class="space-y-3">
                            <div v-for="g in gaps" :key="g.name">
                                <div class="flex justify-between text-base mb-1">
                                    <span class="text-white font-medium">{{ g.name }}</span>
                                    <span class="text-slate-500">ขาด {{ Math.round(g.gap) }}%</span>
                                </div>
                                <div class="w-full h-2 rounded-full overflow-hidden" style="background: rgba(42, 127, 212, 0.1)">
                                    <div class="h-2 rounded-full transition-all duration-500" :style="`width:${Math.max(g.weight - g.gap, 0)}%; background:rgba(13,95,163,0.6)`" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="matchPercent > 0" class="rounded-2xl p-4 text-center" style="background: rgba(76, 175, 80, 0.05); border: 1px solid rgba(76, 175, 80, 0.2)">
                        <svg class="w-10 h-10 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="#81c784" stroke-width="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <p class="text-base font-semibold" style="color: #81c784">ไม่มี skill gap ชัดเจน</p>
                    </div>

                    <!-- Priority skills to develop -->
                    <div v-if="prioritySkills.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest mb-3 text-slate-500">ควรพัฒนาทักษะตามลำดับนี้</p>
                        <div class="space-y-2">
                            <div
                                v-for="(s, i) in prioritySkills"
                                :key="s.skill_id"
                                class="flex items-center gap-3 px-3 py-2 rounded-xl"
                                style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)"
                            >
                                <span class="w-5 h-5 rounded-full flex items-center justify-center text-base font-bold shrink-0" style="background: rgba(13, 95, 163, 0.25); color: #5bc4f5">{{
                                    i + 1
                                }}</span>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-base font-semibold text-white truncate">{{ s.skill_name }}</span>
                                        <span
                                            class="shrink-0 text-base px-1.5 py-0.5 rounded-full font-medium"
                                            :style="`color:${s.labelColor}; background:${s.labelColor}18; border:1px solid ${s.labelColor}44`"
                                        >
                                            {{ s.label }}
                                        </span>
                                    </div>
                                    <div class="w-full h-1 rounded-full mt-1.5" style="background: rgba(42, 127, 212, 0.1)">
                                        <div class="h-1 rounded-full transition-all" :style="`width:${s.priority}%; background:linear-gradient(90deg,#0d5fa3,${s.labelColor})`" />
                                    </div>
                                </div>
                                <span class="shrink-0 text-base font-bold" :style="`color:${s.labelColor}`"> {{ s.userScore }}/5 </span>
                            </div>
                        </div>
                        <p class="text-base text-slate-600 mt-3">คำนวณจาก Market Demand (70%) + ช่องว่างที่ขาด (30%)</p>
                    </div>

                    <!-- Hard Skills Radar -->
                    <div v-if="hardLabels.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest mb-3 text-slate-500">Hard Skills Radar</p>
                        <ClientOnly>
                            <RadarChart
                                :labels="hardLabels"
                                :datasets="[
                                    { label: 'คุณ', data: hardUserData, borderColor: '#2a9fd6', backgroundColor: 'rgba(42,159,214,0.2)', pointBackgroundColor: '#2a9fd6' },
                                    { label: 'ตำแหน่งงาน', data: hardJobData, borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.15)', pointBackgroundColor: '#4caf50' },
                                ]"
                                :compact="true"
                                :label-font-size="11"
                            />
                        </ClientOnly>
                    </div>

                    <!-- Soft Skills Radar -->
                    <div v-if="softLabels.length" class="rounded-2xl p-4" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <p class="text-base font-bold uppercase tracking-widest mb-3 text-slate-500">Soft Skills Radar</p>
                        <ClientOnly>
                            <RadarChart
                                :labels="softLabels"
                                :datasets="[
                                    { label: 'คุณ', data: softUserData, borderColor: '#2a9fd6', backgroundColor: 'rgba(42,159,214,0.2)', pointBackgroundColor: '#2a9fd6' },
                                    { label: 'ตำแหน่งงาน', data: softJobData, borderColor: '#81c784', backgroundColor: 'rgba(129,199,132,0.15)', pointBackgroundColor: '#81c784' },
                                ]"
                                :compact="true"
                                :label-font-size="11"
                            />
                        </ClientOnly>
                    </div>
                </div>
            </div>
        </template>

        <!-- Empty -->
        <div v-else-if="!loadingPositions && !selectedId" class="py-16 text-center rounded-2xl" style="background: rgba(8, 18, 36, 0.5); border: 1px solid rgba(42, 127, 212, 0.1)">
            <svg class="w-12 h-12 mx-auto mb-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p class="font-semibold text-white mb-1">เลือกตำแหน่งที่สนใจด้านบน</p>
            <p class="text-lg text-slate-500">จากนั้นให้คะแนน skills และกดบันทึกผลเมื่อพร้อม</p>
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
