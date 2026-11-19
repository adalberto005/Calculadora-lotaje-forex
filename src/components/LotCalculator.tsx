import { useEffect, useMemo, useState } from "react";
import { Calculator, Download, AlertTriangle, TrendingUp, Coins, Target, Crown, LockKeyhole } from "lucide-react";
import { Button, Card, NumberInput, Stat } from "@/components/ui";
import { exportPdf } from "@/lib/exportPdf";
import { isPro as checkPro, setPro } from "@/lib/payments";
import PaymentModal from "@/components/PaymentModal";

const MIN_PIPS = 1;
const MAX_PIPS = 50;
const STANDARD_LOT = 100_000; // unidades por lote estándar (1.00)
const PIP_VALUE_PER_LOT = 10; // USD por pip por lote estándar

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

type TableRow = { pips: number; lotaje: string; units: string; risk: string };

export default function LotCalculator() {
  const [account, setAccount] = useState("10000");
  const [riskPct, setRiskPct] = useState("1.0");
  const [pro, setProState] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setProState(checkPro());
  }, []);

  const errors = {
    account: account === "" || Number(account) <= 0 ? "El monto debe ser mayor a 0" : null,
    riskPct: (() => {
      const r = Number(riskPct);
      if (riskPct === "" || isNaN(r)) return "Ingresa un valor entre 0.0 y 3.0";
      if (r < 0 || r > 3) return "El riesgo debe estar entre 0.0 y 3.0";
      return null;
    })(),
  };

  const tableRows = useMemo(() => {
    const acct = Number(account);
    const risk = clamp(Number(riskPct), 0, 3);
    if (!isFinite(acct) || acct <= 0 || !isFinite(risk)) return [];

    const riskAmountVal = acct * (risk / 100);

    const out: TableRow[] = [];
    for (let pips = MIN_PIPS; pips <= MAX_PIPS; pips++) {
      const pipValue = PIP_VALUE_PER_LOT * pips;
      const lotaje = pipValue > 0 ? riskAmountVal / pipValue : 0;
      out.push({
        pips,
        lotaje: lotaje.toFixed(2),
        units: Math.round(lotaje * STANDARD_LOT).toLocaleString("es-ES"),
        risk: riskAmountVal.toFixed(2),
      });
    }
    return out;
  }, [account, riskPct]);

  const hasError = Object.values(errors).some(Boolean);
  const validRows = hasError ? [] : tableRows;
  const riskAmount = (() => {
    const acct = Number(account);
    const risk = Number(riskPct);
    if (!isFinite(acct) || acct <= 0 || !isFinite(risk)) return null;
    return acct * (clamp(risk, 0, 3) / 100);
  })();

  const avgLot = validRows.length
    ? (validRows.reduce((s, r) => s + Number(r.lotaje), 0) / validRows.length).toFixed(2)
    : "—";

  const riskValueNum = Number(riskPct);

  const [exporting, setExporting] = useState(false);

  const setRiskFromSlider = (v: number) => {
    setRiskPct(v.toFixed(1));
  };

  const handleExport = async () => {
    if (!pro) {
      setModalOpen(true);
      return;
    }
    setExporting(true);
    try {
      await exportPdf(
        "lotaje.pdf",
        "Tabla de Lotaje por Pips",
        `Cuenta: ${account} USD  ·  Riesgo: ${riskPct}%  ·  Lote estándar (100k)`,
        ["Pips", "Lotaje", "Unidades", "Riesgo (USD)"],
        validRows.map((r) => [String(r.pips), r.lotaje, r.units, r.risk])
      );
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleActivated = () => {
    setPro(true);
    setProState(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Left: inputs */}
      <div className="lg:col-span-2 space-y-4">
        <Card title="Parámetros de la cuenta" icon={<Coins className="h-5 w-5" />} accent="blue">
          <NumberInput
            label="Monto de la cuenta"
            suffix="USD"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            error={errors.account}
            step="100"
            min="0"
            placeholder="10000"
          />
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Instrumento: Lote estándar (100 000 unidades)</p>
            <p className="mt-1 text-slate-400">Valor por pip por lote: $10 USD</p>
          </div>
        </Card>

        <Card title="Riesgo por operación" icon={<Target className="h-5 w-5" />} accent="amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">% de riesgo</span>
            <span className={`text-lg font-bold tabular-nums ${riskValueNum > 0 ? "text-amber-600" : "text-slate-400"}`}>
              {riskPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={Number.isFinite(riskValueNum) ? clamp(riskValueNum, 0, 3) : 0}
            onChange={(e) => setRiskFromSlider(Number(e.target.value))}
            className="mt-3 w-full accent-amber-500"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0.0%</span>
            <span>1.5%</span>
            <span>3.0%</span>
          </div>
          <NumberInput
            label="O escribe el valor exacto"
            suffix="%"
            value={riskPct}
            onChange={(e) => setRiskPct(e.target.value)}
            error={errors.riskPct}
            step="0.1"
            min="0"
            max="3"
            className="mt-3"
          />
          {errors.riskPct && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{errors.riskPct}</span>
            </div>
          )}
        </Card>

        {hasError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Corrige los campos marcados para calcular el lotaje.</span>
          </div>
        )}
      </div>

      {/* Right: results */}
      <div className="lg:col-span-3 space-y-4">
        <Card title="Resumen" icon={<TrendingUp className="h-5 w-5" />} accent="emerald">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Monto en riesgo"
              value={riskAmount != null ? riskAmount.toFixed(2) : "—"}
              unit="USD"
              tone="amber"
            />
            <Stat label="Riesgo" value={hasError ? "—" : `${riskPct}%`} unit="de la cuenta" tone="blue" />
            <Stat label="Lotaje promedio" value={avgLot} unit="lotes" tone="emerald" />
          </div>
        </Card>

        <Card title="Tabla de lotaje por pips" icon={<Calculator className="h-5 w-5" />} accent="slate">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Cada fila muestra el lotaje recomendado para detener la pérdida en N pips manteniendo el riesgo elegido.
          </div>
          <div className="relative overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 font-medium">Pips</th>
                  <th className="px-4 py-2.5 font-medium">Lotaje</th>
                  <th className="px-4 py-2.5 font-medium">Unidades</th>
                  <th className="px-4 py-2.5 font-medium text-right">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                      Completa los parámetros para ver el desglose.
                    </td>
                  </tr>
                )}
                {validRows.map((r) => (
                  <tr
                    key={r.pips}
                    className={`transition-colors ${!pro && r.pips >= 4 ? "select-none blur-[5px]" : "hover:bg-slate-50/60"}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                          {r.pips}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold tabular-nums text-slate-800">{r.lotaje}</td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-500">{r.units}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                      ${r.risk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pro && validRows.length > 3 && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-24 bg-gradient-to-b from-white/0 via-white/55 to-white/95" />
                <div className="absolute left-1/2 top-[62%] z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/95 p-5 text-center shadow-xl shadow-slate-900/15 backdrop-blur-sm">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-5 text-slate-800">
                    🔒 Visualiza la tabla completa (hasta 50 pips) y exporta tus reportes
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button
                      icon={<Download className="h-4 w-4" />}
                      onClick={() => setModalOpen(true)}
                    >
                      📄 Descargar PDF Completo
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400">
                {validRows.length > 0
                  ? `Lote estándar (100k) · ${validRows.length} filas`
                  : "Sin datos para exportar"}
              </p>
              {pro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Crown className="h-3 w-3" /> Pro
                </span>
              )}
            </div>
            <Button
              icon={<Download className="h-4 w-4" />}
              onClick={handleExport}
              disabled={validRows.length === 0 || exporting}
            >
              {exporting ? "Generando…" : pro ? "Exportar PDF" : "Exportar PDF (Pro)"}
            </Button>
          </div>
        </Card>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onActivated={handleActivated}
      />
    </div>
  );
}
