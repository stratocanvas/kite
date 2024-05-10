"use server";
import { createClient } from "@/utils/supabase/server";

export default async function CheckOwner(authorId) {
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();

    const { data: seller, error: sellerError } = await supabase
        .from('seller')
        .select('count')
        .in('author_id', authorId)
        .eq('users_id', auth.user?.id)
        .single();
    if (seller?.count > 0) {
        return true
    } 
        return false
}

