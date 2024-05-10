'use server'

import { createClient } from "@/utils/supabase/server";

const supabase = createClient();

export async function fetchUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();
    return user;
}
