import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NP_API_KEY = Deno.env.get("NOWPAYMENTS_API_KEY") ?? "";
const NP_API_URL = "https://api.nowpayments.io/v1";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const txKey: string | undefined = body?.tx_key;

    if (!txKey || txKey.length < 8) {
      return new Response(
        JSON.stringify({ valid: false, error: "Clave de transacción inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar el registro por tx_key
    const { data: payment, error: dbError } = await supabase
      .from("pro_payments")
      .select("id, nowpayments_invoice_id, status, pay_amount, pay_currency")
      .eq("tx_key", txKey)
      .maybeSingle();

    if (dbError || !payment) {
      return new Response(
        JSON.stringify({ valid: false, error: "Clave de transacción no encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Si ya fue confirmado, validar directamente
    if (payment.status === "confirmed") {
      return new Response(
        JSON.stringify({ valid: true, status: "confirmed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Consultar estado actual en NOWPayments
    const invoiceId = payment.nowpayments_invoice_id;
    let npStatus = payment.status;

    if (invoiceId && NP_API_KEY) {
      const statusRes = await fetch(`${NP_API_URL}/invoice/${invoiceId}`, {
        headers: { "x-api-key": NP_API_KEY },
      });

      if (statusRes.ok) {
        const npData = await statusRes.json();
        npStatus = String(npData.payment_status ?? npStatus).toLowerCase();
      }
    }

    // Actualizar estado en la base de datos si cambió
    if (npStatus !== payment.status) {
      const updatePayload: Record<string, unknown> = { status: npStatus };
      if (npStatus === "confirmed" || npStatus === "finished" || npStatus === "paid") {
        updatePayload.status = "confirmed";
        updatePayload.activated_at = new Date().toISOString();
        npStatus = "confirmed";
      }
      await supabase
        .from("pro_payments")
        .update(updatePayload)
        .eq("id", payment.id);
    }

    const valid = npStatus === "confirmed";

    return new Response(
      JSON.stringify({ valid, status: npStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return new Response(
      JSON.stringify({ valid: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
