// Dates are written day-first with three-letter months ("14 Sep 2026"), in UTC so
// build machines in any time zone produce the same text.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dayMonth = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

export const dayMonthYear = (iso: string) => `${dayMonth(iso)} ${new Date(iso).getUTCFullYear()}`;

export const monthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// "fix(param): populate long_name (#2478)" -> "Populate long_name"
export const plainTitle = (title: string) => {
  const text = title.replace(/^\w+(\([^)]*\))?!?:\s*/, '').replace(/\s*\(#\d+\)$/, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
};
