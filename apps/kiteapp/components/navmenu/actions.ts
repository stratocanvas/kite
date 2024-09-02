"use server";
import { signOut } from "@/lib/auth/auth";

export async function handleSignOut(): Promise<void> {
	return new Promise((resolve, reject) => {
		signOut().then(resolve).catch(reject);
	});
}
