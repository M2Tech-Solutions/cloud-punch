import { getContext } from "@cf-action";
import type { Data } from "../../../action-type";

export async function GET(id: string) {
  const client = getContext<Env, any, Data>(arguments).data.client;

  const user = await client.getUserById(id);

  if (user instanceof Error || !user.data?.users.at(0)) {
    return {
      error:
        user instanceof Error
          ? user.message ?? "Failed to fetch user"
          : "User not found",
    };
  }

  return {
    success: true,
    user: user.data?.users.at(0)!,
  };
}
