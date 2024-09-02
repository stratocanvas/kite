import { auth } from "@/lib/auth/auth";
import { NavBar } from "./navmenu";

export async function TopMenuDesktop() {
	const session = await auth();
	return (
		<div>
			<NavBar session={session} />
		</div>
	);
}
