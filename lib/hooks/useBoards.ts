"use client"
import { boardDataServices, boardServices, columnServices, tasksServices } from "../supabase/services"
import { useCallback, useEffect, useState } from "react";
import { Board, Columns, columnsWithTasks, Tasks } from "../supabase/models";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "../supabase/SupabaseProvider";
import { SupabaseClient } from "@supabase/supabase-js";

export function useBoards(){
    const {supabase} = useSupabase();
    const {user} = useUser();
    const [boards , setBoards] = useState<Board[]>([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState<string | null>(null);

    const loadBoards = useCallback(async()=>{
        if(!user) return;
        try{
            setLoading(true);
            const data = await boardServices.getBoards(supabase! , user.id)
            setBoards(data);
        }catch(err){
             setError(err instanceof Error ? err.message : "Failed to create Board")
        }finally{
            setLoading(false)
        }
    },[supabase , user])

    useEffect(()=>{
        if(user){
            loadBoards();
        }
    },[user , supabase , loadBoards])

    async function createBoard(boardData:{
        title:string,
        description?:string,
        color?:string
    }){
        if(!user) throw new Error("User Not Authenticated");
       try{
        const newBoard = await boardDataServices.createBoardWithDefaultColumns(supabase! , {
            ...boardData,
            user_id:user.id
        })
        setBoards((prev)=>[newBoard , ...prev])
       }catch(err){
            setError(err instanceof Error ? err.message : "Failed to create Board")
       }finally{
        setLoading(false)
       }

    }

    return {loading , error , boards , createBoard}
}

export function useBoard(boardId : string){
    const {supabase} = useSupabase();
    const [board , setBoard] = useState<Board | null>();
    const [columns , setColumns] = useState<columnsWithTasks[]>([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState<string | null>(null);
    const {user} = useUser();
    const loadBoard = useCallback(async()=>{
        if(!boardId) return;
        try{
            setLoading(true);
            const {board  , columnsWithTasks} = await boardDataServices.getBoardWithColumns(supabase! , boardId)
            setBoard(board);
            setColumns(columnsWithTasks);
        }catch(err){
             setError(err instanceof Error ? err.message : "Failed to create Board")
        }finally{
            setLoading(false)
        }
    },[supabase , boardId])

    useEffect(()=>{
        if(boardId){
            loadBoard();
        }
    },[boardId , supabase , loadBoard])

    async function updateBoard(boardId:string , updateData:Partial<Board>){
        if(!boardId) return;
        try{
            setLoading(true);
            const updatedBoard = await  boardServices.updateBoard(supabase! , boardId , updateData)
            setBoard(updatedBoard);
            return updatedBoard
        }catch(err){
             setError(err instanceof Error ? err.message : "Failed to update Board")
        }finally{
            setLoading(false)
        }
    }

    async function createRealTask(columnId:string , taskData:{
        title:string,
        description?:string,
        assignee?:string,
        due_date:string,
        priority:"Low" | "Medium" | "High"
    }){
        try{
            const newTask = await tasksServices.createTask(supabase! , {
                column_id:columnId,
                title:taskData.title,
                description:taskData.description || null,
                assignee:taskData.assignee || null,
                due_date:taskData.due_date || null,
                sort_order:columns.find((col)=>col.id === columnId)?.tasks.length || 0,
                priority:taskData.priority || "Medium"
            })
            
            setColumns((prev)=>
                prev.map((col)=> col.id === columnId ? {...col , tasks:[...col.tasks , newTask]} : col)
            )

            return newTask;
        }catch(err){
            setError(err instanceof Error ? err.message : "Failed to create Task")
        }
    }

    async function moveTask(taskId:string , newColumnId:string , newOrder:number){
        try{
            await tasksServices.moveTask(supabase! , taskId , newColumnId , newOrder);
            setColumns((prev)=>{
                const newColumns = [...prev]

                //find and remove the task from the old column
                let taskToMove : Tasks | null = null;
                for(const col of newColumns){
                    const taskIndex = col.tasks.findIndex((task)=>task.id === taskId)
                    if(taskIndex !== -1){
                        taskToMove = col.tasks[taskIndex]
                        col.tasks.splice(taskIndex , 1)
                        break;
                    }
                }

                if(taskToMove){
                    //add task to new column
                    const targetColumn = newColumns.find((col)=>col.id === newColumnId)
                    if(targetColumn){
                        targetColumn.tasks.splice(newOrder , 0 , taskToMove)
                    }
                }

                return newColumns;
            })
        }catch(err){
            setError(err instanceof Error ? err.message : "Failed to move Task")
        }
    }

    async function createColumn(columnTitle:string){

        if(!board || !user) throw new Error("Board not loaded");
        try{
           const newColumn = await columnServices.createColumn(supabase! , {title:columnTitle , board_id:board.id , sort_order:columns.length , user_id:user.id});
           setColumns((prev)=>[...prev , {...newColumn , tasks:[]}])
           return newColumn;
        }catch(err){
            setError(err instanceof Error ? err.message : "Failed to create Column")
        }
    }

    async function updateColumn(columnId:string , columnTitle:string){
        if(!board || !user) throw new Error("Board not loaded");
        try{
           const newColumn = await columnServices.updateColumn(supabase! , columnId , columnTitle);
           setColumns((prev)=> prev.map((col)=>col.id === columnId ? {...col , title:columnTitle} : col))
           return newColumn;
        }catch(err){
            setError(err instanceof Error ? err.message : "Failed to create Column")
        }
    }

    return {board , columns , setColumns , loading , error , updateBoard , createRealTask , moveTask , createColumn , updateColumn}
}