import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

const db = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return { statusCode: 400, body: "no body" };
  }

  const item = typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const userEmail = item.userEmail;
  const category = item.category;
  const newItem = item.item;

  let inventory = await getCurrentInventory(userEmail);

  if (!inventory[category]) {
    inventory[category] = [];
  }
  inventory[category].push(newItem);

  const putParams = {
    TableName: TABLE_NAME,
    Item: {
      [PRIMARY_KEY]: userEmail,
      inventory,
    },
  };

  try {
    await db.put(putParams);
    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "",
    };
  } catch (dbError: any) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

const getCurrentInventory = async (userEmail: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: userEmail,
    },
  };

  try {
    const response = await db.get(params);
    return response.Item?.inventory || {};
  } catch (dbError: any) {
    return { statusCode: 500, body: dbError };
  }
};
