<script setup>
import { onMounted,ref,defineEmits  } from 'vue';
import { Chart } from 'chart.js';

const props = defineProps({
    config: Object,
    hover: Function,
    chartId: String,
    chartRef: Object
});
const emit = defineEmits(['updateRef']);
const chartRef = ref(null)

onMounted(() => {
    emit('update-ref', chartRef.value);
    const chart = new Chart(chartRef.value, props.config);
    chartRef.value.onmousemove = (event) => props.hover(event, chart);
});
</script>
<template>
    <canvas :id="chartId" ref="chartRef" style="margin-left: auto; margin-right: auto; width: 80%; height: 600px;" />
</template>
