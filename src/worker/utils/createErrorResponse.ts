import { z } from "zod";

/**
 * Create a standardized error response object
 * @param error The error to format
 * @param context Optional context string for logging
 * @returns Formatted error response object
 */
export function createErrorResponse(error: unknown, context?: string) {
	let errorMessage: string;
	let errorDetails: any = {};

	// Format Zod validation errors nicely
	if (error instanceof z.ZodError) {
		const fieldErrors = error.errors.map(err => {
			const path = err.path.join('.');
			return `${path}: ${err.message}`;
		});

		errorMessage = fieldErrors.length === 1
			? fieldErrors[0]
			: `Validation failed: ${fieldErrors.join(', ')}`;

		errorDetails = {
			validationErrors: error.errors.map(err => ({
				field: err.path.join('.'),
				message: err.message,
				code: err.code,
			})),
		};
	} else {
		errorMessage = error instanceof Error ? error.message : String(error);
		errorDetails = typeof error === 'object' && error !== null ? error : {};
	}

	// Log error to Cloudflare observability
	console.error('[OpenCode API Error]', {
		context,
		message: errorMessage,
		error: errorDetails,
		timestamp: new Date().toISOString(),
	});

	return {
		error: {
			message: errorMessage,
			...errorDetails,
		},
	};
}
