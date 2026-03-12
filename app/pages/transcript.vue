<!-- pages/transcript.vue — Redesigned for clarity -->
<script setup lang="ts">
import type { TranscriptDetail, ExtractedSkill, JobRecommendation } from '~/types/transcript';

useHead({ title: 'Transcript — ICT Skill' });

const { uploadTranscript, getTranscript, getExtractedSkills, getRecommendations } = useTranscript();

const file = ref<File | null>(null);
const uploading = ref(false);
const errorMessage = ref<string | null>(null);
const isDragging = ref(false);
const transcript = ref<TranscriptDetail | null>(null);
const skills = ref<ExtractedSkill[]>([]);
const loadingData = ref(false);
const recommendations = ref<JobRecommendation[]>([]);

const hardSkills = computed(() => skills.value.filter((s) => s.skill_type === 'hard_skill'));
const softSkills = computed(() => skills.value.filter((s) => s.skill_type === 'soft_skill'));

const gradeColor = (grade: string) => {
    if (['A', 'B+', 'B'].includes(grade)) return '#4ade80';
    if (['C+', 'C'].includes(grade)) return '#fbbf24';
    if (['D+', 'D'].includes(grade)) return '#fb923c';
    if (grade === 'F') return '#f87171';
    return '#64748b';
};

const loadTranscript = async () => {
    loadingData.value = true;
    transcript.value = await getTranscript();
    skills.value = transcript.value ? await getExtractedSkills() : [];
    recommendations.value = transcript.value ? await getRecommendations() : [];
    loadingData.value = false;
};

onMounted(async () => {
    await nextTick();
    loadTranscript();
});

const fileInput = ref<HTMLInputElement | null>(null);
function handleFileChange(event: Event) {
    file.value = (event.target as HTMLInputElement).files?.[0] ?? null;
}
function handleDrop(event: DragEvent) {
    isDragging.value = false;
    const dropped = event.dataTransfer?.files?.[0];
    if (dropped?.type === 'application/pdf') file.value = dropped;
}
async function handleUpload() {
    if (!file.value) return;
    uploading.value = true;
    errorMessage.value = null;
    try {
        const formData = new FormData();
        formData.append('file', file.value);
        await uploadTranscript(formData);
        file.value = null;
        await loadTranscript();
    } catch (e: any) {
        errorMessage.value = e?.message ?? 'Upload ไม่สำเร็จ';
    } finally {
        uploading.value = false;
    }
}

// Tab for transcript detail view
type DetailTab = 'skills' | 'jobs' | 'courses';
const detailTab = ref<DetailTab>('skills');
</script>

