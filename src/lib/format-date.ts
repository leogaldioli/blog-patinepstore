const PT_MONTHS_SHORT = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
] as const;

const PT_MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

const EN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const EN_MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type Language = "pt" | "en";
type MonthStyle = "short" | "long";

/**
 * Formats publication dates identically on the server and in old browsers.
 * UTC avoids changing the displayed day when the browser and server use
 * different time zones.
 */
export function formatPostDate(
  value: string,
  language: Language,
  monthStyle: MonthStyle,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = ("0" + date.getUTCDate()).slice(-2);
  const year = date.getUTCFullYear();
  const monthIndex = date.getUTCMonth();

  if (language === "en") {
    const month = (monthStyle === "long" ? EN_MONTHS_LONG : EN_MONTHS_SHORT)[monthIndex];
    return `${month} ${day}, ${year}`;
  }

  const month = (monthStyle === "long" ? PT_MONTHS_LONG : PT_MONTHS_SHORT)[monthIndex];
  return `${day} de ${month} de ${year}`;
}
