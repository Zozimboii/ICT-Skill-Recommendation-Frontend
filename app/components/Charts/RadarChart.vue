<!-- components/Charts/RadarChart.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Dataset = {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    pointBackgroundColor?: string;
};

const props = defineProps<{ labels: string[]; datasets: Dataset[] }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const PALETTE = [
    { border: '#2a9fd6', bg: 'rgba(42,159,214,0.15)', point: '#2a9fd6' },
    { border: '#4caf50', bg: 'rgba(76,175,80,0.12)', point: '#4caf50' },
];

const render = () => {
    if (!canvasRef.value) return;
    if (chart) {
        chart.destroy();
        chart = null;
    }

    chart = new Chart(canvasRef.value, {
        type: 'radar',
        data: {
            labels: props.labels,
            datasets: props.datasets.map((d, i) => ({
                label: d.label,
                data: d.data,
                fill: true,
                borderColor: d.borderColor ?? PALETTE[i % 2]!.border,
                backgroundColor: d.backgroundColor ?? PALETTE[i % 2]!.bg,
                pointBackgroundColor: d.pointBackgroundColor ?? PALETTE[i % 2]!.point,
                pointBorderColor: 'transparent',
                pointRadius: 4,
                pointHoverRadius: 6,
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
                        font: { size: 10 },
                    },
                    grid: {
                        color: 'rgba(42,127,212,0.15)',
                    },
                    angleLines: {
                        color: 'rgba(42,127,212,0.2)',
                    },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { size: 11, weight: 'bold' },
                    },
                },
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { size: 12 },
                        padding: 16,
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
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`,
                    },
                },
            },
        },
    });
};

onMounted(render);
watch(() => [props.labels, props.datasets], render, { deep: true });
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
