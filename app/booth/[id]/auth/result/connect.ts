"use server";
import { createClient } from "@/utils/supabase/server";
export async function ConnectAuthor(search: string) {
	const supabase = createClient();
	const { data: userData, error: userError } = await supabase.auth.getUser();
	if (userError) {
		throw new Error(userError.message);
	}
	const username = userData.user.user_metadata.preferred_username;

	const searchParams = new URLSearchParams(search);
	const boothId = searchParams.get("next")?.split("/")[2]; // /booth/[id]에서 [id] 부분 추출
	const { data: authorData, error: authorError } = await supabase
		.from("booth")
		.select("author(author_id, name, sns_x, thumbnail)")
		.eq("booth_id", boothId)
		.limit(1);

	if (authorData?.[0]?.author) {
		const matchedAuthor = authorData[0].author.find((author: any) => {
			const snsUsername = author.sns_x?.startsWith("@")
				? author.sns_x.slice(1)
				: author.sns_x;
			return snsUsername === username;
		});
		if (matchedAuthor) {
			let alreadyExists = false;
			const { error: upsertError } = await supabase
				.from("seller")
				.upsert({ author_id: matchedAuthor.author_id })
				.select()
				.single();
			if (upsertError) {
				console.log(upsertError);
				if (upsertError.code === "23505") {
					alreadyExists = true;
				}
			}
			return {
				isAuthor: true,
				name: matchedAuthor.name,
				sns_x: matchedAuthor.sns_x,
                thumbnail: matchedAuthor.thumbnail,
				alreadyExists: alreadyExists,
			};
		}
	}
	return { isAuthor: false };
}
