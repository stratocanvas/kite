"use server";
import { createClient } from "@/utils/supabase/server";
const supabase = createClient();

export const fetchEvents = async () => {
	const { data: event, error } = await supabase
		.from("event")
		.select("event_id, name, location, start_date, end_date");
	return event;
};

export const fetchTwitterUser = async () => {
	const { data, error } = await supabase.auth.getUser();

	if (error) {
		throw error;
	}

	const { user_metadata } = data.user;

	return {
		name: user_metadata.name,
		preferred_username: user_metadata.preferred_username,
		picture: user_metadata.picture,
	};
};
