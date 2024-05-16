"use server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get("next") ?? "/";
	if (code) {
		try {
			const supabase = createClient();
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			
			if (error) {
				console.error("Error exchanging code for session:", error);
				return NextResponse.redirect(`${origin}/auth/error`);
			}

			const {
				data: { user },
				error: getUserError,
			} = await supabase.auth.getUser();

			if (getUserError) {
				console.error("Error getting user:", getUserError);
				return NextResponse.redirect(`${origin}/auth/error`);
			}

			const sns_x_id = user?.user_metadata.preferred_username;

			//Twitter 로그인인 경우, author 테이블에서 일치하는 Twitter ID 검색 
			if (user?.app_metadata.providers.includes("twitter") && sns_x_id) {
				const modified_sns_x = `@${sns_x_id}`;
				const { data: authorData, error: authorError } = await supabase
					.from("author")
					.select("author_id")
					.eq("sns_x", modified_sns_x)
					.limit(1)
					.single();

				if (!authorError && authorData) {
					// 일치하는 Twitter ID가 있는 경우, seller 테이블에 추가
					const { error: sellerInsertError } = await supabase
						.from("seller")
						.upsert({ author_id: authorData.author_id })
						.eq("author_id", authorData.author_id);
					
					if (!sellerInsertError) {
						await supabase
							.from("users")
							.update({ seller: true })
							.eq("id", user?.id);
					} else {
						console.error("Error inserting seller:", sellerInsertError);
					}
				} else {
					console.error("Error getting author data:", authorError);
				}
			}
			
			// 기존 사용자인 경우 next 파라미터 또는 홈으로 리디렉션
			return NextResponse.redirect(`${origin}${decodeURIComponent(next)}`);
		} catch (error) {
			console.error("Unexpected error occurred:", error);
			return NextResponse.redirect(`${origin}/auth/error`);
		}
	}
	console.error("Error: code is null");
	return NextResponse.redirect(`${origin}/auth/error`);
}