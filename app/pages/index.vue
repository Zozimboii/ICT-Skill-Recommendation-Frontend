<!-- pages/index.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useTrend } from '@/composables/useTrend';
import JobTrendChart from '@/components/Trend/JobTrendChart.vue';
import SkillTrendChart from '@/components/Trend/SkillTrendChart.vue';
import SkillBlockPanel from '@/components/Trend/SkillBlockPanel.vue';
import SankeyChart from '@/components/Trend/SankeyChart.vue';

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
} = useTrend();

const selectedJobs = ref<any[]>([]);
const showModal = ref(false);
const selectedSkillName = ref('');
const sankeyRef = ref<HTMLElement | null>(null); // ref สำหรับ IntersectionObserver

function capitalizeFirst(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
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

async function onSankeyNodeClick(subCategory: string) {
    await onCategoryClick(subCategory);
}

onMounted(async () => {
    await nextTick(); // รอให้ DOM พร้อมก่อน
    await loadInitial(); // โหลดข้อมูล

    // Sankey lazy load
    await nextTick(); // รอให้ sankeyRef mount
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting && !sankeyLoaded.value) {
                fetchSankeyData(8, 4);
                observer.disconnect();
            }
        },
        { threshold: 0.1 },
    );

    if (sankeyRef.value) {
        observer.observe(sankeyRef.value);
    } else {
        setTimeout(() => fetchSankeyData(8, 4), 800);
    }
});
</script>

<template>
    <div class="space-y-8">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h1 class="text-4xl md:text-5xl font-bold font-mono tracking-tight">
                    <span style="background: linear-gradient(135deg, #2a9fd6 0%, #4caf50 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent"> ICT Skill Trends </span>
                </h1>
                <p class="text-slate-400 text-base mt-1">วิเคราะห์แนวโน้มตลาดงานและทักษะที่นายจ้างต้องการ</p>
            </div>
            <button
                class="flex items-center gap-2 border text-slate-300 hover:text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 group self-start"
                style="background: rgba(13, 95, 163, 0.1); border-color: rgba(42, 127, 212, 0.3)"
                :disabled="loading"
                @click="loadAll"
            >
                <span :class="['text-xl transition-transform duration-500', loading ? 'animate-spin' : 'group-hover:rotate-180']" style="color: #4caf50">↻</span>
                <span class="text-base font-semibold">รีเฟรชข้อมูล</span>
            </button>
        </div>

        <!-- Loading (job + skill trend) -->
        <div v-if="loading && !jobTrend.length" class="flex flex-col items-center justify-center py-32 space-y-4 text-slate-500">
            <div class="w-12 h-12 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
            <p class="text-base font-medium animate-pulse">กำลังดึงข้อมูลล่าสุดจากระบบ...</p>
        </div>

        <div v-else-if="error" class="p-6 rounded-2xl flex items-center gap-4 text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">
            <span class="text-2xl">⚠️</span>
            <p>ไม่สามารถโหลดข้อมูลได้: {{ error }}</p>
        </div>

        <template v-else>
            <ClientOnly>
                <!-- Charts (โหลดแล้ว แสดงทันที) -->
                <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <JobTrendChart v-if="jobTrend.length" :series="jobChartSeries" :categories="jobChartCategories" :selected="selectedCategory ?? undefined" @category-click="onCategoryClick" />
                    </div>
                    <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                        <SkillBlockPanel :skills="skillBlockData" :selectedSkillId="selectedSkillId" :selectedCategory="selectedCategory" @skill-click="handleBlockSkillClick" />
                    </div>
                </section>

                <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <SkillTrendChart :series="skillChartSeries" :categories="skillChartCategories" :skill-ids="skillChartIds" @skill-click="handleSkillClick" />
                </div>

                <!-- Sankey: lazy load เมื่อ scroll ถึง -->
                <div ref="sankeyRef" class="rounded-2xl p-6 min-h-[160px]" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <!-- กำลังโหลด Sankey -->
                    <div v-if="sankeyLoading" class="flex flex-col items-center justify-center py-14 gap-3 text-slate-500">
                        <div class="w-8 h-8 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
                        <p class="text-sm animate-pulse">กำลังโหลด Skill Map...</p>
                    </div>
                    <!-- รอ scroll ถึง -->
                    <div v-else-if="!sankeyLoaded" class="flex flex-col items-center justify-center py-14 gap-2 text-slate-600">
                        <p class="text-3xl">🗺️</p>
                        <p class="text-sm">Skill Map</p>
                    </div>
                    <!-- แสดงผล -->
                    <template v-else>
                        <SankeyChart :links="sankeyLinks" @node-click="onSankeyNodeClick" />
                        <div v-if="selectedCategory || selectedSkillId" class="flex justify-end mt-3">
                            <button class="text-xs px-3 py-1.5 rounded-lg border transition" style="border-color: rgba(76, 175, 80, 0.4); color: #4caf50" @click="clearFilter">Reset Filter</button>
                        </div>
                    </template>
                </div>
            </ClientOnly>
        </template>

        <!-- Modal -->
        <Transition name="fade">
            <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                    class="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl"
                    style="background: #080f1c; border: 1px solid rgba(42, 127, 212, 0.2); box-shadow: 0 25px 60px rgba(13, 95, 163, 0.2)"
                >
                    <div class="flex justify-between items-start p-6 shrink-0" style="border-bottom: 1px solid rgba(42, 127, 212, 0.15)">
                        <div>
                            <p class="text-sm font-semibold uppercase tracking-widest mb-1" style="color: #4caf50">Skill Demand</p>
                            <p class="text-base font-bold text-white mt-0.5">{{ selectedSkillName }}</p>
                            <p class="text-base text-slate-400 mt-1">
                                พบ <span class="font-semibold" style="color: #5bc4f5">{{ selectedJobs.length }} ตำแหน่งงาน</span> ที่ต้องการ skill นี้
                            </p>
                        </div>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" @click="showModal = false">✕</button>
                    </div>
                    <div class="overflow-y-auto flex-1 p-3 space-y-2">
                        <div
                            v-for="job in selectedJobs"
                            :key="job.id"
                            class="flex items-start gap-4 p-4 rounded-xl transition-all"
                            style="border: 1px solid rgba(255, 255, 255, 0.05)"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.3)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)')"
                        >
                            <div
                                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                                style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.3); color: #5bc4f5"
                            >
                                {{ job.company_name?.charAt(0) ?? '?' }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-white text-base truncate">{{ job.title }}</p>
                                <p class="text-base text-slate-400 mt-0.5">
                                    <span class="text-slate-300">{{ job.company_name }}</span>
                                    <span class="mx-1.5 text-slate-600">•</span>
                                    <span style="color: #4caf50">{{ job.sub_category }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 shrink-0" style="border-top: 1px solid rgba(42, 127, 212, 0.15)">
                        <button
                            class="w-full py-2.5 rounded-xl text-base font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                            style="border: 1px solid rgba(255, 255, 255, 0.05)"
                            @click="showModal = false"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>
