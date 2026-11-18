import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NP_API_KEY = Deno.env.get("NOWPAYMENTS_API_KEY") ?? "";
const NP_API_URL = "https://api.nowpayments.io/v1";

function genTxKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!NP_API_KEY) {
      return new Response(
        JSON.stringify({ error: "NOWPayments API key no configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const txKey = genTxKey();

    // Crear factura en NOWPayments
    const invoiceRes = await fetch(`${NP_API_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": NP_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: 1.5,
        price_currency: "usd",
        pay_currency: "usdt",
        order_id: txKey,
        order_description: "Activación Pro - Calculadora de Lotaje",
      }),
    });

    if (!invoiceRes.ok) {
      const errText = await invoiceRes.text();
      return new Response(
        JSON.stringify({ error: "Error al crear factura en NOWPayments", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const invoice = await invoiceRes.json();
    const invoiceId = String(invoice.id);
    const payAddress = invoice.pay_address ?? "";
    const payAmount = Number(invoice.pay_amount ?? 1.5);
    const payCurrency = invoice.pay_currency ?? "usdt";
    const invoiceUrl = invoice.invoice_url ?? "";

    // Guardar en la base de datos
    const { error: dbError } = await supabase.from("pro_payments").insert({
      tx_key: txKey,
      nowpayments_invoice_id: invoiceId,
      nowpayments_pay_address: payAddress,
      pay_amount: payAmount,
      pay_currency: payCurrency,
      status: "waiting",
    });

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Error al registrar el pago", detail: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        tx_key: txKey,
        invoice_id: invoiceId,
        invoice_url: invoiceUrl,
        pay_address: payAddress,
        pay_amount: payAmount,
        pay_currency: payCurrency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
