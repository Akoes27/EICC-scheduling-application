type Course = {
    id: number,
    name:string,
}
type Teacher = {
    canTeach: Course[]
}

interface Student {
    preferences: Course[]
    schedule?: Section[]
}

interface Section {
    students: Student[],
    teacher: Teacher,
    course: Course,
    maxStudents?: number,
}

class Schedule {
    static defaultSection:Section = {teacher:{canTeach:[]},students:[], course:{id:-1,name:""}}
    masterSchedule: Array<Array<Section>> = [[]]
    unscheduled: Array<Section> = []

    constructor(schedule:Section[][]){
        this.masterSchedule = schedule
        this.unscheduled = []
    }
    static create(numPeriods:number):Schedule{
        let schedule = Array.from({length:numPeriods}, () => Array.from({length:0}, () => {var x:Section = Schedule.defaultSection; return x}))
        return new Schedule(schedule)
    }

    checkConstraints(toAdd:Section, period:number): boolean {
        // the teacher cannot teach more than one class per period.
        // more constraints to be added
        if (this.masterSchedule == undefined || this.masterSchedule[period] == undefined)
            return false;
        this.masterSchedule[period].forEach((section:Section) =>{
            if (section.teacher == toAdd.teacher)
                return false;
            })
        return true
    }

    add(toAdd:Section, period:number):boolean{
        if (this.masterSchedule == undefined || this.masterSchedule[period] == undefined)
            return false
        if (this.checkConstraints(toAdd,period))
        {
            this.masterSchedule[period].push(toAdd)
            return true
        }
        else 
            return false
    }

    getRandomIndex():{x:number,y:number}|undefined{
        let index:number = Math.floor(Math.random() * this.masterSchedule.length)
        if (this.masterSchedule[index] == undefined){
            console.error("Schedule at index is undefined A")
            return undefined
        }
        let index2:number = Math.floor((this.masterSchedule[index].length * Math.random()))
        return {x:index,y:index2}
    }

    getRandomSection(schedule:Section[][]):Section | undefined{
        let temp = this.getRandomIndex()
        let index:number = temp?.x || 0
        let index2:number = temp?.y || 0

        if (schedule == undefined || schedule[index] == undefined){
            console.error("Schedule at index is undefined B")
            return undefined
        }
        else
            return schedule[index][index2]
        }
    /** prioritizes by the most students less than the max if all sections have a max or by the least number of students if any section lacks a max */
    prioritizeStudentSection(courses:Section[]):Section | undefined{
        if(courses == undefined || courses.length == 0 || courses[0] == undefined)
            return undefined
        let best:Section = courses[0]
        let allHaveMaxSize:boolean = true
        courses.forEach((section)=>{
            if(section.maxStudents == undefined)
            {
                allHaveMaxSize = false
            }
        })
        if (allHaveMaxSize)
            for(let i = 0; i < courses.length; i++){
                let course:Section = courses[i] || best
                if (course.maxStudents != undefined && course.students.length + 1 <= course.maxStudents)
                    return course
            }
        let leastStudents:number = best.students.length
        for(let i = 0; i < courses.length; i++){
            let course: Section = courses[i] || best
            if (course.students.length < best.students.length){
                leastStudents = course.students.length
                best = course
            }
        }
        return best
    }
    countCourse(schedule:Section[][], course:Course|undefined):number{
        if (course == undefined)
            return 0
        let count:number = 0
        for (let i = 0; i < schedule.length; i ++){
            let period: Section[] = schedule[i] || []
            for(let j = 0; j < (period.length || 0); j++)
                    if (period[j]?.course == course)
                        count++
        }
        return count
    }
    // helper method for getBestScheduleGivenMaster
    getRarestSection(filtered:Section[][]):number[]{
        if (filtered == undefined){
            console.log("you can't do that. Please pass a defined schedule into this function")
            return [-1,-1]
        }

        let shortestRow:Section [] = []
        for(let i = 0; i < filtered.length; i ++){
            length = filtered[i]?.length || 0
            if (filtered[i] != undefined && length != 0 && ((length < shortestRow.length)) || (shortestRow.length == 0))
                shortestRow = filtered[i] || []
        }
        let rarestSection = shortestRow[0]
        let lowestCount:number = this.countCourse(filtered, rarestSection?.course)
        for (let i = 1; i < shortestRow.length; i++){
            let count = this.countCourse(filtered,shortestRow[i]?.course)
            if (count < lowestCount)
            {
                lowestCount = count
                rarestSection = shortestRow[i]
            }
        }
        return [filtered.indexOf(shortestRow), shortestRow.indexOf(rarestSection || Schedule.defaultSection)]
    }
    // helper method for getBestScheduleGivenMaster
    removeAll(schedule:Section[][], course:Course):Section[][]{
        return Array.from(schedule, (period:Section[])=>{
            return period.filter(section=>{section.course != course})
        })
    }
    
