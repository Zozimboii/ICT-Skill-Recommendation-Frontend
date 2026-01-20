<script setup lang="ts">
import type { AdvisorResponse } from '~/types/AdvisorResponse'
import type { SkillSearchResponse } from '~/types/SkillSearchResponse'
import SearchJob from '../components/SearchJob.vue'

const question = ref('')
const advisorLoading = ref(false)
const advisorResult = ref<AdvisorResponse | null>(null)

const q = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<SkillSearchResponse | null>(null)

const { get } = useApi()

const search = async () => {
  const keyword = q.value.trim()
  if (!keyword) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    const data = await get<SkillSearchResponse>('/skills/search', { q: keyword })
    result.value = data
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'Search failed'
  } finally {
    loading.value = false
  }
}

const askAdvisor = async () => {
  const text = question.value.trim()
  if (!text) return

  advisorLoading.value = true
  advisorResult.value = null

  try {
    // ✅ ใช้ baseURL จาก runtimeConfig เหมือนกัน ไม่ต้อง hardcode
    const data = await $fetch<AdvisorResponse>('/advisor', {
      baseURL: useRuntimeConfig().public.apiBase,
      method: 'POST',
      body: { question: text },
    })
    advisorResult.value = data
  } catch (e) {
    console.error(e)
  } finally {
    advisorLoading.value = false
  }
}

const quickSearch = async (skillName: string) => {
  q.value = skillName
  await search()
}

const subcatLabels = computed(() =>
  result.value?.top_subcategories?.map((x) => x.sub_category_name) ?? []
)
const subcatValues = computed(() =>
  result.value?.top_subcategories?.map((x) => x.count) ?? []
)

const relatedLabels = computed(() =>
  result.value?.related_skills?.map((x) => x.skill_name) ?? []
)
const relatedValues = computed(() =>
  result.value?.related_skills?.map((x) => x.count) ?? []
)
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 font-sans">
    <!-- Header -->
    <h1 class="text-3xl font-extrabold tracking-tight">
      ICT Job Skill Recommendation
    </h1>
    <p class="mt-2 text-slate-600">
      พิมพ์สกิล (เช่น <span class="font-semibold">python</span>, <span class="font-semibold">sql</span>, <span class="font-semibold">excel</span>)
      เพื่อดูว่าตลาดงานพูดถึงมากแค่ไหน และอยู่ในสายงานใด
    </p>

    <!-- Advisor Card -->
    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="text-lg font-bold">ถามแนะแนวการเรียน</div>
      <div class="mt-1 text-sm text-slate-600">
        พิมพ์คำถาม เช่น “อยากฝึกเขียนโปรแกรมควรเริ่มจากอะไร”
      </div>

      <div class="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          v-model="question"
          @keydown.enter="askAdvisor"
          placeholder="อยากเป็น data analyst ควรเริ่มจากอะไร?"
          class="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          @click="askAdvisor"
          :disabled="advisorLoading || !question.trim()"
          class="rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm
                 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ advisorLoading ? 'กำลังคิด…' : 'ถาม' }}
        </button>
      </div>

      <!-- Advisor Result -->
      <div v-if="advisorResult" class="mt-4 space-y-2">
        <div class="text-sm font-semibold">
          แนวทางที่เหมาะ: <span class="text-blue-700">{{ advisorResult.intent }}</span>
        </div>

        <div class="text-sm">
          <span class="font-semibold">ควรเริ่มจาก:</span>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="s in advisorResult.suggested_skills"
              :key="s"
              @click="quickSearch(s)"
              class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 hover:bg-slate-200"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <div v-if="advisorResult.trend_preview" class="text-sm text-slate-700">
          <span class="font-semibold">ข้อมูลตลาดงาน:</span>
          สกิล <span class="font-semibold">{{ advisorResult.trend_preview.skill_name }}</span>
          พบใน <span class="font-semibold">{{ advisorResult.trend_preview.job_count }}</span> งาน
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        v-model="q"
        @keydown.enter="search"
        placeholder="Search skill… (e.g. python)"
        class="w-full flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
      />
      <button
        @click="search"
        :disabled="loading || !q.trim()"
        class="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white
               hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? 'Searching…' : 'Search' }}
      </button>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

   <!-- Result -->
