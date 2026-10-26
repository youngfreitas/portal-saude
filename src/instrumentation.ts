// Registro estruturado de erros de requisição. Para um serviço externo (Sentry, etc.),
// defina ERROR_WEBHOOK_URL e/ou troque o corpo desta função.
export async function onRequestError(err: unknown, request: { path: string; method: string }, context: { routeType: string }) {
  const e = err as Error & { digest?: string };
  const entry = { level: 'error', at: new Date().toISOString(), path: request.path, method: request.method, routeType: context.routeType, digest: e.digest, message: e.message };
  console.error(JSON.stringify(entry));
  const hook = process.env.ERROR_WEBHOOK_URL;
  if (hook) fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }).catch(() => {});
}
