"use client"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/hooks/useBoards";
import { Columns, columnsWithTasks } from "@/lib/supabase/models";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useParams } from "next/navigation";
import {useState} from "react";
import { Calendar, MoreHorizontal, Plus, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select , SelectTrigger , SelectContent , SelectItem , SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DndContext, DragStartEvent , DragEndEvent , DragOverEvent, rectIntersection, useDroppable, DragOverlay, useSensor, PointerSensor } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {CSS} from '@dnd-kit/utilities';
import { Tasks } from "@/lib/supabase/models";
import { useSensors } from "@dnd-kit/core";

function DroppableColumn({columnInfo , children , onEditColumn , onCreateTask }:{columnInfo:columnsWithTasks , children:React.ReactNode , onEditColumn:(column:columnsWithTasks)=>void , onCreateTask:(taskData:any)=>Promise<void>}){
    const {setNodeRef , isOver} = useDroppable({id:columnInfo.id})

    return (
        <div ref={setNodeRef} className={`lg:w-80 flex-shrink-0 w-full ${isOver? "bg-blue-50 rounded-lg" : ""}`}>
            <div className={`bg-white rounded-lg shadow-sm border ${isOver ? "ring-2 ring-blue-300" : ""}`}>
                <div className="p-3 sm:p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900">{columnInfo.title}</h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{columnInfo.tasks.length}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={()=>onEditColumn(columnInfo)}>
                            <MoreHorizontal/>
                        </Button>
                    </div>
                </div>
                {/* column content */}
                <div className="p-2">{children}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700 mt-3">
                            <Plus/>
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
                    <DialogTitle>Filter Tasks</DialogTitle>
                    <p className="text-sm text-gray-600">filter tasks by priority,assignee or due date</p>
                </DialogHeader>
                <form className="space-y-4" onSubmit={onCreateTask}>
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input id="title" placeholder="add task title" name="title"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea id="description" placeholder="add task description" name="description" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Input id="assignee" placeholder="who should do it ?" name="assignee"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Priority</Label>
                       <Select defaultValue="Medium" name="priority">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                     <SelectContent>
                        {
                            ["Low" , "Medium" , "High"].map((priority , key)=><SelectItem value={priority} key={key}>{priority}</SelectItem>)
                        }
                        </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" name="dueDate"/>
                    </div>
                    <div className="space-y-2 flex items-center justify-end pt-4">
                        <Button variant="default" type="submit">Create Task</Button>
                    </div>
                </form>
                </DialogContent>
                </Dialog>
                </div>
            </div>
        </div>
    )
}

function SortableTask({task}:{task:Tasks}){
    const {attributes , listeners ,setNodeRef , transform , transition , isDragging} = useSortable({id:task.id})
    const styles={
        transform : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }
    return(
        <div ref={setNodeRef} style={styles}{...listeners} {...attributes}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow ">
            <CardContent className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-900 min-w-0 flex-1 leading-tight pr-2">{task.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description || "no description."}</p>
                     {/* task meta */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">{task.assignee && (
                            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                                <User className="w-3 h-3"/>
                                <span className="truncate">{task.assignee}</span>
                            </div>
                        )}
                        {task.due_date && (
                            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3"/>
                                <span className="truncate">{task.due_date}</span>
                            </div>
                        )}
                        <div className={`w-2 h-2 flex-shrink-0 rounded-full ${task.priority === "Low" ? "bg-red-500" : task.priority === "Medium" ? "bg-yellow-500" : "bg-green-500"}`}/>
                        </div>
                     </div>
                </div>
            </CardContent>
        </Card>
        </div>
    )
}

