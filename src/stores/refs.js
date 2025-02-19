import { defineStore } from "pinia";

// Main Pinia Store
export const useRefStore = defineStore(
  "ref",
  {
  state: () => ({
    refChart1:null,
    refChart2:null,
    refChart3:null
  }),
  actions: {
    updateRefChart(ref,chartId){
        if(ref && chartId === 'myChart1'){
            this.refChart1 = ref
        }else if(ref && chartId === 'myChart2'){
            this.refChart2 = ref
        }else if(ref && chartId === 'myChart3'){
            this.refChart3 = ref
        }
    },
  },
});
