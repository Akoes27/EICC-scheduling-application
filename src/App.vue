
  <script setup lang="ts">
  // import HelloWorld from './components/HelloWorld.vue'
  import { Schedule } from "./builder/algorithm.ts";
  import {main} from "./builder/app.ts"
  
  import {handleError, ref} from "vue"



  const csvContent = ref<string | null>(null)

  const schedule = ref<Schedule>(Schedule.blank())

  const fitness = ref<number>(schedule.value.fitness)

  function runAlgorithm(){
    if (!csvContent.value)
      return
    try {
      
      schedule.value = main(csvContent.value);
      fitness.value = schedule.value.fitness
    } catch (error) {
      console.error("Error computing algorithm:", error)
    }
  }


async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  
  try {
    csvContent.value = await file.text()

    //schedule = main(csvContent)
    console.log("CSV file read successfully:", schedule)
  } catch (error) {
    console.error("Error reading or processing CSV file:", error)
  }
}

</script>

<template>


<div class="display-title">
  <h1 class="title-element-big">Scheduling Algorithm</h1>
  <p1>A Comprehensive Scheduling Application Adjusted for Central Catholic Systems</p1>
</div>

<div class="display-logo">
  <img src="./assets/eicc-logo.jpg" alt="EICC 3 logo" id="eicc-logo">
</div>

<div>
  <label>.csv file goes here:</label>
  <input type="file" @change="(e) => handleFileUpload(e)" accept=".csv" placeholder="input file here" class="input"/>
  <p>fitness score: {{fitness}}</p>
</div>

<div>
  <button v-on:click="runAlgorithm">Compute schedule</button>
  <span></span> 
  <div class="container" v-if="schedule?.masterSchedule">
    <table class="schedule">
      <!-- Outer loop iterates over each row -->
      <tr v-for="(row, rowIndex) in schedule.masterSchedule" :key="rowIndex" class="schedule row">
        <!-- Inner loop iterates over items in the current row -->
        <td v-for="(item, colIndex) in row" :key="`${rowIndex}-${colIndex}`" class="schedule item">
          {{ `[id:${item.course.id}, teacher:${item.teacher.name}]`}}
        </td>
      </tr>
    </table>
  </div>
</div>
</template>