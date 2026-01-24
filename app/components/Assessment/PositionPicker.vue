<script setup lang="ts">
import type { PositionItem } from '~/types/PositionProfile';

const props = defineProps<{
    modelValue: string;
    positions: PositionItem[];
    loading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void;
    (e: 'change', id: string): void;
}>();

const onChange = (e: Event) => {
    const id = (e.target as HTMLSelectElement).value;
    emit('update:modelValue', id);
    emit('change', id);
};
</script>

<template>
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="text-sm font-semibold text-slate-900">เลือกตำแหน่งงาน</div>

        <div class="mt-3 flex gap-2 items-center">
            <select class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" :disabled="loading" :value="modelValue" @change="onChange">
                <option value="" disabled>-- เลือกตำแหน่ง --</option>
                <option v-for="p in positions" :key="p.id" :value="p.id">
                    {{ p.name }}
                </option>
            </select>

            <div v-if="loading" class="text-xs text-slate-500">กำลังโหลด…</div>
        </div>
    </div>
</template>
