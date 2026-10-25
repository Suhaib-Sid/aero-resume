export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.text();
  if (!body) return fallback;

  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === "object" && parsed !== null) {
      const errorBody = parsed as Record<string, unknown>;
      for (const key of ["error", "message", "detail"]) {
        if (typeof errorBody[key] === "string" && errorBody[key].trim()) {
          return errorBody[key];
        }
      }
    }
  } catch {
    return body;
  }

  return body;
}
