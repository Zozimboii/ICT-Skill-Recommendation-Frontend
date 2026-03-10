<!--components/Trend/SkillJobModal.vue -->
<script setup lang="ts">
const props = defineProps<{
    skillName: string;
    jobs: any[];
    visible: boolean;
}>();

const emit = defineEmits(['close']);

const formatDate = (date: string | null) => {
    if (!date) return 'ไม่ระบุวันที่';
    return new Date(date).toLocaleDateString();
};
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <!-- Header -->
            <div class="flex items-center justify-between border-b px-6 py-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-900">💼 Jobs ที่ต้องการ {{ skillName }}</h3>
                    <p class="text-xs text-slate-400">{{ jobs.length }} ตำแหน่ง</p>
                </div>

                <button @click="$emit('close')" class="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100">✕</button>
            </div>

            <!-- Body -->
            <div class="max-h-[70vh] overflow-y-auto p-6 space-y-4">
                <div v-for="job in jobs" :key="job.id || job.sub_category_id" class="rounded-2xl border border-slate-200 p-5 transition hover:shadow-md">
                    <!-- 1️⃣ Job Title -->
                    <div class="text-lg font-bold text-slate-900">
                        {{ job.job_title || job.sub_category_name || 'ไม่ระบุตำแหน่ง' }}
                    </div>

                    <!-- 2️⃣ Company -->
                    <div class="mt-1 text-sm text-slate-600">
                        {{ job.company_name || 'ไม่ระบุบริษัท' }}
                    </div>

                    <!-- 3️⃣ Date + Location -->
                    <div class="mt-1 text-xs text-slate-400 flex gap-3">
                        <span>📅 {{ formatDate(job.posted_date || null) }}</span>
                        <span>📍 {{ job.location || 'ไม่ระบุสถานที่' }}</span>
                    </div>

                    <!-- 4️⃣ Description -->
                    <div class="mt-3 text-sm text-slate-700 line-clamp-3">
                        {{ job.description || 'ไม่มีรายละเอียด' }}
                    </div>

                    <!-- 5️⃣ Skills -->
                    <div class="mt-4 flex flex-wrap gap-2">
                        <span
                            v-for="skill in job.hard_skills || []"
                            :key="skill.skill_name"
                            :class="['rounded-md px-2 py-1 text-xs border', skill.skill_name === skillName ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-700']"
                        >
                            {{ skill.skill_name }}
                        </span>
                    </div>
                </div>

                <div v-if="!jobs.length" class="py-10 text-center text-slate-400">ไม่พบตำแหน่งงาน</div>
            </div>
        </div>
    </div>
</template>
