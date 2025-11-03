import { z } from "zod";

/**
 * Determine appropriate HTTP status code from an error
 * @param error The error to analyze
 * @returns HTTP status code (400, 401, 403, 404, or 500)
 */
export function getErrorStatusCode(error: unknown): 400 | 401 | 403 | 404 | 500 {
	// Zod validation errors
	if (error instanceof z.ZodError) {
		return 400;
	}

	if (typeof error === 'object' && error !== null) {
		const err = error as any;

		// Check for explicit status code (validate it's one we support)
		if (typeof err.status === 'number') {
			const status = err.status;
			if (status === 400 || status === 401 || status === 403 || status === 404 || status === 500) {
				return status;
			}
		}

		// Check for HTTP status in response (validate it's one we support)
		if (typeof err.response?.status === 'number') {
			const status = err.response.status;
			if (status === 400 || status === 401 || status === 403 || status === 404 || status === 500) {
				return status;
			}
		}

		// Infer from error message/type
		const message = (err.message || '').toLowerCase();

		// Validation errors
		if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
			return 400;
		}

		// Not found errors
		if (message.includes('not found') || message.includes('does not exist')) {
			return 404;
		}

		// Authentication/Authorization errors
		if (message.includes('unauthorized') || message.includes('authentication')) {
			return 401;
		}

		if (message.includes('forbidden') || message.includes('permission')) {
			return 403;
		}
	}

	// Default to 500 for unknown errors
	return 500;
}
