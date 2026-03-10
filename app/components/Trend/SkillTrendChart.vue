<!-- Components/Trend/SkillTrendChart.vue
<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const emit = defineEmits(['skill-click']);
const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    skillIds: { type: Array, required: true },
});

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        background: 'transparent',
        events: {
            dataPointSelection(event, chartContext, config) {
                const skillId = props.skillIds[config.dataPointIndex];
                emit('skill-click', skillId);
            },
        },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '55%', distributed: false } },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.3,
            gradientToColors: ['#4caf50'], // ✅ น้ำเงิน → เขียว ตาม logo
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.75,
        },
    },
    colors: ['#0d5fa3'], // ✅ ICT blue
    dataLabels: { enabled: false },
    xaxis: {
        categories: props.categories,
        labels: { rotate: -35, style: { fontSize: '13px', colors: '#64748b', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '14px', colors: '#94a3b8' } } },
    grid: {
        borderColor: 'rgba(42,127,212,0.1)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
    },
    tooltip: {
        theme: 'dark',
        y: { formatter: (val) => `${val} ตำแหน่ง` },
        style: { fontFamily: 'Sarabun, sans-serif' },
    },
    states: { active: { filter: { type: 'darken', value: 0.7 } } },
}));
</script>

<template>
    <div>
        <div class="mb-6">
            <h3 class="text-xl font-bold text-slate-200">Top {{ categories.length }} Skills ที่ตลาดต้องการ</h3>
            <p class="text-sm text-slate-500 mt-1 uppercase tracking-tighter">อ้างอิงจากข้อมูลประกาศงาน · คลิกที่แท่งเพื่อดูตำแหน่งงาน</p>
        </div>
        <apexchart type="bar" height="340" :options="chartOptions" :series="series" />
    </div>
</template> -->
<!-- SkillTrendChart.vue -->
<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const emit = defineEmits(['skill-click']);
const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    skillIds: { type: Array, required: true },
});

function capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const displayCategories = computed(() => props.categories.map((c) => capitalizeFirst(c)));

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        background: 'transparent',
        events: {
            dataPointSelection(event, chartContext, config) {
                const idx = config.dataPointIndex;
                const skillId = props.skillIds[idx];
                const skillName = props.categories[idx]; // ✅ ส่งชื่อมาด้วย
                emit('skill-click', skillId, skillName);
            },
        },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '55%', distributed: false } },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.3,
            gradientToColors: ['#4caf50'],
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 0.75,
        },
    },
    colors: ['#0d5fa3'],
    dataLabels: { enabled: false },
    xaxis: {
        categories: displayCategories.value,
        labels: { rotate: -35, style: { fontSize: '13px', colors: '#64748b', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '14px', colors: '#94a3b8' } } },
    grid: {
        borderColor: 'rgba(42,127,212,0.1)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
    },
    tooltip: {
        theme: 'dark',
        y: { formatter: (val) => `${val} ตำแหน่ง` },
        style: { fontFamily: 'Sarabun, sans-serif' },
    },
    states: { active: { filter: { type: 'darken', value: 0.7 } } },
}));
</script>

<template>
    <div>
        <div class="mb-6">
            <h3 class="text-xl font-bold text-slate-200">Top {{ categories.length }} Skills ที่ตลาดต้องการ</h3>
            <p class="text-sm text-slate-500 mt-1 uppercase tracking-tighter">อ้างอิงจากข้อมูลประกาศงาน · คลิกที่แท่งเพื่อดูตำแหน่งงาน</p>
        </div>
        <apexchart type="bar" height="340" :options="chartOptions" :series="series" />
    </div>
</template>
