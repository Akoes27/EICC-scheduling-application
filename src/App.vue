
  <script setup lang="ts">
  // import HelloWorld from './components/HelloWorld.vue'
  import { Schedule } from "./builder/algorithm.ts";
  import {main} from "./builder/app.ts"
  
  import {handleError, ref} from "vue"

  const userInput = ref<string | null>(null)

  const schedule = ref(Schedule.blank())

  function runAlgorithm(){
    if (userInput.value == null)
      return
    schedule.value = main(userInput.value);
  }


async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  
  try {
    const csvContent = await file.text()

    schedule.value = main(csvContent)
    console.log("Schedule computed successfully:", schedule.value)
  } catch (error) {
    console.error("Error reading or processing CSV file:", error)
  }
}
</script>
<template>


<div>
  <label>.csv file goes here:</label>
  <input type="file" @change="handleFileUpload" accept=".csv" placeholder="input file here"/>
</div>

<div>
  <button v-on:click="runAlgorithm">Compute schedule</button>
  <span></span> 
  <div class="container">
    <table>
      <!-- Outer loop iterates over each row -->
      <tr v-for="(row, rowIndex) in schedule.masterSchedule" :key="rowIndex" class="row">
        <!-- Inner loop iterates over items in the current row -->
        <td v-for="(item, colIndex) in row" :key="`${rowIndex}-${colIndex}`" class="item">
          {{ `[id:${item.course.id}, teacher:${item.teacher.name}]`}}
        </td>
      </tr>
    </table>
  </div>
</div>



</template>