<div v-if="result" class="mt-4 grid gap-6">
  <!-- Summary Card -->
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <div class="text-lg font-bold">
          Skill: <span class="text-slate-900">{{ result.skill_name }}</span>
        </div>
        <div class="text-sm text-slate-600">Type: {{ result.skill_type }}</div>
      </div>
      <div class="text-left sm:text-right">
        <div class="text-3xl font-extrabold">{{ result.job_count }}</div>
        <div class="text-sm text-slate-600">jobs mention this skill</div>
      </div>
    </div>
  </div>

  <!-- 2 columns: Table + Related -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Top sub-categories -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 text-base font-bold">Top sub-categories ที่เจอสกิลนี้</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-600">
              <th class="px-2 py-2 font-semibold">Sub-category</th>
              <th class="px-2 py-2 font-semibold">Jobs</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in result.top_subcategories"
              :key="row.sub_category_id"
              class="border-b border-slate-100"
            >
              <td class="px-2 py-2">
                <div class="font-medium text-slate-900">{{ row.sub_category_name }}</div>
                <div class="text-xs text-slate-500">{{ row.main_category_name }}</div>
              </td>
              <td class="px-2 py-2 font-bold">{{ row.count }}</td>
            </tr>

            <tr v-if="result.top_subcategories.length === 0">
              <td colspan="2" class="px-2 py-3 text-slate-500">
                ไม่พบข้อมูล sub-category
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Related skills -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 text-base font-bold">แนะนำสกิลที่มักเจอร่วมกัน</div>

      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in result.related_skills"
          :key="s.skill_name"
          @click="quickSearch(s.skill_name)"
          class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50"
        >
          {{ s.skill_name }}
          <span class="ml-1 text-slate-500">({{ s.count }})</span>
        </button>

        <div v-if="result.related_skills.length === 0" class="text-sm text-slate-500">
          ยังไม่มี related skills
        </div>
      </div>
    </div>
  </div>

  <!-- 2 columns: Charts (ย้ายมาไว้ “ใน result” แล้ว) -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <BarChart
        title="Top sub-categories ที่พบสกิลนี้"
        :labels="subcatLabels"
        :values="subcatValues"
      />
      <p class="mt-2 text-sm text-slate-600">
        กราฟนี้แสดง “จำนวนงาน (count)” ที่มีสกิลนี้ แยกตาม sub-category
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <BarChart
        title="สกิลที่มักเจอร่วมกัน (Related skills)"
        :labels="relatedLabels"
        :values="relatedValues"
      />
      <p class="mt-2 text-sm text-slate-600">
        กราฟนี้แสดง “จำนวนงาน (count)” ที่พบสกิลอื่นร่วมกับสกิลหลัก ใน job เดียวกัน
      </p>
    </div>
  </div>

  <!-- SearchJob Section แยกเป็นการ์ดของมันเอง -->
  <SearchJob />
</div>


    <!-- Hint -->
    <!-- <div class="mt-6 text-xs text-slate-500">
      Tip: กด Enter เพื่อค้นหา / คลิก tag เพื่อค้นหาต่อ
    </div>
  </div>
  <div v-if="result" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
     กราฟ Top sub-categories 
    <div class="space-y-6">
      <BarChart
        title="Top sub-categories ที่พบสกิลนี้"
        :labels="subcatLabels"
        :values="subcatValues"
      />
      <p class="mt-2 text-sm text-slate-600">
        กราฟนี้แสดง “จำนวนงาน (count)” ที่มีสกิลนี้ แยกตาม sub-category
      </p>
    </div> -->

    <!-- กราฟ Related skills -->
    <!-- <div class="space-y-6">
      <BarChart
        title="สกิลที่มักเจอร่วมกัน (Related skills)"
        :labels="relatedLabels"
        :values="relatedValues"
      />
      <p class="mt-2 text-sm text-slate-600">
        กราฟนี้แสดง “จำนวนงาน (count)” ที่พบสกิลอื่นร่วมกับสกิลหลัก ใน job เดียวกัน
      </p>
    </div> -->
  </div>
</template>

