export class Task {
    id: number
    title: string
    description: string
    difficulty: number
    priority: number
    reusable: boolean
    file_url: string
    affectations_count:number
    completed: boolean
    
    constructor(
        title: string,
        description: string,
        difficulty: number,
        priority: number,
        reusable: boolean,
        id: number,
        file_url: string,
        affectations_count: number,
        completed: boolean


    ) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.priority = priority;
        this.reusable = reusable;
        this.id = id;
        this.file_url = file_url;
        this.affectations_count=affectations_count;
        this.completed=completed
        
    }
}