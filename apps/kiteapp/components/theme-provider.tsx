"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { Button } from "./ui/button";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const { setTheme } = useTheme();

	return (
		<NextThemesProvider {...props}>
			<div className="hidden">
				<Button onClick={() => setTheme("light")}>Light</Button>
				<Button onClick={() => setTheme("dark")}>Dark</Button>
				<Button onClick={() => setTheme("system")}>System</Button>
			</div>
			{children}
		</NextThemesProvider>
	);
}
