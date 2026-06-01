export type AuthHandlers = {
	token: string;
	refreshToken: string;
	updateTokens: (token: string, refreshToken: string) => Promise<void>;
	signOut: () => Promise<void>;
};
