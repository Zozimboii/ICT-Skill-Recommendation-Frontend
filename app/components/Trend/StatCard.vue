<!--components/Trend/StatCard.vue -->

<script setup>
import { computed } from 'vue';

const props = defineProps({
    icon: { type: String, default: '📊' },
    value: { type: Number, default: 0 },
    label: { type: String, required: true },
    accent: { type: String, default: '#6366f1' },
});

const formattedValue = computed(() => (props.value >= 1000 ? (props.value / 1000).toFixed(1) + 'K' : props.value.toString()));
</script>
<template>
    <div
        class="group relative overflow-hidden bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50"
        :style="{ '--accent-color': accent }"
    >
        <div class="text-4xl drop-shadow-[0_0_10px_var(--accent-color)] opacity-80 group-hover:opacity-100 transition-opacity">
            {{ icon }}
        </div>

        <div class="flex flex-col">
            <span class="text-2xl font-extrabold text-white leading-tight">
                {{ formattedValue }}
            </span>
            <span class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">
                {{ label }}
            </span>
        </div>

        <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" :style="{ backgroundColor: accent }" />
    </div>
</template>