    getBestScheduleGivenMaster(student:Student):Section[]{
        let unfiltered = this.masterSchedule
        if (unfiltered == undefined)
            return []
        // the filter removes all sections not preffered by the student. There are still possible duplicate courses in a period
        let filteredMaster:Section[][] = Array.from(
            {length:unfiltered.length},
            (x:undefined,i:number) => {
                if (unfiltered == undefined || unfiltered[i] == undefined)
                    return []
                else {
                    return unfiltered[i].filter(
                        (section) =>{
                            return student.preferences.includes(section.course)
                        }
                    )
                }
            })
        // the filter removes all duplicate courses within a period
        student.preferences.forEach((course) =>{
        for(let i = 0; i < filteredMaster.length; i++){
            let period:Section[] = filteredMaster[i] || []
            let priorityCourse = this.prioritizeStudentSection(period.filter(section=>{section.course == course}))
            if (priorityCourse != undefined)
                filteredMaster[i] = [...period.filter(section=>{section.course != course}),priorityCourse]
        }
    })
    let tempCourses = student.preferences
    let result: Section[] = Array.from({length:filteredMaster.length})
    while(tempCourses.length > 0){
        let index:number[] = this.getRarestSection(filteredMaster)
        if(index[0] == undefined || index[0] == -1)
            index[0] = 0
        if(index[1] == undefined || index[1] == -1)
            index[1] = -1
        let x:number = index[0]
        let y:number = index[1]
        if(filteredMaster[x] == undefined)
            filteredMaster[x] = []
        if(filteredMaster[x][y] == undefined)
            return result
        result[x] = filteredMaster[x][y]
        filteredMaster = this.removeAll(filteredMaster,filteredMaster[x][y].course)
        filteredMaster[x] = []
        tempCourses = tempCourses.filter(section=>{section!=result[x]?.course})
    }
// TODO: Logic needs checked. a lot

        return result
    }
        // returns the percent of preferences fulfilled
    checkPreferences(students:Student[]):number{
        let sumPreferences:number = 0
        let fulfilledPrefences: number = 0
        students.forEach((student:Student)=>{
            sumPreferences += student.preferences.length
            student.schedule = this.getBestScheduleGivenMaster(student)
            let sum =0
            student.schedule?.forEach((section:Section)=>{
                if (section != undefined)
                    sum++
                return sum
            })
            fulfilledPrefences += sum
        })

        // prevent dividing by 0
        if (sumPreferences == 0)
            sumPreferences = 1
        return fulfilledPrefences / sumPreferences
        }
}
// returns a tuple of the Schedule and an array of unscheduled sections
function makeSchedule(input:Section[],students:Student[]):Schedule{
    let result:Schedule = Schedule.create(8)
    input.forEach((section:Section)=>{
        let isScheduled:boolean = false
        for (let i:number = 0; i < result.masterSchedule.length; i++)
            if(result.add(section,i)){
                isScheduled = true
                break
            }
        if (!isScheduled)
            result.unscheduled.push(section)
    })
    return result
    
}



