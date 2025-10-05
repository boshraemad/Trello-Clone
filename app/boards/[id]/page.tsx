"use client"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/hooks/useBoards";
import { useParams } from "next/navigation";
import {useState} from "react";
export default function BoardPage(){
    const {id}=useParams<{id:string}>();
    const {board , columns , error , loading , updateBoard} = useBoard(id);
    const [isEditingTitle , setIsEditingTitle] = useState(false);
    const [newTitle , setNewTitle] = useState<string | undefined>("");
    const [newColor , setNewColor] = useState("");

    async function handleUpdateBoard(){
        if(!newTitle?.trim() || !board) return;

        try{
          const updatedBoard = await updateBoard(board.id , {
                title:newTitle.trim(),
                color:newColor || board.color
            })

            setIsEditingTitle(false)
        }catch(err){
            throw new Error("can not update board")
        }
    }
    return <div className='min-h-screen bg-gray-100'>
       <div> <Navbar boardTitle={board?.title} onEdit={()=>{
        setNewTitle(board?.title ?? "")
        setNewColor(board?.color ?? "")
        setIsEditingTitle(true)
       }}/></div>

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                    <DialogTitle>Edit Board</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e)=>{
                    e.preventDefault();
                }} className="space-y-4 sm:space-y-6">
                    <div className="">
                    <Label htmlFor="baordTitle" className="mb-4 sm:mb-6">Board Title</Label>
                    <Input id="boardTitle" value={newTitle} placeholder="Enter board title..." onChange={(e)=>{setNewTitle(e.target.value)}}/>
                    </div>
                    <div>
                        <Label className="mb-4 sm:mb-6">Board Color</Label>
                        <div className='grid grid-cols-4 sm:grid-cols-6 gap-2'>
                            {[
                                "bg-blue-500",
                                "bg-green-500",
                                "bg-yellow-500",
                                "bg-red-500",
                                "bg-pink-500",
                                "bg-purple-500",
                                "bg-gray-500",
                                "bg-orange-500",
                                "bg-teal-500",
                                "bg-emerald-500",
                                "bg-cyan-500",
                            ].map((color,key)=><button onClick={()=>setNewColor(color)} key={key} className={`${color} w-6 h-6 sm:w-8 sm:h-8 rounded-full ${color === newColor ? "ring ring-offset-2 ring-gray-900" : ""}`}/>)}
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={()=>setIsEditingTitle(false)}>Cancel</Button>
                        <Button type="submit" variant="default" onClick={handleUpdateBoard}>Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    </div>
}