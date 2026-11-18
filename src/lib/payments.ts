const PRO_KEY = "lotaje_pro";

export function isPro(): boolean {
  try {
    return localStorage.getItem(PRO_KEY) === "true";
  } catch {
    return false;
  }
}

export function setPro(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(PRO_KEY, "true");
    } else {
      localStorage.removeItem(PRO_KEY);
    }
  } catch {
    /* ignore */
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type InvoiceData = {
  tx_key: string;
  invoice_id: string;
  invoice_url: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
};

export async function createInvoice(): Promise<InvoiceData> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/nowpayments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  const data = await res.json();
  if (!data.tx_key) throw new Error("Respuesta inválida del servidor");
  return data as InvoiceData;
}

export type VerifyResult = {
  valid: boolean;
  status: string;
  error?: string;
};

export async function verifyPayment(txKey: string): Promise<VerifyResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tx_key: txKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { valid: false, status: "error", error: data.error || `Error ${res.status}` };
  }
  return { valid: Boolean(data.valid), status: String(data.status) };
}
