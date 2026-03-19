<!-- components/Debug/RadarDebugPanel.vue -->
<!-- ใช้ใน dev เท่านั้น — ลบออกก่อน deploy -->
<script setup lang="ts">
import { getRadarDebugInfo, buildRadarData } from '~/composables/useJobRadar';
import type { RecommendationItem, SkillGapResponse } from '~/types/Dashboard';

const props = defineProps<{
    recommendations: RecommendationItem[];
    skillGap: SkillGapResponse[];
}>();

const open = ref(false);

const debugRows = computed(() =>
    props.recommendations.map((rec) => ({
        ...getRadarDebugInfo(rec, props.skillGap),
        canRender: !!buildRadarData(rec, props.skillGap),
    })),
);
</script>

<template>
    <div class="fixed bottom-4 left-4 z-50">
        <button
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-base font-semibold"
            style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.4); color: #fbbf24"
            @click="open = !open"
        >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            </svg>
            Radar Debug {{ open ? '▲' : '▼' }}
        </button>

        <div v-if="open" class="mt-2 rounded-2xl p-4 w-[480px] max-h-[70vh] overflow-y-auto" style="background: rgba(6, 12, 24, 0.97); border: 1px solid rgba(251, 191, 36, 0.3)">
            <p class="text-base font-bold mb-3" style="color: #fbbf24">
                Radar Debug
                <span class="text-slate-400 font-normal ml-2"> skillGap: {{ skillGap.length }} · recs: {{ recommendations.length }} </span>
            </p>

            <!-- skillGap titles -->
            <div class="mb-4 p-3 rounded-xl" style="background: rgba(255, 255, 255, 0.03)">
                <p class="text-base font-semibold text-slate-400 mb-2">skillGap job_titles ที่ได้จาก API:</p>
                <div v-if="skillGap.length === 0" class="text-red-400 text-base p-2 rounded-lg" style="background: rgba(239, 68, 68, 0.08)">
                    ⚠ skillGap ว่าง — ตรวจ has_transcript หรือ /api/v1/dashboard/skill-gap
                </div>
                <div v-for="g in skillGap" :key="g.job_title" class="text-base py-0.5 flex justify-between gap-2">
                    <span class="text-slate-200 truncate">"{{ g.job_title }}"</span>
                    <span class="text-slate-500 shrink-0"> ✓{{ g.matched_skills.length }} ✗{{ g.missing_skills.length }} </span>
                </div>
            </div>

            <!-- match table -->
            <p class="text-base font-semibold text-slate-400 mb-2">Match rec.title → gap.job_title:</p>
            <div v-for="row in debugRows" :key="row.recTitle" class="flex items-start gap-2 py-2 border-b" style="border-color: rgba(255, 255, 255, 0.06)">
                <span class="shrink-0 font-bold text-base" :style="row.gapFound ? 'color:#4caf50' : 'color:#f87171'">
                    {{ row.gapFound ? '✓' : '✗' }}
                </span>
                <div class="flex-1 min-w-0">
                    <p class="text-base text-white truncate">{{ row.recTitle }}</p>
                    <p v-if="row.gapFound" class="text-base" style="color: #64748b">
                        matched "{{ row.gapTitle }}" · {{ row.matchedCount }} matched · {{ row.missingCount }} missing
                        <span :style="row.canRender ? 'color:#4caf50' : 'color:#f87171'"> · radar {{ row.canRender ? 'OK' : '✗ (< 3 skills)' }} </span>
                    </p>
                    <p v-else class="text-base text-red-400">ไม่พบ gap — title ต่างกัน หรือ skillGap ไม่มีงานนี้</p>
                </div>
            </div>

            <p class="text-base text-slate-600 mt-3 text-center">ลบ component นี้ออกก่อน deploy</p>
        </div>
    </div>
</template>
