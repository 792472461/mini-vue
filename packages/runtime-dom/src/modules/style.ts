import { camelize, capitalize, isArray, isString } from "@mini-vue/shared"

type Style = string | Record<string, string | string[]> | null

export function patchStyle(el: Element, prev: Style, next: Style) {
  const style = (el as HTMLElement).style
  // 判断新style是不是字符串类型
  const isCssString = isString(next)
  if (next && !isCssString) {
    // 如果不是字符串类型，直接处理就行
    for (const key in next) {
      setStyle(style, key, next[key])
    }
    if (prev && !isString(prev)) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  } else {
    const currentDisplay = style.display
    if (isCssString) {
      if (prev !== next) {
        style.cssText = next as string
      }
    } else if (prev) {
      el.removeAttribute('style')
    }
    // 元素的“显示”由“v-show”控制
    // 因此，无论“样式”如何，我们始终保持当前的“显示”值`
    // 从而将控制权移交给“v-show”
    if ('_vod' in el) {
      style.display = currentDisplay
    }
  }
}

// const importantRE = /\s*!important$/

function setStyle(
  style: CSSStyleDeclaration,
  name: string,
  val: string | string[]
) {
  if (isArray(val)) {
    val.forEach(v => setStyle(style, name, v))
  } else {
    if (val == null) val = ''
    // if (name.startsWith('--')) {
    //   // custom property definition
    //   style.setProperty(name, val)
    // } else {
    const prefixed = autoPrefix(style, name)
    style[prefixed as any] = val
    // if (importantRE.test(val)) {
    //   // !important
    //   style.setProperty(
    //     hyphenate(prefixed),
    //     val.replace(importantRE, ''),
    //     'important'
    //   )
    // } else {
    //   style[prefixed as any] = val
    // }
    // }
  }
}

const prefixes = ['Webkit', 'Moz', 'ms']
const prefixCache: Record<string, string> = {}

function autoPrefix(style: CSSStyleDeclaration, rawName: string): string {
  const cached = prefixCache[rawName]
  if (cached) {
    return cached
  }
  let name = camelize(rawName)
  if (name !== 'filter' && name in style) {
    return (prefixCache[rawName] = name)
  }
  name = capitalize(name)
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name
    if (prefixed in style) {
      return (prefixCache[rawName] = prefixed)
    }
  }
  return rawName
}