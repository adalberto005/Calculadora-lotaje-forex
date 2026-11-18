/*
# Tabla de pagos Pro (NOWPayments)

1. Nueva tabla
- `pro_payments`: registra cada intento de pago para activar el estado Pro.
  - `id` (uuid, pk)
  - `tx_key` (text, único): clave de transacción que el usuario ingresa para activar Pro. Generada por el edge function.
  - `nowpayments_invoice_id` (text): id de factura devuelto por NOWPayments.
  - `nowpayments_pay_address` (text): dirección de pago en blockchain.
  - `pay_amount` (numeric): monto a pagar en USDT.
  - `pay_currency` (text): moneda de pago (USDT).
  - `status` (text): estado del pago: waiting, confirming, confirmed, failed, expired.
  - `created_at` (timestamptz)
  - `activated_at` (timestamptz, nullable): fecha en que se confirmó y activó Pro.

2. Seguridad
- RLS habilitada.
- Grants de SELECT e INSERT a anon + authenticated (la app no tiene login).
- UPDATE y DELETE solo a service_role (edge function con service role key).
- Políticas: anon puede INSERT y SELECT; no puede UPDATE ni DELETE.
*/

CREATE TABLE IF NOT EXISTS pro_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_key text UNIQUE NOT NULL,
  nowpayments_invoice_id text,
  nowpayments_pay_address text,
  pay_amount numeric NOT NULL DEFAULT 1.5,
  pay_currency text NOT NULL DEFAULT 'usdt',
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz
);

ALTER TABLE pro_payments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON pro_payments TO anon, authenticated;
GRANT UPDATE, DELETE ON pro_payments TO service_role;

DROP POLICY IF EXISTS "anon_insert_pro_payment" ON pro_payments;
CREATE POLICY "anon_insert_pro_payment"
ON pro_payments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_pro_payment" ON pro_payments;
CREATE POLICY "anon_select_pro_payment"
ON pro_payments FOR SELECT
TO anon, authenticated USING (true);
