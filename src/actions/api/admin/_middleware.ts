"no action";
import type { EventContext } from "@cloudflare/workers-types";
import type { Data } from "../../../action-type";

export async function onRequest(context: EventContext<Env, any, Data>) {
  const client = context.data.client;
  const userData = await client.getUserSession("private");

  if (userData instanceof Error) {
    return new Response(userData.message ?? "Unauthorized", { status: 401 });
  } else if (userData.private?.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    return await context.next();
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error in API middleware:", err);
      return new Response(`${err.message}\n${err.stack}`, { status: 500 });
    }
    return new Response("Unknown error", { status: 500 });
  }
}
