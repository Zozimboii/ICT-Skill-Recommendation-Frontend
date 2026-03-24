<!-- pages/transcript.vue -->
<script setup lang="ts">
import type { TranscriptDetail, ExtractedSkill } from '~/types/transcript';
import { useDashboardStore } from '~/stores/useDashboardStore';

useHead({ title: 'Transcript — ICT Skill' });

const { uploadTranscript, getTranscript, getExtractedSkills } = useTranscript();
const dashboardStore = useDashboardStore();

const file = ref<File | null>(null);
const uploading = ref(false);
const errorMessage = ref<string | null>(null);
const isDragging = ref(false);
const transcript = ref<TranscriptDetail | null>(null);
const skills = ref<ExtractedSkill[]>([]);
const loadingData = ref(false);

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
    loadingData.value = false;
};
const router = useRouter();

const goDashboard = async () => {
    if (!transcript.value) return;

    await router.push({
        path: '/dashboard',
        query: {
            refresh: Date.now().toString(), // 🔥 force reload data
        },
    });
};
onMounted(async () => {
    await nextTick();
    loadTranscript();
});

const fileInput = ref<HTMLInputElement | null>(null);
function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    if (files.length > 1) {
        errorMessage.value = 'กรุณาเลือกไฟล์ PDF เพียง 1 ไฟล์เท่านั้น';
        (event.target as HTMLInputElement).value = '';
        return;
    }
    const f = files[0];
    if (f && f.type !== 'application/pdf') {
        errorMessage.value = 'รองรับเฉพาะไฟล์ PDF เท่านั้น';
        (event.target as HTMLInputElement).value = '';
        return;
    }
    errorMessage.value = null;
    file.value = f ?? null;
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

        // โหลด transcript ใหม่ในหน้านี้
        await loadTranscript();

        // mark dashboard ให้ reload ครั้งถัดไปที่เปิด (ไม่ต้อง await)
        dashboardStore.reload();
    } catch (e: any) {
        errorMessage.value = e?.message ?? 'อัปโหลดไม่สำเร็จ';
    } finally {
        uploading.value = false;
    }
}

