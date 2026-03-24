<script setup lang="ts">
import { useTrend } from '@/composables/useTrend';
import JobTrendChart from '@/components/Trend/JobTrendChart.vue';
import SkillTrendChart from '@/components/Trend/SkillTrendChart.vue';
import SkillBlockPanel from '@/components/Trend/SkillBlockPanel.vue';
import SankeyChart from '@/components/Trend/SankeyChart.vue';
import {useJobSearch} from '@/composables/useSearchJob';
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
const {
    fetchDateRange,
    dateRangeDb,
} = useJobSearch();
const selectedJobs = ref<any[]>([]);
const showModal = ref(false);
const selectedSkillName = ref('');
const selectedSkillId2 = ref<number | null>(null);
const sankeyRef = ref<HTMLElement | null>(null);
const router = useRouter();

function capitalizeFirst(str: string) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
async function handleSkillClick(skillId: number, skillName: string) {
    selectedSkillName.value = capitalizeFirst(skillName ?? '');
    selectedSkillId2.value = skillId;
    await fetchJobsBySkill(skillId);
    selectedJobs.value = jobsBySkill.value;
    showModal.value = true;
}
async function handleBlockSkillClick(skillId: number, skillName: string) {
    selectedSkillName.value = capitalizeFirst(skillName ?? '');
    selectedSkillId2.value = skillId;
    onSkillClick(skillId);
    await fetchJobsBySkill(skillId);
    selectedJobs.value = jobsBySkill.value;
}

async function handleSearchAllJobs() {
    if (!selectedSkillName.value) return;

    try {
        await fetchJobsBySkill(selectedSkillId2.value!);

        router.push({
            path: '/searchjob',
            query: {
                keyword: selectedSkillName.value,
            },
        });

        showModal.value = false;
    } catch (error) {
        console.error(error);
    }
}

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

