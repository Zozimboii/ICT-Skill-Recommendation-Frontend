<!-- components/Assessment/MatchSummary.vue -->
<script setup lang="ts">
type Gap = { name: string; gap: number };
type Demand = { skill_name: string; weight: number; demand_label?: string; demand_level?: 'HIGH' | 'MEDIUM' | 'LOW' };

const props = defineProps<{
    matchPercent: number;
    gaps: Gap[];
    hasProfile: boolean;
    topDemands?: Demand[]; // ส่งมาจาก assessment.vue
}>();

const badgeClass = (lvl?: string) => {
    if (lvl === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
    if (lvl === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
};
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div class="text-base font-bold">ผลการเทียบ</div>

        <div class="text-4xl font-extrabold">{{ matchPercent }}%</div>
        <div class="text-sm text-slate-600">% นี้คำนวณจาก “ความทับซ้อนของสกิล” เมื่อเทียบกับความต้องการของตำแหน่ง (weight 0–100)</div>

        <div v-if="!hasProfile" class="text-sm text-slate-500">เลือกตำแหน่งงานเพื่อดูการเทียบ</div>

        <div v-else>
            <div v-if="topDemands?.length" class="pt-2">
                <div class="text-sm font-semibold">สกิลที่ตำแหน่งนี้ต้องการมาก</div>
                <div class="mt-2 flex flex-wrap gap-2">
                    <div v-for="s in topDemands" :key="s.skill_name" class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" :class="badgeClass(s.demand_level)">
                        <span class="font-semibold">{{ s.skill_name }}</span>
                        <span class="opacity-80">({{ s.weight }}%)</span>
                        <span v-if="s.demand_label" class="opacity-80">• {{ s.demand_label }}</span>
                    </div>
                </div>
            </div>

            <div v-if="gaps.length" class="pt-3">
                <div class="text-sm font-semibold">สกิลที่ควรเติมก่อน</div>
                <ul class="mt-2 space-y-1 text-sm">
                    <li v-for="g in gaps" :key="g.name">- {{ g.name }} (ขาด {{ Math.round(g.gap) }})</li>
                </ul>
            </div>

            <div v-else class="pt-3 text-sm text-emerald-700">โปรไฟล์ใกล้เคียงมาก 👍</div>
        </div>
    </div>
</template>
