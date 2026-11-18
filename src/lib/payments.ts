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

export const BINANCE_PAY_ID = "TU_BINANCE_PAY_ID";
export const PAYMENT_AMOUNT = "1.50";
export const PAYMENT_CURRENCY = "USDT";
