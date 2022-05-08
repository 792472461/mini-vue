import { isArray, isObject } from "@mini-vue/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type: any, propsOrChildren?: any, children?: any) {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        // VNode情况
        return createVNode(type, null, [propsOrChildren])
      }
      // 对象
      return createVNode(type, propsOrChildren)
    } else {
      // 数组情况
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // h('div', {}, 'a', 'b', 'cc')
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}