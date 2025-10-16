import { SupabaseClient } from "@supabase/supabase-js";
import { Board , Columns , Tasks } from "./models";

export const boardServices={
    async getBoards(supabase:SupabaseClient , userId:string):Promise<Board[]>{
        const {data , error} = await supabase.from("boards").select("*").eq("user_id" , userId).order("created_at" , {ascending:false})
        if(error) throw error
        return data || []
    },
    async createBoard(supabase:SupabaseClient ,board:Omit<Board,"id" | "created_at" | "updated_at">):Promise<Board>{
        const {data , error} = await supabase.from("boards").insert(board).select().single()
        if(error) throw error
        return data || []
    },
    async getBoard(supabase:SupabaseClient , boardId:string):Promise<Board>{
        const {data , error} = await supabase.from("boards").select("*").eq("id" , boardId).single();
        if(error) throw error
        return data || {}
    },
    async updateBoard(supabase:SupabaseClient , boardId:string , boardData:{title:string , color:string}):Promise<Board>{
        const {data , error} = await supabase.from("boards").update({...boardData , updated_at:new Date().toISOString()}).eq("id" , boardId).select().single()
        if(error) throw error;
        return data || {}
    }
}

export const columnServices={
    async getColumns(supabase:SupabaseClient , boardId:string):Promise<Columns[]>{
        const {data , error} = await supabase.from("columns").select("*").eq("board_id" , boardId).order("created_at" , {ascending:false})
        if(error) throw error
        return data || []
    },
    async createColumn(supabase:SupabaseClient , column:Omit<Columns,"id" | "created_at">):Promise<Columns>{
        const {data , error} = await supabase.from("columns").insert(column).select().single()
        if(error) throw error
        return data || []
    }
}

export const boardDataServices ={

    async createBoardWithDefaultColumns(supabase:SupabaseClient , boardData:{
        title:string,
        description?:string,
        color?:string,
        userId:string
    }){
        const board = await boardServices.createBoard(supabase , {title:boardData.title , description:boardData.description , color:boardData.color || "bg-blue-500" , user_id:boardData.userId})
        const defaultColumns = [
            {title:"to Do" , sort_order:0},
            {title:"in progress" , sort_order:1},
            {title:"Review" , sort_order:2},
            {title:"Done" , sort_order:3}
        ]

        await Promise.all(defaultColumns.map(column=>{
            columnServices.createColumn(supabase , {...column , board_id:board.id , user_id:boardData.userId})
        }))

     
        return board;
    } ,

    async getBoardWithColumns(supabase:SupabaseClient , boardId:string){

        const [board , columns] = await Promise.all([
            boardServices.getBoard(supabase , boardId),
            await columnServices.getColumns(supabase , boardId)

        ])

        if(!board) throw new Error("no baord found")
        const tasks = await tasksServices.getTasks(supabase , boardId)
        const columnsWithTasks=columns.map((column)=>({
            ...column,
            tasks:tasks.filter((task)=>task.column_id === column.id)
        }))
        return {board , columnsWithTasks};
    }

}

export const tasksServices={
    async getTasks(supabase:SupabaseClient , boardId:string):Promise<Tasks[]>{
        //join the tasks table with the columns table and filter by board_id
        const {data , error} = await supabase.from("tasks") 
        .select(
            `
            *,
            columns!inner(board_id) 
          `)
          .eq("columns.board_id", boardId).order("created_at" , {ascending:false})
        if(error) throw error 
        return data || []
    },

    async createTask(supabase:SupabaseClient , taskData:Omit<Tasks ,"id" | "created_at" | "updated_at">):Promise<Tasks>{
        const {data , error} = await supabase.from("tasks").insert(taskData).select().single()
        if(error){
            throw new Error("can not create task")
        }

        return data || {}
    },

    async moveTask(supabase:SupabaseClient , taskId:string , newColumnId:string , newOrder:number){
        const {data , error} = await supabase.from("tasks").update({column_id:newColumnId , sort_order:newOrder}).eq("id" , taskId)
        if(error){
            throw new Error("can not move task")
        }

        return data;
    }
}
// `*,columns!inner(board_id)`
// "columns.board_id"