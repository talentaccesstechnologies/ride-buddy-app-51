import { stripeRequest, type StripeEnv } from '../_shared/stripe.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const env: StripeEnv = (url.searchParams.get('env') as StripeEnv) ?? 'sandbox';

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripeRequest<{
      id: string;
      status: string;
      payment_status: string;
      amount_total: number;
      currency: string;
      customer_details?: { email?: string };
    }>(env, `/v1/checkout/sessions/${sessionId}`, { method: 'GET' });

    return new Response(
      JSON.stringify({
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
