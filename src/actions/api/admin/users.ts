import type { UserPageFilter } from "openauthster-shared/endpoints";
import type { Data } from "../../../action-type";
import { getContext } from "@cf-action";

export async function GET(filters?: UserPageFilter) {
  const client = getContext<Env, any, Data>(arguments).data.client;

  const users = await client.getUsers(filters);
  return users instanceof Error
    ? {
        error: users.message ?? "Failed to fetch users",
      }
    : {
        success: true,
        users: users.data!,
      };
}
