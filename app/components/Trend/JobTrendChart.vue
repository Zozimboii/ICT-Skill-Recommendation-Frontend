<!-- components/Trend/JobTrendChart.vue — with "ดูงาน" per category + job panel -->
<!-- <script setup>
import { computed, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    selected: { type: String, default: null },
    // รับ job list แต่ละ category (optional — ถ้าไม่ส่งมาจะ fetch เอง)
    categoryJobs: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['category-click', 'view-jobs']);

// ── State สำหรับ job panel ──────────────────────────────
const panelOpen = ref(false);
const panelCategory = ref('');
const panelJobs = ref([]);
const panelLoading = ref(false);
const router = useRouter();

async function openJobPanel(category) {
    panelCategory.value = category;
    panelOpen.value = true;
    // emit ให้ parent fetch jobs แล้วส่งกลับมา
    // หรือถ้า categoryJobs มีข้อมูลแล้วใช้เลย
    if (props.categoryJobs[category]) {
        panelJobs.value = props.categoryJobs[category];
    } else {
        panelLoading.value = true;
        panelJobs.value = [];
        emit('view-jobs', category, (jobs) => {
            panelJobs.value = jobs;
            panelLoading.value = false;
        });
    }
}
function handleSearchByCategory() {
    if (!panelCategory.value) return;

    router.push({
        path: '/searchjob',
        query: {
            category: panelCategory.value,
        },
    });

    panelOpen.value = false;
}
// ── Chart config ────────────────────────────────────────
const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        background: 'transparent',
        events: {
            dataPointSelection(event, chartContext, config) {
                const cat = props.categories[config.dataPointIndex];
                emit('category-click', cat);
            },
        },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '62%', distributed: true } },
    colors: ['#0d5fa3', '#1570b8', '#1a7fcc', '#2a9fd6', '#35b0e8', '#1a8c3e', '#22a34a', '#2db857', '#4caf50', '#66bb6a', '#0d8c6e', '#10a37f'],
    dataLabels: {
        enabled: true,
        formatter: (val) => `${val} งาน`,
        style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] },
        offsetX: -8,
    },
    xaxis: {
        categories: props.categories,
        labels: { style: { fontSize: '13px', colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: {
            style: { fontSize: '14px', colors: '#64748b', fontWeight: 500 },
            maxWidth: 220,
        },
    },
    grid: {
        borderColor: 'rgba(42,127,212,0.1)',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
    },
    tooltip: {
        theme: 'dark',
        y: { formatter: (val) => `${val} ตำแหน่ง` },
        style: { fontFamily: 'Sarabun, sans-serif' },
    },
    legend: { show: false },
    states: { active: { filter: { type: 'darken', value: 0.7 } } },
}));
</script> -->
<script setup>
import { computed, ref } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    selected: { type: String, default: null },
    categoryJobs: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['category-click', 'view-jobs']);

const panelOpen = ref(false);
const panelCategory = ref('');
const panelJobs = ref([]);
const panelLoading = ref(false);
const router = useRouter();

async function openJobPanel(category) {
    panelCategory.value = category;
    panelOpen.value = true;

    if (props.categoryJobs[category]) {
        panelJobs.value = props.categoryJobs[category];
    } else {
        panelLoading.value = true;
        panelJobs.value = [];
        emit('view-jobs', category, (jobs) => {
            panelJobs.value = jobs;
            panelLoading.value = false;
        });
    }
}

