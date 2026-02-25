import { Festival } from "./festival"
import { Task } from "./task"
import { User } from "./user"

export class Affectation {
    id: number
    expected_start: string
    expected_end: string
    responsability: string
    task: Task
    festival:Festival
    user:User
    start:string|null
    end:string|null
   
   
    
    constructor(
       id: number,
       expected_start: string,
       expected_end: string,
       responsability: string,
       task: Task,
       festival:Festival,
       user:User,
       start: string,
       end: string
       
    ) {
        this.id = id;
        this.task = task;
        this.festival = festival;
        this.user = user;
        this.expected_start = expected_start;
        this.expected_end = expected_end;
        this.responsability = responsability;
        this.start = start; 
        this.end = end;
    }
}