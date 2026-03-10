<!--components/Trend/SankeyChart.vue -->
<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

interface SankeyLink {
    from: string;
    to: string;
    weight: number;
}

const props = defineProps<{
    links: SankeyLink[];
}>();

const emit = defineEmits<{
    (e: 'node-click', name: string): void;
}>();

const chartRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const googleLoaded = ref(false);

// ── ICT color palette (blue → green) ──────────────────────────────────────
const NODE_COLORS = ['#0d5fa3', '#1570b8', '#1a7fcc', '#2a9fd6', '#35b0e8', '#1a8c3e', '#22a34a', '#2db857', '#4caf50', '#66bb6a', '#0d8c6e', '#10a37f', '#1565c0', '#0277bd', '#006064'];

function loadGoogleCharts(): Promise<void> {
    return new Promise((resolve) => {
        if ((window as any).google?.visualization?.Sankey) {
            resolve();
            return;
        }
        // inject script ถ้ายังไม่มี
        if (!document.getElementById('google-charts-script')) {
            const script = document.createElement('script');
            script.id = 'google-charts-script';
            script.src = 'https://www.gstatic.com/charts/loader.js';
            script.onload = () => {
                (window as any).google.charts.load('current', { packages: ['sankey'] });
                (window as any).google.charts.setOnLoadCallback(() => {
                    googleLoaded.value = true;
                    resolve();
                });
            };
            document.head.appendChild(script);
        } else {
            (window as any).google.charts.setOnLoadCallback(() => {
                googleLoaded.value = true;
                resolve();
            });
        }
    });
}

function drawChart() {
    if (!chartRef.value || !props.links.length) return;

    const google = (window as any).google;
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    data.addRows(props.links.map((l) => [l.from, l.to, l.weight]));

    // สร้าง color map สำหรับ nodes
    const allNodes = [...new Set([...props.links.map((l) => l.from), ...props.links.map((l) => l.to)])];
    const nodeColors = allNodes.map((_, i) => NODE_COLORS[i % NODE_COLORS.length]);

    const options = {
        width: chartRef.value.offsetWidth || 700,
        height: 520,
        sankey: {
            node: {
                colors: nodeColors,
                label: {
                    fontName: 'Sarabun',
                    fontSize: 13,
                    color: '#e2e8f0',
                    bold: true,
                },
                nodePadding: 18,
                width: 28,
                interactivity: true,
            },
            link: {
                colorMode: 'gradient', // ไล่สีจาก source → target
                fillOpacity: 0.25,
            },
            iterations: 64,
        },
        tooltip: {
            isHtml: true,
            textStyle: { fontName: 'Sarabun', fontSize: 13 },
        },
        backgroundColor: 'transparent',
    };

    const chart = new google.visualization.Sankey(chartRef.value);

    // click event
    google.visualization.events.addListener(chart, 'select', () => {
        const sel = chart.getSelection();
        if (sel?.length) {
            const row = sel[0].row;
            if (row != null) {
                const from = props.links[row]?.from;
                if (from) emit('node-click', from);
            }
        }
    });

    chart.draw(data, options);
    isLoading.value = false;
}

onMounted(async () => {
    await loadGoogleCharts();
    await nextTick();
    drawChart();
});

watch(
    () => props.links,
    async () => {
        isLoading.value = true;
        await nextTick();
        drawChart();
    },
    { deep: true },
);
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="mb-6">
            <h3 class="text-xl font-bold text-slate-200">สายงาน → ทักษะที่ต้องการ</h3>
            <p class="text-sm text-slate-500 mt-1 uppercase tracking-tighter">Sankey · sub-category → hard skill · ความกว้างแสดงจำนวนตำแหน่งงาน</p>
        </div>

        <!-- Loading -->
        <div v-if="isLoading || !links.length" class="flex flex-col items-center justify-center h-[400px] gap-3 text-slate-500">
            <div v-if="isLoading" class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: rgba(13, 95, 163, 0.2); border-top-color: #2a9fd6" />
            <p v-if="isLoading" class="text-sm animate-pulse">กำลังโหลดกราฟ...</p>
            <p v-else class="text-sm">ไม่มีข้อมูล</p>
        </div>

        <!-- Chart container — Google Charts render ลงตรงนี้ -->
        <div
            ref="chartRef"
            class="w-full"
            :class="{ 'opacity-0 h-0': isLoading || !links.length, 'opacity-100': !isLoading && links.length }"
            style="transition: opacity 0.4s ease; min-height: 400px"
        />

        <!-- Legend -->
        <div v-if="!isLoading && links.length" class="mt-4 flex flex-wrap gap-3">
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <div class="w-8 h-2 rounded-full" style="background: linear-gradient(90deg, #0d5fa3, #4caf50); opacity: 0.6" />
                <span>ความกว้าง = จำนวนตำแหน่งงาน</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <div class="w-3 h-3 rounded-sm" style="background: #2a9fd6" />
                <span>สายงาน (ซ้าย)</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
                <div class="w-3 h-3 rounded-sm" style="background: #4caf50" />
                <span>ทักษะ (ขวา)</span>
            </div>
        </div>
    </div>
</template>
