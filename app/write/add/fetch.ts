'use server'
import { createClient } from '@/utils/supabase/server';
const supabase = createClient();

export const fetchEvents = async () => {
	const { data: event, error } = await supabase
		.from("event")
		.select('event_id, name, location, start_date, end_date');
	return event
};
