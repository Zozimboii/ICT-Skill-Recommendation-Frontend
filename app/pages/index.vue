<script setup lang="ts">
import type { SkillSearchResponse } from '~/types/SkillSearchResponse'
import SearchJob from '~/components/SearchJob.vue'
import type { SearchJobsResult } from '~/types/SearchJobsResult'

const question = ref('')
const q = ref('')

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<SkillSearchResponse | null>(null)
const jobResult = ref<SearchJobsResult | null>(null)
const { search: searchSkill } = useSkill()

const search = async () => {
  const keyword = q.value.trim()
  if (!keyword) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    result.value = await searchSkill(keyword)
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

const quickSearch = async (skillName: string) => {
  q.value = skillName
  await search()
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 font-sans">
    <h1 class="text-3xl font-extrabold tracking-tight">ICT Job Skill Recommendation</h1>
    <p class="mt-2 text-slate-600">
      พิมพ์สกิล (เช่น <span class="font-semibold">python</span>, <span class="font-semibold">sql</span>)
      เพื่อดูว่าตลาดงานพูดถึงมากแค่ไหน และอยู่ในสายงานใด
    </p>

    <!-- ✅ Advisor -->
    <AdvisorPanel v-model="question" @quickSearch="quickSearch" />

    <!-- ✅ Search Bar -->
    <SkillSearchBar v-model="q" :loading="loading" @search="search" />

    <!-- ✅ Error -->
    <div
      v-if="error"
      class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- ✅ Result -->
    <SkillResultPanel
      v-if="result"
      :result="result"
      @quickSearch="quickSearch"
    />

    <!-- ✅ Extra section -->
    <div v-if="result" class="mt-6">
      <SearchJob />
    </div>
  </div>
</template>
