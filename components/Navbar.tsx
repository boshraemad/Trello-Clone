"use client"

import { ArrowRight, Trello } from "lucide-react"
import { SignInButton , SignUpButton } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
 export default function Navbar(){
    const {isSignedIn , user} = useUser();
    console.log(user)
    return(
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Trello className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"/>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">Trello Clone</span>
                </div>
                {
                    isSignedIn ?<div className="flex flex-row sm:flex-col items-center sm:items-end space-x-2 sm:space-x-4">
                        <span className="sm:block hidden">{user.username || user.emailAddresses[0].emailAddress}</span>
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