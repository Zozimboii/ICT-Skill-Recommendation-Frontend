<!-- components/Trend/SkillTrendChart.vue — RENOVATED: Custom ranked bar chart -->
<script setup lang="ts">
const emit = defineEmits<{
    (e: 'skill-click', skillId: number, skillName: string): void;
}>();

const props = defineProps<{
    series: { name: string; data: number[] }[];
    categories: string[];
    skillIds: number[];
}>();

function capitalizeFirst(s: string) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

const activeIdx = ref<number | null>(null);

const items = computed(() => {
    const raw = props.categories.map((cat, i) => ({
        id: (props.skillIds[i] ?? 0) as number,
        name: capitalizeFirst(cat),
        count: props.series[0]?.data[i] ?? 0,
        origIdx: i,
    }));
    return raw; // keep original order (already sorted by backend)
});

const maxCount = computed(() => Math.max(...items.value.map((it) => it.count), 1));

// Color per rank
function barColor(idx: number, isActive: boolean): string {
    if (isActive) return 'linear-gradient(90deg, #5bc4f5, #2a9fd6)';
    if (idx === 0) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
    if (idx < 3) return 'linear-gradient(90deg, #4caf50, #2db857)';
    if (idx < 7) return 'linear-gradient(90deg, #2a9fd6, #0d5fa3)';
    return 'linear-gradient(90deg, rgba(42,127,212,0.55), rgba(13,95,163,0.35))';
}

function glowColor(idx: number): string {
    if (idx === 0) return '0 0 10px rgba(251,191,36,0.4)';
    if (idx < 3) return '0 0 8px rgba(76,175,80,0.35)';
    if (idx < 7) return '0 0 6px rgba(42,127,212,0.3)';
    return 'none';
}

function rankLabel(idx: number): string {
    if (idx === 0) return '👑';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return String(idx + 1);
}

function rankTextColor(idx: number): string {
    if (idx === 0) return '#fbbf24';
    if (idx < 3) return '#4caf50';
    if (idx < 7) return '#2a9fd6';
    return '#334155';
}

function handleClick(item: (typeof items.value)[0], idx: number) {
    activeIdx.value = activeIdx.value === idx ? null : idx;
    emit('skill-click', item.id, item.name);
}

// Show top N, with expand toggle
const showAll = ref(false);
const LIMIT = 12;
const displayed = computed(() => (showAll.value ? items.value : items.value.slice(0, LIMIT)));
</script>

