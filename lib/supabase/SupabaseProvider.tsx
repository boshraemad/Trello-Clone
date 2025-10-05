"use client"
import { SupabaseClient } from "@supabase/supabase-js"
import React from "react"
import { createContext , useContext } from "react"
import {useState , useEffect} from "react"
import { useSession } from "@clerk/nextjs"
import { createBrowserClient } from "@supabase/ssr"
type SupabaseContext={
    supabase:SupabaseClient | null,
    isLoaded:boolean
}

const Context = createContext<SupabaseContext>({supabase:null , isLoaded:false})
export default function SupabaseProvider({children}:{children:React.ReactNode}){
    const {session} = useSession();
    const [supabase , setSupabase] = useState<SupabaseClient | null>(null);
    const [isLoaded , setIsLoaded] = useState<boolean>(false);

    useEffect(()=>{
        if(!session) return;

        const client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                accessToken:async()=> session?.getToken() ?? null
            }
        )

        setSupabase(client)
        setIsLoaded(true)

    },[session])
    return <Context.Provider value={{supabase , isLoaded}}>
        {!session ? <div>is Loading...</div> : children}
    </Context.Provider>
}

export function useSupabase(){
    const context = useContext(Context);
    if(context === undefined) throw new Error("supabase needs to be used inside the provider");
     return context
}