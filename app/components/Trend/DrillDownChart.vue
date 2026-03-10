<!--components/Trend/DrillDownChart.vue -->
<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    title: { type: String, default: 'Drill-down' },
});

defineEmits(['close']);

const chartOptions = computed(() => ({
    chart: {
        type: 'radar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        animations: { enabled: true, easing: 'easeinout', speed: 500 },
        background: 'transparent',
    },
    colors: ['#a78bfa'],
    fill: {
        opacity: 0.2,
        type: 'solid',
    },
    stroke: {
        width: 2,
        colors: ['#a78bfa'],
        dashArray: 0,
    },
    markers: {
        size: 4,
        colors: ['#a78bfa'],
        strokeColors: '#0a0f1e',
        strokeWidth: 2,
        hover: { size: 6 },
    },
    xaxis: {
        categories: props.categories,
        labels: {
            style: {
                fontSize: '11px',
                colors: '#94a3b8',
                fontWeight: 600,
            },
        },
    },
    yaxis: {
        show: false,
        tickAmount: 4,
    },
    grid: { show: false },
    tooltip: {
        theme: 'dark',
        y: { formatter: (val) => `${val} ตำแหน่ง` },
    },
    plotOptions: {
        radar: {
            polygons: {
                strokeColors: '#1e293b',
                fill: {
                    colors: ['#0f172a', '#1e293b'],
                },
            },
        },
    },
}));
</script>
<template>
    <transition
        enter-active-class="transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        enter-from-class="opacity-0 translate-y-6"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="series.length && categories.length" class="bg-[#0a0f1e] border border-indigo-500/30 rounded-[18px] p-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3">
                    <span class="text-[11px] font-bold tracking-wider bg-indigo-900/50 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase"> 🔍 Drill-down </span>
                    <h3 class="text-base font-bold text-slate-200">{{ title }}</h3>
                </div>

                <button
                    @click="$emit('close')"
                    class="text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-slate-600"
                >
                    <span>✕</span> ล้างตัวกรอง
                </button>
            </div>

            <div class="w-full min-h-[320px]">
                <apexchart type="radar" height="320" :options="chartOptions" :series="series" />
            </div>

            <div class="absolute -right-20 -bottom-20 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        </div>
    </transition>
</template>
