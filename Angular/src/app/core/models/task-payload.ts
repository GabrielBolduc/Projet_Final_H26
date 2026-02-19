export class TaskPayload {
    title: string
    description: string
    difficulty: number
    priority: number
    reusable: boolean
    
    constructor(
        title: string,
        description: string,
        difficulty: number,
        priority: number,
        reusable: boolean,
    ) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.priority = priority;
        this.reusable = reusable;        
    }
}