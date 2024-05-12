import { Inventory } from "../types/types";
import { PRIMARY_KEY, TABLE_NAME, db } from "./utils";
import { Handler, Context, PostConfirmationConfirmSignUpTriggerEvent, Callback } from "aws-lambda";

export const handler: Handler = async (
  event: PostConfirmationConfirmSignUpTriggerEvent,
  _: Context,
  callback: Callback
): Promise<any> => {
  const userEmail = event?.request?.userAttributes?.email;
  if (!userEmail) {
    return;
  }

  const inventory: Inventory = {
    beverages: [],
    food: [],
    medicine: [],
    fire: [],
    tools: [],
    money: [],
  };

  const putParams = {
    TableName: TABLE_NAME,
    Item: {
      [PRIMARY_KEY]: userEmail,
      inventory,
    },
  };

  try {
    await db.put(putParams);
    callback(null, event);
  } catch (dbError: any) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
