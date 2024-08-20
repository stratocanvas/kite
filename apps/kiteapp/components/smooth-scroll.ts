"use client";

import { useEffect, useCallback } from "react";

export const useScrollToSection = () => {
	const scrollToElement = useCallback((elementId: string) => {
		const element = document.getElementById(elementId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	useEffect(() => {
		const handleInitialScroll = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				scrollToElement(hash);
			}
		};

		handleInitialScroll();
		window.addEventListener("hashchange", handleInitialScroll);

		return () => {
			window.removeEventListener("hashchange", handleInitialScroll);
		};
	}, [scrollToElement]);

	return scrollToElement;
};