<template>
    <div>
        <!-- Header -->
        <div class="flex items-start justify-between mb-5">
            <div>
                <h3 class="text-lg font-bold text-white">Top {{ categories.length }} Skills ที่ตลาดต้องการ</h3>
                <p class="text-xs mt-0.5" style="color: #475569">อ้างอิงจากประกาศงาน · คลิกที่ skill เพื่อดูรายชื่องาน</p>
            </div>
            <!-- Active filter chip -->
            <Transition name="fade">
                <div
                    v-if="activeIdx !== null"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0"
                    style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5"
                >
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #5bc4f5" />
                    {{ items[activeIdx]?.name }}
                    <button class="ml-1 opacity-60 hover:opacity-100" @click="activeIdx = null">✕</button>
                </div>
            </Transition>
        </div>

        <!-- Bar rows -->
        <div class="space-y-2">
            <div
                v-for="(item, idx) in displayed"
                :key="item.id"
                class="bar-row group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                :style="activeIdx === idx ? 'background:rgba(13,95,163,0.18); border:1px solid rgba(42,159,214,0.4)' : 'border:1px solid transparent'"
                :class="activeIdx !== null && activeIdx !== idx ? 'opacity-40' : 'opacity-100'"
                @click="handleClick(item, idx)"
                @mouseover="
                    (e) => {
                        if (activeIdx !== idx) (e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.08)';
                    }
                "
                @mouseleave="
                    (e) => {
                        if (activeIdx !== idx) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                "
            >
                <!-- Rank label -->
                <span
                    class="w-7 text-center shrink-0 font-bold leading-none"
                    :style="{
                        fontSize: idx < 3 ? '16px' : '12px',
                        color: rankTextColor(idx),
                    }"
                >
                    {{ rankLabel(idx) }}
                </span>

                <!-- Skill name -->
                <span class="w-32 shrink-0 text-sm font-semibold truncate transition-colors" :style="activeIdx === idx ? 'color:#5bc4f5' : 'color:#cbd5e1'">
                    {{ item.name }}
                </span>

                <!-- Bar track -->
                <div class="flex-1 h-5 rounded-lg overflow-hidden relative" style="background: rgba(42, 127, 212, 0.07)">
                    <div
                        class="h-full rounded-lg bar-fill"
                        :style="{
                            width: (item.count / maxCount) * 100 + '%',
                            background: barColor(idx, activeIdx === idx),
                            boxShadow: activeIdx === idx ? '0 0 12px rgba(91,196,245,0.5)' : glowColor(idx),
                            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                        }"
                    />
                    <!-- Shimmer on hover -->
                    <div class="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <!-- Count badge -->
                <span class="w-14 text-right shrink-0 text-xs font-bold tabular-nums" :style="activeIdx === idx ? 'color:#5bc4f5' : 'color:#475569'">
                    {{ item.count.toLocaleString() }}
                    <span class="font-normal opacity-60 text-xs"> งาน</span>
                </span>

                <!-- Click hint arrow -->
                <span class="shrink-0 text-xs opacity-0 group-hover:opacity-60 transition-opacity" style="color: #5bc4f5">→</span>
            </div>
        </div>

        <!-- Show more / less -->
        <div v-if="items.length > LIMIT" class="mt-4 flex justify-center">
            <button
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style="border: 1px solid rgba(42, 127, 212, 0.2); color: #5bc4f5"
                @click="showAll = !showAll"
                @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(13,95,163,0.12)')"
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')"
            >
                <span>{{ showAll ? '▲ แสดงน้อยลง' : `▼ ดูทั้งหมด ${items.length} skills` }}</span>
            </button>
        </div>

        <!-- Legend -->
        <div class="mt-4 pt-3 flex flex-wrap gap-4" style="border-top: 1px solid rgba(42, 127, 212, 0.1)">
            <div
                v-for="[label, color] in [
                    ['👑 #1', '#fbbf24'],
                    ['🥈🥉 Top 3', '#4caf50'],
                    ['Top 10', '#2a9fd6'],
                ]"
                :key="label"
                class="flex items-center gap-1.5 text-xs"
                style="color: #475569"
            >
                <div class="w-3 h-2 rounded-sm" :style="`background:${color}`" />
                {{ label }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.bar-row {
    animation: slide-in 0.35s ease both;
}
.bar-row:nth-child(1) {
    animation-delay: 0s;
}
.bar-row:nth-child(2) {
    animation-delay: 0.03s;
}
.bar-row:nth-child(3) {
    animation-delay: 0.06s;
}
.bar-row:nth-child(4) {
    animation-delay: 0.09s;
}
.bar-row:nth-child(5) {
    animation-delay: 0.12s;
}
.bar-row:nth-child(6) {
    animation-delay: 0.15s;
}
.bar-row:nth-child(7) {
    animation-delay: 0.18s;
}
.bar-row:nth-child(8) {
    animation-delay: 0.21s;
}
.bar-row:nth-child(9) {
    animation-delay: 0.24s;
}
.bar-row:nth-child(10) {
    animation-delay: 0.27s;
}
.bar-row:nth-child(n + 11) {
    animation-delay: 0.3s;
}

@keyframes slide-in {
    from {
        opacity: 0;
        transform: translateX(-12px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.06) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer-move 1.2s infinite;
}
@keyframes shimmer-move {
    from {
        background-position: -200% 0;
    }
    to {
        background-position: 200% 0;
    }
}

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
