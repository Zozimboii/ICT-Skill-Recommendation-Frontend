<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useTrend } from '~/composables/useTrend';

const loadingTrend = ref(false);
const trendError = ref<string | null>(null);
const selectedDays = ref(60);
const dateInterval = 7;

const skillSeries = ref<any[]>([]);
const categorySeries = ref<any[]>([]);
const { getSkillsTrend, getCategoryTrend } = useTrend();

const filteredDates = (data: any[]) => {
    const allDates = [...new Set(data.map((i) => i.snapshot_date.split(' ')[0]))].sort();
    return allDates.filter((_, index) => index % dateInterval === 0);
};
const skillLabels = computed(() => {
    const totals: Record<string, number> = {};

    for (const row of skillSeries.value) {
        totals[row.skill_name] = (totals[row.skill_name] || 0) + row.count;
    }

    return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name);
});

const skillChartOptions = computed(() => ({
    chart: {
        type: 'area',
        fontFamily: 'Kanit, sans-serif',
        toolbar: {
            show: true,
            tools: {
                download: true,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
            },
        },
    } as const,

    stroke: {
        curve: 'smooth',
        width: 3,
    } as const,

    dataLabels: {
        enabled: true,
        formatter: function (val: any, opts: any) {
            const seriesIndex = opts.seriesIndex;
            const dataIndex = opts.dataPointIndex;

            const seriesData = opts.w.config.series[seriesIndex].data;

            if (dataIndex === seriesData.length - 1) {
                return opts.w.config.series[seriesIndex].name;
            }

            return '';
        },
        style: {
            fontSize: '14px',
        },
    } as const,

    xaxis: {
        categories: filteredDates(skillSeries.value),
        title: { text: 'Date' },
    } as const,

    title: {
        text: 'Top Skill Trend (Area)',
        align: 'left',
    } as const,
    legend: {
        position: 'top',
        fontSize: '18px',
    } as const,
}));

const skillChartSeries = computed(() => {
    const dates = filteredDates(skillSeries.value);

    const topSkills = skillLabels.value.slice(0, 5);

    return topSkills.map((skill) => ({
        name: skill,
        data: dates.map((date) => {
            const found = skillSeries.value.find((i) => i.skill_name === skill && i.snapshot_date.startsWith(date));

            return found ? found.count : 0;
        }),
    }));
});

const categoryLabels = computed(() => {
    const totals: Record<string, number> = {};

    for (const row of categorySeries.value) {
        totals[row.sub_category_name] = (totals[row.sub_category_name] || 0) + row.job_count;
    }

    return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name]) => name);
});

const categoryChartOptions = computed(() => ({
    chart: {
        id: 'category-bar',
        type: 'bar',
        fontFamily: 'Kanit, sans-serif',
        toolbar: {
            show: true,
            tools: {
                download: true,
                zoom: false,
                zoomin: false,
                zoomout: false,
                pan: false,
                reset: false,
            },
        },
    } as const,

    plotOptions: {
        bar: {
            horizontal: true,
            borderRadius: 8,
        },
    } as const,

    xaxis: {
        categories: categoryLabels.value,
        title: { text: 'จำนวนงานทั้งหมด' },
    } as const,

    yaxis: {
        title: { text: 'สายงาน (Sub Category)' },
    } as const,

    title: {
        text: 'สายงานที่กำลังมาแรง (Sub Category Ranking)',
        align: 'left',
        style: { fontSize: '20px' },
    } as const,
}));

const categoryChartSeries = computed(() => {
    const totals: Record<string, number> = {};

    for (const row of categorySeries.value) {
        totals[row.sub_category_name] = (totals[row.sub_category_name] || 0) + row.job_count;
    }

    const sorted = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    return [
        {
            name: 'Job Demand',
            data: sorted.map(([_, count]) => count),
        },
    ];
});

async function fetchAllTrends(days = 60) {
    trendError.value = null;
    loadingTrend.value = true;
    try {
        const [resSkills, resCats] = await Promise.all([getSkillsTrend(days), getCategoryTrend(days)]);
        skillSeries.value = resSkills?.series ?? [];
        categorySeries.value = resCats?.series ?? [];
    } catch (e: any) {
        trendError.value = 'Error fetching data';
    } finally {
        loadingTrend.value = false;
    }
}

onMounted(() => fetchAllTrends(selectedDays.value));
</script>

<template>
    <div class="min-h-screen py-10 px-6">
        <div class="max-w-[1600px] mx-auto space-y-10">
            <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 class="text-3xl font-black text-slate-800">Skill Trends</h1>
                <div class="flex items-center gap-4">
                    <span class="text-slate-500 font-medium">มุมมองข้อมูล:</span>
                    <select
                        v-model="selectedDays"
                        @change="fetchAllTrends(selectedDays)"
                        class="bg-indigo-50 border-none rounded-xl px-4 py-2 font-bold text-indigo-700 outline-none ring-2 ring-indigo-500/20"
                    >
                        <option :value="30">1 เดือน</option>
                        <option :value="60">2 เดือน</option>
                        <option :value="365">1 ปี</option>
                    </select>
                </div>
            </div>

            <div v-if="loadingTrend" class="py-40 text-center font-bold text-slate-400 text-xl animate-pulse">กำลังจัดระเบียบข้อมูลเทรนด์...</div>

            <template v-else>
                <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <VueApexCharts width="100%" height="700" :options="skillChartOptions" :series="skillChartSeries" />
                </div>

                <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                    <VueApexCharts width="100%" height="500" :options="categoryChartOptions" :series="categoryChartSeries" />
                </div>
            </template>
        </div>
    </div>
</template>
