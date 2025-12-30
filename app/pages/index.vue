<template>
  <div style="max-width: 980px; margin: 40px auto; padding: 0 16px; font-family: system-ui;">
    <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">
      ICT Job Skill Recommendation
    </h1>
    <p style="color: #666; margin-bottom: 20px;">
      พิมพ์สกิล (เช่น <b>python</b>, <b>sql</b>, <b>excel</b>) เพื่อดูว่าตลาดงานพูดถึงมากแค่ไหน และอยู่ในสายงานใด
    </p>

    <div style="display:flex; gap:10px; align-items:center; margin-bottom: 16px;">
      <input
        v-model="q"
        @keydown.enter="search"
        placeholder="Search skill… (e.g. python)"
        style="flex:1; padding:12px 14px; border:1px solid #ddd; border-radius:10px; font-size:16px;"
      />
      <button
        @click="search"
        :disabled="loading || !q.trim()"
        style="padding:12px 16px; border-radius:10px; border:1px solid #111; background:#111; color:#fff; font-weight:600;"
      >
        {{ loading ? 'Searching…' : 'Search' }}
      </button>
    </div>

    <div v-if="error" style="background:#ffecec; border:1px solid #ffb3b3; padding:12px; border-radius:10px; margin-bottom: 16px;">
      {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result" style="display:grid; grid-template-columns: 1fr; gap: 14px;">
      <div style="border:1px solid #eee; border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <div style="font-size:18px; font-weight:700;">Skill: {{ result.skill_name }}</div>
            <div style="color:#666;">Type: {{ result.skill_type }}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:26px; font-weight:800;">{{ result.job_count }}</div>
            <div style="color:#666;">jobs mention this skill</div>
          </div>
        </div>
      </div>

      <div style="border:1px solid #eee; border-radius:12px; padding:16px;">
        <div style="font-size:16px; font-weight:700; margin-bottom: 10px;">Top sub-categories ที่เจอสกิลนี้</div>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align:left; border-bottom:1px solid #eee;">
              <th style="padding:8px;">Sub-category</th>
              <th style="padding:8px;">Jobs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in result.top_subcategories" :key="row.sub_category_id" style="border-bottom:1px solid #f3f3f3;">
              <td style="padding:8px;">
                {{ row.sub_category_name }}
                <div style="color:#888; font-size:12px;">
                  {{ row.main_category_name }}
                </div>
              </td>
              <td style="padding:8px; font-weight:700;">{{ row.count }}</td>
            </tr>
            <tr v-if="result.top_subcategories.length === 0">
              <td colspan="2" style="padding:10px; color:#777;">ไม่พบข้อมูล sub-category</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="border:1px solid #eee; border-radius:12px; padding:16px;">
        <div style="font-size:16px; font-weight:700; margin-bottom: 10px;">แนะนำสกิลที่มักเจอร่วมกัน</div>
        <div style="display:flex; flex-wrap:wrap; gap:10px;">
          <button
            v-for="s in result.related_skills"
            :key="s.skill_name"
            @click="quickSearch(s.skill_name)"
            style="border:1px solid #ddd; padding:8px 10px; border-radius:999px; background:#fff; cursor:pointer;"
          >
            {{ s.skill_name }} <span style="color:#666;">({{ s.count }})</span>
          </button>
          <div v-if="result.related_skills.length === 0" style="color:#777;">
            ยังไม่มี related skills
          </div>
        </div>
      </div>
    </div>

    <!-- Hint -->
    <div style="margin-top: 18px; color:#666; font-size: 13px;">
      Tip: กด Enter เพื่อค้นหา / คลิก tag เพื่อค้นหาต่อ
    </div>
  </div>
</template>

<script setup lang="ts">
type SubCategoryRow = {
  main_category_id: number
  main_category_name: string
  sub_category_id: number
  sub_category_name: string
  count: number
}

type RelatedSkillRow = {
  skill_name: string
  count: number
}

type SkillSearchResponse = {
  skill_name: string
  skill_type: string
  job_count: number
  top_subcategories: SubCategoryRow[]
  related_skills: RelatedSkillRow[]
}

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
    // เรียก backend: /skills/search?q=python
    const data = await get<SkillSearchResponse>('/skills/search', { q: keyword })
      console.log('API data:', data)
    result.value = data
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
