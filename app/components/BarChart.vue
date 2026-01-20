<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  title: string
  labels: string[]
  values: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      data: props.values,
    },
  ],
}))

const options = computed(() => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: props.title },
    tooltip: {
      callbacks: {
        // tooltip จะแสดง "label: value"
        label: (ctx: any) => `${ctx.label}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
}))
</script>

<template>
  <div class="w-full">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
