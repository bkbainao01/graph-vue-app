<script setup>
import { onMounted } from 'vue';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    ScatterController,
    Filler,
    SubTitle,
    Decimation
} from 'chart.js';

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    ScatterController,
    Filler,
    SubTitle,
    Decimation
);

const sortData = (list1 = [], list2 = []) => {
    const list = [...list1, ...list2];
    return list.sort((a, b) => (a.year === b.year ? a.x - b.x : a.year - b.year));
};

const generateData = (initialValue, increment, count, yearStart) => {
    const data = [];
    let value = initialValue;
    let year = yearStart;

    for (let i = 1; i <= count; i++) {
        value += increment - Math.random() * 10;
        data.push({ x: value, y: i, date: '12-01-2023', year });
        if (i % 10 === 0) year++;
    }

    return data;
};

const data = generateData(200, 1500, 2000, 2023);
const data2 = generateData(300, 1200, 2000, 2023);

const getListOfXData = (sortedData = []) => {
    const years = [];
    const valueList = [];
    sortedData.forEach(element => {
        if (!years.includes(element.year)) {
            valueList.push(element);
            years.push(element.year);
        }
    });
    return valueList;
};

const totalDuration = 10000;
const delayBetweenPoints = totalDuration / data.length;

const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;

const animation = {
    x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) return 0;
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    },
    y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) return 0;
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
        }
    }
};

const lineMarker = {
    id: 'lineMarker',
    beforeDatasetsDraw: (chart) => {
        const { ctx, chartArea: { top, bottom, right, left }, scales: { x } } = chart;
        const sortList = sortData(data, data2);
        const verticalLines = getListOfXData(sortList);
        ctx.save();
        verticalLines.forEach(line => {
            const xPosition = x.getPixelForValue(line.x);
            if (xPosition < left || xPosition > right) return;

            ctx.save();
            ctx.beginPath();
            ctx.rect(left, top, right - left, bottom - top);
            ctx.clip();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#d0afe1';
            ctx.setLineDash([6, 10]);
            ctx.moveTo(xPosition, top);
            ctx.lineTo(xPosition, bottom);
            ctx.stroke();

            const pillWidth = 40;
            const pillHeight = 20;
            const pillX = xPosition - pillWidth / 2;
            const pillY = top + 3;

            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.setLineDash([]);
            ctx.lineWidth = 0;
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(line.year, xPosition, pillY + pillHeight / 2);
        });
        ctx.restore();
    }
};

const hoverLine = {
    id: 'hoverLine',
    beforeDatasetsDraw: (chart) => {
        const { ctx, tooltip, chartArea: { top, bottom }, scales: { x } } = chart;
        if (tooltip._active.length) {
            const xCoor = x.getPixelForValue(tooltip.dataPoints[0].parsed.x);
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'grey';
            ctx.moveTo(xCoor, top);
            ctx.lineTo(xCoor, bottom);
            ctx.stroke();
        }
    }
};

const createChartConfig = (type, datasets, options, plugins) => ({
    type,
    data: { datasets },
    options,
    plugins
});

const scatterGraphOptions = {
    responsive: false,
    maintainAspectRatio: false,
    interaction: {
        mode: 'nearest',
        axis: 'xy',
        intersect: false
    },
    scales: {
        x: {
            min: 0,
            max: 61650,
            ticks: { stepSize: 12330 },
            title: {
                display: true,
                text: 'Gp (MMscf)',
                padding: { top: 10, bottom: 30 }
            }
        },
        y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20 },
            title: {
                display: true,
                text: 'Qg_n (MMscfd)',
                padding: { top: 10, bottom: 30 }
            }
        },
        y2: {
            min: 0,
            max: 100,
            position: 'right',
            ticks: { stepSize: 20 },
            title: {
                display: true,
                text: 'Qg_n (MMscfd)',
                padding: { top: 10, bottom: 30 }
            }
        }
    },
    plugins: {
        tooltip: {
            mode: 'nearest',
            axis: 'xy',
            intersect: false,
            callbacks: {
                title: (context) => {
                    const item = context?.length ? context[0] : {};
                    return Object.keys(item)?.length ? `${item.dataset?.label}\nQg_n: ${item.raw?.y}\nGp: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : '';
                },
                label: () => ''
            }
        },
        legend: { display: false },
        lineMarker: { borderColor: 'grey', borderWidth: 1, borderDash: [6, 10] },
        hoverLine: {}
    },
    events: ['mousemove', 'mouseout', 'click']
};

const lineGraphOptions = {
    responsive: false,
    aspectRatio: 2,
    devicePixelRatio: 4,
    maintainAspectRatio: false,
    animation,
    interaction: {
        mode: 'nearest',
        axis: 'xy',
        intersect: false
    },
    plugins: {
        legend: true,
        tooltip: {
            mode: 'nearest',
            axis: 'xy',
            intersect: false,
            callbacks: {
                title: (context) => {
                    const item = context?.length ? context[0] : {};
                    return Object.keys(item)?.length ? `${item.dataset?.label}\nWHFP: ${item.raw?.y}\nWGR: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : '';
                },
                label: () => ''
            }
        },
        hoverLine: {}
    },
    events: ['mousemove', 'mouseout', 'click'],
    scales: {
        x: {
            type: 'linear',
            min: 0,
            max: 61650,
            ticks: { stepSize: 12330 },
            title: {
                display: true,
                text: 'WGR',
                padding: { top: 10, bottom: 30 }
            }
        },
        y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20 },
            title: {
                display: true,
                text: 'WHFP (barg)',
                padding: { top: 10, bottom: 30 }
            }
        },
        y2: {
            position: 'right',
            min: 0,
            max: 100,
            ticks: { stepSize: 20 },
            title: {
                display: true,
                text: 'WHFP (barg)',
                padding: { top: 10, bottom: 30 }
            }
        }
    }
};

