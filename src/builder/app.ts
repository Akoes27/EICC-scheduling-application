import {Schedule} from "./algorithm"
import {type Section, type Student,type Teacher} from "./algorithm"
import {getData, getDataFromFile} from "./csv_reader"
import {getSections} from "./section_builder"

export function parse(file:string):[Student[], Teacher[]]{
      console.log("getting data")
    let temp = getDataFromFile(file)
    console.log("data obtained, setting arrays")
    const students:Student[] = temp[0]
    const teachers:Teacher[] = temp[1]
  return [students,teachers]
}


export function analyze(students:Student[], teachers:Teacher[]):Schedule {



        
    const maxStudents = 30;
    console.log("constructing sections")
    let startingSections = getSections(students, teachers, maxStudents)
    console.log("sections built, attempting schedule")
    let m_schedule:Schedule = Schedule.makeSchedule(startingSections, students)
    console.log("\nfinished\n")
    //console.log(m_schedule.toString())

    // m_schedule.masterSchedule.forEach((x)=>{
    //     console.log(x)
    // })
  return m_schedule
    
    }


