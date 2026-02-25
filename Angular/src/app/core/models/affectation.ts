export class Affectation {
    id: number
    user_id: number
    task_id: number
    festival_id: number
    start_time: string
    end_time: string
    responsability: string
   
   
    
    constructor(
       id: number,
       user_id: number,
       task_id: number,
       festival_id: number,
       start_time: string,
       end_time: string,
       responsability: string
    ) {
        this.id = id;
        this.user_id = user_id;
        this.task_id = task_id;
        this.festival_id = festival_id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.responsability = responsability;
    }
}