<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <!-- Header Section -->
    <div class="max-w-6xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-gray-900">Transcript Analysis</h1>
      <p class="text-gray-600 mt-2">อัพโหลด Transcript ของคุณเพื่อวิเคราะห์ Hard Skills และ Soft Skills</p>
    </div>

    <!-- Main Content -->
    <Transcript />
  </div>
</template>

<script setup lang="ts">

useHead({
  title: 'Transcript Analysis',
})
</script>
