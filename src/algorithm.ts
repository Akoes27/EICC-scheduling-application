type Course = {
    id: number,
    name:string,
}
type Teacher = {
    canTeach: Course[]


}

type Student = {
    preferences: Course[]

}

type Section = {
    students: Student[],
    teacher: Teacher,
    course: Course
}

class Schedule {
    schedule: Array<Array<Section>>
    unscheduled: Array<Section>

    constructor(schedule:Section[][]){
        this.schedule = schedule
        this.unscheduled = []
    }
    static create(length:number):Schedule{
        let schedule = Array.from({length:length}, () => Array.from({length:0}, () => {var x:Section = {teacher:{canTeach:[]},students:[], course:{id:0,name:""}}; return x}))
        return new Schedule(schedule)
    }

    checkConstraints(toAdd:Section, period:number): boolean {
        // the teacher cannot teach more than one class per period.
        // more constraints to be added
        if (this.schedule == undefined || this.schedule[period] == undefined)
            return false;
        this.schedule[period].forEach((section:Section) =>{
            if (section.teacher == toAdd.teacher)
                return false;
            })
        return true
    }

    add(toAdd:Section, period:number):boolean{
        if (this.schedule == undefined || this.schedule[period] == undefined)
            return false
        if (this.checkConstraints(toAdd,period))
        {
            this.schedule[period].push(toAdd)
            return true
        }
        else 
            return false
    }

    getRandomIndex():{x:number,y:number}|undefined{
        let index:number = Math.floor(Math.random() * this.schedule.length)
        if (this.schedule[index] == undefined){
            console.error("Schedule at index is undefined A")
            return undefined
        }
        let index2:number = Math.floor((this.schedule[index].length * Math.random()))
        return {x:index,y:index2}
    }

    getRandomSection():Section | undefined{
        let temp = this.getRandomIndex()
        let index:number
        let index2:number
        index = temp?.x || 0
        index2 = temp?.y || 0
        

        if (this.schedule == undefined || this.schedule[index] == undefined){
            console.error("Schedule at index is undefined B")
            return undefined
        }
        else
            return this.schedule[index][index2]
        }
}
// returns a tuple of the Schedule and an array of unscheduled sections
function makeSchedule(input:Section[]):Schedule{
    let result:Schedule = Schedule.create(8)
    input.forEach((section:Section)=>{
        let isScheduled:boolean = false
        for (let i:number = 0; i < result.schedule.length; i++)
            if(result.add(section,i)){
                isScheduled = true
                break
            }
        if (!isScheduled)
            result.unscheduled.push(section)
    })
    return result
    
}

