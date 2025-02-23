export function snapAngle(angle: number, steps: number): number {
  // Calc the size of each step in the scale. 12 for hours, 60 for minutes
  const stepSize = 360 / steps;
  // Find the closest multiple of the step size. 12 for hours, 60 for minutes
  const closestStep = Math.round(angle / stepSize);
  // Calc the snapped angle
  const snappedAngle = closestStep * stepSize;

  return snappedAngle;
}

export function hoursToAngle(hour: number): number {
  const angle = (hour - 3) * 30;
  return (angle + 360) % 360;
}

export function minutesToAngle(minute: number): number {
  let angle = (minute - 15) * 6;
  angle = (angle + 360) % 360;

  return angle;
}

export function hours24ToAngle(hour: number): number {
  let angle: number;

  if (hour >= 0 && hour <= 11) {
    angle = (hour - 3) * 30; // Dial 1: 0 to 11
  } else {
    angle = (hour - 15) * 30; // Dial 2: 12 to 23
  }

  angle = (angle + 360) % 360;

  return angle;
}

export function angleToHours(angle: number): number {
  // Normalize the angle to be within 0-360 range
  angle = (angle + 360) % 360;
  // Correct mapping: 0 degrees -> 3, 270 degrees -> 12
  let hour = Math.floor((angle + 90) / 30) % 12;
  // Handle the 0 hour case (midnight)
  if (hour === 0) {
    hour = 12;
  }

  return hour;
}

export function angleToMinutes(angle: number): number {
  // Normalize the angle
  angle = (angle + 360) % 360;

  let minute = (angle / 6) + 15;

  minute = (minute + 60) % 60; // Ensure positive value and wrap around 60

  return Math.floor(minute);
}

export function angleToHours24(angle: number, dial: number): number {
  angle = (angle + 360) % 360;

  let hour: number = 0;
  const baseValue = angle / 30;

  if (dial === 1) { 
    hour = (Math.floor(baseValue + 3) % 12 + 12) % 12;
  } else if (dial === 2) { 
    hour = (Math.floor(baseValue + 3) % 12) + 12;
  }
  
  return hour;
}