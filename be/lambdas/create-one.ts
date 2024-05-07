import { Category, Inventory, InventoryItem } from "../types/types";
import { PRIMARY_KEY, TABLE_NAME, db, getAllInventoryItemsByUserEmail } from "./utils";

export const handler = async (event: any = {}): Promise<any> => {
  if (!event.body) {
    return { statusCode: 400, body: "no body" };
  }

  const item = typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const userEmail = event.requestContext.authorizer.claims.email;
  const category = item.category as Category;
  const newItem = item.item as InventoryItem;

  if (!userEmail || !category || !newItem) {
    return { statusCode: 400, body: `missing userEmail, category or newItem` };
  }

  let inventory = await getAllInventoryItemsByUserEmail(userEmail) as Inventory;
  if (typeof inventory === "object" && "statusCode" in inventory) {
    return { statusCode: 500, body: "getting inventory failed" };
  }

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
      headers: { "Access-Control-Allow-Origin": "*" },
      body: `item ${newItem.id} created successfully`,
    };
  } catch (dbError: any) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
