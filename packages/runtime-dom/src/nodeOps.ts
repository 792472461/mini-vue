import { RendererOptions } from '@mini-vue/runtime-core'

export const svgNS = 'http://www.w3.org/2000/svg'
const doc = (typeof document !== 'undefined' ? document : null) as Document

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  // 插入
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },

  // 删除
  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (tag, isSVG, is, props): Element => {
    const el = isSVG
      ? doc.createElementNS(svgNS, tag)
      : doc.createElement(tag, is ? { is } : undefined)

    if (tag === 'select' && props && props.multiple != null) {
      ; (el as HTMLSelectElement).setAttribute('multiple', props.multiple)
    }

    return el
  },

  // 创建文本节点
  createText: text => doc.createTextNode(text),

  createComment: text => doc.createComment(text),

  // 设置文本
  setText: (node, text) => {
    node.nodeValue = text
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  parentNode: node => node.parentNode as Element | null,

  nextSibling: node => node.nextSibling,

  querySelector: selector => doc.querySelector(selector),

}