import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertTriangle, Crown, Copy, QrCode, KeyRound, Wallet } from "lucide-react";
import { BINANCE_PAY_ID, PAYMENT_AMOUNT, PAYMENT_CURRENCY, setPro } from "@/lib/payments";

type Props = {
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
};

export default function PaymentModal({ open, onClose, onActivated }: Props) {
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setTxHash("");
      setError("");
      setSuccess(false);
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

  const copyId = () => {
    navigator.clipboard.writeText(BINANCE_PAY_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivate = () => {
    const trimmed = txHash.trim();
    if (trimmed.length < 10) {
      setError("Pega el ID de transacción o hash del pago (mínimo 10 caracteres).");
      return;
    }
    setPro(true);
    setSuccess(true);
    setTimeout(() => {
      onActivated();
      onClose();
    }, 1600);
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
          {success ? (
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
                    {PAYMENT_AMOUNT} <span className="text-base font-semibold text-slate-400">{PAYMENT_CURRENCY}</span>
                  </p>
                </div>
                <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Pro
                </span>
              </div>

              {/* Binance Pay ID */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Wallet className="h-4 w-4 text-blue-500" />
                  Envía {PAYMENT_AMOUNT} {PAYMENT_CURRENCY} vía Binance Pay
                </div>

                {/* QR placeholder */}
                <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-36 w-36 items-center justify-center rounded-xl bg-slate-50">
                    {/* QR visual placeholder — reemplaza por tu QR real */}
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                      <QrCode className="h-16 w-16 text-slate-300" />
                      <span className="absolute bottom-1 text-[9px] text-slate-400">QR Binance Pay</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-400">Escanea el QR o usa el ID de Binance Pay</p>
                </div>

                {/* Binance Pay ID */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs font-medium text-slate-500">ID de Binance Pay</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 truncate text-sm font-semibold text-slate-700">{BINANCE_PAY_ID}</code>
                    <button
                      onClick={copyId}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                      aria-label="Copiar ID"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction hash input */}
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-medium text-slate-600">
                  Pega el ID de transacción o hash del pago:
                </p>
                <div className="flex items-stretch rounded-lg border border-slate-200 bg-slate-50 transition focus-within:border-blue-500 focus-within:bg-white">
                  <KeyRound className="m-2.5 h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => {
                      setTxHash(e.target.value);
                      setError("");
                    }}
                    placeholder="ID de transacción / Hash"
                    className="w-full bg-transparent py-2 pr-3 text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleActivate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
              >
                <Crown className="h-5 w-5" />
                Activar Pro
              </button>

              <p className="text-center text-xs text-slate-400">
                Tras enviar el pago, pega el ID de transacción y pulsa «Activar Pro».
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
