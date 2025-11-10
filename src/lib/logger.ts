/**
 * Simple logger utility
 * Wraps console for consistent logging across the app
 * 
 * In Cloudflare Workers, console.* statements are automatically captured
 * by Workers observability, so we just need a simple wrapper.
 */

export const logger = {
	debug: (...args: any[]) => {
		console.log(...args);
	},
	info: (...args: any[]) => {
		console.info(...args);
	},
	warn: (...args: any[]) => {
		console.warn(...args);
	},
	error: (...args: any[]) => {
		console.error(...args);
	},
};
