export class TaskPayload {
    title: string
    description: string
    difficulty: number
    priority: number
    reusable: boolean
    file?: File
    
    constructor(
        title: string,
        description: string,
        difficulty: number,
        priority: number,
        reusable: boolean,
        file?: File
    ) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.priority = priority;
        this.reusable = reusable;
        this.file = file;        
    }
}