type DetailTab = 'skills' | 'courses';
const detailTab = ref<DetailTab>('skills');
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
                <h1 class="text-4xl font-bold text-white">Transcript</h1>
                <p class="text-base text-slate-400 mt-1">ตรวจสอบข้อมูลที่ระบบอ่านได้จากไฟล์ — skills และรายวิชา</p>
            </div>
            <Transition name="fade">
                <div v-if="transcript && !loadingData" class="flex items-center gap-2">
                    <!-- ไปที่ Dashboard -->
                    <button
                        class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-base font-semibold transition-all"
                        style="background: rgba(42, 127, 212, 0.08); border: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5"
                        @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.4)')"
                        @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.2)')"
                        @click="goDashboard"
                    >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Dashboard
                    </button>
                    <!-- อัปโหลดใหม่ -->
                    <button
                        class="flex items-center gap-2 px-4 py-2 rounded-xl text-base font-semibold transition-all"
                        style="background: rgba(13, 95, 163, 0.1); border: 1px solid rgba(42, 127, 212, 0.25); color: #5bc4f5"
                        @mouseover="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.5)')"
                        @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.25)')"
                        @click="transcript = null"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        อัปโหลดใหม่
                    </button>
                </div>
            </Transition>
        </div>

        <!-- Loading -->
        <div v-if="loadingData" class="space-y-4">
            <div v-for="i in 3" :key="i" class="rounded-2xl p-6 animate-pulse" style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)">
                <div class="h-6 rounded w-1/3 mb-3" style="background: rgba(42, 127, 212, 0.15)" />
                <div class="h-5 rounded w-2/3" style="background: rgba(42, 127, 212, 0.1)" />
            </div>
        </div>

        <template v-else>
            <!-- ── มีข้อมูลแล้ว ── -->
            <template v-if="transcript">
                <!-- Profile summary -->
                <div class="rounded-2xl p-6" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="h-0.5 w-10 rounded-full mb-4" style="background: linear-gradient(90deg, #0d5fa3, #4caf50)" />
                    <div class="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <p class="text-base uppercase tracking-widest text-slate-300 mb-1">มหาวิทยาลัยเกษตรศาสตร์</p>
                            <p class="font-bold text-2xl text-white">{{ transcript.university ?? '-' }}</p>
                            <p class="text-lg text-slate-400 mt-1">{{ transcript.major ?? '-' }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-base uppercase tracking-widest text-slate-300 mb-1">เกรดเฉลี่ย</p>
                            <p class="text-6xl font-extrabold" style="background: linear-gradient(135deg, #2a9fd6, #4caf50); -webkit-background-clip: text; -webkit-text-fill-color: transparent">
                                {{ transcript.gpa?.toFixed(2) ?? '-' }}
                            </p>
                        </div>
                    </div>
                    <!-- Stats row -->
                    <div class="grid grid-cols-3 gap-3 mt-5 pt-4" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-white">{{ hardSkills.length }}</p>
                            <p class="text-base text-slate-400 mt-0.5">Hard Skills</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-white">{{ softSkills.length }}</p>
                            <p class="text-base text-slate-400 mt-0.5">Soft Skills</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-white">{{ transcript.courses?.length ?? 0 }}</p>
                            <p class="text-base text-slate-400 mt-0.5">จำนวนรายวิชาที่เรียน</p>
                        </div>
                    </div>
                </div>

                <!-- Tabs: เหลือแค่ Skills + วิชาเรียน -->
                <div class="flex gap-1 p-1 rounded-2xl w-fit" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.15)">
                    <button
                        v-for="tab in [
                            { key: 'skills', label: 'Skills ที่วิเคราะห์ได้' },
                            { key: 'courses', label: 'รายวิชา' },
                        ]"
                        :key="tab.key"
                        class="px-5 py-2.5 rounded-xl text-base font-semibold transition-all"
                        :style="detailTab === tab.key ? 'background:rgba(13,95,163,0.3); color:#5bc4f5; border:1px solid rgba(42,159,214,0.3)' : 'color:#64748b; border:1px solid transparent'"
                        @click="detailTab = tab.key as DetailTab"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Tab: Skills ที่ดึงได้ -->
                <template v-if="detailTab === 'skills'">
                    <!-- Context note -->
                    <p class="text-base text-slate-300 -mt-2">ระบบวิเคราะห์ skills เหล่านี้จากชื่อรายวิชาและเนื้อหาใน Transcript โดยอัตโนมัติ</p>
                    <div class="space-y-4">
                        <div v-if="hardSkills.length" class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-base font-bold uppercase tracking-widest mb-3" style="color: #5bc4f5">Hard Skills — ทักษะเทคนิค ({{ hardSkills.length }})</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in hardSkills"
                                    :key="s.skill_id"
                                    class="px-3.5 py-1.5 rounded-full text-base font-semibold"
                                    style="background: rgba(13, 95, 163, 0.15); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5"
                                >
                                    {{ s.skill_name }}
                                </span>
                            </div>
                        </div>
                        <div v-if="softSkills.length" class="rounded-2xl p-5" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                            <p class="text-base font-bold uppercase tracking-widest mb-3" style="color: #81c784">Soft Skills — ทักษะสังคม ({{ softSkills.length }})</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="s in softSkills"
                                    :key="s.skill_id"
                                    class="px-3.5 py-1.5 rounded-full text-base font-semibold"
                                    style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.28); color: #81c784"
                                >
                                    {{ s.skill_name }}
                                </span>
                            </div>
                        </div>
                        <div v-if="!hardSkills.length && !softSkills.length" class="py-12 text-center text-base text-slate-300 rounded-2xl" style="border: 1px solid rgba(42, 127, 212, 0.1)">
                            ไม่พบ skills จาก Transcript นี้
                            <p class="text-base text-slate-400 mt-1">ลองอัปโหลดไฟล์ใหม่ หรือตรวจสอบว่าไฟล์ถูกต้อง</p>
                        </div>
                    </div>
                </template>

                <!-- Tab: วิชาเรียน -->
                <template v-else>
                    <p class="text-base text-slate-500 -mt-2">รายวิชาทั้งหมดที่ระบบอ่านได้ — ตรวจสอบว่าครบถ้วนและถูกต้อง</p>
                    <div class="rounded-2xl overflow-hidden" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                        <div class="px-5 py-4" style="border-bottom: 1px solid rgba(42, 127, 212, 0.1)">
                            <p class="font-bold text-white text-base">รายวิชาทั้งหมด ({{ transcript.courses?.length ?? 0 }} วิชา)</p>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-base">
                                <thead>
                                    <tr class="text-base uppercase tracking-wide" style="border-bottom: 1px solid rgba(42, 127, 212, 0.1); color: rgba(148, 163, 184, 0.6)">
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
                                        <td class="px-5 py-3.5 font-mono text-base text-slate-400">{{ course.course_code }}</td>
                                        <td class="px-3 py-3.5 text-base text-slate-200">{{ course.course_name }}</td>
                                        <td class="px-3 py-3.5 text-center text-base text-slate-400">{{ course.credit }}</td>
                                        <td class="px-5 py-3.5 text-center text-base font-bold" :style="`color:${gradeColor(course.grade)}`">
                                            {{ course.grade }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>
            </template>

            <!-- ── ยังไม่มี Transcript ── -->
            <template v-else>
                <!-- Steps -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                        v-for="step in [
                            { n: 1, title: 'เลือกไฟล์ PDF', desc: 'ไฟล์ Transcript จากมหาวิทยาลัย' },
                            { n: 2, title: 'อัปโหลด', desc: 'ระบบดึง skills ให้อัตโนมัติ' },
                            { n: 3, title: 'ตรวจสอบผลลัพธ์', desc: 'ยืนยันว่าข้อมูลถูกต้องครบถ้วน' },
                        ]"
                        :key="step.n"
                        class="flex items-center gap-3 p-4 rounded-xl"
                        style="background: rgba(13, 95, 163, 0.06); border: 1px solid rgba(42, 127, 212, 0.1)"
                    >
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                            style="background: rgba(13, 95, 163, 0.25); color: #5bc4f5; border: 1px solid rgba(42, 159, 214, 0.3)"
                        >
                            {{ step.n }}
                        </div>
                        <div>
                            <p class="text-base font-semibold text-white">{{ step.title }}</p>
                            <p class="text-base text-slate-400 mt-0.5">{{ step.desc }}</p>
                        </div>
                    </div>
                </div>

                <!-- Drop zone -->
                <div
                    class="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer"
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
                    <div class="flex justify-center mb-4">
                        <svg class="w-14 h-14 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </div>
                    <p class="text-lg font-semibold text-slate-200 mb-1.5">วางไฟล์ที่นี่ หรือคลิกเพื่อเลือก</p>
                    <p class="text-base text-slate-500">รองรับเฉพาะไฟล์ PDF</p>
                    <input ref="fileInput" type="file" accept=".pdf" class="hidden" :multiple="false" @change="handleFileChange" />
                </div>

                <!-- Selected file -->
                <div v-if="file" class="flex items-center justify-between gap-3 px-5 py-4 rounded-xl" style="background: rgba(8, 18, 36, 0.6); border: 1px solid rgba(42, 127, 212, 0.2)">
                    <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#5bc4f5" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div>
                            <p class="text-base font-medium text-white">{{ file.name }}</p>
                            <p class="text-base text-slate-500 mt-0.5">{{ (file.size / 1024).toFixed(1) }} KB</p>
                        </div>
                    </div>
                    <button class="text-slate-500 hover:text-red-400 transition" @click="file = null">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <!-- Error -->
                <div
                    v-if="errorMessage"
                    class="flex items-center gap-2 px-4 py-3.5 rounded-xl text-base text-red-400"
                    style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3)"
                >
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {{ errorMessage }}
                </div>

                <!-- Upload button -->
                <button
                    :disabled="!file || uploading"
                    class="w-full py-3.5 rounded-xl font-semibold text-base text-white disabled:opacity-40 transition-all"
                    style="background: linear-gradient(135deg, #0d5fa3, #1a8c3e)"
                    @click="handleUpload"
                >
                    <span v-if="uploading" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        กำลังวิเคราะห์ Transcript...
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        อัปโหลด Transcript
                    </span>
                </button>
            </template>
        </template>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.25s,
        transform 0.25s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
