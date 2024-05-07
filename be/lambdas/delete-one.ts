import { Inventory } from "../types/types";
import { PRIMARY_KEY, TABLE_NAME, db, getAllInventoryItemsByUserEmail } from "./utils";

export const handler = async (event: any = {}): Promise<any> => {
  const requestedItemId = event.pathParameters.id;
  const userEmail = event.requestContext.authorizer.claims.email;

  if (!requestedItemId || !userEmail) {
    return { statusCode: 400, body: `missing itemId or userEmail` };
  }

  let inventory = await getAllInventoryItemsByUserEmail(userEmail);
  if (typeof inventory === "object" && "statusCode" in inventory) {
    return { statusCode: 500, body: "getting inventory failed" };
  }

  for (const category of Object.keys(inventory)) {
    const itemIndex = inventory[category as keyof Inventory].findIndex((item) => item.id === requestedItemId);
    if (itemIndex !== -1) {
      inventory[category as keyof Inventory].splice(itemIndex, 1);
      break;
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
      headers: { "Access-Control-Allow-Origin": "*" },
      body: `item ${requestedItemId} deleted successfully`,
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
