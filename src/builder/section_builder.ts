import {Course} from "./algorithm"
import type {Student, Teacher, Section} from "./algorithm"

class courseCount{
    course:Course;
    count:number;

    constructor(course:Course, count:number){
        this.count = count;
        this.course = course;
    }

    valueOf(): number{
        return this.count
    }

    increment(){
        this.count+= 1
    }

    toString():string{
        return `{id:${this.course.id}, count:${this.count}}`
    }
}

function search(course:Course, toSearch:courseCount[]): number{
    let index = -1
    toSearch.forEach((x,i)=>{
        if (index == -1 && x.course.id == course.id){
            // console.log(`\n\n!! ${i} !!\n\n`)
            index = i
        }

    })
    return index
}
function searchCourses(course:Course, toSearch:Section[]): number{
    let index = -1
    toSearch.forEach((x,i)=>{
        if (index == -1 && x.course.id == course.id){
            // console.log(`\n\n!! ${i} !!\n\n`)
            index = i
        }

    })
    return index
}

function getDesiredCourses(students:Student[]): courseCount[]
{
    

    let preferedCourses: Course[] = [];

    students.forEach((stud,i)=>{
        stud.preferences.forEach((prefcourse)=>{
            preferedCourses.push(prefcourse);
        })
    })

    let filteredCourses:courseCount[] = [];

    while (preferedCourses.length > 0){
        let currCourse = preferedCourses.pop()
        if (currCourse == undefined)
            continue
        let index:number = search(currCourse,filteredCourses)
        //console.log(index)
        if(index == -1){
            filteredCourses.push(new courseCount(currCourse, 1))
        }
        else{
            filteredCourses.at(index)?.increment()
            // console.log(filteredCourses.at(index))

        }
    }
    // Map to a clean, flat structure before sorting to strip out heavy framework metadata
const cleanList = filteredCourses.map(item => ({
    id: item.course.id,
    original: item // keep reference if needed
    }));

    console.log(filteredCourses.length);
    cleanList.sort((a, b) => a.id - b.id);
    // console.log("sorted")

// Map back if necessary
const finalSorted = cleanList.map(item => item.original);
// console.log("mapped back")

    return finalSorted
}
function filterByTeachers(courses:courseCount[],teachers:Teacher[], maxsize:number):Section[]{
    let teachableCourses:Section[] = [];
    let unteachableCourses:Course[] = [];
    let result:Section[] = [];
    teachers.forEach((x)=>{
        x.canTeach.forEach((y)=>{
            teachableCourses.push({students:[],teacher:x,course:y})
        })
    })

    let counter = 20;
    while (courses.length > 0){
        console.log(courses.length)
        let c = courses.pop()
        if (c == undefined)
            continue;
        let index = searchCourses(c.course, teachableCourses)
        
        if (index == -1){ // if the course cannot be taught, it cannot be taught and does not end up in the returned array.
            unteachableCourses.push(c.course)
        }
        if (teachableCourses[index] == undefined)
            continue
        if(c.count > maxsize) { // if there are too many people who want to take it.
            for (let i = c.count; i >= maxsize; i -= maxsize){ // split it into smaller courses.
                courses.push(new courseCount(c.course, maxsize))
            }
            if (c.count % maxsize != 0)
                courses.push(new courseCount(c.course, c.count % maxsize));
            continue

        }
        result.push({students:[], teacher:teachableCourses[index].teacher, course:c.course,maxStudents:maxsize})
    }
    console.log("filtered by teachers");
    return result;
}

export function getSections(students:Student[], teachers:Teacher[], maxStudents:number):Section[]{
    return filterByTeachers(getDesiredCourses(students), teachers, maxStudents)
}

// // source GeeksForGeeks
// function mergeSort(array: any[]): any[] {
//     // console.log(array)
//     // console.log("MERGE SORT PRINTER")
//     // array.forEach((element)=>{
//     //     console.log(element)
//     // });
//     if (array.length <= 1) {
//         return array;
//     }
//     const middle = Math.floor(array.length / 2);
//     const leftHalf = array.slice(0, middle);
//     const rightHalf = array.slice(middle);
//     return merge(mergeSort(leftHalf), mergeSort(rightHalf));
// }

// function merge(left: any[], right: any[]): any[] {
//     let result: any[] = [];
//     let leftIndex = 0;
//     let rightIndex = 0;

//     while (leftIndex < left.length &&
//         rightIndex < right.length) {
//         if (left[leftIndex] < right[rightIndex]){
//             result.push(left[leftIndex]);
//             leftIndex++;
//         } else {
//             result.push(right[rightIndex]);
//             rightIndex++;
//         }
//     }

//     return result.concat(left.slice(leftIndex)).
//         concat(right.slice(rightIndex));
// }



// // let unsortedCourses:Course[] = [];
// // [{ id: 4, name: 'Lunch 12th', length: '5(A-F)', room: 'CAFE' },
// //             { id: 2054, name: 'AP Psychology', length: '6(A-F)', room: "307" },
// //             { id: 1100, name: 'Study Hall', length: '7(A-F)', room: 'Z302' },
// //             { id: 1041, name: 'World Literature', length: '4(A-F)', room: "409" },
// //             { id: 1100, name: 'Study Hall', length: '7(A-F)', room: 'Z302' },
// //             { id: 9022, name: 'Honors Band', length: '8(A-F)', room: 'PAC' },
// //             { id: 1100, name: 'Study Hall', length: '7(A-F)', room: 'Z302' },
// //             { id: 9022, name: 'Honors Band', length: '8(A-F)', room: 'PAC' },
// //             { id: 9022, name: 'Honors Band', length: '8(A-F)', room: 'PAC' },
// //             { id: 9022, name: 'Honors Band', length: '8(A-F)', room: 'PAC' },
// //             { id: 1000, name: 'Homeroom', length: 'FlX(A-F)', room: "108" },
// //             // { id: 5043, name: 'Honors Anatomy/ Physiology', length: '1(A-F)', room: 'Z204'},
// //             { id: 4041, name: 'Man of Faith', length: '2(A-F)', room: "411" },
// //             { id: 5042, name: 'Bioengineering', length: '3(A-F)', room: 'Z206' },
// //             { id: 1041, name: 'World Literature', length: '4(A-F)', room: "409" },
// //             { id: 1041, name: 'World Literature', length: '4(A-F)', room: "409" },
  
// //         ].forEach((x)=>{unsortedCourses.push(new Course(x.id, x.name,x.length, x.room))})
// // const sortedCourseArray: courseCount[] = 
// //     getDesiredCourses(
// //         [{preferences:unsortedCourses}]
// //     );
// // console.log(sortedNumberArray);
// // console.log(sortedCourseArray);
// // sortedCourseArray.forEach((x)=>{console.log(`${x}`)})

