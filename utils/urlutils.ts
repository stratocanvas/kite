import DOMPurify from "dompurify";

export function sanitizeUrl(url: string): string {
	return DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

function isValidRedirectUrl(url: string, allowedUrls: string[]): boolean {
	try {
		const parsedUrl = new URL(url);
		return allowedUrls.some((prefix) => url.startsWith(prefix));
	} catch (e) {
		console.error("Invalid URL:", url);
		return false;
	}
}
