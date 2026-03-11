import { getContext } from "@cf-action";
import type { Data } from "../../../action-type";

/**
 * Get all user salary records.
 */
export async function GET() {
  const ctx = getContext<Env, any, Data>(arguments);
  const client = ctx.data.client;

  const users = await client.getUsers();
  if (users instanceof Error) {
    return {
      success: false,
      message: "Impossible de récupérer les utilisateurs",
    };
  }

  const salaries = users.data?.users.map((u) => ({
    userId: u.id,
    salary: (u.session_private as { salary?: number })?.salary ?? 0,
  }));

  return {
    success: true,
    data: salaries,
  };
}

/**
 * Upsert hourly salary for a user (e.g. 15.5 = 15.50€/h).
 */
export async function PATCH({
  userId,
  salary,
}: {
  userId: string;
  salary: number;
}) {
  const ctx = getContext<Env, any, Data>(arguments);
  const client = ctx.data.client;
  const userData = await client.getUserById(userId);
  if (userData instanceof Error) {
    return {
      success: false,
      message: "Utilisateur non trouvé",
    };
  }

  const user = userData.data?.users.at(0);
  if (!user) {
    return {
      success: false,
      message: "Utilisateur non trouvé",
    };
  }

  const updatedSessionPrivate = {
    ...user.session_private,
    salary,
  };

  const updateResult = await client.updateUserById(userId, {
    session_private: updatedSessionPrivate,
  });

  if (updateResult instanceof Error) {
    return {
      success: false,
      message: "Impossible de mettre à jour le salaire",
    };
  }

  return {
    success: true,
    data: { userId, salary },
  };
}