<template>
    <div class="space-y-6">
        <!-- ── Header ── -->
        <div>
            <h1 class="text-3xl font-bold text-white">Transcript</h1>
            <p class="text-sm text-slate-400 mt-1">อัปโหลด Transcript เพื่อให้ระบบ extract ทักษะและแนะนำงาน</p>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loadingData" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-2/3" style="background: rgba(42, 127, 212, 0.1)" />
            </div>
        </div>

        <template v-else>
            <!-- ══════════ มีข้อมูลแล้ว ══════════ -->
            <template v-if="transcript">
                <!-- Profile summary card -->
                <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="h-0.5 w-10 rounded-full mb-4" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                    <div class="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">มหาวิทยาลัย</p>
                            <p class="font-bold text-xl text-white">{{ transcript.university ?? '-' }}</p>
                            <p class="text-slate-400 mt-0.5">{{ transcript.major ?? '-' }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">เกรดเฉลี่ย</p>
                            <p class="text-5xl font-extrabold" style="background: linear-gradient(135deg, #2a9fd6, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
                                {{ transcript.gpa?.toFixed(2) ?? '-' }}
                            </p>
                        </div>
                    </div>
                    <!-- Quick stats -->
                    <div class="grid grid-cols-3 gap-3 mt-4 pt-4" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">
                        <div class="text-center">
                            <p class="text-xl font-bold text-white">{{ hardSkills.length }}</p>
                            <p class="text-xs text-slate-500">Hard Skills</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-bold text-white">{{ softSkills.length }}</p>
                            <p class="text-xs text-slate-500">Soft Skills</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xl font-bold text-white">{{ transcript.courses?.length ?? 0 }}</p>
                            <p class="text-xs text-slate-500">วิชาเรียน</p>
                        </div>
                    </div>
                </div>

                <!-- Detail tabs -->
                <div class="flex gap-1 p-1 rounded-2xl w-fit" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <button
                        v-for="tab in [
                            { key: 'skills', label: '💡 Skills' },
                            { key: 'jobs', label: '💼 งานแนะนำ' },
                            { key: 'courses', label: '📚 วิชาเรียน' },
                        ]"
                        :key="tab.key"
                        class="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        :style="detailTab === tab.key ? 'background:rgba(13,95,163,0.3); color:#5bc4f5; border:1px solid rgba(42,159,214,0.3)' : 'color:#64748b; border:1px solid transparent'"
                        @click="detailTab = tab.key as DetailTab"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Skills tab -->
                <template v-if="detailTab === 'skills'">
                    <div class="space-y-4">
                        <div v-if="hardSkills.length" class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: #5bc4f5">💻 Hard Skills ({{ hardSkills.length }})</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in hardSkills"
                                    :key="s.skill_id"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                    style="background: rgba(13, 95, 163, 0.15); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5"
                                >
                                    {{ s.skill_name }}
                                </span>
                            </div>
                        </div>
                        <div v-if="softSkills.length" class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: #81c784">🤝 Soft Skills ({{ softSkills.length }})</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in softSkills"
                                    :key="s.skill_id"
                                    class="px-3 py-1.5 rounded-full text-xs font-semibold"
                                    style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.28); color: #81c784"
                                >
                                    {{ s.skill_name }}
                                </span>
                            </div>
                        </div>
                        <div v-if="!hardSkills.length && !softSkills.length" class="py-10 text-center text-slate-500 rounded-2xl" style="border: 1px solid rgba(42, 127, 212, 0.1)">
                            ไม่พบ skills จาก Transcript นี้
                        </div>
                    </div>
                </template>

                <!-- Jobs tab -->
                <template v-else-if="detailTab === 'jobs'">
                    <div v-if="recommendations.length" class="space-y-3">
                        <div
                            v-for="rec in recommendations"
                            :key="rec.id"
                            class="flex items-start justify-between gap-4 p-4 rounded-xl transition-all"
                            style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.12)"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.3)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.12)')"
                        >
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-white truncate">{{ rec.title }}</p>
                                <p class="text-sm font-medium mt-0.5" style="color: #2a9fd6">{{ rec.sub_category }}</p>
                                <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span>🏢 {{ rec.company_name }}</span>
                                    <span v-if="rec.location">📍 {{ rec.location }}</span>
                                </div>
                            </div>
                            <div class="shrink-0 relative w-12 h-12">
                                <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0d1f35" stroke-width="3" />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.9"
                                        fill="none"
                                        stroke="url(#mGrad2)"
                                        stroke-width="3"
                                        stroke-dasharray="100"
                                        :stroke-dashoffset="100 - Math.min(rec.skill_match_percent, 100)"
                                        stroke-linecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="mGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stop-color="#0d5fa3" />
                                            <stop offset="100%" stop-color="#4caf50" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color: #5bc4f5"> {{ Math.round(rec.skill_match_percent) }}% </span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="py-10 text-center text-slate-500 rounded-2xl" style="border: 1px solid rgba(42, 127, 212, 0.1)">ยังไม่มีงานแนะนำ</div>
                </template>

                <!-- Courses tab -->
                <template v-else>
                    <div class="rounded-2xl overflow-hidden" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div class="px-5 py-4" style="border-bottom: 1px solid rgba(42, 127, 212, 0.1)">
                            <p class="font-bold text-white text-sm">รายวิชาทั้งหมด ({{ transcript.courses?.length ?? 0 }} วิชา)</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-xs uppercase tracking-widest" style="border-bottom: 1px solid rgba(42, 127, 212, 0.1); color: rgba(148, 163, 184, 0.5)">
                                        <th class="text-left px-5 py-3 font-semibold">รหัสวิชา</th>
                                        <th class="text-left px-3 py-3 font-semibold">ชื่อวิชา</th>
                                        <th class="text-center px-3 py-3 font-semibold">หน่วยกิต</th>
                                        <th class="text-center px-5 py-3 font-semibold">เกรด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="course in transcript.courses"
                                        :key="course.course_code"
                                        style="border-bottom: 1px solid rgba(42, 127, 212, 0.06)"
                                        @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.05)')"
                                        @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                                    >
                                        <td class="px-5 py-3 font-mono text-xs text-slate-500">{{ course.course_code }}</td>
                                        <td class="px-3 py-3 text-slate-300">{{ course.course_name }}</td>
                                        <td class="px-3 py-3 text-center text-slate-500">{{ course.credit }}</td>
                                        <td class="px-5 py-3 text-center font-bold" :style="`color:${gradeColor(course.grade)}`">
                                            {{ course.grade }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>

                <!-- Re-upload link -->
                <div class="text-center pb-2">
                    <button class="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 transition" @click="transcript = null">อัปโหลด Transcript ใหม่</button>
                </div>
            </template>

            <!-- ══════════ ยังไม่มี Transcript ══════════ -->
            <template v-else>
                <!-- Upload steps guide -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                        v-for="step in [
                            { n: 1, icon: '📄', title: 'เลือกไฟล์ PDF', desc: 'ไฟล์ Transcript จากมหาวิทยาลัย' },
                            { n: 2, icon: '⬆️', title: 'อัปโหลด', desc: 'ระบบจะ extract skills อัตโนมัติ' },
                            { n: 3, icon: '🎯', title: 'ดูผลลัพธ์', desc: 'Skills และงานที่แนะนำ' },
                        ]"
                        :key="step.n"
                        class="flex items-center gap-3 p-3.5 rounded-xl"
                        style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)"
                    >
                        <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style="background: rgba(13, 95, 163, 0.25); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.3)"
                        >
                            {{ step.n }}
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-white">{{ step.title }}</p>
                            <p class="text-xs text-slate-500">{{ step.desc }}</p>
                        </div>
                    </div>
                </div>

                <!-- Drop zone -->
                <div
                    class="border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer"
                    :style="isDragging ? 'border-color:#2a9fd6; background:rgba(13,95,163,0.1)' : 'border-color:rgba(42,127,212,0.25); background:rgba(13,95,163,0.03)'"
                    @dragover.prevent="isDragging = true"
                    @dragleave="isDragging = false"
                    @drop.prevent="handleDrop"
                    @click="fileInput?.click()"
                    @mouseover="
                        (e) => {
                            if (!isDragging) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.45)';
                        }
                    "
                    @mouseleave="
                        (e) => {
                            if (!isDragging) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.25)';
                        }
                    "
                >
                    <div class="text-4xl mb-3">📄</div>
                    <p class="font-semibold text-slate-300 mb-1">วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก</p>
                    <p class="text-sm text-slate-500">รองรับเฉพาะไฟล์ PDF</p>
                    <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileChange" />
                </div>

                <!-- Selected file preview -->
                <div v-if="file" class="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">📎</span>
                        <div>
                            <p class="text-sm font-medium text-white">{{ file.name }}</p>
                            <p class="text-xs text-slate-500">{{ (file.size / 1024).toFixed(1) }} KB</p>
                        </div>
                    </div>
                    <button class="text-slate-500 hover:text-red-400 transition text-lg" @click="file = null">✕</button>
                </div>

                <!-- Error -->
                <div
                    v-if="errorMessage"
                    class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400"
                    style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)"
                >
                    ⚠️ {{ errorMessage }}
                </div>

                <!-- Upload button -->
                <button
                    :disabled="!file || uploading"
                    class="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
                    style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                    @click="handleUpload"
                >
                    <span v-if="uploading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        กำลังวิเคราะห์ Transcript...
                    </span>
                    <span v-else>⬆️ อัปโหลด Transcript</span>
                </button>
            </template>
        </template>
    </div>
</template>
