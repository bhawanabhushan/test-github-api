export function getDefaultHeaders() {
	return {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};
}

export function getHeadersWithAuthorization(bearerToken: string) {
	return {
		...getDefaultHeaders(),
		Authorization: `Bearer ${bearerToken}`,
	};
}
