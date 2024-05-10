'use server'
import { createClient } from "@/utils/supabase/server";

export async function GetUser() {
	const supabase = createClient();
	const {
		data: { user },
		error: getUserError,
	} = await supabase.auth.getUser();

	if (getUserError) {
		return null;
	}
	const { data } = await supabase
		.from("users")
		.select("id, name, n_name")
		.eq("id", user?.id)
		.limit(1)
		.single();
	return {
		...data,
		providers: user?.app_metadata?.providers || [],
	};
}

export async function SignOut() {
	const supabase = createClient();
	await supabase.auth.signOut();
}

