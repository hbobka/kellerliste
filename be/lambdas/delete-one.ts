import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Inventory } from "../utils/types";

const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";
const db = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event: any = {}): Promise<any> => {
  const requestedItemId = event.pathParameters.id;
  const userEmail = event.requestContext.authorizer.claims.email;

  if (!requestedItemId || !userEmail) {
    return { statusCode: 400, body: `missing itemId or userEmail` };
  }

  let inventory = await getCurrentInventory(userEmail);
  if (typeof inventory === "object" && "statusCode" in inventory) {
    return { statusCode: 500, body: "getting inventory failed" };
  }

  // find and remove the item from the inventory
  for (const category of Object.keys(inventory)) {
    const itemIndex = inventory[category as keyof Inventory].findIndex((item) => item.id === requestedItemId);
    if (itemIndex !== -1) {
      inventory[category as keyof Inventory].splice(itemIndex, 1);
      break; // Exit the loop once the item is found and removed
    }
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      [PRIMARY_KEY]: userEmail,
      inventory,
    },
  };

  try {
    await db.put(params);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: `item ${requestedItemId} deleted successfully`,
    };
  } catch (dbError) {
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
    const inventoryData = response.Item?.inventory;

    return inventoryData as Inventory;
  } catch (dbError: any) {
    return { statusCode: 500, body: dbError };
  }
};
