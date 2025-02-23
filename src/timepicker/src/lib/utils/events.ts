import { fromEvent, merge, Observable, tap } from "rxjs";

export interface MouseTouchEvent {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  target: EventTarget | null;
}

 export function normalizeEvent(event: MouseEvent | TouchEvent | Touch): MouseTouchEvent {
  if (event instanceof MouseEvent) {
    return event;
  } else if (event instanceof TouchEvent) {
    return event.touches[0] || event.changedTouches[0];
  } else if (event instanceof Touch) {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      screenX: event.screenX,
      screenY: event.screenY,
      target: event.target
    };
  }
  return event;
}

  export function createPointerEvents(element: HTMLElement | Element): {
    start$: Observable<PointerEvent>;
    move$: Observable<PointerEvent>;
    end$: Observable<PointerEvent>;
  } {
  const pointerDown$ = fromEvent<PointerEvent>(element, 'pointerdown');
  const pointerMove$ = fromEvent<PointerEvent>(document, 'pointermove');
  const pointerUp$ = fromEvent<PointerEvent>(document, 'pointerup');
  const pointerLeave$ = fromEvent<PointerEvent>(document, 'pointerleave');

  const start$ = pointerDown$;
  const move$ = pointerMove$;
  const end$ = merge(pointerUp$, pointerLeave$);

  return { start$, move$, end$ };
}
