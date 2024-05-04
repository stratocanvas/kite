"use server";
import { createClient } from "@/utils/supabase/server";
export async function GetBoothData(boothId: string) {
	const supabase = createClient();

	const { data: booth } = await supabase
		.from("booth")
		.select(`booth_id, name, locations, thumbnail, date,
                 author(name, thumbnail),
                 event(name)`)
		.eq("booth_id", boothId)
		.limit(1)
		.single();
	return booth;
}

export async function GetProductData(boothId: string) {
	const supabase = createClient();

	const { data: product } = await supabase
		.from("product")
		.select(`product_id, name, adult, 
                 category(name),
                 author(name),
                 p_option(option_id, name, price, thumbnail, character(name, thumbnail))`)
		.eq("booth_id", boothId);
	return product;
}
