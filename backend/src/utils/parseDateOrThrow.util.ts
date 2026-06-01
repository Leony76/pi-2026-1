import { createHttpError } from "../lib/http-error";

export function parseDateOrThrow(rawDate: string, fieldName: string): Date {
	const parsedDate = new Date(rawDate);

	if (Number.isNaN(parsedDate.getTime())) {
		throw createHttpError(400, "bad_request", `Campo ${fieldName} invalido.`);
	}

	return parsedDate;
}