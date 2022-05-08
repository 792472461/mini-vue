type EventValue = Function | Function[]

interface Invoker extends EventListener {
  value: EventValue
}

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.addEventListener(event, handler, options)
}

export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options?: EventListenerOptions
) {
  el.removeEventListener(event, handler, options)
}

export function patchEvent(
  el: Element & { _vei?: Record<string, Invoker | undefined> },
  rawName: string,
  prevValue: EventValue | null,
  nextValue: EventValue | null,
) {
  // 先移除事件，然后再重新绑定事件
  // remove -> add -> add + 自定义事件 里面调用绑定的方法
  const invokers = el._vei || (el._vei = {})
  // 缓存
  const existingInvoker = invokers[rawName]

  if (existingInvoker && nextValue) {
    // 已经绑定过事件 && 新的事件不是null
    existingInvoker.value = nextValue
  } else {
    const [name] = parseName(rawName)
    if (nextValue) {
      // add
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      addEventListener(el, name, invoker)
    } else if (existingInvoker) {
      // 如果新事件是null,需要把老的事件移除掉
      removeEventListener(el, name, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}

function createInvoker(initialValue: EventValue) {
  const invoker: Invoker = (e) => {
    if (Array.isArray(invoker.value)) {
      // TODO:处理事件是数组情况
    } else {
      return invoker.value()
    }
  }

  invoker.value = initialValue
  return invoker
}

function parseName(rawName: string) {
  const name = rawName?.slice(2)?.toLowerCase() || ''
  return [name]
}