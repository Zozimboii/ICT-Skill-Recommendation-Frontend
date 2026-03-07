<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    jobList: any[];
    allSkills: any[];
    isLoading: boolean;
    loadError: string | null;
}>();

const selectedJobId = ref<number | null>(null);
const selectedSkillName = ref<string | null>(null);
const jobSearch = ref('');

const selectedJob = computed(() => {
    if (!selectedJobId.value) return null;
    return props.jobList.find((j) => j.sub_category_id === selectedJobId.value) ?? null;
});

const displayedSkills = computed(() => {
    if (selectedJob.value) return selectedJob.value.hard_skills;
    return props.allSkills.slice(0, 20);
});

const filteredJobs = computed(() => {
    let list = props.jobList;
    const q = jobSearch.value.trim().toLowerCase();

    if (q) {
        list = list.filter((j) => j.sub_category_name.toLowerCase().includes(q) || j.main_category_name.toLowerCase().includes(q));
    }

    return list;
});

const isJobHighlighted = (job: any) => {
    if (!selectedSkillName.value) return false;
    const skill = props.allSkills.find((s) => s.skill_name === selectedSkillName.value);
    return skill?.related_job_ids.includes(job.sub_category_id);
};

const selectJob = (job: any) => {
    if (selectedJobId.value === job.sub_category_id) {
        selectedJobId.value = null;
        selectedSkillName.value = null;
    } else {
        selectedJobId.value = job.sub_category_id;
        selectedSkillName.value = null;
    }
};

const selectSkill = (skill: any) => {
    if (selectedSkillName.value === skill.skill_name) {
        selectedSkillName.value = null;
    } else {
        selectedSkillName.value = skill.skill_name;
        selectedJobId.value = null;
    }
};
</script>

<template>
    <div>
        <!-- Loading -->
        <div v-if="props.isLoading" class="py-20 text-center text-slate-500">กำลังโหลดข้อมูล...</div>

        <!-- Error -->
        <div v-else-if="props.loadError" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {{ props.loadError }}
        </div>

        <!-- Main -->
        <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Left: Jobs -->
            <div class="rounded-2xl border bg-white shadow-sm">
                <div class="border-b px-5 py-4">
                    <div class="text-base font-bold text-slate-900">ตำแหน่งงาน ICT</div>
                    <div class="text-xs text-slate-400">{{ filteredJobs.length }} ตำแหน่ง</div>

                    <input v-model="jobSearch" type="text" placeholder="ค้นหา..." class="mt-3 w-full rounded-lg border px-3 py-2 text-sm" />
                </div>

                <div class="max-h-[70vh] overflow-y-auto">
                    <div
                        v-for="job in filteredJobs"
                        :key="job.sub_category_id"
                        @click="selectJob(job)"
                        :class="[
                            'cursor-pointer border-b px-5 py-4 transition',
                            selectedJobId === job.sub_category_id ? 'bg-indigo-50' : isJobHighlighted(job) ? 'bg-emerald-50' : 'hover:bg-slate-50',
                        ]"
                    >
                        <div class="font-semibold text-slate-900">
                            {{ job.sub_category_name }}
                        </div>
                        <div class="text-xs text-slate-400">
                            {{ job.main_category_name }}
                        </div>
                        <div class="mt-1 text-indigo-600 font-bold">
                            {{ job.job_count.toLocaleString() }}
                        </div>
                    </div>

                    <div v-if="!filteredJobs.length" class="py-10 text-center text-sm text-slate-400">ไม่พบข้อมูล</div>
                </div>
            </div>

            <!-- Right: Skills -->
            <div class="rounded-2xl border bg-white shadow-sm">
                <div class="border-b px-5 py-4">
                    <div class="text-base font-bold text-slate-900">Hard Skills</div>
                    <div class="text-xs text-slate-400">{{ displayedSkills.length }} skills</div>
                </div>

                <div class="max-h-[70vh] overflow-y-auto p-5">
                    <div v-if="displayedSkills.length" class="flex flex-wrap gap-2">
                        <button
                            v-for="skill in displayedSkills"
                            :key="skill.skill_name"
                            @click="selectSkill(skill)"
                            :class="[
                                'rounded-lg border px-3 py-2 text-sm font-semibold transition',
                                selectedSkillName === skill.skill_name ? 'bg-emerald-500 text-white' : 'bg-slate-50 hover:bg-indigo-50',
                            ]"
                        >
                            {{ skill.skill_name }}
                            <span class="ml-2 text-xs font-bold">
                                {{ skill.mention_count }}
                            </span>
                        </button>
                    </div>

                    <div v-else class="py-16 text-center text-sm text-slate-400">ไม่มีข้อมูล skill</div>
                </div>
            </div>
        </div>
    </div>
</template>
