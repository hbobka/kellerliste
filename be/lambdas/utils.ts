import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Inventory } from "../types/types";

export const TABLE_NAME = process.env.TABLE_NAME || "";
export const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
export const db = DynamoDBDocument.from(new DynamoDB());

export const getAllInventoryItemsByUserEmail = async (userEmail: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: userEmail,
    },
  };

  try {
    const response = await db.get(params);

    return response.Item?.inventory as Inventory;
  } catch (dbError: any) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
