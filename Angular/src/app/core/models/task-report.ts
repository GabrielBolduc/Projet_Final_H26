export class TaskReport {
    tasks_count: number;
    tasks_completed: number;
    tasks_ongoing: number;
    tasks_waiting: number;
   

    constructor(
        tasks_count: number,
        tasks_completed: number,
        tasks_ongoing: number,
        tasks_waiting: number,
      
    ) {
        this.tasks_count = tasks_count;
        this.tasks_completed = tasks_completed;
        this.tasks_ongoing = tasks_ongoing;
        this.tasks_waiting = tasks_waiting;
      
    }
}