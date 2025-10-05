"use client"

import { ArrowLeft, ArrowRight, MoreHorizontal, Trello } from "lucide-react"
import { SignInButton , SignUpButton, UserButton } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BoardProps{
    boardTitle?:string,
    onEdit?:()=>void
}
 export default function Navbar({boardTitle , onEdit}:BoardProps){
    const {isSignedIn , user} = useUser();
    const pathName = usePathname();
    const isDashboardPage:boolean = pathName === "/dashboard";
    const isBoardPage:boolean = pathName.includes("/boards/");

    if(isDashboardPage){
        return(
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"/>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">Trello Clone</span>
                </div>
                <div>
                    <UserButton/>
                </div>
            </div>
        </header>
        )
    }
    if(isBoardPage){
       return(
        <header className="bg-white border-b sticky z-50 top-0">
        <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className='flex items-center justify-between'>
                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                    <Link className="flex items-center space-x-2 sm:space-x-4" href="/dashboard">
                    <ArrowLeft className="sm:w-5 sm:h-5 h-4 w-4 text-gray-500"/>
                    <span className="hidden sm:inline text-gray-500">back to dashboard</span>
                    <span className="sm:hidden text-gray-500">back</span>
                    </Link>
                    <div className="h-4 sm:h-6 w-px bg-gray-400 hidden sm:block"></div>
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                        <Trello className="text-blue-600"/>
                        <span className="text-lg items-center space-x-1 sm:space-x-2 min-w-0 font-bold truncate">{boardTitle}</span>
                        {
                            onEdit && <Button variant="ghost" size="sm" className="h-7 w-7 flex-shrink-0 p-0" onClick={onEdit}>
                                <MoreHorizontal/>
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </div>
    </header>
       )
    }
    return(
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"/>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">Trello Clone</span>
                </div>
                {
                    isSignedIn ?<div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-4">
                        <span className="sm:block hidden">{user.firstName ?? user.emailAddresses[0].emailAddress}</span>
                        <Link href="/dashboard">
                            <Button>Go to Dashboard<ArrowRight/></Button>
                        </Link>
                    </div>:<div>
                    <SignInButton>
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">SignIn</Button>
                    </SignInButton>
                    <SignUpButton>
                        <Button size="sm" className="text-xs sm:text-sm">Signup</Button>
                    </SignUpButton>
                </div>
                }
            </div>
        </header>
    )
 }