<script setup>
import { onMounted, ref, defineEmits, watch } from 'vue';
import { Chart } from 'chart.js';
import { storeToRefs } from "pinia";
import { useRefStore } from '../stores/refs';
const refStore = useRefStore()
const { refChart1, refChart2, refChart3 } = storeToRefs(refStore);

const props = defineProps({
    config: Object,
    hover: Function,
    chartId: String,
    chartRef: Object
});
const emit = defineEmits(['hoverOnMouseMove']);
const chartRef = ref(null);

onMounted(() => {
    const chart = new Chart(chartRef.value, props.config);
    refStore.updateRefChart(chartRef.value, props.chartId)
    chartRef.value.onmousemove = (event) => {
        refStore.updateRefChart(chartRef.value, props.chartId)
        emit('hoverOnMouseMove', event, chart);
    }
});

watch(chartRef, (value) => {
    refStore.updateRefChart(value, props.chartId)
}, { deep: true })

</script>
<template>
    <canvas :id="chartId" ref="chartRef" style="margin-left: auto; margin-right: auto; width: 80%; height: 600px;" />
</template>
