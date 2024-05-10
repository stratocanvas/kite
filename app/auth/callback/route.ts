"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get("next") ?? "/";
	if (code) {
		const supabase = createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		console.log(error);
		if (!error) {
			// 여기서 getUser를 사용하여 사용자 정보를 불러옵니다.
			const {
				data: { user },
				error: getUserError,
			} = await supabase.auth.getUser();
			const { data, error: newUserError } = await supabase
				.from("users")
				.select("id")
				.eq("id", user?.id)
				.limit(1)
				.single();

			if (getUserError) {
				return NextResponse.redirect(`${origin}/auth/auth-code-error`);
			}
			const sns_x_id = user?.user_metadata.preferred_username;

			//Twitter 로그인인 경우, author 테이블에서 일치하는 Twitter ID 검색
			if (user?.app_metadata.provider === "twitter") {
				const modified_sns_x = `@${sns_x_id}`;
				const { data: authorData, error: authorError } = await supabase
					.from("author")
					.select("author_id")
					.eq("sns_x", modified_sns_x)
					.limit(1)
					.single();

				if (authorError) {
				} else if (authorData) {
					// 일치하는 Twitter ID가 있는 경우, seller 테이블에 추가
					const { error: sellerInsertError } = await supabase
						.from("seller")
						.insert({ author_id: authorData.author_id });
					if (sellerInsertError) {
						console.error("Error inserting seller:", sellerInsertError);
					} else {
						const { error: updateUserError } = await supabase
							.from("users")
							.update({ seller: true })
							.eq("id", user?.id);
						if (updateUserError) {
							console.error(
								"Error updating user seller status:",
								updateUserError,
							);
						}
					}

					if (sellerInsertError) {
					}
				}
			}
			// 기존 사용자인 경우 next 파라미터 또는 홈으로 리디렉션
			return NextResponse.redirect(`${origin}${decodeURIComponent(next)}`);
		}
		// 오류 페이지로 리디렉션
		return NextResponse.redirect(`${origin}/auth/error`);
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/auth/error`);
}
