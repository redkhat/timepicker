export function secondsToDate(seconds: number): Date {
  const initialDate = new Date(0, 0, 0, 0);
  const date = new Date(initialDate.getTime() + seconds * 1000);
  return date;
}

export function detectTimeFormat(date: Date): string {
  const localTime = date.toLocaleTimeString();
  if (localTime.includes('AM') || localTime.includes('PM')) {
    return '12h';
  } else {
    return '24h';
  }
}

export function splitDate(date: Date): SimpleTime {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return { hours, minutes };
}

export function amPmTransform(isAm: string, date: Date) : Date {
  const newDate = new Date(date);
  const tempHours = newDate.getHours();
  if (isAm === 'AM' && tempHours >= 12) {
    newDate.setHours(tempHours - 12);
  } else if (isAm === 'PM' && tempHours < 12) {
    newDate.setHours(tempHours + 12);
  }
  return newDate;
}

export function validateTimeValue(value: string, max: number): string {
  let numericValue = value.replace(/[^0-9]/g, '');

  if (numericValue.length > 2) {
    numericValue = numericValue.slice(0, 2);
  }

  if (numericValue === '') {
    return '';
  }
  const num = parseInt(numericValue, 10);
  return num > max ? max.toString() : numericValue;
}

export function formatTimeValue(value: string, defaultValue: string, padLength: number = 2): string {
  if (value === '') {
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (num === 0) {
    return defaultValue;
  }
  return value.padStart(padLength, '0');
}

export interface SimpleTime {
  hours: number;
  minutes: number;
}


/**
 * Converts a time string or number to the number of seconds since midnight.
 *
 * Supported formats include:
 *  - Integers (e.g., "10", "1030", 10, 1030) in 24-hour format (up to 2359).
 *  - Space-separated numbers (e.g., "10 30") as HH MM.
 *  - Colon-separated numbers (e.g., "10:30" or "10:30:00") as HH:MM or HH:MM:SS.
 *  - Formats with regional AM/PM markers either at the beginning or at the end
 *    (e.g., "10:30am", "am 10:30", "午後3:25:00", "10:30 du matin").
 *
 * Additionally, this function normalizes Arabic digits (Unicode range \u0660-\u0669)
 * to their Western counterparts before processing.
 *
 * @param input The input to convert (can be a string or number).
 * @returns The number of seconds since midnight, or null if the input is invalid.
 */
export function timeToSecondsi18n(input: string | number): number | null {
  // Convert input to string and trim whitespace.
  let inputStr = typeof input === 'number' ? String(input) : input;
  inputStr = inputStr.trim();

  // Normalize Arabic digits to Western digits if found.
  if (/[\u0660-\u0669]/.test(inputStr)) {
    inputStr = inputStr.replace(/[\u0660-\u0669]/g, d => (d.charCodeAt(0) - 0x0660).toString());
  }
  // Extended list of AM and PM markers across various regions/languages.
  const AM_MARKERS = [
    'am', 'a.m.', 'a.m',         // English
    '午前',                     // Japanese
    '上午',                     // Chinese
    '오전',                     // Korean
    'ص', 'صباح', 'صباحاً',       // Arabic
    'du matin', 'matin'         // French
  ];
  const PM_MARKERS = [
    'pm', 'p.m.', 'p.m',         // English
    '午後',                     // Japanese
    '下午',                     // Chinese
    '오후',                     // Korean
    'م', 'مساء', 'مساءً',         // Arabic
    "de l’après-midi", "de l'aprés-midi", "de l'après-midi",
    'après-midi', 'du soir', 'soir' // French
  ];

  let period: 'AM' | 'PM' | null = null;

  // Helper functions to compare prefix/suffix ignoring case.
  const startsWithIgnoreCase = (str: string, prefix: string) =>
    str.substring(0, prefix.length).toLowerCase() === prefix.toLowerCase();
  const endsWithIgnoreCase = (str: string, suffix: string) =>
    str.substring(str.length - suffix.length).toLowerCase() === suffix.toLowerCase();

  // Check if the period marker is at the beginning.
  for (const marker of AM_MARKERS) {
    if (startsWithIgnoreCase(inputStr, marker)) {
      period = 'AM';
      inputStr = inputStr.substring(marker.length).trim();
      break;
    }
  }
  if (!period) {
    for (const marker of PM_MARKERS) {
      if (startsWithIgnoreCase(inputStr, marker)) {
        period = 'PM';
        inputStr = inputStr.substring(marker.length).trim();
        break;
      }
    }
  }
  // If not found at the beginning, check at the end.
  if (!period) {
    for (const marker of AM_MARKERS) {
      if (endsWithIgnoreCase(inputStr, marker)) {
        period = 'AM';
        inputStr = inputStr.substring(0, inputStr.length - marker.length).trim();
        break;
      }
    }
  }
  if (!period) {
    for (const marker of PM_MARKERS) {
      if (endsWithIgnoreCase(inputStr, marker)) {
        period = 'PM';
        inputStr = inputStr.substring(0, inputStr.length - marker.length).trim();
        break;
      }
    }
  }

  // Split the numeric part of the time.
  let timeParts: number[] = [];

  if (inputStr.includes(':')) {
    // Colon-separated format. Accepts HH:MM or HH:MM:SS.
    const parts = inputStr.split(':');
    if (parts.length < 2 || parts.length > 3) return null;
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num)) return null;
      timeParts.push(num);
    }
  } else if (inputStr.includes(' ')) {
    // Space-separated format (e.g., "10 30").
    const parts = inputStr.split(/\s+/);
    if (parts.length > 3) return null;
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num)) return null;
      timeParts.push(num);
    }
  } else if (/^\d+$/.test(inputStr)) {
    // Numeric case without separators: "10", "1030".
    if (inputStr.length <= 2) {
      timeParts = [parseInt(inputStr, 10)];
    } else if (inputStr.length === 3) {
      timeParts = [
        parseInt(inputStr.substring(0, 1), 10),
        parseInt(inputStr.substring(1), 10),
      ];
    } else if (inputStr.length === 4) {
      timeParts = [
        parseInt(inputStr.substring(0, 2), 10),
        parseInt(inputStr.substring(2), 10),
      ];
    } else {
      // Unsupported numeric format with more than 4 digits.
      return null;
    }
  } else {
    // Unrecognized format.
    return null;
  }

  // Extract hour, minute, and second (defaulting to 0 if not provided).
  let hour = timeParts[0];
  let minute = timeParts.length >= 2 ? timeParts[1] : 0;
  let second = timeParts.length === 3 ? timeParts[2] : 0;

  // Validate minute and second ranges.
  if (minute < 0 || minute > 59) return null;
  if (second < 0 || second > 59) return null;

  // Adjust hour based on the AM/PM marker.
  if (period) {
    if (hour < 1 || hour > 12) return null;
    if (period === 'PM') {
      hour = hour === 12 ? 12 : hour + 12;
    } else {
      hour = hour === 12 ? 0 : hour;
    }
  } else {
    // Without a period, assume 24-hour format.
    if (hour < 0 || hour > 23) return null;
  }

  return hour * 3600 + minute * 60 + second;
}
