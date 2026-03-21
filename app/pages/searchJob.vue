<!-- pages/searchJob.vue -->
<script setup lang="ts">
useHead({ title: 'Search Job — ICT Skill' });
const route = useRoute();
const {
    jobs,
    total,
    page,
    loading,
    error,
    searchMode,
    keyword,
    selectedSubCategory,
    subCategories,
    totalPages,
    fetchCategories,
    fetchDateRange,
    searchJobs,
    prevPage,
    nextPage,
    searchMeta,
    dateRangeDb,
    searchBy,
} = useJobSearch();

const hasLoaded = ref(false);
const expandedSkills = ref<Set<number>>(new Set());
const toggleSkills = (id: number) => {
    if (expandedSkills.value.has(id)) expandedSkills.value.delete(id);
    else expandedSkills.value.add(id);
    expandedSkills.value = new Set(expandedSkills.value); // trigger reactivity
};
const fromSkillName = ref('');

async function doSearch() {
    fromSkillName.value = '';
    // trim + lowercase ให้ backend search ได้ทั้งตัวเล็กตัวใหญ่
    keyword.value = keyword.value.trim().toLowerCase();
    await searchJobs();
}

const handlePrevPage = async () => {
    await prevPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleNextPage = async () => {
    await nextPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// อ่าน query params และ set keyword/mode
function applyRouteQuery() {
    const skillId = route.query.skill_id;
    const skillName = route.query.skill_name ?? route.query.skill;
    const kw = route.query.keyword; // จาก handleSearchAllJobs ใน index.vue
    const cat = route.query.category; // จาก handleSearchByCategory ใน JobTrendChart

    if (cat) {
        // กรณีมาจาก panel "ค้นหาทั้งหมด" ตามสายงาน
        selectedSubCategory.value = String(cat);
        searchMode.value = 'dropdown';
        fromSkillName.value = '';
        keyword.value = '';
    } else if (kw) {
        // กรณีมาจาก modal skill "ค้นหาทั้งหมด"
        keyword.value = String(kw).toLowerCase();
        searchMode.value = 'keyword';
        fromSkillName.value = String(kw);
    } else if (skillId || skillName) {
        fromSkillName.value = skillName ? String(skillName) : '';
        searchMode.value = 'keyword';
        keyword.value = fromSkillName.value || String(skillId ?? '');
    }
}

onMounted(async () => {
    await nextTick();
    await Promise.all([fetchCategories(), fetchDateRange()]);
    applyRouteQuery();
    await searchJobs();
    hasLoaded.value = true;
});

// watch route query เมื่อ navigate มาจาก panel/modal โดยไม่ reload หน้า
watch(
    () => route.query,
    async (q) => {
        if (q.keyword || q.skill_name || q.skill_id || q.category) {
            applyRouteQuery();
            await searchJobs();
        }
    },
);
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-4xl font-bold text-white">Search Job</h1>
            <p class="text-lg text-slate-400 mt-1">ค้นหาตำแหน่งงาน ICT และดู skills ที่ต้องการ</p>
        </div>

        <!-- Skill banner (มาจาก Trend) -->
        <Transition name="fade">
            <div
                v-if="fromSkillName"
                class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl flex-wrap"
                style="background: rgba(42, 127, 212, 0.08); border: 1px solid rgba(42, 127, 212, 0.25)"
            >
                <div class="flex items-center gap-2.5">
                    <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#5bc4f5" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                        <p class="text-lg font-semibold text-white">
                            งานที่ต้องการ <span style="color: #5bc4f5">{{ fromSkillName }}</span>
                        </p>
                        <p class="text-base text-slate-300 mt-0.5">กำลังแสดงงานที่เกี่ยวข้อง · ค้นหาเพิ่มเติมได้ด้านล่าง</p>
                    </div>
                </div>
                <button
                    class="text-base text-slate-300 hover:text-white transition px-2 py-1 rounded-lg"
                    style="border: 1px solid rgba(255, 255, 255, 0.08)"
                    @click="
                        fromSkillName = '';
                        keyword = '';
                        searchJobs();
                    "
                >
                    ล้าง
                </button>
            </div>
        </Transition>

        <!-- Search Panel -->
        <div class="rounded-2xl p-6 space-y-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
            <div>
                <h2 class="font-bold text-2xl text-white mb-0.5">ค้นหาข้อมูลตำแหน่งงาน</h2>
                <p class="text-base text-slate-400 mb-1">เลือกวิธีค้นหาที่ต้องการด้านล่าง</p>
                <p class="text-base text-slate-300">
                    ข้อมูลอ้างอิงช่วงวันที่
                    <template v-if="dateRangeDb.min_date && dateRangeDb.max_date">
                        {{ new Date(dateRangeDb.min_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }}
                        - {{ new Date(dateRangeDb.max_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) }}
                    </template>
                    <template v-else>{{ new Date().toLocaleDateString('th-TH') }}</template>
                </p>
            </div>

            <!-- Mode Toggle -->
            <div class="flex gap-2">
                <button
                    v-for="m in [
                        { key: 'keyword', label: 'พิมพ์คำค้นหา' },
                        { key: 'dropdown', label: 'เลือกจากรายการ' },
                    ]"
                    :key="m.key"
                    class="px-4 py-2 rounded-full text-base font-semibold border transition-all"
                    :style="searchMode === m.key ? 'background:rgba(13,95,163,0.2); border-color:rgba(42,159,214,0.4); color:#5bc4f5;' : 'border-color:rgba(255,255,255,0.1); color:#94a3b8;'"
                    @click="searchMode = m.key as any"
                >
                    {{ m.label }}
                </button>
            </div>

            <!-- Search by filter -->
            <div v-if="searchMode === 'keyword'" class="flex gap-2">
                <button
                    v-for="opt in [
                        { key: 'all', label: 'ทั้งหมด' },
                        { key: 'title', label: 'ชื่องาน' },
                        { key: 'skill', label: 'Skill' },
                    ]"
                    :key="opt.key"
                    class="px-3 py-1.5 rounded-full text-base font-medium border transition-all"
                    :style="searchBy === opt.key ? 'background:rgba(13,95,163,0.2); border-color:rgba(42,159,214,0.4); color:#5bc4f5' : 'border-color:rgba(255,255,255,0.08); color:#64748b'"
                    @click="searchBy = opt.key as any"
                >
                    {{ opt.label }}
                </button>
            </div>

            <!-- Keyword -->
            <div v-if="searchMode === 'keyword'" class="space-y-2">
                <div class="flex gap-2">
                    <input
                        v-model="keyword"
                        type="text"
                        :placeholder="searchBy === 'skill' ? 'ค้นหาด้วยชื่อ Skill เช่น Python, React...' : 'ค้นหาชื่องาน, บริษัท...'"
                        class="flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none text-lg transition-all"
                        style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.2)"
                        @focus="(e) => ((e.target as HTMLInputElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                        @blur="(e) => ((e.target as HTMLInputElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        @keydown.enter="doSearch()"
                    />
                    <button
                        :disabled="loading"
                        class="px-6 py-3 text-white rounded-xl font-semibold text-base disabled:opacity-50 transition-all"
                        style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                        @click="doSearch()"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>

            <!-- Dropdown -->
            <div v-else class="flex gap-3 items-end">
                <div class="flex flex-col gap-1 flex-1">
                    <label class="text-base font-medium" style="color: #5bc4f5">ประเภทงาน</label>
                    <select
                        v-model="selectedSubCategory"
                        class="w-full px-4 py-3 rounded-xl text-white outline-none text-lg"
                        style="background: rgba(8, 18, 36, 0.9); border: 1px solid rgba(42, 127, 212, 0.2)"
                    >
                        <option value="all">— ทุกประเภท —</option>
                        <option v-for="sub in subCategories" :key="sub" :value="sub">{{ sub }}</option>
                    </select>
                </div>
                <button
                    :disabled="loading"
                    class="px-6 py-3 text-white rounded-xl font-semibold text-base disabled:opacity-50 transition-all"
                    style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                    @click="doSearch()"
                >
                    ค้นหา
                </button>
            </div>
        </div>

        <!-- Result Count -->
        <div v-if="!loading && total > 0" class="text-lg text-slate-400">
            พบ <span class="text-white font-semibold">{{ total.toLocaleString() }}</span> ตำแหน่งงาน
        </div>

        <!-- Error -->
        <div v-if="error" class="rounded-xl px-5 py-4 text-base text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">
            {{ error }}
        </div>

        <!-- Loading overlay (skeleton แต่ไม่ซ่อน cards เดิม) -->
        <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-1/4 mb-4" style="background: rgba(42, 127, 212, 0.1)" />
                <div class="h-4 rounded w-full mb-2" style="background: rgba(42, 127, 212, 0.08)" />
                <div class="h-4 rounded w-5/6" style="background: rgba(42, 127, 212, 0.08)" />
            </div>
        </div>

        <!-- cards + empty: แสดงทันทีเมื่อ !loading -->
        <template v-if="!loading">
            <!-- Empty state (แสดงหลัง hasLoaded เท่านั้น เพื่อไม่ flicker) -->
            <div v-if="hasLoaded && !jobs.length && !error" class="text-center py-20">
                <div class="flex justify-center mb-4">
                    <svg class="w-14 h-14 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                </div>
                <p class="text-xl font-semibold text-white mb-1">
                    <template v-if="searchMode === 'dropdown' && selectedSubCategory !== 'all'"> ไม่มีข้อมูลของสายงาน "{{ selectedSubCategory }}" </template>
                    <template v-else>ไม่พบตำแหน่งงานที่ตรงกัน</template>
                </p>
                <p class="text-base text-slate-500 mb-4">ลองเปลี่ยนคำค้นหาหรือเลือกสายงานอื่น</p>
                <button
                    v-if="searchMode === 'dropdown' && selectedSubCategory !== 'all'"
                    class="px-4 py-2 rounded-xl text-base font-semibold transition"
                    style="background: rgba(13, 95, 163, 0.15); color: #5bc4f5; border: 1px solid rgba(42, 127, 212, 0.25)"
                    @click="
                        selectedSubCategory = 'all';
                        doSearch();
                    "
                >
                    ดูงานทั้งหมด
                </button>
            </div>

            <!-- Job Cards: แสดงเสมอเมื่อมีข้อมูล ไม่สน mode -->
            <div v-else-if="jobs.length" class="space-y-4">
                <div
                    v-for="job in jobs"
                    :key="job.id"
                    class="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                    style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)"
                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.35)')"
                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.15)')"
                >
                    <!-- Title row -->
                    <div class="mb-2">
                        <div class="flex items-start gap-2 flex-wrap mb-1">
                            <h3 class="font-bold text-xl text-white leading-snug flex-1 min-w-0">{{ job.title }}</h3>
                            <span
                                v-if="job.job_type"
                                class="shrink-0 text-base px-2.5 py-0.5 rounded-full"
                                style="background: rgba(42, 127, 212, 0.12); color: #5bc4f5; border: 1px solid rgba(42, 127, 212, 0.2)"
                            >
                                {{ job.job_type }}
                            </span>
                        </div>
                        <span
                            class="inline-block text-base px-2.5 py-0.5 rounded-full font-medium"
                            style="background: rgba(76, 175, 80, 0.12); color: #4caf50; border: 1px solid rgba(76, 175, 80, 0.2)"
                        >
                            {{ job.sub_category ?? '—' }}
                        </span>
                    </div>

                    <!-- Meta -->
                    <div class="flex items-center justify-between gap-2 flex-wrap text-base text-slate-300 mb-3">
                        <div class="flex flex-wrap gap-x-4 gap-y-0.5">
                            <span class="flex items-center gap-1.5">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <rect x="2" y="7" width="20" height="14" rx="2" />
                                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                </svg>
                                {{ job.company_name }}
                            </span>
                            <span class="flex items-center gap-1.5">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {{ job.location ?? 'Bangkok' }}
                            </span>
                            <span v-if="job.posted_date" class="shrink-0 text-base" style="color: #64748b">
                                {{ new Date(job.posted_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                            </span>
                        </div>
                    </div>

                    <!-- Description -->
                    <p v-if="job.description" class="text-base text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {{ job.description }}
                    </p>

                    <!-- Skills แยก Hard / Soft + expand -->
                    <template v-if="job.skills?.length">
                        <div class="space-y-2 mb-3">
                            <!-- Hard Skills -->
                            <div v-if="job.skills.filter((s) => s.skill_type === 'hard_skill').length">
                                <p class="mb-1.5 uppercase font-semibold text-slate-500" style="font-size: 11px; letter-spacing: 0.08em">Hard Skills</p>
                                <div class="flex flex-wrap gap-1.5">
                                    <span
                                        v-for="skill in expandedSkills.has(job.id)
                                            ? job.skills.filter((s) => s.skill_type === 'hard_skill')
                                            : job.skills.filter((s) => s.skill_type === 'hard_skill').slice(0, 5)"
                                        :key="skill.id"
                                        class="px-3 py-1 text-base font-medium rounded-full transition-all"
                                        :style="
                                            keyword && skill.name.toLowerCase().includes(keyword.toLowerCase())
                                                ? 'border:2px solid rgba(42,159,214,0.8); color:#fff; background:rgba(13,95,163,0.4); font-weight:700'
                                                : 'border:1px solid rgba(42,159,214,0.35); color:#5bc4f5; background:rgba(13,95,163,0.15)'
                                        "
                                        >{{ skill.name }}</span
                                    >
                                </div>
                            </div>
                            <!-- Soft Skills -->
                            <div v-if="job.skills.filter((s) => s.skill_type === 'soft_skill').length">
                                <p class="mb-1.5 uppercase font-semibold text-slate-500" style="font-size: 11px; letter-spacing: 0.08em">Soft Skills</p>
                                <div class="flex flex-wrap gap-1.5">
                                    <span
                                        v-for="skill in expandedSkills.has(job.id)
                                            ? job.skills.filter((s) => s.skill_type === 'soft_skill')
                                            : job.skills.filter((s) => s.skill_type === 'soft_skill').slice(0, 3)"
                                        :key="skill.id"
                                        class="px-3 py-1 text-base font-medium rounded-full"
                                        style="border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784; background: rgba(76, 175, 80, 0.08)"
                                        >{{ skill.name }}</span
                                    >
                                </div>
                            </div>
                            <!-- Toggle button — แสดงเฉพาะเมื่อมี skills เกิน threshold -->
                            <button
                                v-if="job.skills.filter((s) => s.skill_type === 'hard_skill').length > 5 || job.skills.filter((s) => s.skill_type === 'soft_skill').length > 3"
                                class="flex items-center gap-1.5 text-base transition-all mt-1"
                                :style="expandedSkills.has(job.id) ? 'color:#64748b' : 'color:#5bc4f5'"
                                @click.stop="toggleSkills(job.id)"
                            >
                                <template v-if="!expandedSkills.has(job.id)">
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                                    ดู skills ทั้งหมด ({{ job.skills.length }})
                                </template>
                                <template v-else>
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                                    ย่อลง
                                </template>
                            </button>
                        </div>
                    </template>

                    <!-- Link -->
                    <a
                        v-if="job.url"
                        :href="job.url"
                        target="_blank"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium mt-1 transition"
                        style="background: #0d5fa3; color: white"
                    >
                        ดูรายละเอียดงาน
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </div>
            </div>
        </template>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 pt-4">
            <button
                :disabled="page === 1 || loading"
                class="px-4 py-2 rounded-xl text-base font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.25)"
                @click="handlePrevPage"
            >
                ← ก่อนหน้า
            </button>

            <p class="text-base text-slate-500">แสดง {{ (page - 1) * 20 + 1 }}–{{ Math.min(page * 20, total) }} จาก {{ total }} งาน</p>

            <button
                :disabled="page === totalPages || loading"
                class="px-4 py-2 rounded-xl text-base font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 127, 212, 0.25)"
                @click="handleNextPage"
            >
                ถัดไป →
            </button>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.2s,
        transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
