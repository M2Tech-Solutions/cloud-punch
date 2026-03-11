"no action";
import type { EventContext } from "@cloudflare/workers-types";
import { createClient } from "@auth";
import type { Data } from "../../action-type";

export async function onRequest(context: EventContext<Env, any, Data>) {
  if (new URL(context.request.url).pathname.startsWith("/api/webhook")) {
    return context.next();
  }

  const client = createClient({ secret: context.env.AUTH_SECRET });
  await client.setTokenFromRequest(context.request as unknown as Request);

  if (!client.isAuthenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  context.data.client = client;

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
