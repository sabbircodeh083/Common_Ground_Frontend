import "server-only";
import { headers } from "next/headers";
import { getAuth } from "../auth";

export async function getServerJwtToken() {
  try {
    const { auth } = await getAuth();
    const { token } = await auth.api.getToken({
      headers: await headers(),
    });

    return token ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
