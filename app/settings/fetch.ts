"use server";
import { createClient } from "@/utils/supabase/server";
const supabase = createClient();

export async function getUserData() {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	const { data, error: dataError } = await supabase
		.from("users")
		.select("name, n_name")
		.eq("id", user.id)
		.single();

	return { data, error: dataError };
}

export async function getUsedId(input: string) {
	const { data, error } = await supabase
		.from("users")
		.select("name")
		.eq("name", input)
		.limit(1)
		.maybeSingle();
	if (!data || error) {
		return "";
	}
	return { data, error };
}

export async function SubmitData(
	values: FormData,
	searchParams: URLSearchParams,
) {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	await supabase
		.from("users")
		.update({ n_name: values.nickname, name: values.id })
		.eq("id", user.id)
		.single();
}

export async function DeleteUser() {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	await supabase.auth.deleteUser();
}

