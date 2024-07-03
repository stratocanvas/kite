"use server";
import { connectDB } from "@/utils/mongodb/database";
import { ObjectId } from "mongodb";
import { createClient } from "@/utils/supabase/server";

export async function GetBoothData(boothId: string) {
    const supabase = createClient()
    const { data: booth } = await supabase
        .from("booth")
        .select(`booth_id, name, locations, thumbnail, date,
                 author(author_id, name, thumbnail, sns_x),
                 event(name), article, product(count), preorder(type, date), genre(name)`)
        .eq("booth_id", boothId)
        .limit(1)
        .single();
    return booth;
}

export async function GetBooth(boothId: string) {
    const client = await connectDB;
    const db = client.db("kiteapp");
    const data = await db.collection("booth").findOne({ _id: new ObjectId(boothId) });
    return data;
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


export async function GetOgData(boothId: string) {
    const supabase = createClient();
    const { data: booth } = await supabase
        .from("booth")
        .select(`booth_id, name, locations, thumbnail, date,
                 author(name, sns_x),
                 event(name), preorder(type, date), genre(name)`)
        .eq("booth_id", boothId)
        .limit(1)
        .single();
    return booth;
}

