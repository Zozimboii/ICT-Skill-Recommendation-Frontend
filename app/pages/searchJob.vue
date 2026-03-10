<!-- pages/searchJob.vue -->
<script setup lang="ts">
useHead({ title: 'Search Job — ICT Skill' });

const { jobs, total, page, loading, error, searchMode, keyword, selectedSubCategory, subCategories, totalPages, fetchCategories, searchJobs, prevPage, nextPage } = useJobSearch();

onMounted(async () => {
    await nextTick();
    fetchCategories();
    searchJobs();
    // ลบ searchJobs() ออก — ไม่โหลด jobs จนกว่า user จะกดค้นหา
});
</script>

<template>
    <div class="space-y-6">
        <h1 class="text-3xl font-bold text-white">Search Job</h1>

        <!-- Search Panel -->
        <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
            <h2 class="font-bold text-xl text-white mb-0.5">ค้นหาข้อมูลตำแหน่งงาน</h2>
            <p class="text-base text-slate-400 mb-1">เลือกวิธีค้นหาที่ต้องการด้านล่าง</p>
            <p class="text-sm text-slate-500 mb-4">ข้อมูลอ้างอิงช่วงวันที่ {{ new Date().toLocaleDateString('th-TH') }}</p>

            <!-- Mode Toggle -->
            <div class="flex gap-2 mb-5">
                <button
                    v-for="m in [
                        { key: 'keyword', label: '🔍 พิมพ์คำค้นหา' },
                        { key: 'dropdown', label: '📋 เลือกจากรายการ' },
                    ]"
                    :key="m.key"
                    class="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
                    :style="searchMode === m.key ? 'background: rgba(13,95,163,0.2); border-color: rgba(42,159,214,0.4); color: #5bc4f5;' : 'border-color: rgba(255,255,255,0.1); color: #94a3b8;'"
                    @click="searchMode = m.key as any"
                >
                    {{ m.label }}
                </button>
            </div>

            <!-- Keyword Mode -->
            <div v-if="searchMode === 'keyword'" class="flex gap-2">
                <input
                    v-model="keyword"
                    type="text"
                    placeholder="ค้นหาชื่องาน, บริษัท, ทักษะ..."
                    class="flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none text-base transition-all"
                    style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                    @focus="
                        (e) => {
                            if (e.target) (e.target as HTMLInputElement).style.borderColor = 'rgba(42,159,214,0.5)';
                        }
                    "
                    @blur="
                        (e) => {
                            if (e.target) (e.target as HTMLInputElement).style.borderColor = 'rgba(42,127,212,0.2)';
                        }
                    "
                    @keydown.enter="searchJobs()"
                />
                <button
                    :disabled="loading || !keyword.trim()"
                    class="px-6 py-3 text-white rounded-xl font-semibold text-base disabled:opacity-50 transition-all"
                    style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%)"
                    @click="searchJobs()"
                >
                    ค้นหา
                </button>
            </div>

            <!-- Dropdown Mode -->
            <div v-else class="flex gap-3 items-end">
                <div class="flex flex-col gap-1 flex-1">
                    <label class="text-xs font-medium" style="color: #5bc4f5">ประเภทงาน</label>
                    <select
                        v-model="selectedSubCategory"
                        class="w-full px-4 py-3 rounded-xl text-white outline-none text-base"
                        style="background: rgba(8, 18, 36, 0.9); border: 1px solid rgba(42, 127, 212, 0.2)"
                    >
                        <option value="all">-- ทุกประเภท --</option>
                        <option v-for="sub in subCategories" :key="sub" :value="sub">{{ sub }}</option>
                    </select>
                </div>
                <button
                    :disabled="loading"
                    class="px-6 py-3 text-white rounded-xl font-semibold text-base disabled:opacity-50 transition-all"
                    style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%)"
                    @click="searchJobs()"
                >
                    ค้นหา
                </button>
            </div>
        </div>

        <!-- Result Count -->
        <div v-if="!loading && total > 0" class="text-base text-slate-400">
            พบ <span class="text-white font-semibold">{{ total.toLocaleString() }}</span> ตำแหน่งงาน
        </div>

        <!-- Error -->
        <div v-if="error" class="rounded-xl px-5 py-4 text-sm text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">⚠️ {{ error }}</div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-1/4 mb-4" style="background: rgba(42, 127, 212, 0.1)" />
                <div class="h-4 rounded w-full mb-2" style="background: rgba(42, 127, 212, 0.08)" />
                <div class="h-4 rounded w-5/6" style="background: rgba(42, 127, 212, 0.08)" />
            </div>
        </div>

        <!-- Empty state: ยังไม่ได้ search -->
        <div v-else-if="!jobs.length && !error" class="text-center py-20 text-slate-500">
            <p class="text-5xl mb-4">🔍</p>
            <p class="text-lg font-medium text-slate-400">พิมพ์คำค้นหาหรือเลือกประเภทงาน</p>
            <p class="text-base mt-1">แล้วกด <span class="text-white font-semibold">ค้นหา</span> เพื่อดูผลลัพธ์</p>
        </div>

        <!-- Job Cards -->
        <TransitionGroup v-else-if="jobs.length" name="list" tag="div" class="space-y-4">
            <div
                v-for="job in jobs"
                :key="job.id"
                class="rounded-2xl p-6 transition-all duration-200"
                style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)"
                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.35)')"
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.15)')"
            >
                <div class="flex justify-between items-start gap-4 mb-1">
                    <h3 class="font-bold text-lg text-white leading-snug">{{ job.title }}</h3>
                    <span class="text-sm font-medium shrink-0" style="color: #4caf50">{{ job.posted_date }}</span>
                </div>
                <p class="font-semibold text-base mb-2" style="color: #2a9fd6">{{ job.sub_category }}</p>
                <div class="flex flex-wrap gap-x-4 gap-y-1 text-base text-slate-400 mb-3">
                    <span>🏢 {{ job.company_name }}</span>
                    <span>📍 {{ job.location ?? 'Bangkok' }}</span>
                </div>
                <p v-if="job.description" class="text-base text-slate-400 leading-relaxed mb-4 line-clamp-3">{{ job.description }}</p>
                <div v-if="job.skills?.length" class="flex flex-wrap gap-2">
                    <span
                        v-for="skill in job.skills"
                        :key="skill.id"
                        class="px-3 py-1 text-xs font-medium rounded-full transition-colors"
                        :style="
                            skill.skill_type === 'hard_skill'
                                ? 'border: 1px solid rgba(42,159,214,0.35); color: #5bc4f5; background: rgba(13,95,163,0.15);'
                                : 'border: 1px solid rgba(76,175,80,0.3); color: #81c784; background: rgba(76,175,80,0.08);'
                        "
                    >
                        {{ skill.name }}
                    </span>
                </div>
                <a
                    v-if="job.url"
                    :href="job.url"
                    target="_blank"
                    class="inline-flex items-center gap-1 mt-3 text-xs font-medium transition-colors"
                    style="color: #2a9fd6"
                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = '#5bc4f5')"
                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = '#2a9fd6')"
                >
                    ดูตำแหน่งงาน →
                </a>
            </div>
        </TransitionGroup>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 pt-4">
            <button
                :disabled="page === 1 || loading"
                class="px-4 py-2 rounded-xl text-base font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.25)"
                @click="prevPage"
            >
                ← ก่อนหน้า
            </button>
            <span class="text-base text-slate-400">หน้า {{ page }} / {{ totalPages }}</span>
            <button
                :disabled="page === totalPages || loading"
                class="px-4 py-2 rounded-xl text-base font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.25)"
                @click="nextPage"
            >
                ถัดไป →
            </button>
        </div>
    </div>
</template>

<style scoped>
.list-enter-active {
    transition: all 0.3s ease;
}
.list-enter-from {
    opacity: 0;
    transform: translateY(10px);
}
</style>
