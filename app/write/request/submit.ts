'use server'

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

interface FormData {
    infoUrl: string
    comment: string
}

const supabase = createClient()


export async function SubmitRequest(values: FormData) {
    await supabase.from('request').insert({ url: values.infoUrl, description: values.comment }).single();
    redirect('/')
}
