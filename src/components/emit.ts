export default function emit<T>(target: Element, type: string, detail?: T): CustomEvent {
    const customEvent = new CustomEvent(type, {
      detail: detail !== undefined ? [detail] : undefined,
      bubbles: true,
      cancelable: false,
      composed: true,
    });
  
    target.dispatchEvent(customEvent);
  
    return customEvent;
  }
  