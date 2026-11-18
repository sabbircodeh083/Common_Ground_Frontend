import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(async (request) => {
  const { auth } = await getAuth();

  return auth.handler(request);
});
