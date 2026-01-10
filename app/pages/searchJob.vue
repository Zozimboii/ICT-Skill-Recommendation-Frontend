<template>
  <div class="search-job-container">
    <h1>Search Job Count by Sub-Category</h1>
    
    <!-- Search Input -->
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search sub-category name..."
        class="search-input"
        @input="handleSearch"
      />
      <button @click="fetchAllJobCounts" class="btn-refresh">
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      Loading job counts...
    </div>

    <!-- Error State -->
    <div v-if="error" class="error">
      {{ error }}
      <button @click="fetchAllJobCounts" class="btn-retry">Retry</button>
    </div>

    <!-- Results -->
    <div v-else-if="result" class="results-section">
      <div style="border:1px solid #eee; border-radius:12px; padding:16px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <div>
            <h2 style="margin:0; color:#007bff;">{{ result.sub_category_name }}</h2>
            <p style="color:#666; margin:5px 0;">ID: {{ result.sub_category_id }}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:32px; font-weight:bold; color:#007bff;">{{ result.job_count }}</div>
            <p style="color:#666; margin:5px 0;">Total Jobs</p>
          </div>
        </div>
      </div>

      <!-- Top Categories -->
      <div v-if="result.top_categories && result.top_categories.length > 0" style="margin-bottom:20px;">
        <h3 style="color:#333; margin-bottom:10px;">📊 Top Categories</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:15px;">
          <div v-for="cat in result.top_categories" :key="`${cat.main_category_id}-${cat.sub_category_id}`" 
               style="border:1px solid #ddd; border-radius:8px; padding:15px;">
            <h4 style="margin:0 0 5px 0; color:#333;">{{ cat.main_category_name }}</h4>
            <p style="margin:5px 0; color:#666; font-size:14px;">{{ cat.sub_category_name }}</p>
            <span style="background:#007bff; color:white; padding:4px 8px; border-radius:4px; font-weight:bold;">{{ cat.job_count }} jobs</span>
          </div>
        </div>
      </div>

      <!-- Related Sub Categories -->
      <div v-if="result.related_sub_categories && result.related_sub_categories.length > 0">
        <h3 style="color:#333; margin-bottom:10px;">🔗 Related Sub-Categories</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:15px;">
          <div v-for="rel in result.related_sub_categories" :key="rel.sub_category_id" 
               style="border:1px solid #e0e0e0; border-radius:8px; padding:15px; background:#f9f9f9;">
            <h4 style="margin:0 0 5px 0; color:#333;">{{ rel.sub_category_name }}</h4>
            <span style="background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-weight:bold;">{{ rel.job_count }} jobs</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'

interface TopCategory {
  main_category_id: number | string
  main_category_name: string
  sub_category_id: number | string
  sub_category_name: string
  job_count: number
}

interface RelatedSubCategory {
  sub_category_id: number | string
  sub_category_name: string
  job_count: number
}

interface SearchJobsResult {
  sub_category_id: number | string
  sub_category_name: string
  job_count: number
  top_categories: TopCategory[]
  related_sub_categories: RelatedSubCategory[]
}

const { get } = useApi()

// State
const result = ref<SearchJobsResult | null>(null)
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed
const filteredJobCounts = computed(() => {
  // Don't filter locally - the API already filters
  return jobCounts.value
})

// Methods
const fetchAllJobCounts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await get<SearchJobsResult>('/searchjobs', { q: searchQuery.value })
    result.value = response
  } catch (err) {
    error.value = `Failed to fetch job counts: ${err instanceof Error ? err.message : 'Unknown error'}`
    console.error('Error fetching job counts:', err)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // Trigger search when user types
  if (searchQuery.value.trim()) {
    fetchAllJobCounts()
  } else {
    result.value = null
  }
}

// Lifecycle
// Don't fetch on mount - require user to search first
// onMounted(() => {
//   fetchAllJobCounts()
// })
</script>

<style scoped>
.search-job-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.btn-refresh {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-refresh:hover {
  background-color: #0056b3;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
  border-radius: 4px;
  font-size: 16px;
}

.loading {
  background-color: #e7f3ff;
  color: #004085;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  margin-bottom: 20px;
}

.btn-retry {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #721c24;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #5a151b;
}

.results-section {
  margin-top: 20px;
}

.results-count {
  color: #666;
  margin-bottom: 20px;
  font-weight: bold;
}

.no-results {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 18px;
}

.job-types-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.job-type-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.job-type-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.job-type-card h3 {
  margin: 0 0 10px 0;
  color: #007bff;
  font-size: 18px;
}

.job-type-card .description {
  color: #666;
  margin: 10px 0;
  line-height: 1.5;
}

.job-meta {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  font-size: 14px;
  color: #999;
}

.job-count {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.id {
  font-weight: bold;
}
</style>
