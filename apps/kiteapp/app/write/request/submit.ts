'use server'

import { redirect } from "next/navigation";

interface FormData {
    infoUrl: string
    comment: string
}



export async function SubmitRequest(values: FormData) {
    redirect('/')
}
