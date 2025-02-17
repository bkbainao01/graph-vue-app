<script setup>
import { shallowRef, onMounted, reactive } from 'vue';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController,ScatterController  } from 'chart.js';
import { LineChart,ScatterChart } from 'vue-chart-3';
import { faker } from '@faker-js/faker'; // Import faker for generating fake data
import moment from 'moment';

// ✅ Explicitly register the LineController and required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  ScatterController,
);

function getRandomInt(max) {
    return Math.random() * max;
}
// Generate 6150 unique fake data points
const generateFakeData = (prev= 200,nums = 1000) => {
  let yearInit = 2020
  let dateInit = 1
  const data = [];
  for (let i = 1; i <= 2000; i++) {
    prev += nums-(Math.random() * 10);
    data.push({ x: prev, y: i , date:`${yearInit}-1-${dateInit}`});
    if(i % 10 === 0){
      yearInit++
    }
  }
  return data
};

const dataObj = reactive({
  data1: generateFakeData(200,1500),
  data2: generateFakeData(300,1200)
})


// Initialize chartData with 6150 fake data points
const chartData0 = shallowRef({
  datasets: [
    {
      label: 'Scatter Dataset',
      borderColor: 'rgba(75, 192, 192, 1)',
      data: dataObj.data1, // Generate fake data
      fill: true,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }
  ]
});

const chartData1 = shallowRef({
  datasets: [
  {
    label: 'Choke Size (%)',
    borderColor: 'orange',
    data: dataObj.data1,
    fill:true,
    backgroundColor: ['rgba(251, 192, 147,0.2)'], // Add transparency
    radius: 0,

  },
  {
    label: 'WHFP',
    backgroundColor: 'grey', // Make this semi-transparent
    borderColor: 'grey',
    data: dataObj.data2,
    fill: true, // Ensure this dataset does NOT fill
    radius: 0,
  },
]

});

const sortData = (list1=[], list2=[]) =>{
    const list = [...list1 , ...list2]
    return list.sort((a,b)=>{
      const dateA = moment(a.date,'YYYY-M-D'); // Parse date using moment
      const dateB = moment(b.date,'YYYY-M-D'); // Parse date using moment
      if (dateA < dateB) {
        return -1
      } else if (dateB < dateA) {
          return 1
      } else {
          return 0
      }
    })
}

const getListOfXData = (sortedData = []) => {
    const years = [];
    const valueList = [];
    sortedData.forEach(element => {
        const year = moment(element.date,'YYYY-M-D').format('YYYY');
        if (years.length === 0 || !years.includes(year)) {
            element.year = year
            valueList.push(element)
            years.push(year)
        }
    });
    return valueList;
}

const lineMarker = {
    id: 'lineMarker',
    beforeDatasetsDraw: (chart, args, plugins) => {
        const { ctx, chartArea: { top, bottom, right, left }, scales: { x } } = chart;
        const sortList = sortData(dataObj.data1, dataObj.data2);
        const verticalLines = getListOfXData(sortList);
        ctx.save();
        verticalLines.forEach(line => {
            const xPosition = x.getPixelForValue(line.x);
            if(xPosition < left || xPosition > right ) {
                return;
            }

            // Clip to chart area to prevent overflow
            ctx.save();
            ctx.beginPath();
            ctx.rect(left, top, right - left, bottom - top);
            ctx.clip();
            // Draw the vertical line
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#d0afe1';
            ctx.setLineDash([5, 5]);
            ctx.moveTo(xPosition, top);
            ctx.lineTo(xPosition, bottom);
            ctx.stroke();

            // Draw rounded pill for year label
            const pillWidth = 40;
            const pillHeight = 20;
            let pillX = xPosition - pillWidth / 2;
            const pillY = top + 3; // Inside the graph area

            // Draw pill background behind the gridlines
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.setLineDash([0, 0]);
            ctx.lineWidth = 0;
            ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 10);
            ctx.fill();
            ctx.stroke();

            // Render year text inside pill
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(line.year, xPosition, pillY + pillHeight / 2);
        });
        ctx.restore();
    }
}

