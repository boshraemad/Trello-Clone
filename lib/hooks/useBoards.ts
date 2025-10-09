"use client"
import { boardDataServices, boardServices, tasksServices } from "../supabase/services"
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

    return {board , columns , loading , error , updateBoard , createRealTask}
}