// Shared types between worker and React app

export interface User {
	id: string;
	name: string;
	email: string;
	createdAt: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
}

export interface NameResponse {
	name: string;
}

export interface CounterState {
	count: number;
	lastUpdated: string;
}
