<script setup lang="ts">
import type { SkillSearchResponse } from '~/types/SkillSearchResponse';

const props = defineProps<{
    result: SkillSearchResponse;
}>();

const emit = defineEmits<{
    (e: 'quickSearch', skillName: string): void;
}>();

const subcatLabels = computed(() => props.result.top_subcategories?.map((x) => x.sub_category_name) ?? []);
const subcatValues = computed(() => props.result.top_subcategories?.map((x) => x.count) ?? []);

const relatedLabels = computed(() => props.result.related_skills?.map((x) => x.skill_name) ?? []);
const relatedValues = computed(() => props.result.related_skills?.map((x) => x.count) ?? []);
</script>

<template>
    <div class="mt-4 grid gap-6">
        <!-- Summary Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <div class="text-lg font-bold">
                        Skill: <span class="text-slate-900">{{ result.skill_name }}</span>
                    </div>
                    <div class="text-sm text-slate-600">Type: {{ result.skill_type }}</div>
                </div>
                <div class="text-left sm:text-right">
                    <div class="text-3xl font-extrabold">{{ result.job_count }}</div>
                    <div class="text-sm text-slate-600">jobs mention this skill</div>
                </div>
            </div>
        </div>

        <!-- 2 columns: Table + Related -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Top sub-categories -->
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="mb-3 text-base font-bold">Top sub-categories ที่เจอสกิลนี้</div>
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-600">
                                <th class="px-2 py-2 font-semibold">Sub-category</th>
                                <th class="px-2 py-2 font-semibold">Jobs</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in result.top_subcategories" :key="row.sub_category_id" class="border-b border-slate-100">
                                <td class="px-2 py-2">
                                    <div class="font-medium text-slate-900">{{ row.sub_category_name }}</div>
                                    <div class="text-xs text-slate-500">{{ row.main_category_name }}</div>
                                </td>
                                <td class="px-2 py-2 font-bold">{{ row.count }}</td>
                            </tr>

                            <tr v-if="result.top_subcategories.length === 0">
                                <td colspan="2" class="px-2 py-3 text-slate-500">ไม่พบข้อมูล sub-category</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Related skills -->
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="mb-3 text-base font-bold">แนะนำสกิลที่มักเจอร่วมกัน</div>

                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="s in result.related_skills"
                        :key="s.skill_name"
                        @click="emit('quickSearch', s.skill_name)"
                        class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50"
                    >
                        {{ s.skill_name }}
                        <span class="ml-1 text-slate-500">({{ s.count }})</span>
                    </button>

                    <div v-if="result.related_skills.length === 0" class="text-sm text-slate-500">ยังไม่มี related skills</div>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <BarChart title="Top sub-categories ที่พบสกิลนี้" :labels="subcatLabels" :values="subcatValues" />
                <p class="mt-2 text-sm text-slate-600">กราฟนี้แสดง “จำนวนงาน (count)” ที่มีสกิลนี้ แยกตาม sub-category</p>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <BarChart title="สกิลที่มักเจอร่วมกัน (Related skills)" :labels="relatedLabels" :values="relatedValues" />
                <p class="mt-2 text-sm text-slate-600">กราฟนี้แสดง “จำนวนงาน (count)” ที่พบสกิลอื่นร่วมกับสกิลหลัก ใน job เดียวกัน</p>
            </div>
        </div>
    </div>
</template>
