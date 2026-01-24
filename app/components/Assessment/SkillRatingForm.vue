<script setup lang="ts">
import type { SkillScore } from '~/types/SkillScore';
import type { PositionSkill } from '~/types/PositionProfile';

const props = defineProps<{
    modelValue: SkillScore[];
    demands?: Record<string, Pick<PositionSkill, 'demand_level' | 'demand_label' | 'weight'>>;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: SkillScore[]): void }>();

const setScore = (i: number, score: number) => {
    emit(
        'update:modelValue',
        props.modelValue.map((x, idx) => (idx === i ? { ...x, score } : x)),
    );
};
const setName = (i: number, name: string) => {
    emit(
        'update:modelValue',
        props.modelValue.map((x, idx) => (idx === i ? { ...x, skill_name: name } : x)),
    );
};
const addSkill = () => emit('update:modelValue', [...props.modelValue, { skill_name: '', score: 0 }]);
const removeSkill = (i: number) =>
    emit(
        'update:modelValue',
        props.modelValue.filter((_, idx) => idx !== i),
    );

const levelText = ['ยังไม่ถนัด', 'น้อย', 'พอใช้', 'ปานกลาง', 'เก่ง', 'เชี่ยวชาญ'] as const;

const getDemand = (name: string) => {
    const key = name.trim().toLowerCase();
    return key ? props.demands?.[key] : undefined;
};

const demandBadgeClass = (lvl?: string) => {
    if (lvl === 'HIGH') return 'border-red-200 bg-red-50 text-red-700';
    if (lvl === 'MEDIUM') return 'border-amber-200 bg-amber-50 text-amber-800';
    if (lvl === 'LOW') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    return 'border-slate-200 bg-slate-50 text-slate-700';
};
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div class="text-base font-bold">แบบสอบถามทักษะ (ให้คะแนนตัวเอง)</div>

        <div v-for="(s, i) in modelValue" :key="i" class="grid grid-cols-12 gap-2 items-center">
            <div class="col-span-12 sm:col-span-5 space-y-1">
                <input
                    class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    placeholder="เช่น SQL, Python, Excel"
                    :value="s.skill_name"
                    @input="setName(i, ($event.target as HTMLInputElement).value)"
                />

                <!-- ✅ แสดงความต้องการของตำแหน่ง -->
                <div v-if="getDemand(s.skill_name)" class="flex items-center gap-2">
                    <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold" :class="demandBadgeClass(getDemand(s.skill_name)?.demand_level)">
                        {{ getDemand(s.skill_name)?.demand_label }}
                    </span>
                    <span class="text-xs text-slate-500"> (ต้องการ {{ getDemand(s.skill_name)?.weight }}%) </span>
                </div>
            </div>

            <!-- ✅ ปุ่มเลือกคะแนน 0-5 -->
            <div class="col-span-12 sm:col-span-6 flex flex-wrap gap-2">
                <button
                    v-for="n in 6"
                    :key="n"
                    type="button"
                    @click="setScore(i, n - 1)"
                    class="rounded-lg border px-3 py-1 text-sm"
                    :class="s.score === n - 1 ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
                >
                    {{ n - 1 }}
                </button>
            </div>

            <div class="col-span-12 sm:col-span-1 text-xs font-semibold text-slate-700 sm:text-right">
                {{ levelText[s.score] }}
            </div>

            <button class="col-span-12 text-sm text-red-600 hover:underline sm:col-span-12 sm:text-right" @click="removeSkill(i)">ลบ</button>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <div class="font-semibold mb-1">ระดับคะแนน (0–5)</div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 justify-center text-center">
                <span>1 = น้อย</span>
                <span>2 = พอใช้</span>
                <span>3 = ปานกลาง</span>
                <span>4 = เก่ง</span>
                <span>5 = เชี่ยวชาญ</span>
            </div>
        </div>

        <button class="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50" @click="addSkill">+ เพิ่มสกิล</button>
    </div>
</template>
