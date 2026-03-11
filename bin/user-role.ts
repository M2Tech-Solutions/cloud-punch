import { createClient, type PrivateSession } from "@auth";

const roleToSet = Bun.argv[2] as PrivateSession["role"];
const userId = Bun.argv[3] as string;

if (!roleToSet) {
  console.error("Please provide a role to set as a command line argument.");
  process.exit(1);
} else if (!userId) {
  console.error("Please provide a user ID as a command line argument.");
  process.exit(1);
}

if (!["admin", "employee"].includes(roleToSet)) {
  console.error(
    "Invalid role provided. Role must be either 'admin' or 'employee'.",
  );
  process.exit(1);
}

const client = createClient({ secret: process.env.AUTH_SECRET! });

const currentSession = await client
  .getUserById(userId)
  .then((user) => (user instanceof Error ? undefined : user.data?.users.at(0)));

const res = await client.updateUserById(userId, {
  session_private: {
    ...(currentSession?.session_private ?? {}),
    role: roleToSet,
  },
  session_public: {
    ...(currentSession?.session_public ?? {}),
    role: roleToSet,
  },
});

if (res instanceof Error) {
  console.error("Failed to update user role:", res);
  process.exit(1);
}
console.log(`Successfully updated user ${userId} role to ${roleToSet}.`);
