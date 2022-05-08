import { isString, NOOP, ShapeFlags } from "@mini-vue/shared"
import { App } from "./apiCreateApp"
import { Data } from "./component"
// import { createApp } from "./createApp"
import { VNode, VNodeProps, VNodeArrayChildren, isSameVNode, VNodeChild, createVNode } from './vnode'
import { Text } from "./vnode"

export interface RendererNode {
  [key: string]: any
}
export interface RendererElement extends RendererNode { }

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
  > {
  patchProp(
    el: HostElement,
    key: string,
    prevValue: any,
    nextValue: any,
    isSVG?: boolean,
  ): void
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null): void
  remove(el: HostNode): void
  createElement(
    type: string,
    isSVG?: boolean,
    isCustomizedBuiltIn?: string,
    vnodeProps?: (VNodeProps & { [key: string]: any }) | null
  ): HostElement
  createText(text: string): HostNode
  createComment(text: string): HostNode
  setText(node: HostNode, text: string): void
  setElementText(node: HostElement, text: string): void
  parentNode(node: HostNode): HostElement | null
  nextSibling(node: HostNode): HostNode | null
  querySelector?(selector: string): HostElement | null
  setScopeId?(el: HostElement, id: string): void
  cloneNode?(node: HostNode): HostNode
  insertStaticContent?(
    content: string,
    parent: HostElement,
    anchor: HostNode | null,
    isSVG: boolean,
    start?: HostNode | null,
    end?: HostNode | null
  ): [HostNode, HostNode]
}

export type CreateAppFunction<HostElement = RendererElement> = (
  rootComponent: any,
  rootProps?: Data | null
) => App<HostElement>

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: any | null,
  container: HostElement,
  isSVG?: boolean
) => void

export interface Renderer<HostElement = RendererElement> {
  render: RootRenderFunction<HostElement>
  createApp?: CreateAppFunction<HostElement>
}

export function createRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement
>(options: RendererOptions<HostNode, HostElement>) {
  return baseCreateRenderer<HostNode, HostElement>(options)
}

function baseCreateRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement
>(options: RendererOptions): Renderer<HostElement> {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    // createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    // parentNode: hostParentNode,
    // nextSibling: hostNextSibling,
    // setScopeId: hostSetScopeId = (NOOP),
    // cloneNode: hostCloneNode,
    // insertStaticContent: hostInsertStaticContent
  } = options

  const normalize = (child: VNodeChild): VNode => {
    return createVNode(Text, null, String(child))
  }

  const mountChildren = (
    children: VNodeArrayChildren,
    container: RendererElement,
    start: number = 0
  ) => {
    for (let i = start; i < children.length; i++) {
      if (children[i]) {
        const child = normalize(children[i])

        patch(null, child, container)
      }
    }
  }

  const mountElement = (vnode: VNode, container: RendererElement) => {
    const { type, props, shapeFlag } = vnode
    // 将真实元素挂载到这个虚拟节点上，后面可以用来复用节点和更新
    const el = vnode.el = hostCreateElement(type as string)
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children as VNodeArrayChildren, el)
    }
    // 处理props
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    hostInsert(el, container)
  }

  const patchProps = (
    el: RendererElement,
    vnode: VNode,
    oldProps: Data,
    newProps: Data,
  ) => {

  }

  const patchElement = () => {

  }

  const processText = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    if (n1 === null) {
      hostInsert(hostCreateText(n2.children as string), container)
    } else {
      // 文本内容变化
      const el = (n2.el = n1.el!)
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string)
      }
    }
  }

  const processElement = (n1: VNode | null, n2: VNode, container: RendererElement) => {
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      // 更新逻辑
      // - 如果前后完全没关系，新的直接替换老的
      // - 老的和新的一样，复用，属性是否一样，更新属性
      // - 对比儿子
      patchElement()
    }
  }

  const patch = (
    n1: VNode | null, // null means this is a mount
    n2: VNode,
    container: RendererElement,
  ) => {
    if (n1 === n2) return

    if (n1 && !isSameVNode(n1, n2)) {
      // 如果n1和n2不一致，删除老的
      unmount(n1)
      n1 = null
    }
    const { type, shapeFlag } = n2
    // 初次渲染
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
    }
  }
  const unmount = (vnode: VNode) => {
    if (vnode.el) {
      hostRemove(vnode.el)
    }
  }

  const render = (vnode: VNode, container: RendererElement) => {
    if (vnode == null) {
      // 卸载逻辑
      // 如果之前渲染过，卸载dom
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  return {
    render,
    // createApp: createApp as CreateAppFunction<HostElement>
    // createApp: () => {

    // }
  }
}