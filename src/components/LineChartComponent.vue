<script setup>
import { shallowRef, onMounted } from 'vue';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import { LineChart } from 'vue-chart-3';

// ✅ Explicitly register the LineController and required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

// Initialize chartData with 6150 fake data points
const chartData = shallowRef({
  labels: [], // Empty initially
  datasets: [
    {
      label: 'Live Data',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      data: data, // Generate fake data
      fill: false,
      tension: 0.4
    }
  ]
});

// Chart options
const options = shallowRef({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000, // 1-second smooth animation
    easing: 'linear'
  },
  scales: {
    x: {
      beginAtZero: true,
      min:0,
      max:61650,
      type: 'linear', // Use linear scale for x-axis
      ticks: {
          stepSize: 12330
      },
      title: {
        display: true,
        text: 'X Value'
      }
    },
    y: {
      beginAtZero: true,
      min:0,
      max:100,
      ticks: {
        stepSize: 20
      },
      title: {
        display: true,
        text: 'Y Value'
      }
    },
    y2: {
      beginAtZero: true,
      min:0,
      max:100,
      ticks: {
        stepSize: 20
      },
      position:'right',
      title: {
        display: true,
        text: 'Y Value'
      }
    }
  }
});

// Progressive data update
onMounted(() => {
});
</script>

<template>
  <h1>Chart Js</h1>
  <span>Graph with vue-chart-3 (3.1.8) and chart.js (3.9.1) on Vue.js 3</span>
  <div style="height: 400px;">
    <LineChart v-if="chartData" :chartData="chartData" :options="options" />
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
