import { type PrivateSession } from "@auth";
import { getContext } from "@cf-action";
import type { Data } from "../../../action-type";

export async function UPDATE({
  userId,
  role,
}: {
  userId: string;
  role: PrivateSession["role"];
}) {
  const ctx = getContext<Env, any, Data>(arguments);

  const client = ctx.data.client;

  const user = await client.getUserById(userId);

  if (user instanceof Error)
    return {
      error: user.message,
    };

  await client.updateUserById(userId, {
    session_private: {
      ...user.data?.users.at(0)?.session_private,
      role,
    },
  });

  return {
    success: true,
  };
}
