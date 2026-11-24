
type oldCourse = {id:number, name:string, length:string, room?:string}

export class Course {
    id: number;
    name:string;
    length:string;
    room?:string;


    constructor(id:number, name:string, length:string, room?:string){
        this.id = id;
        this.name = name;
        this.length = length;
        if (room != undefined)
            this.room = room
    }

    valueOf():number{
        return this.id
    }

    static blank():Course{
        return new Course(-1, "", "")
    }

    static getCourseFromInterface(course:oldCourse):Course{
        return new Course(course.id, course.name, course.length, course.room)
    }

    toString():string {
        return `[COURSE#:${this.id}]`
    }


}

export type Teacher = {
    canTeach: Course[],
    name:string
}

export interface Student {
    preferences: Course[]
    schedule?: Section[]
    name?: string

}

export class Section {
    students: Student[];
    teacher: Teacher;
    course: Course;
    maxStudents: number;

    constructor(students: Student[], teacher:Teacher, course:Course, maxStudents?:number){
    this.students= students;
    this.teacher = teacher;
    this.course =course
    this.maxStudents = maxStudents || 30;
    }

    public static blank():Section{
        return new Section([],{canTeach:[],name:""},Course.blank(),0)
    }

    toString():string{
        return `[ course:${this.course.id}, taught by ${this.teacher.name} with ${this.students.length} students ]`
    }

}

interface point {x:number,y:number}

export class Schedule {

    static blank():Schedule{
        let sectionsLSection:Array<Array<Section>> = []
        return new Schedule(sectionsLSection)
    } 


    masterSchedule: Array<Array<Section>> = [[]]
    unscheduled: Array<Section> = []
    fitness:number = -1

    constructor(schedule:Section[][]){
        this.masterSchedule = schedule
        this.unscheduled = []
        this.fitness = 0
    }
    static create(numPeriods:number):Schedule{
        let schedule = Array.from({length:numPeriods}, () => Array.from({length:0}, Section.blank))
        return new Schedule(schedule)
    }

    private checkConstraints(toAdd:Section, period:number): boolean {
        // the teacher cannot teach more than one class per period.
        // more constraints to be added
        if (this.masterSchedule == undefined || this.masterSchedule[period] == undefined)
            return false
        let safe:boolean = true
        this.masterSchedule[period].forEach((section:Section) =>{
            if (section.teacher == toAdd.teacher)
                safe = false;
            })
        return safe
    }

