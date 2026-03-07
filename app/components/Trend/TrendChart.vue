<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, type ActiveElement } from 'chart.js';
import { useJob } from '~/composables/useJob';

import SkillJobsModal from './SkillJobsModal.vue';
import type { SkillTrendItem } from '~/types/Trend';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
    skills: SkillTrendItem[];
    jobs: any[];
    // jobPosts: any[];
}>();
const { getJobs } = useJob();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const selectedSkill = ref<string | null>(null);
const relatedJobs = ref<any[]>([]);
const modalVisible = ref(false);

const handleBarClick = async (index: number) => {
    const skill = props.skills.slice(0, 10)[index];
    if (!skill) return;

    selectedSkill.value = skill.skill_name;
    modalVisible.value = true;

    try {
        relatedJobs.value = await getJobs({
            skill_name: skill.skill_name,
        });
    } catch (e) {
        console.error('โหลด job ไม่สำเร็จ', e);
        relatedJobs.value = [];
    }
};

const renderChart = () => {
    if (!canvasRef.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const topSkills = props.skills.slice(0, 10);

    chartInstance = new Chart(canvasRef.value, {
        type: 'bar',
        data: {
            labels: topSkills.map((s) => s.skill_name),
            datasets: [
                {
                    label: 'Mention Count',
                    data: topSkills.map((s) => s.count),
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
            },
            onClick: (_, elements) => {
                const index = elements?.[0]?.index;
                if (index === undefined) return;

                handleBarClick(index);
            },
        },
    });
};

onMounted(renderChart);

watch(
    () => props.skills,
    () => renderChart(),
    { deep: true },
);
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mb-4 text-base font-bold text-slate-900">Top 10 Hard Skills</h2>

        <canvas ref="canvasRef"></canvas>

        <SkillJobsModal :visible="modalVisible" :skillName="selectedSkill || ''" :jobs="relatedJobs" @close="modalVisible = false" />
    </div>
</template>
