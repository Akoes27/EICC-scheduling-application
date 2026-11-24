import fs, { type PathOrFileDescriptor } from 'node:fs';
import Papa from 'papaparse';

import {type Student, type Teacher, Course} from "./algorithm"

export function getData(pathName:PathOrFileDescriptor): [Student[],Teacher[]]{
const file = fs.readFileSync(pathName, 'utf8');
  return getDataFromFile(file)
}

export function getDataFromFile(file:string): [Student[],Teacher[]]{
  interface section {
grade:number,courseName:string,course:number,sectionNumber:number,expression:string,term:string,room:string,teacher:string
}
interface temp {
  student:string,grade:number,courseName:string,course:number,sectionNumber:number,expression:string,term:string,room:string,teacher:string
}
interface student {
  student: String,
  sections: section[]
}

const parsed = Papa.parse<temp>(file, {
  delimiter: ',',
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true,
});

const { data } = parsed;

let rStudents:Array<Student> = []
let rTeachers:Array<Teacher> = []
data.forEach(element => {


  if(element?.student != undefined && typeof(element.student) == typeof(""))
  {
    rStudents.push({name:element.student, preferences:[]})
  }

  let course:Course = new Course(element.course, element.courseName, element.expression, element.room)
  if (course.id != 1000){
    // filtering out homerooms as preferences
    rStudents.at(rStudents.length - 1)?.preferences.push(course)
  }
  rTeachers.push({name:element.teacher, canTeach:[course]})
});

rTeachers = mergeLikeTeachers(rTeachers);

return [rStudents, rTeachers.filter(((teacher)=>(typeof(teacher.name) === typeof(""))))]
}

function mergeLikeTeachers(arr:Teacher[]): Teacher[]{
  let result:Teacher[] = []
  arr.forEach((teacher)=>{
    let knownTeacher:Teacher = getFromArray(teacher,result)
    // if the teacher is not already added to the result array, is not known about, then make them visible
    if (knownTeacher == teacher){
      result.push(teacher)
    }
    // the teacher is known about. The teacher should not be added an additional time, 
    // rather the instance of the teacher known about should be known to teach the class the teacher unknown instance teaches.
    else {
      knownTeacher.canTeach.concat(teacher.canTeach)

    }
  });
  return result
}

function getFromArray(t:Teacher, arr:Teacher[]):Teacher{
  let result = t
  arr.forEach((teacher)=>{
    if (teacher.name == t.name){
      result = teacher
    }
  })
  return result
}