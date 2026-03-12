<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

interface SankeyLink {
    from: string;
    to: string;
    weight: number;
}

const props = defineProps<{ links: SankeyLink[] }>();
const emit = defineEmits<{ (e: 'node-click', name: string): void }>();

const chartRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);

function loadGoogleCharts(): Promise<void> {
    return new Promise((resolve) => {
        if ((window as any).google?.visualization?.Sankey) {
            resolve();
            return;
        }

        const s = document.createElement('script');
        s.src = 'https://www.gstatic.com/charts/loader.js';

        s.onload = () => {
            (window as any).google.charts.load('current', { packages: ['sankey'] });
            (window as any).google.charts.setOnLoadCallback(resolve);
        };

        document.head.appendChild(s);
    });
}

function drawChart() {
    if (!chartRef.value || !props.links.length) {
        isLoading.value = false;
        return;
    }

    const google = (window as any).google;
    const data = new google.visualization.DataTable();

    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');

    // -------------------------------
    // SCALE WEIGHT (แก้เส้นบาง)
    // -------------------------------

    const weights = props.links.map((l) => l.weight);
    const max = Math.max(...weights);
    const min = Math.min(...weights);

    const MIN = 2;
    const MAX = 15;

    const scaleWeight = (w: number) => {
        if (max === min) return 6;
        return MIN + ((w - min) / (max - min)) * (MAX - MIN);
    };
    const filteredLinks = props.links.sort((a, b) => b.weight - a.weight).slice(0, 20);
    data.addRows(filteredLinks.map((l) => [l.to, l.from, scaleWeight(l.weight)]));

    const options = {
        height: 780,

        sankey: {
            node: {
                nodePadding: 40,
                width: 32,

                label: {
                    fontName: 'Sarabun',
                    fontSize: 14,
                    color: '#e2e8f0',
                    bold: true,
                },
            },

            link: {
                colorMode: 'gradient',
                fillOpacity: 0.6,
            },

            iterations: 64,
        },

        tooltip: {
            isHtml: true,
        },

        backgroundColor: 'transparent',
    };

    const chart = new google.visualization.Sankey(chartRef.value);

    google.visualization.events.addListener(chart, 'select', () => {
        const sel = chart.getSelection();

        if (sel?.length) {
            const row = sel[0].row;

            if (row != null) {
                const subCat = props.links[row]?.from;
                if (subCat) emit('node-click', subCat);
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
        <div v-if="isLoading" class="flex items-center justify-center h-[500px] text-slate-400">Loading Skill Map...</div>

        <div ref="chartRef" class="w-full" style="min-height: 500px" />
    </div>
</template>
