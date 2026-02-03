<script setup lang="ts">
import type { SearchJobsResult } from '~/types/SearchJobsResult';

const { search } = useSearchJob();

const result = ref<SearchJobsResult | null>(null);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchAllJobCounts = async () => {
    const q = searchQuery.value.trim();
    if (!q) {
        result.value = null;
        return;
    }

    isLoading.value = true;
    error.value = null;

    try {
        const res = await search(q);
        console.log('API Response:', res);
        result.value = res;
    } catch (err: any) {
        error.value = err?.data?.detail || (err?.message ? `Failed to fetch job counts: ${err.message}` : 'Failed to fetch job counts');
        console.error('Error fetching job counts:', err);
    } finally {
        isLoading.value = false;
    }
};

const handleSearch = () => {
    if (searchQuery.value.trim()) fetchAllJobCounts();
    else result.value = null;
};
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
            <div>
                <div class="text-base font-bold text-slate-900">Search Job Count by Sub-Category</div>
                <div class="mt-1 text-sm text-slate-600">พิมพ์ชื่อ sub-category เพื่อดูจำนวนงาน + หมวดที่เกี่ยวข้อง</div>
            </div>
        </div>

        <!-- Search -->
        <div class="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="Search sub-category name..."
                class="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                @input="handleSearch"
            />
            <button
                @click="fetchAllJobCounts"
                :disabled="isLoading || !searchQuery.trim()"
                class="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
                {{ isLoading ? 'Loading…' : 'Refresh' }}
            </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Loading job counts...</div>

        <!-- Error -->
        <div v-else-if="error" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ error }}
            <button @click="fetchAllJobCounts" class="ml-2 underline decoration-red-300 underline-offset-2 hover:opacity-80">Retry</button>
        </div>

        <!-- Result -->
        <div v-else-if="result" class="mt-4 space-y-6">
            <!-- Summary -->
            <div class="rounded-2xl border border-slate-200 bg-white p-4">
                <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <div class="text-lg font-bold text-blue-700">
                            {{ result.sub_category_name }}
                        </div>
                        <div class="text-sm text-slate-600">ID: {{ result.sub_category_id }}</div>
                    </div>

                    <div class="text-left sm:text-right">
                        <div class="text-3xl font-extrabold text-blue-700">{{ result.job_count }}</div>
                        <div class="text-sm text-slate-600">Total Jobs</div>
                    </div>
                </div>
            </div>

            <!-- 2 columns -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <!-- Top Categories -->
                <div v-if="result.top_categories?.length" class="space-y-3">
                    <div class="text-base font-bold text-slate-900">📊 Top Categories</div>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div v-for="cat in result.top_categories" :key="`${cat.main_category_id}-${cat.sub_category_id}`" class="rounded-xl border border-slate-200 bg-white p-4">
                            <div class="font-semibold text-slate-900">{{ cat.main_category_name }}</div>
                            <div class="mt-1 text-sm text-slate-600">{{ cat.sub_category_name }}</div>
                            <div class="mt-3">
                                <span class="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-semibold text-white"> {{ cat.job_count }} jobs </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Related Sub Categories -->
                <div v-if="result.related_sub_categories?.length" class="space-y-3">
                    <div class="text-base font-bold text-slate-900">🔗 Related Sub-Categories</div>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div v-for="rel in result.related_sub_categories" :key="rel.sub_category_id" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div class="font-semibold text-slate-900">{{ rel.sub_category_name }}</div>
                            <div class="mt-3">
                                <span class="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-semibold text-white"> {{ rel.job_count }} jobs </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty -->
        <div v-else class="mt-4 text-sm text-slate-500">เริ่มจากพิมพ์ sub-category แล้วกด Refresh หรือพิมพ์แล้วระบบจะค้นหาให้</div>
    </div>
</template>
