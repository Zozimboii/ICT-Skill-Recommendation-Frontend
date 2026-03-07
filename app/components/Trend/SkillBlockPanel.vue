<!-- <script setup lang="ts">
defineProps<{
    skills: { id: number; name: string; job_count: number }[];
    selectedSkillId: number | null;
    
}>();

const emit = defineEmits<{
    (e: 'skill-click', skillId: number): void;
}>();
</script>

<template>
    <div class="max-w-full">
        <div class="mb-4">
            <h3 class="text-xl font-bold text-slate-200">Hard Skills</h3>
            <p class="text-sm text-slate-500 mt-1 uppercase tracking-tighter">คลิกที่ skill เพื่อดูตำแหน่งงานที่ต้องการ</p>
        </div>

        <div v-if="!skills.length" class="text-slate-500 text-xs italic">ไม่มีข้อมูล</div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            <div
                v-for="skill in skills"
                :key="skill.id"
                class="cursor-pointer rounded-lg p-2.5 transition-all duration-200 text-center"
                :style="
                    selectedSkillId === skill.id
                        ? 'border: 1px solid rgba(42,159,214,0.6); background: rgba(13,95,163,0.2);'
                        : 'border: 1px solid rgba(42,127,212,0.15); background: rgba(8,18,36,0.5);'
                "
                @click="emit('skill-click', skill.id)"
                @mouseover="
                    (e) => {
                        if (selectedSkillId !== skill.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.4)';
                    }
                "
                @mouseleave="
                    (e) => {
                        if (selectedSkillId !== skill.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.15)';
                    }
                "
            >
                <div class="font-semibold text-base truncate" :style="selectedSkillId === skill.id ? 'color: #5bc4f5;' : 'color: #cbd5e1;'" :title="skill.name">
                    {{ skill.name }}
                </div>
                <div class="text-xs mt-0.5 font-medium" :style="selectedSkillId === skill.id ? 'color: #4caf50;' : 'color: #64748b;'">{{ skill.job_count }} jobs</div>
            </div>
        </div>
    </div>
</template> -->
<script setup lang="ts">
defineProps<{
    skills: { id: number; name: string; job_count: number }[];
    selectedSkillId: number | null;
    selectedCategory: string | null;
}>();

const emit = defineEmits<{
    (e: 'skill-click', skillId: number, skillName: string): void; // ✅ เพิ่ม skillName
}>();
</script>

<template>
    <div class="max-w-full h-full flex flex-col">
        <div class="mb-4 shrink-0">
            <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-xl font-bold text-slate-200">
                    {{ selectedCategory ? `Skills ใน "${selectedCategory}"` : 'Hard Skills' }}
                </h3>
                <span
                    v-if="selectedCategory"
                    class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style="background: rgba(13, 95, 163, 0.2); border: 1px solid rgba(42, 159, 214, 0.3); color: #5bc4f5"
                >
                    เฉพาะสายงานนี้
                </span>
                <span v-else class="text-xs px-2 py-0.5 rounded-full font-semibold" style="background: rgba(76, 175, 80, 0.12); border: 1px solid rgba(76, 175, 80, 0.3); color: #81c784">
                    ทุกสายงาน
                </span>
            </div>
            <p class="text-sm mt-1" style="color: #64748b">
                <span v-if="selectedCategory">
                    จำนวนงานใน <span style="color: #5bc4f5">{{ selectedCategory }}</span> ที่ต้องการแต่ละ skill
                </span>
                <span v-else> คลิก skill เพื่อดูว่ามีกี่งานที่ต้องการ skill นี้ <span style="color: #81c784">(ทุกสายงาน)</span> </span>
            </p>
        </div>

        <div v-if="!skills.length" class="text-slate-500 text-sm italic">ไม่มีข้อมูล</div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 overflow-y-auto" style="max-height: 280px">
            <div
                v-for="skill in skills"
                :key="skill.id"
                class="cursor-pointer rounded-lg p-2.5 transition-all duration-200 text-center"
                :style="
                    selectedSkillId === skill.id
                        ? 'border: 1px solid rgba(42,159,214,0.6); background: rgba(13,95,163,0.2);'
                        : 'border: 1px solid rgba(42,127,212,0.15); background: rgba(8,18,36,0.5);'
                "
                @click="emit('skill-click', skill.id, skill.name)"
                @mouseover="
                    (e) => {
                        if (selectedSkillId !== skill.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,159,214,0.4)';
                    }
                "
                @mouseleave="
                    (e) => {
                        if (selectedSkillId !== skill.id) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,127,212,0.15)';
                    }
                "
            >
                <div class="font-semibold text-sm truncate" :style="selectedSkillId === skill.id ? 'color: #5bc4f5;' : 'color: #cbd5e1;'" :title="skill.name">
                    {{ skill.name }}
                </div>
                <div class="text-xs mt-0.5 font-medium" :style="selectedSkillId === skill.id ? 'color: #4caf50;' : 'color: #64748b;'">
                    {{ skill.job_count }}
                    <span class="opacity-70">{{ selectedCategory ? 'งาน' : 'jobs รวม' }}</span>
                </div>
            </div>
        </div>

        <p v-if="selectedSkillId && selectedCategory" class="mt-3 text-xs shrink-0" style="color: #475569">
            💡 count ด้านบนคือเฉพาะใน <span style="color: #5bc4f5">{{ selectedCategory }}</span>
            — กด skill เพื่อดูจำนวนรวมทุกสายงาน
        </p>
    </div>
</template>