const scatterGraphConfig = createChartConfig('scatter', [
    { label: 'Gas', data, backgroundColor: 'rgb(0, 0, 10, 0.2)' },
    { label: 'Test', data: data2, backgroundColor: 'rgb(165,143,236,0.5)' }
], scatterGraphOptions, [lineMarker, hoverLine]);

const lineGraphConfig1 = createChartConfig('line', [
    { borderColor: 'orange', borderWidth: 1, radius: 0, data, label: 'Choke Size (%)', fill: true, backgroundColor: 'rgba(251, 192, 147,0.2)' },
    { borderColor: 'grey', borderWidth: 1, radius: 0, data: data2, label: 'WHFP', fill: false, backgroundColor: 'grey' }
], lineGraphOptions, [hoverLine]);

const lineGraphConfig2 = createChartConfig('line', [
    { borderColor: 'blue', borderWidth: 1, radius: 0, data, label: 'WGR', fill: false, backgroundColor: 'blue' },
    { borderColor: 'grey', borderWidth: 1, radius: 0, data: data2, label: 'WGR2', fill: false, backgroundColor: 'grey', display: false }
], lineGraphOptions, [hoverLine]);

const hover = (move, chartP1, chartP2, chartP3) => {
    const points = chartP1.getElementsAtEventForMode(move, 'nearest', { intersect: true }, true);
    if (points[0]) {
        const dataset = points[0].datasetIndex;
        const datapoints = points[0].index;

        chartP2.tooltip.setActiveElements([{ datasetIndex: dataset, index: datapoints }]);
        chartP2.setActiveElements([{ datasetIndex: dataset, index: datapoints }]);
        chartP2.update();

        chartP3.tooltip.setActiveElements([{ datasetIndex: dataset, index: datapoints }]);
        chartP3.setActiveElements([{ datasetIndex: dataset, index: datapoints }]);
        chartP3.update();
    } else {
        chartP2.tooltip.setActiveElements([], { x: 0, y: 0 });
        chartP2.setActiveElements([], { x: 0, y: 0 });
        chartP2.update();

        chartP3.tooltip.setActiveElements([], { x: 0, y: 0 });
        chartP3.setActiveElements([], { x: 0, y: 0 });
        chartP3.update();
    }
};

onMounted(() => {

    const ctx1 = document.getElementById("myChart1");
    const ctx2 = document.getElementById("myChart2");
    const ctx3 = document.getElementById("myChart3");

    const chart1 = new Chart(ctx1, scatterGraphConfig);
    chart1.canvas.onmousemove = (event) => hover(event, chart1, chart2, chart3);
    const chart2 = new Chart(ctx2, lineGraphConfig1);
    chart2.canvas.onmousemove = (event) => hover(event, chart2, chart1, chart3);
    const chart3 = new Chart(ctx3, lineGraphConfig2);
    chart3.canvas.onmousemove = (event) => hover(event, chart3, chart1, chart2);
});
</script>

<template>
    <h1>Chart Js</h1>
    <span>Graph with vue-chart-3 (3.1.8) and chart.js (3.9.1) on Vue.js 3</span>
    <div class="chart-container">
        <canvas id="myChart1"
            style="margin-left: auto; margin-right: auto; width: 1000px; height: 600px;" />
        <canvas id="myChart2"
            style="margin-left: auto; margin-right: auto; width: 1000px; height: 600px;" />
        <canvas id="myChart3"
            style="margin-left: auto; margin-right: auto; width: 1000px; height: 600px;" />
    </div>
</template>