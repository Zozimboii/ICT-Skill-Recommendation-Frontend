<script setup lang="ts">
import { ref, computed } from 'vue';
import JobTrendChart from './JobTrendChart.vue';
import InteractiveJobChart from './InteractiveJobChart.vue';

const props = defineProps<{
    jobs: any[];
    skills: any[];
}>();

const selectedJobId = ref<number | null>(null);
const selectedSkillName = ref<string | null>(null);

/* -------------------------
   Computed
--------------------------*/

const filteredJobs = computed(() => {
    if (!selectedSkillName.value) return props.jobs;

    const skill = props.skills.find((s) => s.skill_name === selectedSkillName.value);

    if (!skill) return [];

    return props.jobs.filter((job) => skill.related_job_ids.includes(job.sub_category_id));
});

const displayedSkills = computed(() => {
    if (!selectedJobId.value) {
        // show top 20 skills
        return props.skills.slice(0, 20);
    }

    const job = props.jobs.find((j) => j.sub_category_id === selectedJobId.value);

    return job?.hard_skills ?? [];
});

/* -------------------------
   Events
--------------------------*/

const handleJobClick = (jobId: number) => {
    if (selectedJobId.value === jobId) {
        selectedJobId.value = null;
    } else {
        selectedJobId.value = jobId;
        selectedSkillName.value = null;
    }
};

const handleSkillClick = (skillName: string) => {
    if (selectedSkillName.value === skillName) {
        selectedSkillName.value = null;
    } else {
        selectedSkillName.value = skillName;
        selectedJobId.value = null;
    }
};
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="mb-6 text-lg font-bold text-slate-900">Job Trend & ICT Hard Skills</h2>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- LEFT : Job -->
            <div>
                <h3 class="mb-3 font-semibold text-slate-700">Job Positions</h3>

                <InteractiveJobChart :jobs="filteredJobs" :selectedJobId="selectedJobId" @select="handleJobClick" />
            </div>

            <!-- RIGHT : Hard Skills -->
            <div>
                <h3 class="mb-3 font-semibold text-slate-700">ICT Hard Skills</h3>

                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="skill in displayedSkills"
                        :key="skill.skill_name"
                        @click="handleSkillClick(skill.skill_name)"
                        :class="['rounded-lg border px-3 py-2 text-sm transition', selectedSkillName === skill.skill_name ? 'bg-emerald-500 text-white' : 'bg-slate-50 hover:bg-emerald-50']"
                    >
                        {{ skill.skill_name }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
