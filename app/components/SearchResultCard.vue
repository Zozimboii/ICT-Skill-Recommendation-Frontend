<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { JobListItem, SearchMeta } from '~/types/SearchJobs';
import { useSearchJob } from '~/composables/useSearchJob';

const { getAll, getJobOptions, getMeta } = useSearchJob();

const meta = ref<SearchMeta | null>(null);

type SearchMode = 'keyword' | 'dropdown';
const searchMode = ref<SearchMode>('keyword');

const results = ref<JobListItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const searchQuery = ref('');

const dropdownOptions = ref<{ label: string; value: string }[]>([]);
const selectedOption = ref('');
const isLoadingOptions = ref(false);

const loadDropdownOptions = async () => {
    if (dropdownOptions.value.length > 0) return;

    isLoadingOptions.value = true;
    try {
        dropdownOptions.value = await getJobOptions();
    } catch {
        dropdownOptions.value = [];
    } finally {
        isLoadingOptions.value = false;
    }
};

// const switchMode = (mode: SearchMode) => {
//     searchMode.value = mode;
//     results.value = [];
//     error.value = null;

//     if (mode === 'dropdown') {
//         loadDropdownOptions();
//     }
// };

// const switchMode = (mode: SearchMode) => {
//     searchMode.value = mode;
//     error.value = null;

//     if (mode === 'dropdown') {
//         loadDropdownOptions();
//     }
// };
const switchMode = (mode: SearchMode) => {
    searchMode.value = mode;

    results.value = [];
    error.value = null;
    isLoading.value = false;

    searchQuery.value = '';
    selectedOption.value = '';

    if (mode === 'dropdown') {
        dropdownOptions.value = []; // 👈 บังคับ reload
        loadDropdownOptions();
    }
};
const executeSearch = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        if (searchMode.value === 'keyword') {
            results.value = await getAll({ keyword: searchQuery.value });
        } else {
            results.value = await getAll({
                sub_category_id: Number(selectedOption.value),
            });
        }
    } catch (err: any) {
        error.value = 'ค้นหาไม่สำเร็จ';
    } finally {
        isLoading.value = false;
    }
};
const handleKeywordSearch = () => {
    if (!searchQuery.value.trim()) return;
    executeSearch();
};

// const handleDropdownChange = () => {
//     if (!selectedOption.value) return;
//     executeSearch();
// };
const handleDropdownChange = async () => {
    if (!selectedOption.value) return;

    await executeSearch();
};
const retrySearch = () => {
    executeSearch();
};

const currentQueryLabel = computed(() => {
    return searchMode.value === 'keyword' ? searchQuery.value : selectedOption.value;
});
const formattedDateRange = computed(() => {
    if (!meta.value) return '';
    const min = new Date(meta.value.min_snapshot_date);
    const max = new Date(meta.value.max_snapshot_date);
    return `${min.toLocaleDateString('th-TH')} - ${max.toLocaleDateString('th-TH')}`;
});

onMounted(async () => {
    meta.value = await getMeta();
});
watch(selectedOption, (val) => {
    if (searchMode.value === 'dropdown' && val) {
        executeSearch();
    }
});
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <!-- Header -->
        <div class="mb-4">
            <h2 class="text-base font-bold text-slate-900">ค้นหาข้อมูลตำแหน่งงาน</h2>
            <p class="mt-0.5 text-sm text-slate-500">เลือกวิธีค้นหาที่ต้องการด้านล่าง</p>
        </div>
        <div v-if="formattedDateRange" class="mb-4 text-xs text-slate-500">ข้อมูลอ้างอิงช่วงวันที่ {{ formattedDateRange }}</div>
        <!-- Tabs -->
        <div class="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
                @click="switchMode('keyword')"
                :class="[
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
                    searchMode === 'keyword' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                ]"
            >
                🔍 พิมพ์คำค้นหา
            </button>

            <button
                @click="switchMode('dropdown')"
                :class="[
                    'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
                    searchMode === 'dropdown' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                ]"
            >
                📋 เลือกจากรายการ
            </button>
        </div>

        <!-- Keyword Search -->
        <div v-if="searchMode === 'keyword'" class="flex gap-2">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="กรุณาระบุคำที่ต้องการค้นหา เช่น BA, Developer"
                class="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm"
                @keydown.enter="handleKeywordSearch"
            />

            <button @click="handleKeywordSearch" :disabled="isLoading || !searchQuery.trim()" class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {{ isLoading ? 'กำลังค้นหา…' : 'ค้นหา' }}
            </button>
        </div>

        <!-- Dropdown -->
        <div v-if="searchMode === 'dropdown'" class="flex gap-2">
            <select :key="searchMode" v-model="selectedOption" class="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm">
                <option value="" disabled>เลือกชื่อตำแหน่งงาน</option>
                <option v-for="opt in dropdownOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="mt-4 text-sm text-slate-500">กำลังค้นหา "{{ currentQueryLabel }}" ...</div>

        <!-- Error -->
        <div v-else-if="error" class="mt-4 text-sm text-red-600">
            {{ error }}
            <button @click="retrySearch" class="ml-2 underline">ลองอีกครั้ง</button>
        </div>

        <!-- Results -->
        <!-- Results -->
        <div v-else-if="results.length" class="mt-6 space-y-6">
            <div v-for="job in results" :key="job.id" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">
                            {{ job.job_title }}
                        </h3>

                        <p class="text-indigo-600 font-semibold">
                            {{ job.sub_category_name }}
                        </p>

                        <p class="text-sm text-slate-500 mt-1">📍 {{ job.location }}</p>
                    </div>

                    <div class="text-sm text-emerald-600 font-semibold">
                        {{ job.posted_date }}
                    </div>
                </div>

                <p class="mt-4 text-sm text-slate-600 line-clamp-3">
                    {{ job.description }}
                </p>

                <!-- Hard Skills -->
                <div v-if="job.hard_skills?.length" class="mt-4 flex flex-wrap gap-2">
                    <span v-for="skill in job.hard_skills" :key="skill.skill_name" class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {{ skill.skill_name }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!isLoading && !error" class="mt-4 text-sm text-slate-400">กรุณาค้นหาตำแหน่งงานที่ต้องการ</div>
    </div>
</template>
