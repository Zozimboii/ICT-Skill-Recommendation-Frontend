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
            datasets: props.datasets.map((d, index) => {
                const colors = [
                    {
                        border: '#2563eb',
                        bg: 'rgba(37, 99, 235, 0.25)',
                    },
                    {
                        border: '#f97316',
                        bg: 'rgba(249, 115, 22, 0.25)',
                    },
                ];

                return {
                    label: d.label,
                    data: d.data,
                    fill: true,

                    // ✅ สีของเส้น
                    borderColor: colors[index]?.border,

                    // ✅ สีพื้น
                    backgroundColor: colors[index]?.bg,

                    // ✅ จุด
                    pointBackgroundColor: colors[index]?.border,

                    // ความหนา
                    borderWidth: 2,
                };
            }),
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                    },
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