onMounted(async () => {
    fetchDateRange()
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
                    <span class="text-base font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style="background: rgba(42, 127, 212, 0.15); color: #5bc4f5">LIVE DATA</span>
                </div>
                <h1 class="text-6xl font-bold text-white">ICT Skill Trends</h1>
                <p class="text-slate-400 text-lg mt-1">วิเคราะห์ทักษะที่นายจ้างต้องการในตลาดงาน ICT ไทย</p>
                <p class="text-base text-slate-300">
                    ข้อมูลอ้างอิงวันที่
                    <template v-if="dateRangeDb.min_date && dateRangeDb.max_date">
                        {{ new Date(dateRangeDb.min_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }}
                        - {{ new Date(dateRangeDb.max_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }}
                    </template>
                </p>
            </div>
            <button
                class="self-start flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-semibold transition-all"
                style="background: rgba(13, 95, 163, 0.1); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                :disabled="loading"
                @click="loadAll"
            >
                <span :class="loading ? 'animate-spin' : ''">↻</span>
                รีเฟรช
            </button>
        </div>

        <!-- ── How to use hint ── -->
        <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-base" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.12); color: #7dd3fc">
            <svg class="w-5 h-5 shrink-0 mt-0.5" style="color: #5bc4f5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
            <span>
                กดที่แท่งกราฟหรือ skill block เพื่อกรองข้อมูล · กดที่ชื่อ skill ในกราฟด้านล่างเพื่อดูรายชื่องาน ·
                <button v-if="selectedCategory || selectedSkillId" class="underline font-semibold" @click="clearFilter">ล้าง filter</button>
                <span v-else>Scroll ลงเพื่อดู Skill Map</span>
            </span>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loading && !jobTrend.length" class="flex flex-col items-center justify-center py-32 gap-4 text-slate-300">
            <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
            <p class="text-lg animate-pulse">กำลังโหลดข้อมูลตลาดงาน...</p>
        </div>

        <!-- ── Error ── -->
        <div v-else-if="error" class="flex items-center gap-3 p-5 rounded-2xl text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
                <p class="font-semibold">โหลดข้อมูลไม่สำเร็จ</p>
                <p class="text-lg opacity-75 mt-0.5">{{ error }}</p>
            </div>
        </div>

        <template v-else>
            <ClientOnly>
                <!-- ── Section: Skill Map (ขึ้นก่อน) ── -->
                <div class="space-y-2">
                    <h2 class="text-xl font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">Skill Map — ความสัมพันธ์ระหว่าง skill กับสายงาน</h2>
                    <div ref="sankeyRef" class="rounded-2xl p-5 min-h-[160px]" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <div v-if="sankeyLoading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-300">
                            <div class="w-8 h-8 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
                            <p class="text-lg animate-pulse">กำลังโหลด Skill Map...</p>
                        </div>
                        <div v-else-if="!sankeyLoaded" class="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                            <svg class="w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                                <line x1="8" y1="2" x2="8" y2="18" />
                                <line x1="16" y1="6" x2="16" y2="22" />
                            </svg>
                            <p class="text-lg">Skill Map จะโหลดเมื่อ scroll มาถึง</p>
                        </div>
                        <template v-else>
                            <SankeyChart :links="sankeyLinks" @node-click="onSankeyNodeClick" />
                        </template>
                    </div>
                </div>

                <!-- ── Section: Job & Skill trends ── -->
                <div class="space-y-2">
                    <h2 class="text-xl font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">ภาพรวมตลาดงาน</h2>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                            <p class="text-base text-slate-400 mb-3">จำนวนตำแหน่งงาน · คลิกเพื่อดูSkills  · กดงานด้านล่างเพื่อดูตำแหน่งงานที่รับสมัคร</p>
                            <JobTrendChart
                                v-if="jobTrend.length"
                                :series="jobChartSeries"
                                :categories="jobChartCategories"
                                :selected="selectedCategory ?? undefined"
                                :category-jobs="jobsByCategory"
                                @category-click="onCategoryClick"
                                @view-jobs="handleViewJobs"
                            />
                            <div v-if="selectedCategory || selectedSkillId" class="flex justify-end mt-3">
                                <button class="text-base px-3 py-1.5 rounded-lg border transition" style="border-color: rgba(76, 175, 80, 0.4); color: #4caf50" @click="clearFilter">
                                    ล้าง filter
                                </button>
                            </div>
                        </div>

                        <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                            <p class="text-lg text-slate-500 mb-3">Skill ทั้งหมด · คลิกเพื่อดูสายงาน</p>
                            <SkillBlockPanel :skills="skillBlockData" :selectedSkillId="selectedSkillId" :selectedCategory="selectedCategory" @skill-click="handleBlockSkillClick" />
                        </div>
                    </div>
                </div>

                <!-- ── Section: Skill demand chart ── -->
                <div class="space-y-2">
                    <h2 class="text-xl font-bold uppercase tracking-widest" style="color: rgba(148, 163, 184, 0.5)">Skill Demand (Top skills · คลิกที่ชื่อเพื่อดูงาน)</h2>
                    <div class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <SkillTrendChart :series="skillChartSeries" :categories="skillChartCategories" :skill-ids="skillChartIds" @skill-click="handleSkillClick" />
                    </div>
                </div>
            </ClientOnly>
        </template>

        <Transition name="modal">
            <div
                v-if="showModal"
                class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(6px)"
                @click.self="showModal = false"
            >
                <!-- กว้างขึ้น: max-w-2xl -->
                <div
                    class="w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col"
                    style="background: linear-gradient(180deg, #0c1524 0%, #080f1c 100%); border: 1px solid rgba(42, 127, 212, 0.2); box-shadow: 0 -8px 40px rgba(13, 95, 163, 0.2)"
                    :style="{ borderRadius: 'clamp(0px,(100vw - 640px)*9999,20px) clamp(0px,(100vw - 640px)*9999,20px) 0 0' }"
                >
                    <!-- Header -->
                    <div class="px-6 pt-5 pb-4 shrink-0" style="border-bottom: 1px solid rgba(42, 127, 212, 0.12)">
                        <div class="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden" style="background: rgba(148, 163, 184, 0.2)" />
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3 flex-wrap">
                                <span
                                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-bold"
                                    style="background: rgba(42, 127, 212, 0.15); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5"
                                >
                                    <span class="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style="background: #5bc4f5" />
                                    {{ selectedSkillName }}
                                </span>
                                <span class="text-base font-semibold" style="color: #81c784"> {{ selectedJobs.length }} ตำแหน่ง </span>
                            </div>
                            <button
                                class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-base transition-all"
                                style="color: #64748b; border: 1px solid rgba(255, 255, 255, 0.08)"
                                @click="showModal = false"
                                @mouseover="
                                    (e) => {
                                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                        (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                                    }
                                "
                                @mouseleave="
                                    (e) => {
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLElement).style.color = '#64748b';
                                    }
                                "
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <!-- Job list -->
                    <div class="overflow-y-auto flex-1 px-4 py-4 space-y-3">
                        <!-- Empty -->
                        <div v-if="!selectedJobs.length" class="flex flex-col items-center justify-center py-20 gap-3">
                            <svg class="w-12 h-12 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="2" y="7" width="20" height="14" rx="2" />
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                            <p class="text-base text-slate-500">ไม่พบงานที่ต้องการ skill นี้</p>
                        </div>

                        <!-- Job card -->
                        <div
                            v-for="(job, ji) in selectedJobs"
                            :key="job.id"
                            class="group rounded-2xl p-5 transition-all duration-150"
                            style="background: rgba(13, 30, 55, 0.55); border: 1px solid rgba(42, 127, 212, 0.12)"
                            :style="{ animationDelay: Math.min(ji * 0.04, 0.3) + 's' }"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.3)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.12)')"
                        >
                            <!-- Row 1: title + link -->
                            <div class="flex items-start justify-between gap-3 mb-2">
                                <div class="flex-1 min-w-0">
                                    <p class="font-bold text-white text-lg leading-snug">{{ job.title }}</p>
                                </div>
                                <a
                                    v-if="job.url"
                                    :href="job.url"
                                    target="_blank"
                                    rel="noopener"
                                    class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-semibold transition-all opacity-0 group-hover:opacity-100"
                                    style="background: rgba(42, 127, 212, 0.15); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(42,127,212,0.28)')"
                                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(42,127,212,0.15)')"
                                >
                                    ดูงาน
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </a>
                            </div>

                            <!-- Row 2: company + location + sub_category -->
                            <div class="flex items-center gap-2 flex-wrap mb-3">
                                <!-- Company -->
                                <div class="flex items-center gap-1.5 text-base text-slate-300 font-medium">
                                    <svg class="w-4 h-4 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                    </svg>
                                    {{ job.company_name }}
                                </div>
                                <!-- Location -->
                                <template v-if="job.location">
                                    <span class="text-slate-700">·</span>
                                    <div class="flex items-center gap-1 text-base text-slate-400">
                                        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {{ job.location }}
                                    </div>
                                </template>
                                <!-- Sub category -->
                                <template v-if="job.sub_category">
                                    <span class="text-slate-700">·</span>
                                    <span class="text-base font-medium" style="color: #4caf50">{{ job.sub_category }}</span>
                                </template>
                            </div>

                            <!-- Row 3: Description -->
                            <p v-if="job.description" class="text-base leading-relaxed line-clamp-3" style="color: #94a3b8">
                                {{ job.description }}
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="px-4 pb-5 pt-3 shrink-0 flex gap-2" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">
                        <button
                            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold text-white transition-all active:scale-95"
                            style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                            @click="handleSearchAllJobs"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
                        >
                            ดูงานที่ต้องการ {{ selectedSkillName }} ทั้งหมด
                        </button>
                        <button
                            class="px-4 py-3 rounded-xl text-base font-semibold transition-all"
                            style="border: 1px solid rgba(255, 255, 255, 0.1); color: #64748b"
                            @click="showModal = false"
                            @mouseover="
                                (e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                                }
                            "
                            @mouseleave="
                                (e) => {
                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLElement).style.color = '#64748b';
                                }
                            "
                        >
                            ปิด
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
