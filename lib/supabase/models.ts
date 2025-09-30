export interface Board{
    id:string,
    created_at:string,
    title:string,
    description:string | null,
    color:string,
    user_id:string,
    updated_at:string
}

export interface Columns{
    id:string,
    created_at:string,
    board_id:string,
    title:string,
    sort_order:number
}

export interface Tasks{
    id:string,
    created_at:string,
    title:string,
    assignee:string | null,
    description:string | null,
    due_date:string | null,
    priority: "low" | "medium" | "high",
    sort_order:number,
    column_id:string
}