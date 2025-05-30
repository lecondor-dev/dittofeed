import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { createAdminApiKey } from "backend-lib/src/adminApiKeys";
import { db } from "backend-lib/src/db";
import * as schema from "backend-lib/src/db/schema";
import { DittofeedFastifyInstance } from "backend-lib/src/types";
import { and, eq } from "drizzle-orm";
import {
  CreateAdminApiKeyRequest,
  CreateAdminApiKeyResponse,
  DeleteAdminApiKeyRequest,
  EmptyResponse,
} from "isomorphic-lib/src/types";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function apiKeyController(
  fastify: DittofeedFastifyInstance,
) {
  fastify.withTypeProvider<TypeBoxTypeProvider>().post(
    "/",
    {
      schema: {
        description: "Create an admin API key.",
        tags: ["API Key", "Admin"],
        body: CreateAdminApiKeyRequest,
        response: {
          200: CreateAdminApiKeyResponse,
          409: EmptyResponse,
        },
      },
    },
    async (request, reply) => {
      const adminApiKey = await createAdminApiKey(request.body);
      if (adminApiKey.isErr()) {
        return reply.status(409).send();
      }
      const { workspaceId, name, id, apiKey, createdAt } = adminApiKey.value;

      return reply.status(200).send({
        workspaceId,
        name,
        id,
        apiKey,
        createdAt,
      });
    },
  );

  fastify.withTypeProvider<TypeBoxTypeProvider>().delete(
    "/",
    {
      schema: {
        description: "Delete an admin API key.",
        tags: ["API Key", "Admin"],
        querystring: DeleteAdminApiKeyRequest,
        response: {
          204: EmptyResponse,
        },
      },
    },
    async (request, reply) => {
      const { id, workspaceId }: DeleteAdminApiKeyRequest = request.query;
      await db()
        .delete(schema.adminApiKey)
        .where(
          and(
            eq(schema.adminApiKey.workspaceId, workspaceId),
            eq(schema.adminApiKey.id, id),
          ),
        );

      return reply.status(200).send();
    },
  );
}
