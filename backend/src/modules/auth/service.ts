import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../lib/prisma";

type RegisterInput = {
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	password: string;
	repeatPassword: string;
};

type LoginInput = {
	email: string;
	password: string;
};

type SafeUser = {
	id: string;
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	createdAt: Date;
};

type AuthResponse = {
	user: SafeUser;
	token: string;
};

function createHttpError(statusCode: number, message: string): Error & { statusCode: number } {
	const error = new Error(message) as Error & { statusCode: number };
	error.statusCode = statusCode;
	return error;
}

function toSafeUser(user: {
	id: string;
	name: string;
	specialty: string;
	crmCrp: string;
	email: string;
	createdAt: Date;
}): SafeUser {
	return {
		id: user.id,
		name: user.name,
		specialty: user.specialty,
		crmCrp: user.crmCrp,
		email: user.email,
		createdAt: user.createdAt,
	};
}

function getJwtSecret(): string {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw createHttpError(500, "JWT_SECRET not configured");
	}

	return secret;
}

export async function register(data: RegisterInput): Promise<AuthResponse> {
	const name = data.name?.trim();
	const specialty = data.specialty?.trim();
	const crmCrp = data.crmCrp?.trim().toUpperCase();
	const email = data.email?.trim().toLowerCase();

	if (!name || !specialty || !crmCrp || !email || !data.password || !data.repeatPassword) {
		throw createHttpError(400, "Missing required fields");
	}

	if (data.password !== data.repeatPassword) {
		throw createHttpError(400, "Passwords do not match");
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { crmCrp }],
		},
	});

	if (existingUser) {
		throw createHttpError(409, "User with this e-mail or CRM/CRP already exists");
	}

	const passwordHash = await bcrypt.hash(data.password, 10);

	const user = await prisma.user.create({
		data: {
			name,
			specialty,
			crmCrp,
			email,
			passwordHash,
		},
		select: {
			id: true,
			name: true,
			specialty: true,
			crmCrp: true,
			email: true,
			createdAt: true,
		},
	});

	const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });

	return { user: toSafeUser(user), token };
}

export async function login(data: LoginInput): Promise<AuthResponse> {
	const email = data.email?.trim().toLowerCase();

	if (!email || !data.password) {
		throw createHttpError(400, "Missing e-mail or password");
	}

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw createHttpError(401, "Invalid credentials");
	}

	const passwordIsValid = await bcrypt.compare(data.password, user.passwordHash);

	if (!passwordIsValid) {
		throw createHttpError(401, "Invalid credentials");
	}

	const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });

	return {
		user: toSafeUser(user),
		token,
	};
}
