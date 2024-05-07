import { TABLE_NAME, db } from "./utils";

export const handler = async (): Promise<any> => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const response = await db.scan(params);
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(response.Items),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
