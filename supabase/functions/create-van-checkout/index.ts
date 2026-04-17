import { stripeRequest, type StripeEnv } from '../_shared/stripe.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CheckoutItem {
  label: string;
  amount: number; // CHF
}

interface CheckoutRequest {
  items: CheckoutItem[];
  from: string;
  to: string;
  return_url: string;
  metadata?: Record<string, string>;
  env?: StripeEnv;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CheckoutRequest;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'items required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!body.return_url) {
      return new Response(JSON.stringify({ error: 'return_url required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const env: StripeEnv = body.env ?? 'sandbox';

    // Build Stripe line_items with inline price_data (CHF, cents)
    const lineItems: Record<string, unknown>[] = body.items
      .filter((i) => i.amount > 0)
      .map((item) => ({
        quantity: 1,
        price_data: {
          currency: 'chf',
          unit_amount: Math.round(item.amount * 100),
          product_data: {
            name: item.label,
          },
        },
      }));

    if (lineItems.length === 0) {
      return new Response(JSON.stringify({ error: 'No billable items' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripeRequest<{ id: string; client_secret: string; url: string }>(
      env,
      '/v1/checkout/sessions',
      {
        method: 'POST',
        body: {
          ui_mode: 'embedded',
          mode: 'payment',
          line_items: lineItems,
          return_url: `${body.return_url}?session_id={CHECKOUT_SESSION_ID}`,
          metadata: {
            from: body.from,
            to: body.to,
            product: 'caby_van',
            ...(body.metadata ?? {}),
          },
        },
      }
    );

    return new Response(
      JSON.stringify({
        client_secret: session.client_secret,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('create-van-checkout error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
