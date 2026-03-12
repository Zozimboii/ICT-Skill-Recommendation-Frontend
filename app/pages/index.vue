<!-- pages/index.vue — Skill Trends (redesigned for clarity) -->
<script setup lang="ts">
import { useTrend } from '@/composables/useTrend';
import JobTrendChart from '@/components/Trend/JobTrendChart.vue';
import SkillTrendChart from '@/components/Trend/SkillTrendChart.vue';
import SkillBlockPanel from '@/components/Trend/SkillBlockPanel.vue';
import SankeyChart from '@/components/Trend/SankeyChart.vue';

useHead({ title: 'ICT Skill Trends' });

const {
    jobTrend,
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
    skillBlockData,
    skillChartIds,
    fetchJobsBySkill,
    jobsBySkill,
    fetchJobsByCategory,
    jobsByCategory,
} = useTrend();

const selectedJobs = ref<any[]>([]);
const showModal = ref(false);
const selectedSkillName = ref('');
const sankeyRef = ref<HTMLElement | null>(null);
const router = useRouter();
function capitalizeFirst(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
async function handleSkillClick(skillId: number, skillName: string) {
    selectedSkillName.value = capitalizeFirst(skillName ?? '');
    await fetchJobsBySkill(skillId);
    selectedJobs.value = jobsBySkill.value;
    showModal.value = true;
}
async function handleBlockSkillClick(skillId: number, skillName: string) {
    selectedSkillName.value = capitalizeFirst(skillName ?? '');
    onSkillClick(skillId);
    await fetchJobsBySkill(skillId);
    selectedJobs.value = jobsBySkill.value;
}

// Handle "ดูงาน" button from JobTrendChart → fetch jobs by category and hand back via callback
async function handleViewJobs(category: string, callback: (jobs: any[]) => void) {
    try {
        const jobs = await fetchJobsByCategory(category);
        callback(jobs);
    } catch {
        callback([]);
    }
}
async function onSankeyNodeClick(subCategory: string) {
    await onCategoryClick(subCategory);
}
async function goToSearch(skill: string) {
    router.push({
        path: '/searchJob',
        query: { skill },
    });
}
onMounted(async () => {
    await nextTick();
    await loadInitial();
    await nextTick();
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting && !sankeyLoaded.value) {
                fetchSankeyData(8, 4);
                observer.disconnect();
            }
        },
        { threshold: 0.1 },
    );
    if (sankeyRef.value) observer.observe(sankeyRef.value);
    else setTimeout(() => fetchSankeyData(8, 4), 800);
});
</script>

