<script setup>
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const props = defineProps({
    series: { type: Array, required: true },
    categories: { type: Array, required: true },
    selected: { type: String, default: null },
});
const emit = defineEmits(['category-click']);

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        toolbar: { show: false },
        fontFamily: 'Sarabun, sans-serif',
        background: 'transparent',
        events: {
            dataPointSelection(event, chartContext, config) {
                emit('category-click', props.categories[config.dataPointIndex]);
            },
        },
        animations: { enabled: true, easing: 'easeinout', speed: 600 },
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '62%', distributed: true } },
    // ✅ ICT blue → green palette
    colors: ['#0d5fa3', '#1570b8', '#1a7fcc', '#2a9fd6', '#35b0e8', '#1a8c3e', '#22a34a', '#2db857', '#4caf50', '#66bb6a', '#0d8c6e', '#10a37f'],
    dataLabels: {
        enabled: true,
        formatter: (val) => `${val} งาน`,
        style: { fontSize: '13px', fontWeight: 600, colors: ['#fff'] },
        offsetX: -8,
    },
    xaxis: {
        categories: props.categories,
        labels: { style: { fontSize: '12px', colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: '12px', colors: '#64748b', fontWeight: 500 }, maxWidth: 300 } },
    grid: { borderColor: 'rgba(42,127,212,0.1)', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
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
        <div class="flex items-start justify-between mb-6">
            <div>
                <h3 class="text-xl font-bold text-slate-200">หมวดหมู่สายงาน ICT</h3>
                <p class="text-sm text-slate-500 mt-1 uppercase tracking-tighter">คลิกที่แท่งเพื่อดูข้อมูลสกิลที่เกี่ยวข้อง</p>
            </div>
            <!-- active indicator -->
            <div v-if="selected" class="text-xs px-2.5 py-1 rounded-full font-medium" style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5">
                {{ selected }}
            </div>
        </div>
        <apexchart type="bar" height="340" :options="chartOptions" :series="series" />
    </div>
</template>
