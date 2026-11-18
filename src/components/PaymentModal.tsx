import { useEffect, useState } from "react";
import { X, CreditCard, KeyRound, Loader2, CheckCircle2, ExternalLink, AlertTriangle, Crown, Copy } from "lucide-react";
import { createInvoice, verifyPayment, setPro, type InvoiceData } from "@/lib/payments";

type Status = "idle" | "creating" | "paying" | "verifying" | "success" | "error";

type Props = {
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
};

export default function PaymentModal({ open, onClose, onActivated }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [txKeyInput, setTxKeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setInvoice(null);
      setTxKeyInput("");
      setErrorMsg("");
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handlePay = async () => {
    setStatus("creating");
    setErrorMsg("");
    try {
      const inv = await createInvoice();
      setInvoice(inv);
      setStatus("paying");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al crear la factura");
      setStatus("error");
    }
  };

  const handleVerify = async () => {
    if (txKeyInput.trim().length < 8) {
      setErrorMsg("Ingresa una clave de transacción válida");
      return;
    }
    setStatus("verifying");
    setErrorMsg("");
    try {
      const result = await verifyPayment(txKeyInput.trim());
      if (result.valid) {
        setPro(true);
        setStatus("success");
        setTimeout(() => {
          onActivated();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(
          result.status === "waiting"
            ? "El pago aún no ha sido confirmado. Intenta de nuevo en unos segundos."
            : result.error || "Clave de transacción no válida o pago no confirmado"
        );
        setStatus("paying");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al verificar el pago");
      setStatus("paying");
    }
  };

  const copyAddress = () => {
    if (invoice?.pay_address) {
      navigator.clipboard.writeText(invoice.pay_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Activar Pro</h2>
              <p className="text-sm text-blue-100">Desbloquea la exportación PDF</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <h3 className="text-lg font-semibold text-slate-800">¡Pro activado!</h3>
              <p className="text-sm text-slate-500">
                Tu cuenta ahora tiene estado Pro. Ya puedes exportar tus tablas en PDF.
              </p>
            </div>
          ) : (
            <>
              {/* Price summary */}
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pago único</p>
                  <p className="text-2xl font-bold text-slate-800">
                    1.50 <span className="text-base font-semibold text-slate-400">USDT</span>
                  </p>
                </div>
                <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pro
                </span>
              </div>

              {/* Step 1: Pay button */}
              {status === "idle" || status === "creating" ? (
                <button
                  onClick={handlePay}
                  disabled={status === "creating"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60"
                >
                  {status === "creating" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                  {status === "creating" ? "Generando factura…" : "Pagar con NOWPayments"}
                </button>
              ) : null}

              {/* Step 2: Invoice details + verify */}
              {(status === "paying" || status === "verifying" || status === "error") && invoice && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-medium text-slate-500">Dirección de pago (USDT TRC20)</p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 truncate text-xs text-slate-700">
                        {invoice.pay_address || "—"}
                      </code>
                      <button
                        onClick={copyAddress}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                        aria-label="Copiar dirección"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Monto</span>
                      <span className="text-sm font-semibold text-slate-700">
                        {invoice.pay_amount} {invoice.pay_currency.toUpperCase()}
                      </span>
                    </div>
                    {invoice.invoice_url && (
                      <a
                        href={invoice.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Ver factura en NOWPayments
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      Tu clave de transacción: <span className="font-mono font-semibold text-slate-600">{invoice.tx_key}</span>
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-medium text-slate-600">
                      ¿Ya pagaste? Ingresa tu clave de transacción:
                    </p>
                    <div className="flex gap-2">
                      <div className="flex flex-1 items-stretch rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:bg-white">
                        <KeyRound className="m-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={txKeyInput}
                          onChange={(e) => setTxKeyInput(e.target.value)}
                          placeholder="Clave de transacción"
                          className="w-full bg-transparent py-2 pr-3 text-sm text-slate-800 outline-none"
                          disabled={status === "verifying"}
                        />
                      </div>
                      <button
                        onClick={handleVerify}
                        disabled={status === "verifying"}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-center text-xs text-slate-400">
                Pago procesado por NOWPayments · Clave válida para activar Pro permanentemente
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
