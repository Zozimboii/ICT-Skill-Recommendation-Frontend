<!-- components/Charts/RadarChart.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import type { RadarDataset } from '~/types/Assessment';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = withDefaults(
    defineProps<{
        labels: string[];
        datasets: RadarDataset[];
        labelFontSize?: number; // font รอบ radar
        showLegend?: boolean; // แสดง legend
        compact?: boolean; // compact mode (dashboard radar)
    }>(),
    {
        labelFontSize: 13,
        showLegend: true,
        compact: false,
    },
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const PALETTE: Array<{ border: string; bg: string; point: string }> = [
    { border: '#2a9fd6', bg: 'rgba(42,159,214,0.15)', point: '#2a9fd6' },
    { border: '#4caf50', bg: 'rgba(76,175,80,0.12)', point: '#4caf50' },
];

function render() {
    if (!canvasRef.value) return;
    chart?.destroy();
    chart = null;

    // ตัด label ที่ยาวเกินให้พอดีใน compact mode
    const displayLabels = props.labels.map((l) => (props.compact && l.length > 14 ? l.slice(0, 13) + '…' : l));

    chart = new Chart(canvasRef.value, {
        type: 'radar',
        data: {
            labels: displayLabels,
            datasets: props.datasets.map((d, i) => ({
                label: d.label,
                data: d.data,
                fill: true,
                borderColor: d.borderColor ?? PALETTE[i % 2]!.border,
                backgroundColor: d.backgroundColor ?? PALETTE[i % 2]!.bg,
                pointBackgroundColor: d.pointBackgroundColor ?? PALETTE[i % 2]!.point,
                pointBorderColor: 'transparent',
                pointRadius: props.compact ? 3 : 4,
                pointHoverRadius: props.compact ? 5 : 6,
                borderWidth: 2,
            })),
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        color: 'rgba(148,163,184,0.6)',
                        backdropColor: 'transparent',
                        font: { size: props.compact ? 10 : 13 },
                        // ซ่อน tick numbers ใน compact mode
                        display: !props.compact,
                    },
                    grid: {
                        color: 'rgba(42,127,212,0.15)',
                    },
                    angleLines: {
                        color: 'rgba(42,127,212,0.2)',
                    },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { size: props.labelFontSize, weight: 'bold' as const },
                        // padding รอบ label
                        padding: props.compact ? 4 : 8,
                        callback:(label) => label
                    },
                },
            },
            plugins: {
                legend: {
                    display: props.showLegend,
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: props.compact ? 12 : 14 },
                        padding: props.compact ? 10 : 16,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(6,14,26,0.95)',
                    borderColor: 'rgba(42,127,212,0.3)',
                    borderWidth: 1,
                    titleColor: '#5bc4f5',
                    bodyColor: '#cbd5e1',
                    padding: 10,
                    bodyFont: { size: 13 },
                    titleFont: { size: 13 },
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`,
                    },
                },
            },
        },
    });
}

onMounted(render);
watch(() => [props.labels, props.datasets, props.compact], render, { deep: true });
onBeforeUnmount(() => {
    chart?.destroy();
    chart = null;
});
</script>

<template>
    <div class="relative rounded-2xl p-4" style="background: rgba(6, 14, 26, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
        <canvas ref="canvasRef" />
    </div>
</template>
