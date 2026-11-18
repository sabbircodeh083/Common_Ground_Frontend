import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";

function createAuthBundle() {
  const client = new MongoClient(process.env.MONGODB_URI as string, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8_000,
  });

  // Connect before handing the client to the adapter. If this fails, the
  // driver closes the topology and refuses to reconnect on later operations,
  // so the caller must not cache the rejected promise (see getAuth below).
  return client.connect().then((connectedClient) => {
    const auth = betterAuth({
      database: mongodbAdapter(connectedClient.db("CommonGround"), {
        client: connectedClient,
      }),
      emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
      },
      plugins: [jwt()],
      session: {
        cookieCache: {
          enabled: true,
          strategy: "jwt",
          maxAge: 24 * 60 * 60,
        },
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
    });

    return { auth, client: connectedClient };
  });
}

type AuthBundle = Awaited<ReturnType<typeof createAuthBundle>>;

// Cache the auth instance (and its connected client) across requests. On
// Vercel this keeps one connection pool per warm function instance; in dev it
// keeps Fast Refresh from opening a new pool on every recompile.
const globalForAuth = globalThis as typeof globalThis & {
  __commonGroundAuth?: Promise<AuthBundle>;
};

/**
 * Returns the Better Auth instance, creating it on first use.
 *
 * A failed connection is deliberately not cached: the next request builds a
 * fresh MongoClient instead of reusing one whose topology was already closed.
 */
export function getAuth(): Promise<AuthBundle> {
  if (!globalForAuth.__commonGroundAuth) {
    globalForAuth.__commonGroundAuth = createAuthBundle().catch((error) => {
      globalForAuth.__commonGroundAuth = undefined;
      throw error;
    });
  }

  return globalForAuth.__commonGroundAuth;
}
