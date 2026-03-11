import { useCache } from "./cache";
import { GET as getAllUsers } from "@api/admin/users";
import { GET as getUserById } from "@api/admin/user";
import type { UserResponseSchemaType } from "openauthster-shared/endpoints";

export function useUsers() {
  return useCache<
    Exclude<UserResponseSchemaType["data"], null>["users"] | Error
  >("users", () =>
    getAllUsers().then((res) =>
      res.error
        ? new Error(res.error)
        : (res.users?.users as Exclude<
            UserResponseSchemaType["data"],
            null
          >["users"]),
    ),
  );
}

export function useUser(id: string) {
  return useCache<
    Exclude<UserResponseSchemaType["data"], null>["users"][number] | Error
  >(`user-${id}`, () =>
    getUserById(id).then((res) =>
      res.error
        ? new Error(res.error)
        : (res.user as Exclude<
            UserResponseSchemaType["data"],
            null
          >["users"][number]),
    ),
  );
}
