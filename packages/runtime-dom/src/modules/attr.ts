export function patchAttr(
  el: Element,
  key: string,
  value: any,
) {
  if (value) {
    el.setAttribute(key, value)
  } else {
    el.removeAttribute(key)
  }
}