const chartData2 = shallowRef({
  labels: [], // Empty initially
  datasets: [
    {
      label: 'WGR',
      backgroundColor: 'rgb(0,0,128,0.8)',
      borderColor: 'rgb(0,0,128)',
      data: dataObj.data1, // Generate fake data
      fill: false,
      tension: 0.4,
      radius:0
    }
  ]
});


// Chart options
const options0 = shallowRef({
  responsive: false,
  maintainAspectRatio:false,
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
        text: 'Gp (MMscf)'
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
        text: 'Qg_n(MMscfd)'
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
        text: 'Qg_n(MMscfd)'
      }
    }
  },
  plugins: {
    tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nQg_n: ${item.raw?.y}\nGp: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
    legend:{
      display:false
    },
    lineMarker:{},
    crosshair: {
        line: {
          enabled: true,
          color: '#F66',  // crosshair line color
          width: 1        // crosshair line width
        },
        sync: {
          enabled: true,            // enable trace line syncing with other charts
          group: 1,                 // chart group
          suppressTooltips: false   // suppress tooltips when showing a synced tracer
        },
        zoom: {
          enabled: false,                                      // enable zooming
          zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box
          zoomboxBorderColor: '#48F',                         // border color of zoom box
          zoomButtonText: 'Reset Zoom',                       // reset zoom button text
          zoomButtonClass: 'reset-zoom',                      // reset zoom button class
        },
      }
  }
});

const options1 = shallowRef({
  responsive: false,
  maintainAspectRatio:false,
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
        text: 'Gp (MMscf)'
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
        text: 'Choke Size (%)'
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
        text: 'Choke Size (%)'
      }
    }
  },
  plugins:{
    tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nQg_n: ${item.raw?.y}\nGp: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
    crosshair: {
        line: {
          enabled: true,
          color: '#F66',
          width: 1
        },
        sync: {
          enabled: true,
          group: 1,
          suppressTooltips: false
        },
      }
  }
});

const options2 = shallowRef({
  responsive: false,
  maintainAspectRatio:false,
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
  },
  plugins:{
    tooltip: {
                mode: 'interpolate',
                intersect: false,
                callbacks: {
                    title: function async(context) {
                        const item = context?.length ? context[0] : {}
                        return Object.keys(item)?.length ? `${item.dataset?.label}\nQg_n: ${item.raw?.y}\nGp: ${item.raw?.x}\nDate: ${item.raw?.date || '-'}` : ''
                    },
                    label: function (context) {
                        return false;
                    }
                }
            },
    crosshair: {
        line: {
          enabled: true,
          color: '#F66',  // crosshair line color
          width: 1        // crosshair line width
        },
        sync: {
          enabled: true,            // enable trace line syncing with other charts
          group: 1,                 // chart group
          suppressTooltips: false   // suppress tooltips when showing a synced tracer
        },
        zoom: {
          enabled: false,                                      // enable zooming
          zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box
          zoomboxBorderColor: '#48F',                         // border color of zoom box
          zoomButtonText: 'Reset Zoom',                       // reset zoom button text
          zoomButtonClass: 'reset-zoom',                      // reset zoom button class
        },
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
    <div class="chart-container">
      <ScatterChart v-if="chartData0" :chartData="chartData0" :options="options0" :width="1200" :height="500" :plugins="[lineMarker]"/>
    </div>

    <!-- Container for LineChart 1 -->
    <div class="chart-container">
      <LineChart v-if="chartData1" :chartData="chartData1" :options="options1" :width="1200" :height="500"/>
    </div>

    <!-- Container for LineChart 2 -->
    <div class="chart-container">
      <LineChart v-if="chartData2" :chartData="chartData2" :options="options2" :width="1200" :height="500" />
    </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

</style>
