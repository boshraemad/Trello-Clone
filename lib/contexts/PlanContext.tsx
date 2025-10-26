"use client"
import { createContext, useContext } from "react";

interface PlanContextType{
    isFreeUser:boolean,
    hasProPlan:boolean,
    hasEnterPrisePlan:boolean
}
const PlanContext = createContext<PlanContextType|undefined>(undefined)

interface PlanProviderProps{
    children:React.ReactNode,
    hasProPlan:boolean,
    hasEnterPrisePlan:boolean
}

export function PlanProvider({children , hasProPlan , hasEnterPrisePlan}:PlanProviderProps){
    return(
        <PlanContext.Provider value={{isFreeUser:!hasProPlan && !hasEnterPrisePlan , hasProPlan ,  hasEnterPrisePlan}}>
        {children}
        </PlanContext.Provider>
    )
}

export function usePlan(){
    const context = useContext(PlanContext);
    if(context === undefined) throw new Error("usePlan needs to be used inside the provider");
     return context
}