import { clientID, clientSecret, redirectUri, cognitoDomain } from "./utils";

/**
 * get auth tokens by code
 * @param event cotains the auth token in query param "code"
 * @returns id_token, access_token, referesh_token
 */
export const handler = async (event: any = {}): Promise<any> => {
  const authCode = event.queryStringParameters?.code;
  if (!authCode) {
    return { statusCode: 400, body: `no auth code` };
  }

  const credentials = `${clientID}:${clientSecret}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");
  const data = new URLSearchParams();
  data.append("grant_type", "authorization_code");
  data.append("client_id", clientID);
  data.append("client_secret", clientSecret);
  data.append("code", authCode);
  data.append("redirect_uri", redirectUri);

  try {
    const response = await fetch(`${cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authentication: `Basic ${base64Credentials}`,
      },
      body: data,
    });

    if (response.ok) {
      const json = await response.json();

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(json),
      };
    }
  } catch (error) {
    console.log("auth failed:", error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