    private add(toAdd:Section, period:number):boolean{
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

    private getRandomIndex():{x:number,y:number}|undefined{
        let index:number = Math.floor(Math.random() * this.masterSchedule.length)
        if (this.masterSchedule[index] == undefined){
            console.error("Schedule at index is undefined A")
            return undefined
        }
        let index2:number = Math.floor((this.masterSchedule[index].length * Math.random()))
        return {x:index,y:index2}
    }

    /** prioritizes by the most students less than the max if all sections have a max or by the least number of students if any section lacks a max */
    private prioritizeStudentSection(courses:Section[]):Section | undefined{
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
    private countCourse(schedule:Section[][], course:Course|undefined):number{
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
    private getRarestSection(filtered:Section[][]):point{
        if (filtered == undefined){
            // console.log("you can't do that. Please pass a defined schedule into this function")
            return {x:-1,y:-1}
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
        return {x:filtered.indexOf(shortestRow), y:shortestRow.indexOf(rarestSection || Section.blank())}
    }
    // helper method for getBestScheduleGivenMaster
    private removeAll(schedule:Section[][], course:Course):Section[][]{
        return Array.from(schedule, (period:Section[])=>{
            return period.filter((section)=>{return section.course !== course})
        })
    }

    public toString():string{
        let result:string = ""
        for (let i = 0; i < this.masterSchedule.length; i ++){
            result += (i + 1) + ":"
            let period =this.masterSchedule[i]
            if (period != undefined)
                for (let j = 0; j < period.length; j++){
                    result = result.concat(this.stringifySection(period[j]));
            }
            result = result.concat("\n")
        }
        return result
    }

    private stringifySection(section?:Section):string{
        if (section == undefined)
            return "{}"
        return "{Course:" + section.course + ",Teacher:" + section.teacher + ",n:"+section.students + ",students:"+section.students + ",max-n" + section.maxStudents + "}"
    }
    public getBestScheduleGivenMaster(student:Student):Section[]{
        let unfiltered = this.masterSchedule
        // console.log("Unfiltered:")
        // console.log(this.stringifySchedule(unfiltered))

        if (unfiltered == undefined)
            return []
        // the filter removes all sections not prefered by the student. There are still possible duplicate courses in a period
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

        // console.log("Filtered 1 - only courses prefered by the student:")
        // console.log(`student's preferences:${student.preferences}`)
        // console.log(this.stringifySchedule(filteredMaster))
        
        // the filter removes all duplicate courses within each period
        student.preferences.forEach((course) =>{
        for(let i = 0; i < filteredMaster.length; i++){
            let period:Section[] = filteredMaster[i] || []
            let priorityCourse = this.prioritizeStudentSection(period.filter(section=>{section.course == course}))
            if (priorityCourse != undefined)
                filteredMaster[i] = [...period.filter(section=>{section.course != course}),priorityCourse]
        }
    })
    // console.log("Filtered 2 - no duplicates:")
    // console.log(this.stringifySchedule(filteredMaster))

    // setting a temporary variable
    let tempCourses = student.preferences
    // creating an array of the length of the schedule
    let result: Section[] = Array.from({length:filteredMaster.length})
    while(tempCourses.length > 0){

        // picking a section within 
        let index:point = this.getRarestSection(filteredMaster)
        // console.log("Point A", `${tempCourses}`)
        if(filteredMaster[index.x] == undefined){
            filteredMaster[index.x] = []
            // console.log("Point A2")
        }

        if(filteredMaster[index.x][index.y] == undefined)
        {
            // console.log(this.stringifySchedule(filteredMaster))
            // console.log(`x:${index.x},y:${index.y}`)
            // console.log("\n\n!!!\n\n")
            return result
        }
        // setting the student's class for that period to the course
        // console.log("Point B", `${tempCourses}`)
        result[index.x] = filteredMaster[index.x][index.y]
        // removing that course from the schedule of possible courses for that student
        // console.log("Point C", `${tempCourses}`)
        // console.log("CHECKPOINT before every instance of the course is ment to be removed")
        // console.log(this.stringifySchedule(filteredMaster))
        filteredMaster = this.removeAll(filteredMaster,filteredMaster[index.x][index.y].course)
        // console.log(this.stringifySchedule(filteredMaster))
        // removing all courses from that period (no other courses may be scheduled during that period for that student)
        filteredMaster[index.x] = []
        // ???
        // console.log("Point D", `${tempCourses}`)
        //remove that course
        let indexInTempCourses = tempCourses.indexOf(result[index.x].course)
        if (indexInTempCourses < 0){
            console.error("Invalid Course within Temp Courses")
            continue
        }
        // console.log(`indexintempcourses:${indexInTempCourses}`)
        tempCourses = this.remove(tempCourses,result[index.x].course)
        // console.log("Point E", `${tempCourses}`)
    }
// TODO: Logic needs checked. a lot

        return result
    }




        // returns the percent of preferences fulfilled
    public checkPreferences(students:Student[]):number{
        let totalPreferences:number = 0
        let fulfilledPrefences: number = 0
        students.forEach((student:Student)=>{
            totalPreferences += student.preferences.length
            student.schedule = this.getBestScheduleGivenMaster(student)
            let sum =0
            student.schedule?.forEach((section:Section)=>{
                if (section != undefined)
                    sum++
            })
            fulfilledPrefences += sum
        });

        // prevent dividing by 0
        if (totalPreferences == 0)
            totalPreferences = 1
        return fulfilledPrefences / totalPreferences
        }
        // returns a tuple of the Schedule and an array of unscheduled sections
    public static makeSchedule(input:Section[],students:Student[]):Schedule{
    let result:Schedule = Schedule.create(8)
    input.forEach((section:Section)=>{
        let isScheduled:boolean = false
        let sortedBySections = result.masterSchedule.sort((a,b) => a.length - b.length)

            for (let i:number = 0; i < result.masterSchedule.length; i++){
                let x = sortedBySections[i]
                if (x == undefined) {
                    continue;
                }
                if(result.add(section,result.masterSchedule.indexOf(x))){
                    isScheduled = true
                    break
                }
            }
                if (!isScheduled)
            result.unscheduled.push(section)
    })
    result.fitness = result.checkPreferences(students);
    return result;
}
    private stringifySchedule(schedule:Section[][]):string {
        let result = ""

        for (let i = 1; i <= schedule?.length || 0; i++){
            let period = schedule[i - 1]
            result += `\n\t ---${i} [\n`
            period?.forEach((section)=>{
                result+= `( ${section?.course} ) `
            });
            result += `] \n`
        }

        return result
        
    }


    private remove(courses:Course[], badCourse:Course):Course[]{
        let result = courses.filter((course)=> course !== badCourse)
        // console.log(courses.length, result.length)
        return result
    }
}



