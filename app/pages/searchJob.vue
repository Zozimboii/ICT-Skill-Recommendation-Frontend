<script setup lang="ts">
import SearchJob from '~/components/SearchJob.vue';
</script>

<template>
    <div class="mx-auto max-w-6xl px-4 py-10">
        <div class="mb-6">
            <h1 class="text-3xl font-extrabold tracking-tight">Search Job Trends</h1>
            <p class="mt-2 text-slate-600">ดูข้อมูลตำแหน่งงานที่เกี่ยวข้องกับ Skill ในตลาด</p>
        </div>

        <div class="rounded-2xl border bg-white shadow p-6">
            <SearchJob />
        </div>
    </div>
</template>
