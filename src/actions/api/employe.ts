import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { createClient } from "../../auth";
import type { GetUserListFilters } from "openauthster-shared/endpoints";

export async function GET(filters?: GetUserListFilters) {
  const ctx = getContext<Env, any, any>(arguments);
  const authClient = createClient({ secret: ctx.env.AUTH_SECRET });
  await authClient.setTokenFromRequest(ctx.request as unknown as Request);
  return await authClient
    .getUsers(filters)
    .then((u) =>
      u instanceof Error
        ? { error: u.message, success: false }
        : { data: u, success: true },
    );
}
