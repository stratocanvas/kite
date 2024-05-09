'use server'
import { createClient } from "@/utils/supabase/server";

export async function SubmitContact(type: 'error' | 'delete' | 'abuse', description: string, boothId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('contact')
        .insert([{ type, description, booth_id: boothId }]);
    
    if (error) {
        throw error
    }
}