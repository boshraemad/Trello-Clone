"use client"
import Navbar from "@/components/Navbar"
import { useState } from "react";
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button";
import { ChartBarIcon, Grid3X3, List, Loader2, Plus , Rocket, Trello , Filter, Search} from "lucide-react";
import { useBoards } from "@/lib/hooks/useBoards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
export default function Dashboard(){
    const {user} = useUser();
    const {loading , error , boards , createBoard} = useBoards();
    const [viewMode , setViewMode] = useState<"Grid" | "List">("Grid");
    const handleCreateBoard=async()=>{
        if(!user) return;
        await createBoard({title:"new board" , description:"team board" , color:"bg-pink-500" , userId : user.id});
    }
    if(loading){
        return <div>
            <Loader2/>
            <p>loading...</p>
        </div>
    }

    if(error){
        return <div>
            <p>{error}</p>
        </div>
    }
    return(
       <div className="min-h-screen bg-gray-50">
         <Navbar/>
        <main className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="mb-2 text-2xl sm:text-3xl text-gray-800 font-bold">Welcome , {user?.firstName ?? user?.emailAddresses[0].emailAddress}!</h1>
                <p className="text-sm text-gray-500 font-semibold">here what is happening with your boards toaday</p>
            </div>
             {/* stats */}
             <div className="grid grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8 mt-6 sm:mt-8 gap-4">
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p>Total Boards</p>
                                <p className="text-xl sm:text-2xl font-bold ">{boards.length}</p>
                            </div>
                            <div className="sm:w-10 sm:h-10 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                                <Trello className="text-blue-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="">Recent activities</p>
                                <p className="text-xl sm:text-2xl font-bold ">{
                                    boards.filter((board)=>{
                                        const updatedAt=  new Date(board.updated_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return updatedAt > weekAgo
                                    }).length
                                    }</p>
                            </div>
                            <div className="sm:w-10 sm:h-10 w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg">
                                <ChartBarIcon className="text-purple-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="">active Boards</p>
                                <p className="text-xl sm:text-2xl font-bold ">{boards.length}</p>
                            </div>
                            <div className="sm:w-10 sm:h-10 w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg">
                                <Rocket className="text-green-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="">Total Boards</p>
                                <p className="text-xl sm:text-2xl font-bold ">{boards.length}</p>
                            </div>
                            <div className="sm:w-10 sm:h-10 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                                <Trello className="text-blue-600"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                    <div>
                        <p  className="font-bold text-xl sm:text-2xl text-gray-900">Your Boards</p>
                        <p className="text-gray-600">Manage Your Projects and Tasks</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0 space-x-2">
                        <div className="flex items-center  p-1 space-x-1 bg-white border-1">
                            <Button variant={viewMode === "Grid" ? "default" : "ghost"} onClick={()=>setViewMode("Grid")}>
                                <Grid3X3/>
                            </Button>
                            <Button variant={viewMode === "List" ? "default" : "ghost"} onClick={()=>setViewMode("List")}>
                                <List/>
                            </Button>
                        </div>
                        <Button variant="outline">
                                <Filter/>
                                Filter
                        </Button>
                        <Button onClick={handleCreateBoard}>
                            <Plus/>
                            create new board
                        </Button>
                    </div>
                </div>
                <div className="relative mb-4 sm:mb-6">
                    <Search className="text-gray-400 w-5 h-5 absolute top-1/2 left-3 transform -translate-y-1/2"/>
                    <Input id="search" placeholder="search boards..." className="pl-10"/>
                </div>
             </div>
             {/* boards Grid/List */}
             {boards.length === 0 ? <div>No Boards yet</div> : viewMode === "Grid" ?
              <div className=" grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2">
                {
                    boards.map((board , key)=><Link href={`boards/${board.id}`} key={key}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className={`${board.color} rounded w-4 h-4`}/>
                                <Badge variant="secondary" className="text-xs">New</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg mb-2">{board.title}</CardTitle>
                                <CardDescription className='text-sm mb-4'>{board.description}</CardDescription>
                                <div className="flex flex-col text-sm text-gray-400 font-semibold">
                                <span> Created {" "} {new Date(board.created_at).toLocaleDateString()}</span>
                                    <span>Updated {" "} {new Date(board.updated_at).toLocaleDateString()}</span>
                                </div>
                        </CardContent>
                    </Card></Link>)
                }
                <div>
                <Card className=" group border-2 border-dashed border-gray-300 hover:border-blue-600 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[223px]">
                        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2"/>
                        <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">Create New Board</p>
                    </CardContent>
                </Card>
            </div>
    
              </div> 
              : 
              <div>
              {
                  boards.map((board , key)=><div key={key} className={`${key > 0 ? "mt-4" : ""}`}>
                    <Link href={`boards/${board.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                              <div className={`${board.color} rounded w-4 h-4`}/>
                              <Badge variant="secondary" className="text-xs">New</Badge>
                          </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                              <CardTitle className="text-base sm:text-lg mb-2">{board.title}</CardTitle>
                              <CardDescription className='text-sm mb-4'>{board.description}</CardDescription>
                              <div className="flex flex-col text-sm text-gray-400 font-semibold">
                              <span> Created {" "} {new Date(board.created_at).toLocaleDateString()}</span>
                                  <span>Updated {" "} {new Date(board.updated_at).toLocaleDateString()}</span>
                              </div>
                      </CardContent>
                  </Card></Link>
                    </div>)
              }
              <div>
              <Card className=" mt-4 group border-2 border-dashed border-gray-300 hover:border-blue-600 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[223px]">
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-600 mb-2"/>
                      <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">Create New Board</p>
                  </CardContent>
              </Card>
          </div>
  
            </div> 
             }
            
        </main>
       </div>
    )
}