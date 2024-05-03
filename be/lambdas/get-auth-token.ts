const clientID = process.env.COGNITO_CLIENT_ID || "";
const clientSecret = process.env.COGNITO_CLIENT_SECRET || "";
const cognitoDomain = process.env.COGNITO_DOMAIN || "";
const redirectUri = process.env.COGNITO_REDIRECT_URI || "";

/**
 * get auth token by code
 * @param event cotains the auth token in query param "code"
 * @returns
 */
export const handler = async (event: any = {}): Promise<any> => {
  const authCode = event.queryStringParameters?.code;
  if (!authCode) {
    return { statusCode: 400, body: `no auth code` };
  }

  const credentials = `${clientID}:${clientSecret}`;
  const base64Credentials = Buffer.from(credentials).toString("base64");
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authentication: `Basic ${base64Credentials}`,
  };
  const data = new URLSearchParams();
  data.append("grant_type", "authorization_code");
  data.append("client_id", clientID);
  data.append("client_secret", clientSecret);
  data.append("code", authCode);
  data.append("redirect_uri", redirectUri);

  try {
    const response = await fetch(`${cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers,
      body: data,
    });

    if (response.ok) {
      const json = (await response.json()) as any;

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(json),
      };
    }
  } catch (error) {
    console.log("auth failed:", error);
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
