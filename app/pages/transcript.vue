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
    if (['A', 'B+', 'B'].includes(grade)) return 'text-emerald-400 font-bold';
    if (['C+', 'C'].includes(grade)) return 'text-amber-400 font-semibold';
    if (['D+', 'D'].includes(grade)) return 'text-orange-400';
    if (grade === 'F') return 'text-red-400 font-bold';
    return 'text-slate-400';
};

const loadTranscript = async () => {
    loadingData.value = true;
    transcript.value = await getTranscript();
    skills.value = transcript.value ? await getExtractedSkills() : [];
    recommendations.value = transcript.value ? await getRecommendations() : [];
    loadingData.value = false;
};

onMounted(() => loadTranscript());

const fileInput = ref<HTMLInputElement | null>(null);

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] ?? null;
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
        errorMessage.value = e?.message ?? 'Upload failed';
    } finally {
        uploading.value = false;
    }
}
</script>
<template>
    <div class="space-y-6">
        <h1 class="text-3xl font-bold text-white">Transcript</h1>

        <!-- Loading -->
        <div v-if="loadingData" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-5 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-4 rounded w-2/3" style="background: rgba(42, 127, 212, 0.1)" />
            </div>
        </div>

        <template v-else>
            <!-- ─── มีข้อมูลแล้ว ─── -->
            <template v-if="transcript">
                <!-- GPA Card -->
                <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <!-- accent bar -->
                    <div class="h-0.5 w-12 rounded-full mb-5" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                    <div class="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <p class="text-xs uppercase tracking-widest font-semibold mb-1 text-slate-500">มหาวิทยาลัย</p>
                            <p class="font-bold text-xl text-white">{{ transcript.university ?? '-' }}</p>
                            <p class="text-slate-400 text-base mt-0.5">{{ transcript.major ?? '-' }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs uppercase tracking-widest font-semibold mb-1 text-slate-500">เกรดเฉลี่ย</p>
                            <p class="text-5xl font-extrabold" style="background: linear-gradient(135deg, #2a9fd6, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
                                {{ transcript.gpa?.toFixed(2) ?? '-' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Skills -->
                <div v-if="skills.length" class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <h2 class="font-bold text-xl text-white mb-4">Skills ที่ได้จาก Transcript</h2>
                    <div class="space-y-4">
                        <div v-if="hardSkills.length">
                            <p class="text-xs font-semibold uppercase tracking-widest mb-2" style="color: #5bc4f5">Hard Skills</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="skill in hardSkills"
                                    :key="skill.skill_id"
                                    class="px-3 py-1.5 text-sm font-medium rounded-full"
                                    style="background: rgba(13, 95, 163, 0.18); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5"
                                >
                                    {{ skill.skill_name }}
                                </span>
                            </div>
                        </div>
                        <div v-if="softSkills.length">
                            <p class="text-xs font-semibold uppercase tracking-widest mb-2" style="color: #81c784">Soft Skills</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="skill in softSkills"
                                    :key="skill.skill_id"
                                    class="px-3 py-1.5 text-sm font-medium rounded-full"
                                    style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784"
                                >
                                    {{ skill.skill_name }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recommendations -->
                <div v-if="recommendations.length" class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <h2 class="font-bold text-xl text-white mb-1">งานที่แนะนำสำหรับคุณ</h2>
                    <p class="text-xs text-slate-500 mb-4">จากการวิเคราะห์ทักษะใน Transcript</p>
                    <div class="space-y-3">
                        <div
                            v-for="rec in recommendations"
                            :key="rec.id"
                            class="flex items-start justify-between gap-4 p-4 rounded-xl transition-all"
                            style="border: 1px solid rgba(42, 127, 212, 0.1)"
                            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.3)')"
                            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.1)')"
                        >
                            <div class="flex-1 min-w-0">
                                <p class="font-semibold text-base text-white truncate">{{ rec.title }}</p>
                                <p class="text-sm font-medium mt-0.5" style="color: #2a9fd6">{{ rec.sub_category }}</p>
                                <div class="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    <span>🏢 {{ rec.company_name }}</span>
                                    <span v-if="rec.location">📍 {{ rec.location }}</span>
                                </div>
                            </div>
                            <!-- Match circle -->
                            <div class="shrink-0 text-right">
                                <div class="relative w-14 h-14">
                                    <svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0d1f35" stroke-width="3" />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.9"
                                            fill="none"
                                            stroke="url(#matchGrad)"
                                            stroke-width="3"
                                            stroke-dasharray="100"
                                            :stroke-dashoffset="100 - Math.min(rec.skill_match_percent, 100)"
                                            stroke-linecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stop-color="#0d5fa3" />
                                                <stop offset="100%" stop-color="#4caf50" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color: #5bc4f5"> {{ Math.round(rec.skill_match_percent) }}% </span>
                                </div>
                                <p class="text-sm text-slate-500 mt-1">match</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Courses Table -->
                <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <h2 class="font-bold text-xl text-white mb-4">รายวิชาทั้งหมด ({{ transcript.courses.length }} วิชา)</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-base">
                            <thead>
                                <tr class="text-left text-xs uppercase tracking-widest" style="border-bottom: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5">
                                    <th class="pb-3 font-semibold">รหัสวิชา</th>
                                    <th class="pb-3 font-semibold">ชื่อวิชา</th>
                                    <th class="pb-3 font-semibold text-center">หน่วยกิต</th>
                                    <th class="pb-3 font-semibold text-center">เกรด</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="course in transcript.courses"
                                    :key="course.course_code"
                                    class="transition-colors"
                                    style="border-bottom: 1px solid rgba(42, 127, 212, 0.06)"
                                    @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.06)')"
                                    @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
                                >
                                    <td class="py-3 pr-4 font-mono text-sm text-slate-500">{{ course.course_code }}</td>
                                    <td class="py-3 pr-4 text-slate-300">{{ course.course_name }}</td>
                                    <td class="py-3 text-center text-slate-500">{{ course.credit }}</td>
                                    <td class="py-3 text-center" :class="gradeColor(course.grade)">{{ course.grade }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Re-upload -->
                <div class="text-center pb-4">
                    <button class="text-sm text-slate-500 hover:text-white underline underline-offset-4 transition-colors" @click="transcript = null">อัปโหลด transcript ใหม่</button>
                </div>
            </template>

            <!-- ─── ยังไม่มี transcript ─── -->
            <template v-else>
                <!-- Drop Zone -->
                <div
                    class="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer"
                    :style="isDragging ? 'border-color: #2a9fd6; background: rgba(13,95,163,0.1);' : 'border-color: rgba(42,127,212,0.25); background: rgba(13,95,163,0.03);'"
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
                    <div class="text-5xl mb-3">📄</div>
                    <p class="text-lg font-semibold text-slate-300 mb-1">วางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                    <p class="text-base text-slate-500">รองรับเฉพาะไฟล์ PDF เท่านั้น</p>
                    <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="handleFileChange" />
                </div>

                <!-- Selected file -->
                <div v-if="file" class="rounded-2xl px-5 py-4 flex items-center justify-between" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">📎</span>
                        <div>
                            <p class="font-medium text-sm text-white">{{ file.name }}</p>
                            <p class="text-xs text-slate-500">{{ (file.size / 1024).toFixed(1) }} KB</p>
                        </div>
                    </div>
                    <button class="text-slate-500 hover:text-red-400 transition-colors text-lg" @click="file = null">✕</button>
                </div>

                <!-- Error -->
                <div v-if="errorMessage" class="rounded-xl px-5 py-4 text-sm text-red-400" style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)">
                    ⚠️ {{ errorMessage }}
                </div>

                <!-- Upload Button -->
                <button
                    :disabled="!file || uploading"
                    class="w-full py-3 rounded-xl font-semibold text-base transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    style="background: linear-gradient(135deg, #0d5fa3 0%, #1a8c3e 100%); box-shadow: 0 4px 20px rgba(13, 95, 163, 0.3)"
                    @click="handleUpload"
                >
                    <span v-if="uploading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        กำลังประมวลผล...
                    </span>
                    <span v-else>อัปโหลด Transcript</span>
                </button>
            </template>
        </template>
    </div>
</template>
