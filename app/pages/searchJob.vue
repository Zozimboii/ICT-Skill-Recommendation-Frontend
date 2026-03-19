<!-- pages/searchJob.vue -->
<script setup lang="ts">
// useHead({ title: 'Search Job — ICT Skill' });
// const route = useRoute();
// const { jobs, total, page, loading, error, searchMode, keyword, selectedSubCategory, subCategories, totalPages, fetchCategories, searchJobs, prevPage, nextPage, searchMeta } = useJobSearch();

// const hasLoaded = ref(false);
// const fromSkillName = ref('');

// async function doSearch() {
//     fromSkillName.value = '';
//     // trim + lowercase ให้ backend search ได้ทั้งตัวเล็กตัวใหญ่
//     keyword.value = keyword.value.trim().toLowerCase();
//     await searchJobs();
// }

// // suggestion chips: คำที่ search บ่อย
// const suggestions = ['python', 'javascript', 'react', 'java', 'sql', 'network', 'devops', 'docker', 'aws', 'security', 'data analyst', 'frontend', 'backend', 'mobile'];
// // อ่าน query params และ set keyword/mode
// function applyRouteQuery() {
//     const skillId = route.query.skill_id;
//     const skillName = route.query.skill_name ?? route.query.skill;
//     const kw = route.query.keyword; // จาก handleSearchAllJobs ใน index.vue

//     if (kw) {
//         // กรณีมาจาก modal "ค้นหาทั้งหมด"
//         keyword.value = String(kw).toLowerCase();
//         searchMode.value = 'keyword';
//         fromSkillName.value = String(kw);
//     } else if (skillId || skillName) {
//         fromSkillName.value = skillName ? String(skillName) : '';
//         searchMode.value = 'keyword';
//         keyword.value = fromSkillName.value || String(skillId ?? '');
//     }
// }
// onMounted(async () => {
//     await nextTick();
//     await fetchCategories();
//     applyRouteQuery();
//     await searchJobs();
//     hasLoaded.value = true;
// });
// // watch route query เมื่อ navigate มาจาก modal โดยไม่ reload หน้า
// watch(
//     () => route.query,
//     async (q) => {
//         if (q.keyword || q.skill_name || q.skill_id) {
//             applyRouteQuery();
//             await searchJobs();
//         }
//     },
// );

useHead({ title: 'Search Job — ICT Skill' });
const route = useRoute();
const { jobs, total, page, loading, error, searchMode, keyword, selectedSubCategory, subCategories, totalPages, fetchCategories, searchJobs, prevPage, nextPage, searchMeta } = useJobSearch();

const hasLoaded = ref(false);
const fromSkillName = ref('');

async function doSearch() {
    fromSkillName.value = '';
    // trim + lowercase ให้ backend search ได้ทั้งตัวเล็กตัวใหญ่
    keyword.value = keyword.value.trim().toLowerCase();
    await searchJobs();
}

