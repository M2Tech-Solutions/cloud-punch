import type { createClient } from "@auth";

export type Data = {
  client: ReturnType<typeof createClient>;
};
