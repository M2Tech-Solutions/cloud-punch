"no action";

import type { Data } from "../../../action-type";
import { WebHook } from "openauthster-shared/webhook";

export async function onRequest(context: EventContext<Env, any, Data>) {
  const webhook = await WebHook.getWebHookPayloadFromRequest(
    "registration_success",
    context.request as unknown as Request,
    context.env.AUTH_SECRET,
  );

  const client = context.data.client;

  await client.updateUserById(webhook.data.userID, {
    session_private: {
      role: "employee",
      salary: 35.0,
    },
  });

  return new Response("OK");
}
