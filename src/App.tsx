import { useEffect } from "react";
import { Calculator as CalcIcon, Gauge } from "lucide-react";
import LotCalculator from "@/components/LotCalculator";

export default function App() {
  useEffect(() => {
    document.title = "Calculadora de Lotaje Forex & Gestión de Riesgo Gratis";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-sm">
              <Gauge className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-tight">Calculadora de Lotaje</h1>
              <p className="text-xs text-slate-500">Gestión de riesgo para trading</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
            <CalcIcon className="h-3.5 w-3.5" />
            FX Risk Manager
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <LotCalculator />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="text-center text-xs text-slate-400">
          Herramienta orientativa · El trading conlleva riesgo de pérdida de capital.
        </p>
      </footer>
    </div>
  );
}
