export class Task {
    id: number
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
        id: number
    ) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.priority = priority;
        this.reusable = reusable;
        this.id = id;
        
    }
}