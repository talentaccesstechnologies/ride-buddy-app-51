// Shared Stripe client routed through Lovable's connector gateway.
// Do NOT call api.stripe.com directly — the gateway handles auth & key rotation.

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/stripe';

export type StripeEnv = 'sandbox' | 'live';

function getKeys(env: StripeEnv) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY is not configured');

  const stripeKey =
    env === 'live'
      ? Deno.env.get('STRIPE_LIVE_API_KEY')
      : Deno.env.get('STRIPE_SANDBOX_API_KEY');
  if (!stripeKey) {
    throw new Error(
      `${env === 'live' ? 'STRIPE_LIVE_API_KEY' : 'STRIPE_SANDBOX_API_KEY'} is not configured`
    );
  }
  return { lovableKey, stripeKey };
}

function toFormBody(obj: Record<string, unknown>, prefix = ''): string {
  const params: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (typeof v === 'object' && v !== null) {
          params.push(toFormBody(v as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          params.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(String(v))}`);
        }
      });
    } else if (typeof value === 'object') {
      params.push(toFormBody(value as Record<string, unknown>, fullKey));
    } else {
      params.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return params.filter(Boolean).join('&');
}

export async function stripeRequest<T = unknown>(
  env: StripeEnv,
  path: string,
  init: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T> {
  const { lovableKey, stripeKey } = getKeys(env);
  const method = init.method ?? 'POST';

  const headers: Record<string, string> = {
    Authorization: `Bearer ${lovableKey}`,
    'X-Connection-Api-Key': stripeKey,
  };

  let body: string | undefined;
  if (init.body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = toFormBody(init.body);
  }

  const res = await fetch(`${GATEWAY_URL}${path}`, { method, headers, body });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Stripe API ${method} ${path} failed [${res.status}]: ${JSON.stringify(data)}`
    );
  }
  return data as T;
}
