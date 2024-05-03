import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const supabase = createClient();


export default async function UserStatus() {
    const { data, error } = await supabase.auth.getSession()
}
