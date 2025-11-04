

import type { Language } from '../store/languageStore';

// --- Date Conversion Helpers ---

const isLeapYear = (year: number): boolean => {
  if (year <= 0) year += 1; // Adjust for BC years, as there's no year 0
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getDaysInYear = (year: number): number => isLeapYear(year) ? 366 : 365;

const getDayOfYear = (day: number, month: number, year: number): number => {
  const daysInMonth = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dayOfYear = 0;
  for (let i = 1; i < month; i++) {
    dayOfYear += daysInMonth[i];
  }
  return dayOfYear + day;
};

/**
 * Converts a date (with optional month and day) into a decimal year representation
 * for accurate positioning on the timeline.
 */
export const dateToDecimal = (event: { date: number; month?: number; day?: number }): number => {
  if (event.month && event.day && event.month >= 1 && event.month <= 12 && event.day >= 1 && event.day <= 31) {
    const dayOfYear = getDayOfYear(event.day, event.month, event.date);
    const daysInYear = getDaysInYear(event.date);
    // Position in the middle of the day for better centering
    return event.date + (dayOfYear - 0.5) / daysInYear;
  }
  return event.date;
};

const decimalToDate = (decimalYear: number) => {
    const year = Math.floor(decimalYear);
    const remainder = decimalYear - year;
    const daysInYear = getDaysInYear(year);
    let dayOfYear = Math.floor(remainder * daysInYear) + 1;

    const daysInMonth = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = 1;
    while(month <= 12 && dayOfYear > daysInMonth[month]) {
        dayOfYear -= daysInMonth[month];
        month++;
    }
    const day = dayOfYear;
    return { year, month, day };
}


// --- Formatting Helpers ---

const MONTH_NAMES: Record<Language, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    be: ["Студзень", "Люты", "Сакавік", "Красавік", "Травень", "Чэрвень", "Ліпень", "Жнівень", "Верасень", "Кастрычнік", "Лістапад", "Снежань"],
};

const MONTH_ABBREVIATIONS: Record<Language, string[]> = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
    be: ["Сту", "Лют", "Сак", "Кра", "Тра", "Чэр", "Ліп", "Жні", "Вер", "Кас", "Ліс", "Сне"],
};

const BCE_CE_LABELS: Record<Language, { bce: string }> = {
    en: { bce: 'BCE' },
    ru: { bce: 'до н.э.' },
    be: { bce: 'да н.э.' },
};

export const formatBceCe = (year: number, lang: Language): string => {
   if (year < 0) return `${Math.abs(year)} ${BCE_CE_LABELS[lang].bce}`;
   if (year === 0) return `1 ${BCE_CE_LABELS[lang].bce}`; // Conventionally, year 0 is 1 BCE
   return `${year}`;
}

/**
 * Formats an event's date for display on its card.
 */
export const formatEventDate = (event: { date: number; month?: number; day?: number }, lang: Language): string => {
    const yearString = formatBceCe(event.date, lang);
    const months = MONTH_NAMES[lang];

    if (event.month && event.day && event.month >= 1 && event.month <= 12) {
        return `${months[event.month - 1]} ${event.day}, ${yearString}`;
    }
    if (event.month && event.month >= 1 && event.month <= 12) {
        return `${months[event.month - 1]}, ${yearString}`;
    }
    return yearString;
};

/**
 * Formats a date part (start or end) for display on a period.
 * Abbreviates for space.
 */
export const formatPeriodDate = (date: { date: number; month?: number; day?: number }, lang: Language): string => {
    const yearString = formatBceCe(date.date, lang);
    const months = MONTH_ABBREVIATIONS[lang];

    if (date.month && date.day && date.month >= 1 && date.month <= 12) {
        // Full date: Jan 1, 2024
        return `${months[date.month - 1]} ${date.day}, ${yearString}`;
    }
    if (date.month && date.month >= 1 && date.month <= 12) {
        // Month and year: Jan, 2024
        return `${months[date.month - 1]}, ${yearString}`;
    }
    // Just year
    return yearString;
};

// --- Ruler Tick Generation ---

/**
 * Dynamically generates ruler ticks based on the visible time span.
 */
export const getTicks = (startYear: number, endYear: number, minSpacing: number = 80, lang: Language): { major: {value: number, label: string}[], minor: {value: number, label?: string}[] } => {
    const span = endYear - startYear;
    if (span <= 0) return { major: [], minor: [] };
    const viewWidth = window.innerWidth;
    const idealNumTicks = viewWidth / minSpacing;

    // Level 1: Millennia to Decades
    if (span > 2) {
        const tickSizes = [5000, 1000, 500, 250, 100, 50, 25, 10, 5, 1];
        const idealTickSize = span / idealNumTicks;
        const tickSize = tickSizes.find(size => size < idealTickSize * 2) || 1;

        const startTick = Math.ceil(startYear / tickSize) * tickSize;
        const major = [];
        for (let i = startTick; i <= endYear; i += tickSize) {
            major.push({ value: i, label: formatBceCe(Math.round(i), lang) });
        }

        const subdivisions = tickSize > 100 ? 10 : 5;
        const minorStep = tickSize / subdivisions;
        const minor = [];
        if (minorStep >= 1) {
             for (const maj of major) {
                for (let i = 1; i < subdivisions; i++) {
                    const tickValue = maj.value - tickSize + i * minorStep;
                    if(tickValue > startYear && tickValue < endYear) {
                       minor.push({ value: tickValue });
                    }
                }
            }
        }
        return { major, minor };
    }

    // Level 2: Years and Months
    if (span > 0.25) { // ~3 months
        const major = []; // Years
        const minor = []; // Months
        const start = Math.floor(startYear);
        const end = Math.ceil(endYear);
        const months = MONTH_ABBREVIATIONS[lang];

        for (let year = start; year <= end; year++) {
            if (dateToDecimal({ date: year }) >= startYear && dateToDecimal({ date: year }) <= endYear) {
                major.push({ value: year, label: formatBceCe(year, lang) });
            }
            for(let month = 1; month <= 12; month++) {
                const decimal = dateToDecimal({ date: year, month: month, day: 15 });
                if(decimal > startYear && decimal < endYear) {
                    minor.push({ value: decimal, label: months[month-1] });
                }
            }
        }
        return { major, minor };
    }

    // Level 3: Days
    const major = []; // Months
    const minor = []; // Days
    const { year: sYear, month: sMonth } = decimalToDate(startYear);
    const eDate = decimalToDate(endYear);
    const eYear = eDate.year;
    const eMonth = eDate.month;
    const months = MONTH_NAMES[lang];
    
    for(let year = sYear; year <= eYear; year++) {
        const startMonth = (year === sYear) ? sMonth : 1;
        const endMonth = (year === eYear) ? eMonth : 12;
        for(let month = startMonth; month <= endMonth; month++) {
            const monthDecimal = dateToDecimal({date: year, month, day: 1});
             if(monthDecimal > startYear && monthDecimal < endYear) {
                major.push({ value: monthDecimal, label: `${months[month-1]} ${formatBceCe(year, lang)}`});
             }

            const daysInMonth = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
            const dayStep = span < 0.08 ? 1 : 5; // Show every day if span is ~ a month, else every 5 days
             for(let day = 1; day <= daysInMonth; day += dayStep) {
                 const dayDecimal = dateToDecimal({date: year, month, day});
                  if(dayDecimal > startYear && dayDecimal < endYear) {
                    minor.push({ value: dayDecimal, label: `${day}`});
                  }
             }
        }
    }
    return { major, minor };
};