"use client"
import { boardDataServices, boardServices } from "../supabase/services"
import { useCallback, useEffect, useState } from "react";
import { Board, Columns } from "../supabase/models";
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
    const [columns , setColumns] = useState<Columns[]>([])
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState<string | null>(null);
    const loadBoard = useCallback(async()=>{
        if(!boardId) return;
        try{
            setLoading(true);
            const {board , columns} = await boardDataServices.getBoardWithColumns(supabase! , boardId)
            setBoard(board);
            setColumns(columns);
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

    return {board  , loading , error , updateBoard}
}