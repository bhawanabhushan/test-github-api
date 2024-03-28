import assert from "node:assert";
import { type AxiosError, get, patch } from "axios";
import { getDefaultHeaders, getHeadersWithAuthorization } from "../utils";

describe("GitHub API Test", () => {
	let userUrl: string;

	before(() => {
		const { BASE_URL: baseUrl, USER_PATH: userPath } = process.env;
		userUrl = `${baseUrl}/${userPath}`;
	});

	describe("Failure Test Cases", () => {
		it("No Token Provided", async () => {
			try {
				await get(userUrl, { headers: getDefaultHeaders() });
			} catch (e) {
				const error = e as AxiosError;
				const response = error.response;
				assert(response?.status === 401, "HTTP Code should be 401");
			}
		});

		it("Invalid Token Provided", async () => {
			try {
				await get(userUrl, { headers: getHeadersWithAuthorization("xyz") });
			} catch (e) {
				const error = e as AxiosError;
				const response = error.response;
				assert(response?.status === 401, "HTTP Code should be 401");
			}
		});

		it("Forbidden Access (Token Without Necessary Permissions)", async () => {
			try {
				const { FORBIDDEN_GITHUB_TOKEN: gitHubToken } = process.env;
				// Each token has access to GET /user, hence 403 cannot be simulated on GET /user
				// So testing on PATCH /user, but GitHub returns 404 instead of 403
				await patch(
					userUrl,
					{ bio: "UPDATE" },
					{ headers: getHeadersWithAuthorization(gitHubToken as string) },
				);
			} catch (e) {
				const error = e as AxiosError;
				const response = error.response;
				// 403 cannot be tested for a disabled scope, GitHub returns 404 instead of 403
				assert(response?.status === 404, "HTTP Code should be 404");
			}
		});
	});

	describe("Success Test Cases", () => {
		const { VALID_GITHUB_TOKEN: gitHubToken, LOGIN: userLogin } = process.env;

		it("Get User With Valid Token", async () => {
			const response = await get(userUrl, {
				headers: getHeadersWithAuthorization(gitHubToken as string),
			});
			assert(response.status === 200, "HTTP Code should be 200");
			const { login } = response.data;
			assert(login === userLogin, "Incorrect login name!");
		});

		it("Update User Bio With Valid Token", async () => {
			const bioUpdate = "Your new bio content here.";
			const response = await patch(
				userUrl,
				{ bio: bioUpdate },
				{ headers: getHeadersWithAuthorization(gitHubToken as string) },
			);
			assert(response.status === 200, "HTTP Code should be 200");
			const { login, bio } = response.data;
			assert(login === userLogin, "Incorrect login name!");
			assert(bio === bioUpdate, "Bio not updated");
		});
	});
});
