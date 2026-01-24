<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Dataset = { label: string; data: number[] };

const props = defineProps<{
    labels: string[];
    datasets: Dataset[];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

const render = () => {
    if (!canvasRef.value) return;
    if (chart) chart.destroy();

    chart = new Chart(canvasRef.value, {
        type: 'radar',
        data: {
            labels: props.labels,
            datasets: props.datasets.map((d) => ({
                label: d.label,
                data: d.data,
                fill: true,
            })),
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { stepSize: 20 },
                },
            },
        },
    });
};

onMounted(render);
watch(() => [props.labels, props.datasets], render, { deep: true });
onBeforeUnmount(() => chart?.destroy());
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <canvas ref="canvasRef" />
    </div>
</template>
