<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    skills: { id: number; name: string; job_count: number }[];
    selectedSkillId: number | null;
    selectedCategory: string | null;
}>();

const emit = defineEmits<{
    (e: 'skill-click', skillId: number, skillName: string): void;
}>();

const displaySkills = computed(() => props.skills.slice(0, 24));
</script>

<template>
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 shrink-0">
            <h3 class="text-xl font-bold text-white">
                {{ selectedCategory ? `Skills ใน "${selectedCategory}"` : 'Hard Skills' }}
                <span class="text-slate-400 text-sm ml-1">({{ skills.length }})</span>
            </h3>

            <span v-if="selectedCategory" class="text-sm px-3 py-1 rounded-full font-semibold" style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 159, 214, 0.35); color: #5bc4f5">
                {{ selectedCategory }}
            </span>

            <span v-else class="text-sm px-3 py-1 rounded-full font-semibold" style="background: rgba(76, 175, 80, 0.12); border: 1px solid rgba(76, 175, 80, 0.28); color: #81c784"> ทุกสายงาน </span>
        </div>

        <!-- No Data -->
        <div v-if="!skills.length" class="flex-1 flex items-center justify-center text-slate-500">ไม่มีข้อมูล</div>

        <!-- Scroll Container -->
        <div v-else class="skill-scroll grid grid-cols-6 gap-4">
            <div
                v-for="skill in displaySkills"
                :key="skill.id"
                class="skill-card p-4 rounded-xl cursor-pointer"
                :class="{ selected: selectedSkillId === skill.id }"
                @click="emit('skill-click', skill.id, skill.name)"
            >
                <div class="flex flex-col h-full justify-between">
                    <!-- Skill Name -->
                    <div class="text-sm font-bold text-white leading-snug">
                        {{ skill.name }}
                    </div>

                    <!-- Job Count -->
                    <div class="flex items-center justify-between mt-3">
                        <span class="text-xs text-slate-400"> Jobs </span>

                        <span class="text-lg font-extrabold text-sky-400">
                            {{ skill.job_count }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.skill-scroll {
    max-height: 420px;
    overflow-y: auto;
    padding-right: 6px;
}

/* scrollbar */

.skill-scroll::-webkit-scrollbar {
    width: 6px;
}

.skill-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.skill-scroll::-webkit-scrollbar-thumb {
    background: #1e3a5f;
    border-radius: 6px;
}

.skill-scroll::-webkit-scrollbar-thumb:hover {
    background: #5bc4f5;
}

/* card */

.skill-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(148, 163, 184, 0.15);
    transition: all 0.15s ease;
}

.skill-card:hover {
    transform: translateY(-3px);
    border-color: #5bc4f5;
    box-shadow: 0 6px 18px rgba(91, 196, 245, 0.25);
}

.skill-card.selected {
    border-color: #5bc4f5;
    background: rgba(13, 95, 163, 0.25);
    box-shadow: 0 0 16px rgba(91, 196, 245, 0.45);
}
</style>
