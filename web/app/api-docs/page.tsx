import type { Metadata } from "next";
import openapi from "@/lib/api/openapi.json";

export const metadata: Metadata = { title: "API docs" };

// Loose view of the OpenAPI document that `make openapi` exports, so this page never lags the API.
interface Schema {
  title?: string;
  type?: string;
  format?: string;
  $ref?: string;
  anyOf?: Schema[];
  items?: Schema;
  properties?: Record<string, Schema>;
}

interface Operation {
  summary?: string;
  parameters?: { name: string; required?: boolean; schema: Schema }[];
  responses: Record<string, { content?: Record<string, { schema: Schema }> }>;
}

interface Spec {
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, Schema> };
}

const spec: Spec = openapi;

const refName = (s: Schema) => s.$ref?.split("/").pop();

function typeName(s: Schema): string {
  if (s.$ref) return refName(s) ?? "object";

  if (s.anyOf) return s.anyOf.map(typeName).join(" or ").replace("null", "null (no data)");

  if (s.type === "array") return `list of ${s.items ? typeName(s.items) : "values"}`;

  return s.format ? `${s.type} (${s.format})` : (s.type ?? "any");
}

/** The fields of the response object, looking through a list and a $ref. */
function fields(s: Schema): [string, Schema][] {
  const target = s.type === "array" && s.items ? s.items : s;
  const name = refName(target);
  const resolved = name ? spec.components.schemas[name] : target;

  return Object.entries(resolved?.properties ?? {});
}

const EXAMPLE_QUERY = new Map([
  ["start", "2026-10-04T00:00:00Z"],
  ["end", "2026-10-05T00:00:00Z"],
]);

function curl(path: string, op: Operation): string {
  const q = (op.parameters ?? []).filter((p) => p.required).map((p) => `${p.name}=${EXAMPLE_QUERY.get(p.name) ?? ""}`);

  return `curl "https://<api-host>${path}${q.length ? `?${q.join("&")}` : ""}"`;
}

export default function ApiDocs() {
  return (
    <div className="space-y-6">
      <header className="max-w-prose space-y-2">
        <h1 className="text-2xl font-bold">API docs</h1>
        <p className="text-base">
          SolarBud&apos;s forecasts and measurements are available as JSON over HTTP. All times are UTC. The endpoints are
          read-only and need no key yet.
        </p>
        <p className="text-sm text-muted">
          The public address is published here when SolarBud goes live; replace <code>&lt;api-host&gt;</code> in the
          examples with it. This page is generated from the API&apos;s own OpenAPI description (version{" "}
          {openapi.info.version}).
        </p>
      </header>
      {Object.entries(spec.paths).flatMap(([path, methods]) =>
        Object.entries(methods).map(([method, op]) => {
          const schema = op.responses["200"]?.content?.["application/json"]?.schema;

          return (
            <section key={`${method}${path}`} className="rounded-card border border-outline bg-card p-6">
              <h2 className="text-[0.95rem] font-semibold">{`${method.toUpperCase()} ${path}`}</h2>
              {op.summary && <p className="mt-1 text-sm text-muted">{op.summary}</p>}
              <pre className="mt-3 overflow-x-auto rounded-input bg-surface p-3 text-sm">
                <code>{curl(path, op)}</code>
              </pre>
              {!!op.parameters?.length && (
                <ul className="mt-3 space-y-1 text-sm">
                  {op.parameters.map((p) => (
                    <li key={p.name}>
                      <code className="font-semibold">{p.name}</code>{" "}
                      <span className="text-muted">
                        {typeName(p.schema)}, {p.required ? "required" : "optional"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {schema && (
                <>
                  <p className="mt-3 text-sm font-semibold">Returns {typeName(schema)}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {fields(schema).map(([name, f]) => (
                      <li key={name}>
                        <code className="font-semibold">{name}</code> <span className="text-muted">{typeName(f)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          );
        }),
      )}
    </div>
  );
}
