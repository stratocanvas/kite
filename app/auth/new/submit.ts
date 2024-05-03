"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function SubmitData(
	values: FormData,
	searchParams: URLSearchParams,
) {
	const supabase = createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	await supabase
		.from("users")
		.update({ n_name: values.nickname, name: values.id })
		.eq("id", user.id)
		.single();
	redirect(`/`);
}