// suggestion chips: คำที่ search บ่อย
const suggestions = ['python', 'javascript', 'react', 'java', 'sql', 'network', 'devops', 'docker', 'aws', 'security', 'data analyst', 'frontend', 'backend', 'mobile'];

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
    await fetchCategories();
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
                <p class="text-base text-slate-300">ข้อมูลอ้างอิงช่วงวันที่ {{ new Date().toLocaleDateString('th-TH') }}</p>
            </div>

            <!-- Search key info -->
            <div class="flex items-start gap-2 px-4 py-3 rounded-xl text-base leading-relaxed" style="background: rgba(13, 95, 163, 0.08); border: 1px solid rgba(42, 127, 212, 0.15); color: #64748b">
                <svg class="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="#5bc4f5" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                    <b class="text-slate-300">พิมพ์คำค้นหา</b> — ค้นจาก <b class="text-slate-400">ชื่องาน</b> และ <b class="text-slate-400">ชื่อบริษัท</b>
                    &nbsp;|&nbsp;
                    <b class="text-slate-300">เลือกจากรายการ</b> — กรองตาม <b class="text-slate-400">สายงาน</b> เช่น Developers, Data Analyst, Networks
                </div>
            </div>

            <!-- Popular tags -->
            <div>
                <p class="text-base text-slate-300 mb-2">ค้นหายอดนิยม</p>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="tag in ['Frontend', 'Backend', 'Data', 'DevOps', 'AI']"
                        :key="tag"
                        class="px-3 py-1.5 rounded-full text-base font-medium transition"
                        style="background: rgba(13, 95, 163, 0.15); color: #5bc4f5; border: 1px solid rgba(42, 127, 212, 0.2)"
                        @click="
                            keyword = tag;
                            searchMode = 'keyword';
                            doSearch();
                        "
                    >
                        {{ tag }}
                    </button>
                </div>
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

            <!-- Keyword -->
            <div v-if="searchMode === 'keyword'" class="space-y-2">
                <div class="flex gap-2">
                    <input
                        v-model="keyword"
                        type="text"
                        placeholder="ค้นหาชื่องาน, บริษัท..."
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
                <!-- แสดงว่า search คำนี้อยู่ + ผลลัพธ์ -->
                <div v-if="keyword && total > 0" class="flex items-center gap-2 flex-wrap">
                    <span class="text-base text-slate-400">ค้นหา:</span>
                    <span class="px-3 py-1 rounded-full text-base font-semibold" style="background: rgba(42, 127, 212, 0.15); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5">
                        {{ keyword }}
                    </span>
                    <span class="text-base text-slate-400">พบ {{ total.toLocaleString() }} งาน</span>
                    <span v-if="searchMeta?.length" class="text-base" style="color: #64748b">
                        · ค้นจาก <span style="color: #5bc4f5">{{ searchMeta.join(', ') }}</span>
                    </span>
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
                    <div class="flex flex-wrap gap-x-4 gap-y-0.5 text-base text-slate-300 mb-3">
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
                        <span v-if="job.experience_level" class="flex items-center gap-1.5">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {{ job.experience_level }}
                        </span>
                        <span v-if="job.posted_date" class="flex items-center gap-1.5" style="color: #94a3b8">
                            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {{
                                (() => {
                                    const d = new Date(job.posted_date);
                                    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
                                    if (diff === 0) return 'วันนี้';
                                    if (diff === 1) return 'เมื่อวาน';
                                    if (diff <= 7) return diff + ' วันที่แล้ว';
                                    if (diff <= 30) return Math.floor(diff / 7) + ' สัปดาห์ที่แล้ว';
                                    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
                                })()
                            }}
                        </span>
                    </div>

                    <!-- Description -->
                    <p v-if="job.description" class="text-base text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {{ job.description }}
                    </p>

                    <!-- Skills -->
                    <div v-if="job.skills?.length" class="flex flex-wrap gap-2 mb-3">
                        <span
                            v-for="skill in job.skills.slice(0, 6)"
                            :key="skill.id"
                            class="px-3 py-1 text-base font-medium rounded-full"
                            :style="
                                skill.skill_type === 'hard_skill'
                                    ? 'border:1px solid rgba(42,159,214,0.35); color:#5bc4f5; background:rgba(13,95,163,0.15);'
                                    : 'border:1px solid rgba(76,175,80,0.3); color:#81c784; background:rgba(76,175,80,0.08);'
                            "
                        >
                            {{ skill.name }}
                        </span>
                        <span v-if="job.skills.length > 6" class="text-base text-slate-500 self-center"> +{{ job.skills.length - 6 }} more </span>
                    </div>

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
                @click="prevPage"
            >
                ← ก่อนหน้า
            </button>
            <p class="text-base text-slate-500">แสดง {{ (page - 1) * 20 + 1 }}–{{ Math.min(page * 20, total) }} จาก {{ total }} งาน</p>
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
