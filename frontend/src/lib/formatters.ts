export function formatCurrency(value: number, decimals = 1): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}T`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}B`;
  }
  return `$${value.toFixed(decimals)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatLargeNumber(value: number, decimals = 1): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

export function formatKpiValue(value: number, format: string): string {
  switch (format) {
    case "trillions":
      return `$${(value / 1_000).toFixed(1)}T`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "index":
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatQuarter(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}
