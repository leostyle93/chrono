
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

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const formatBceCe = (year: number): string => {
   if (year < 0) return `${Math.abs(year)} BCE`;
   if (year === 0) return `1 BCE`; // Conventionally, year 0 is 1 BCE
   return `${year} CE`;
}

/**
 * Formats an event's date for display on its card.
 */
export const formatEventDate = (event: { date: number; month?: number; day?: number }): string => {
    const yearString = formatBceCe(event.date);

    if (event.month && event.day && event.month >= 1 && event.month <= 12) {
        return `${MONTH_NAMES[event.month - 1]} ${event.day}, ${yearString}`;
    }
    if (event.month && event.month >= 1 && event.month <= 12) {
        return `${MONTH_NAMES[event.month - 1]}, ${yearString}`;
    }
    return yearString;
};

// --- Ruler Tick Generation ---

/**
 * Dynamically generates ruler ticks based on the visible time span.
 */
export const getTicks = (startYear: number, endYear: number, minSpacing: number = 80): { major: {value: number, label: string}[], minor: {value: number, label?: string}[] } => {
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
            major.push({ value: i, label: formatBceCe(Math.round(i)) });
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

        for (let year = start; year <= end; year++) {
            if (dateToDecimal({ date: year }) >= startYear && dateToDecimal({ date: year }) <= endYear) {
                major.push({ value: year, label: formatBceCe(year) });
            }
            for(let month = 1; month <= 12; month++) {
                const decimal = dateToDecimal({ date: year, month: month, day: 15 });
                if(decimal > startYear && decimal < endYear) {
                    minor.push({ value: decimal, label: MONTH_NAMES[month-1].substring(0,3) });
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
    
    for(let year = sYear; year <= eYear; year++) {
        const startMonth = (year === sYear) ? sMonth : 1;
        const endMonth = (year === eYear) ? eMonth : 12;
        for(let month = startMonth; month <= endMonth; month++) {
            const monthDecimal = dateToDecimal({date: year, month, day: 1});
             if(monthDecimal > startYear && monthDecimal < endYear) {
                major.push({ value: monthDecimal, label: `${MONTH_NAMES[month-1]} ${formatBceCe(year)}`});
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