function TaskOverlay({task} : {task:Tasks}){
    return(
        <Card className="cursor-pointer hover:shadow-md transition-shadow ">
            <CardContent className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm text-gray-900 min-w-0 flex-1 leading-tight pr-2">{task.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{task.description || "no description."}</p>
                     {/* task meta */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">{task.assignee && (
                            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                                <User className="w-3 h-3"/>
                                <span className="truncate">{task.assignee}</span>
                            </div>
                        )}
                        {task.due_date && (
                            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3"/>
                                <span className="truncate">{task.due_date}</span>
                            </div>
                        )}
                        <div className={`w-2 h-2 flex-shrink-0 rounded-full ${task.priority === "Low" ? "bg-red-500" : task.priority === "Medium" ? "bg-yellow-500" : "bg-green-500"}`}/>
                        </div>
                     </div>
                </div>
            </CardContent>
        </Card>
    )
}
export default function BoardPage(){
    const {id}=useParams<{id:string}>();
    const {board , columns , setColumns , error , loading , updateBoard , createRealTask , moveTask , createColumn , updateColumn} = useBoard(id);
    const [isEditingTitle , setIsEditingTitle] = useState(false);
    const [isFilterOpen , setIsFilterOpen] = useState(false);
    const [isCreatingColumn , setIsCreatingColumn] = useState(false);
    const [isEditingColumn , setIsEditingColumn] = useState(false);
    const [editingColumnTitle , setEditingColumnTitle] = useState("");
    const [editingColumn , setEditingColumn] = useState<columnsWithTasks | null>(null)
    const [newColumnTitle , setNewColumnTitle] = useState("")
    const [newTitle , setNewTitle] = useState<string | undefined>("");
    const [newColor , setNewColor] = useState("");
    const [activeTask , setActiveTask] = useState<Tasks | null>(null);
    const [filters , setFilters] = useState({
        priority:[] as string[],
        assignee:[] as string[],
        dueDate: null as string | null
    })
    const sensors = useSensors(useSensor(
        PointerSensor , {
            activationConstraint:{
                distance:8,
            }
        }
    ))

    function handleFilterChange(type: "priority" | "assignee" | "dueDate" , value:string | string[] | null){
        setFilters((prev)=>({...prev , [type]:value}))
    }

    function handleClearFilters(){
        setFilters({
            priority:[] as string[],
            assignee:[] as string[],
            dueDate: null as string | null
        })
    }
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

    async function createTask(taskData:{
        title:string,
        description?:string,
        assignee?:string,
        due_date:string,
        priority:"Low" | "Medium" | "High"
    }){
        const targetColumn = columns[0];
        if(!targetColumn){
            throw new Error("no column available to add task")
        }

        await createRealTask(targetColumn.id , taskData);
    }
    async function handleCreateTask(e:any){
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const taskData = {
            title:formData.get("title") as string,
            description:formData.get("description") as string || undefined,
            assignee:formData.get("assignee") as string || undefined,
            due_date:formData.get("dueDate") as string || undefined,
            priority:(formData.get("priority") as "Low" | "Medium" | "High") || "Medium",
        }

        if(taskData.title.trim()){
            await createTask(taskData);
            const trigger = document.querySelector('[data-state = "open"') as HTMLElement
            if(trigger) trigger.click();
        }

    }

    function handleDragStart(event:DragStartEvent){
        const taskId = event.active.id as string;
        const task = columns.flatMap((col)=>col.tasks).find((task)=>task.id === taskId);

        if(task){
            setActiveTask(task);
        }
    }
    function handleDragOver(event:DragOverEvent){
        const {active , over} = event;
        if(!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const sourceColumn = columns.find((col)=>col.tasks.some((task)=>task.id === activeId))
        const targetColumn = columns.find((col)=>col.tasks.some((task)=>task.id === overId))

        if(!sourceColumn || !targetColumn) return;
        if(sourceColumn.id = targetColumn.id){
            const activeIndex=sourceColumn.tasks.findIndex((task)=>task.id === activeId)
            const overIndex=targetColumn.tasks.findIndex((task)=>task.id === overId)
            

            if(activeIndex !== overIndex){
                setColumns((prev:columnsWithTasks[])=>{
                    const newColumns=[...prev];
                    const column = newColumns.find((col)=>col.id === sourceColumn.id)
                    if(column){
                        const tasks = [...column.tasks]
                        const [removed] = tasks.splice(activeIndex , 1);
                        tasks.splice(overIndex,0,removed)
                        column.tasks=tasks;
                    }
                    return newColumns;
                })
            }
        }

    }
    async function handleDragEnd(event:DragEndEvent){
        const {active , over} = event;
        if(!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        const targetColumn = columns.find((col)=>col.id === overId);
        if(targetColumn){
            const sourceColumn = columns.find((col)=>col.tasks.some((task)=>task.id === taskId))
            if(sourceColumn && sourceColumn.id !== targetColumn.id){
                await moveTask(taskId , targetColumn.id , targetColumn.tasks.length )
            }
        }else{
            //check to see if were dropping on another task
            const sourceColumn = columns.find((col)=>col.tasks.some((task)=>task.id === taskId))
            const targetColumn = columns.find((col)=>col.tasks.some((task)=>task.id === overId))

            if(sourceColumn && targetColumn){
                const oldIndex=sourceColumn.tasks.findIndex((task)=>task.id === taskId)
                const newIndex=targetColumn.tasks.findIndex((task)=>task.id === overId)

                if(oldIndex !== newIndex){
                    await moveTask(taskId , targetColumn.id , newIndex)
                }
            }
        }
    }

    async function handleCreateColumn(e:React.FormEvent){
        e.preventDefault();

        if(!newColumnTitle.trim()) return;

        await createColumn(newColumnTitle);
        setNewColumnTitle("");
        setIsCreatingColumn(false);
    }

    
    async function handleUpdatingColumn(e:React.FormEvent){
        e.preventDefault();

        if(!editingColumnTitle.trim() || !editingColumn) return;

        await updateColumn(editingColumn.id , editingColumnTitle.trim());
        setEditingColumnTitle("");
        setIsEditingColumn(false);
        setEditingColumn(null);
    }

    function handleEditingColumn(column:columnsWithTasks){
        setIsEditingColumn(true)
        setEditingColumnTitle(column.title)
        setEditingColumn(column)
    }

    const filteredColumns = columns.map((col)=>({
        ...col,
        tasks:col.tasks.filter((task)=>{
            //filter by priority
            if(filters.priority.length > 0 && !filters.priority.includes(task.priority)){
                return false;
            }
            
            //filter by dueDate
            if(task.due_date && filters.dueDate){
                const taskDate = new Date(task.due_date).toDateString();
                const filterDate = new Date(filters.dueDate).toDateString();
                if(taskDate !== filterDate){
                    return false;
                }
            }

            return true;
        })
    }))
    return <>
    <div className='min-h-screen bg-gray-100'>
       <div> <Navbar boardTitle={board?.title} onEdit={()=>{
        setNewTitle(board?.title ?? "")
        setNewColor(board?.color ?? "")
        setIsEditingTitle(true)
       }} onFilter={()=>{setIsFilterOpen(true)}} filterCount={
        Object.values(filters).reduce((count , v)=> count + (Array.isArray(v) ? v.length :  v!==null ? 1 : 0) , 0)
       }/></div>

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

        {/* filter dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
                    <DialogTitle>Filter Tasks</DialogTitle>
                    <p className="text-sm text-gray-600">filter tasks by priority,assignee or due date</p>
                </DialogHeader>
               <div className="space-y-4">
               <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                   <div className="flex items-center flex-wrap gap-2">
                   {["Low","Medium","High"].map((priority,key)=><Button onClick={()=>{
                        const newPriorities = filters.priority.includes(priority) ? filters.priority.filter((p)=>p!==priority) : [...filters.priority , priority]
                        handleFilterChange("priority" , newPriorities)
                   }} key={key} variant={filters.priority.includes(priority) ? "default" : "outline"}>
                        {priority}
                    </Button>)}
                   </div>
                </div>
                {/* <div className="space-y-2">
                    <Label htmlFor="priority">Assignee</Label>
                   <div className="flex items-center flex-wrap gap-2">
                   {["Low","Medium","High"].map((priority,key)=><Button key={key} variant="outline">
                        {priority}
                    </Button>)}
                   </div>
                </div> */}
                 <div className="space-y-2">
                    <Label htmlFor="priority">Due Date</Label>
                    <Input type="date" value={filters.dueDate || ""} onChange={(e)=>handleFilterChange("dueDate" , e.target.value || null)}/>
                </div>
                <div className="flex items-center justify-between">
                    <Button variant="secondary" onClick={handleClearFilters}>Clear Filters</Button>
                    <Button variant="default" onClick={()=>setIsFilterOpen(false)}>Apply Filters</Button>
                </div>
               </div>
            </DialogContent>
        </Dialog>

        {/* stats */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Total Tasks: </span>
                        {columns.reduce((sum:number , col:Columns)=>sum = sum + col.tasks.length , 0)}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus/>
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
                    <DialogTitle>Filter Tasks</DialogTitle>
                    <p className="text-sm text-gray-600">filter tasks by priority,assignee or due date</p>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateTask}>
                    <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input id="title" placeholder="add task title" name="title"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea id="description" placeholder="add task description" name="description" rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Assignee</Label>
                        <Input id="assignee" placeholder="who should do it ?" name="assignee"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Priority</Label>
                       <Select defaultValue="Medium" name="priority">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                     <SelectContent>
                        {
                            ["Low" , "Medium" , "High"].map((priority , key)=><SelectItem value={priority} key={key}>{priority}</SelectItem>)
                        }
                        </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" name="dueDate"/>
                    </div>
                    <div className="space-y-2 flex items-center justify-end pt-4">
                        <Button variant="default" type="submit">Create Task</Button>
                    </div>
                </form>
                </DialogContent>
                </Dialog>
            </div>

            {/*tasks columns */}
         <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}
          >
         <div className="mt-2 sm:mt-4 flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:mx-2 lg:[&::-webkit-scrollbar-track]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-100 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0">
                {
                    filteredColumns.map((column , key)=><DroppableColumn key={key} columnInfo={column} onCreateTask={handleCreateTask} onEditColumn={handleEditingColumn}>
                        <SortableContext items={column.tasks.map((task)=>task.id)}
                         strategy={verticalListSortingStrategy}
                         >
                        <div className="space-y-3">
                            {
                                column.tasks.map((task, key)=><SortableTask key={key} task={task}/>)
                            }
                        </div>
                        </SortableContext>
                    </DroppableColumn>)
                }
                <div className="w-full lg:flex-shrink-0 lg:w-80">
                    <Button onClick={()=>setIsCreatingColumn(true)} variant="outline" className="w-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"><Plus/>Add Another List</Button>
                </div>
                <DragOverlay>
                    {activeTask ? <TaskOverlay task={activeTask}/> : null}
                </DragOverlay>
           </div>
         </DndContext>
        </main>
    </div>
    <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add new Column to organize your tasks</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateColumn}>
                    <div className="space-y-2">
                        <Label>Column Title</Label>
                        <Input id="columnTitle" value={newColumnTitle} onChange={(e)=>setNewColumnTitle(e.target.value)} placeholder="enter column title..." required/>
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                        <Button variant="outline" type="button" onClick={()=>setIsCreatingColumn(false)}>Cancel</Button>
                        <Button type="submit">Create Column</Button>
                    </div>
                </form>
            </DialogContent>
    </Dialog>
    <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Column</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleUpdatingColumn}>
                    <div className="space-y-2">
                        <Label>Column Title</Label>
                        <Input id="columnTitle" value={editingColumnTitle} onChange={(e)=>setEditingColumnTitle(e.target.value)} placeholder="enter column title..." required/>
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                        <Button variant="outline" type="button" onClick={()=>{
                            setIsEditingColumn(false);
                        }}>Cancel</Button>
                        <Button type="submit">Edit Column</Button>
                    </div>
                </form>
            </DialogContent>
    </Dialog>
    </>
}