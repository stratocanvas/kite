"use server";
import { createClient } from "@/utils/supabase/server";

export default async function fetchEvent({
	searchParams,
}: {
	searchParams?: {
		event?: number;
	};
}) {
	const supabase = createClient();

	const { data: event } = await supabase
		.from("event")
		.select(
			"event_id, name, location, start_date, end_date, map_data, homepage, ticketpage",
		)
		.eq("event_id", searchParams?.event)
		.single();

	return event;
}