<template>
    <div class="space-y-6">
        <!-- ── Page header ── -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5">LIVE DATA</span>
                </div>
                <h1 class="text-3xl font-bold text-white">ICT Skill Trends</h1>
                <p class="text-slate-400 text-sm mt-1">วิเคราะห์ทักษะที่นายจ้างต้องการในตลาดงาน ICT ไทย</p>
            </div>
            <button
                class="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style="background: rgba(13, 95, 163, 0.1); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                :disabled="loading"
                @click="loadAll"
            >
                <span :class="loading ? 'animate-spin' : ''">↻</span>
                รีเฟรช
            </button>
        </div>

        <!-- ── How to use hint ── -->
        <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-xs" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12); color: #7dd3fc">
            <span class="text-base shrink-0 mt-0.5">💡</span>
            <span>
                กดที่แท่งกราฟหรือ skill block เพื่อกรองข้อมูล · กดที่ชื่อ skill ในกราฟด้านล่างเพื่อดูรายชื่องาน ·
                <button v-if="selectedCategory || selectedSkillId" class="underline font-semibold" @click="clearFilter">ล้าง filter</button>
                <span v-else>Scroll ลงเพื่อดู Skill Map</span>
            </span>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loading && !jobTrend.length" class="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
            <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
            <p class="text-sm animate-pulse">กำลังโหลดข้อมูลตลาดงาน...</p>
        </div>

        <!-- ── Error ── -->
        <div v-else-if="error" class="flex items-center gap-3 p-5 rounded-2xl text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">
            <span class="text-xl">⚠️</span>
            <div>
                <p class="font-semibold">โหลดข้อมูลไม่สำเร็จ</p>
                <p class="text-sm opacity-75 mt-0.5">{{ error }}</p>
            </div>
        </div>

        <template v-else>
            <ClientOnly>
                <!-- ── Section: Job & Skill trends ── -->
                <div class="space-y-2">
                    <h2 class="text-sm font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">ภาพรวมตลาดงาน</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                            <p class="text-xs text-slate-500 mb-3">📊 จำนวนงานแต่ละสาย · คลิกเพื่อกรอง · กด "ดูงาน" เพื่อดูรายชื่อ</p>
                            <JobTrendChart
                                v-if="jobTrend.length"
                                :series="jobChartSeries"
                                :categories="jobChartCategories"
                                :selected="selectedCategory ?? undefined"
                                :category-jobs="jobsByCategory"
                                @category-click="onCategoryClick"
                                @view-jobs="handleViewJobs"
                            />
                        </div>
                        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                            <p class="text-xs text-slate-500 mb-3">💡 Skill ยอดนิยม · คลิกเพื่อดูงาน</p>
                            <SkillBlockPanel :skills="skillBlockData" :selectedSkillId="selectedSkillId" :selectedCategory="selectedCategory" @skill-click="handleBlockSkillClick" />
                        </div>
                    </div>
                </div>

                <!-- ── Section: Skill demand chart ── -->
                <div class="space-y-2">
                    <h2 class="text-sm font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">Skill Demand (Top skills · คลิกที่ชื่อเพื่อดูงาน)</h2>
                    <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <SkillTrendChart :series="skillChartSeries" :categories="skillChartCategories" :skill-ids="skillChartIds" @skill-click="handleSkillClick" />
                    </div>
                </div>

                <!-- ── Section: Skill Map (lazy) ── -->
                <div class="space-y-2">
                    <h2 class="text-sm font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">Skill Map — ความสัมพันธ์ระหว่าง skill กับสายงาน</h2>
                    <div ref="sankeyRef" class="rounded-2xl p-5 min-h-[160px]" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <div v-if="sankeyLoading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                            <div class="w-8 h-8 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
                            <p class="text-sm animate-pulse">กำลังโหลด Skill Map...</p>
                        </div>
                        <div v-else-if="!sankeyLoaded" class="flex flex-col items-center justify-center py-12 gap-2 text-slate-600">
                            <p class="text-4xl">🗺️</p>
                            <p class="text-sm">Skill Map จะโหลดเมื่อ scroll มาถึง</p>
                        </div>
                        <template v-else>
                            <SankeyChart :links="sankeyLinks" @node-click="onSankeyNodeClick" />
                            <div v-if="selectedCategory || selectedSkillId" class="flex justify-end mt-3">
                                <button class="text-xs px-3 py-1.5 rounded-lg border transition" style="border-color: rgba(76, 175, 80, 0.4); color: #4caf50" @click="clearFilter">
                                    ✕ ล้าง filter
                                </button>
                            </div>
                        </template>
                    </div>
                </div>
            </ClientOnly>
        </template>

        <Transition name="modal">
            <div v-if="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div class="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden" style="background: #070d18; border: 1px solid rgba(42, 127, 212, 0.25)">
                    <!-- HEADER -->
                    <div class="p-6 flex justify-between items-start border-b border-white/5">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Skill Demand Insight</p>

                            <h2 class="text-xl font-bold text-white mt-1">
                                {{ selectedSkillName }}
                            </h2>

                            <p class="text-sm text-slate-400 mt-1">
                                พบ
                                <span class="font-semibold text-sky-400">
                                    {{ selectedJobs.length }}
                                </span>
                                ตำแหน่งงานที่ต้องการ skill นี้
                            </p>
                        </div>

                        <button class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition" @click="showModal = false">✕</button>
                    </div>

                    <!-- JOB LIST -->
                    <div class="flex-1 overflow-y-auto p-5 space-y-3">
                        <div v-for="job in selectedJobs" :key="job.id" class="group p-4 rounded-2xl border border-white/5 hover:border-sky-500/40 hover:bg-white/5 transition-all">
                            <div class="flex gap-4 items-start">
                                <!-- Company Avatar -->
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-sky-400" style="background: rgba(13, 95, 163, 0.25)">
                                    {{ job.company_name?.charAt(0) ?? '?' }}
                                </div>

                                <!-- Job Info -->
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-white truncate">
                                        {{ job.title }}
                                    </p>

                                    <p class="text-sm text-slate-400 mt-0.5">
                                        {{ job.company_name }}
                                    </p>

                                    <!-- Tags -->
                                    <div class="flex flex-wrap gap-2 mt-2">
                                        <span v-if="job.sub_category" class="text-xs px-2 py-0.5 rounded-md" style="background: rgba(76, 175, 80, 0.15); color: #4caf50">
                                            {{ job.sub_category }}
                                        </span>

                                        <span class="text-xs px-2 py-0.5 rounded-md" style="background: rgba(91, 196, 245, 0.15); color: #5bc4f5"> Uses {{ selectedSkillName }} </span>
                                    </div>
                                </div>

                                <!-- Action -->
                                <button class="text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition" style="background: #0d5fa3; color: white">View</button>
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="p-4 border-t border-white/5">
                        <button class="w-full py-2.5 rounded-xl text-sm font-medium text-white transition" style="background: #0d5fa3" @click="goToSearch(selectedSkillName)">
                            ดูตำแหน่งงานทั้งหมดที่ใช้ {{ selectedSkillName }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.97);
}
</style>