function handleSearchByCategory() {
    if (!panelCategory.value) return;
    panelOpen.value = false;
    router.push({
        path: '/searchjob',
        query: { category: panelCategory.value },
    });
}

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        background: 'transparent',
        events: {
            dataPointSelection(event, chartContext, config) {
                const cat = props.categories[config.dataPointIndex];
                emit('category-click', cat);
            },
        },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '62%', distributed: true } },
    colors: ['#0d5fa3', '#1570b8', '#1a7fcc', '#2a9fd6', '#35b0e8', '#1a8c3e', '#22a34a', '#2db857', '#4caf50', '#66bb6a', '#0d8c6e', '#10a37f'],
    dataLabels: {
        enabled: true,
        formatter: (val) => `${val} งาน`,
        style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] },
        offsetX: -8,
    },
    xaxis: {
        categories: props.categories,
        labels: { style: { fontSize: '13px', colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        labels: {
            style: { fontSize: '14px', colors: '#64748b', fontWeight: 500 },
            maxWidth: 220,
        },
    },
    grid: {
        borderColor: 'rgba(42,127,212,0.1)',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
    },
    tooltip: {
        theme: 'dark',
        y: { formatter: (val) => `${val} ตำแหน่ง` },
        style: { fontFamily: 'Sarabun, sans-serif' },
    },
    legend: { show: false },
    states: { active: { filter: { type: 'darken', value: 0.7 } } },
}));
</script>
<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-xl font-bold text-slate-200">สายงาน ICT</h3>
            </div>
            <div v-if="selected" class="text-sm px-2.5 py-1 rounded-full font-medium shrink-0" style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5">
                {{ selected }}
            </div>
        </div>

        <!-- Chart -->
        <apexchart type="bar" height="310" :options="chartOptions" :series="series" />

        <!-- Per-category "ดูงาน" buttons -->
        <div class="mt-3 flex flex-wrap gap-1.5">
            <button
                v-for="(cat, idx) in categories"
                :key="cat"
                class="text-sm px-2.5 py-1 rounded-lg font-medium transition-all"
                :style="
                    selected === cat
                        ? 'background:rgba(13,95,163,0.25); border:1px solid rgba(42,159,214,0.4); color:#5bc4f5'
                        : 'background:rgba(13,95,163,0.06); border:1px solid rgba(42,127,212,0.15); color:#64748b'
                "
                @click.stop="openJobPanel(cat)"
                @mouseover="(e) => (e.currentTarget.style.color = '#94a3b8')"
                @mouseleave="(e) => (e.currentTarget.style.color = selected === cat ? '#5bc4f5' : '#64748b')"
            >
                {{ cat }} →
            </button>
        </div>

        <!-- ── Job Panel (slide-over) ── -->
        <Teleport to="body">
            <Transition name="panel">
                <div v-if="panelOpen" class="fixed inset-0 z-50 flex justify-end">
                    <!-- Backdrop -->
                    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="panelOpen = false" />

                    <!-- Panel -->
                    <div class="relative flex flex-col w-full max-w-md h-full shadow-2xl" style="background: #080f1c; border-left: 1px solid rgba(42, 127, 212, 0.2)">
                        <!-- Panel header -->
                        <div class="flex items-center justify-between px-5 py-4 shrink-0" style="border-bottom: 1px solid rgba(42, 127, 212, 0.12)">
                            <div>
                                <p class="text-sm font-bold uppercase tracking-widest mb-0.5" style="color: #4caf50">สายงาน</p>
                                <p class="font-bold text-white text-lg">{{ panelCategory }}</p>
                                <p v-if="!panelLoading" class="text-sm text-slate-500 mt-0.5">{{ panelJobs.length }} ตำแหน่งงาน</p>
                            </div>
                            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition" @click="panelOpen = false">✕</button>
                        </div>

                        <!-- Loading -->
                        <div v-if="panelLoading" class="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <div class="w-8 h-8 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
                            <p class="text-base">กำลังโหลดงาน...</p>
                        </div>

                        <!-- Job list -->
                        <div v-else class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                            <div v-if="!panelJobs.length" class="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                                <p class="text-4xl">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        class="lucide lucide-file-text-icon lucide-file-text"
                                    >
                                        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                                        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                        <path d="M10 9H8" />
                                        <path d="M16 13H8" />
                                        <path d="M16 17H8" />
                                    </svg>
                                </p>
                                <p class="text-base">ไม่พบข้อมูลงาน</p>
                            </div>
                            <div
                                v-for="job in panelJobs"
                                :key="job.id"
                                class="flex items-start gap-3 p-3.5 rounded-xl transition-all"
                                style="border: 1px solid rgba(255, 255, 255, 0.05)"
                                @mouseover="(e) => (e.currentTarget.style.borderColor = 'rgba(42,159,214,0.3)')"
                                @mouseleave="(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')"
                            >
                                <!-- Company initial -->
                                <div
                                    class="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                                    style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.3); color: #5bc4f5"
                                >
                                    {{ job.company_name?.charAt(0) ?? '?' }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-white text-base truncate">{{ job.title }}</p>
                                    <p class="text-sm text-slate-400 mt-0.5">{{ job.company_name }}</p>
                                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span v-if="job.location" class="text-sm text-slate-500"> {{ job.location }}</span>
                                        <span v-if="job.skills?.length" class="text-sm text-slate-600">
                                            {{
                                                job.skills
                                                    .slice(0, 3)
                                                    .map((s) => s.name)
                                                    .join(' · ')
                                            }}
                                        </span>
                                    </div>
                                </div>
                                <a
                                    v-if="job.url"
                                    :href="job.url"
                                    target="_blank"
                                    class="shrink-0 text-sm px-2 py-1 rounded-lg transition-all font-medium"
                                    style="background: rgba(42, 127, 212, 0.12); border: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5"
                                    @mouseover="(e) => (e.currentTarget.style.background = 'rgba(42,127,212,0.25)')"
                                    @mouseleave="(e) => (e.currentTarget.style.background = 'rgba(42,127,212,0.12)')"
                                    >↗</a
                                >
                            </div>
                        </div>

                        <!-- Panel footer -->
                        <div class="px-4 py-3 shrink-0" style="border-top: 1px solid rgba(42, 127, 212, 0.12)">
                            <button
                                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-base font-semibold text-white transition-all active:scale-95"
                                style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                                @click="handleSearchByCategory"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m21 21-4.34-4.34" />
                                    <circle cx="11" cy="11" r="8" />
                                </svg>
                                ดูตำแหน่งงาน {{ panelCategory }} ทั้งหมด
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
    transition:
        opacity 0.25s,
        transform 0.25s;
}
.panel-enter-from,
.panel-leave-to {
    opacity: 0;
}
.panel-enter-from > div:last-child {
    transform: translateX(100%);
}
.panel-leave-to > div:last-child {
    transform: translateX(100%);
}
</style>
