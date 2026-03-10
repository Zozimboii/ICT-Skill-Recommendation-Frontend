<!--components/Trend/InteractiveJobChart.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
    jobs: any[];
    selectedJobId: number | null;
}>();

const emit = defineEmits(['select']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const renderChart = () => {
    if (!canvasRef.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const topJobs = props.jobs
        .slice()
        .sort((a, b) => b.job_count - a.job_count)
        .slice(0, 10);

    chartInstance = new Chart(canvasRef.value, {
        type: 'bar',
        data: {
            labels: topJobs.map((j) => j.sub_category_name),
            datasets: [
                {
                    data: topJobs.map((j) => j.job_count),
                    backgroundColor: topJobs.map((j) => (j.sub_category_id === props.selectedJobId ? '#6366f1' : '#cbd5e1')),
                    borderRadius: 6,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            onClick: (_, elements) => {
                const index = elements?.[0]?.index;
                if (index === undefined) return;

                const job = topJobs[index];
                emit('select', job.sub_category_id);
            },
        },
    });
};

onMounted(renderChart);

watch(
    () => [props.jobs, props.selectedJobId],
    () => renderChart(),
    { deep: true },
);
</script>

<template>
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>
