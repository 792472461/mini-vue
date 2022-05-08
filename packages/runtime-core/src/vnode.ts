import { isString, ShapeFlags } from "@mini-vue/shared"
import { Data } from "./component"
import { RendererElement, RendererNode } from "./renderer"

export const Text = Symbol('Text')

export const createVNode = _createVNode
export type VNodeTypes =
  | string
  | VNode
  | typeof Text

export type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void
  
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren

export type VNodeNormalizedChildren =
  | string
  | VNodeArrayChildren
  | null

export interface VNode<
  HostNode = RendererNode,
  HostElement = RendererElement,
  ExtraProps = { [key: string]: any }
  > {
  __v_isVNode: true
  type: VNodeTypes
  props: (VNodeProps & ExtraProps) | null
  key: string | number | symbol | null
  el: HostNode | null
  target: HostElement | null // teleport target
  children: VNodeNormalizedChildren
  shapeFlag: number
  patchFlag: number
}

export function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false
}

export function isSameVNode(n1: VNode, n2: VNode) {
  // 判断两个虚拟节点是否是相同节点
  // 1. 标签名一致，
  // 2. key一样
  return n1.type === n2.type && n1.key === n2.key
}

export type VNodeProps = {
  key?: string | number | symbol
}

function _createVNode(type: VNodeTypes, props: VNodeProps | null = null, children: any = null): VNode {
  return createBaseVnode(type, props, children)
}

function createBaseVnode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0,
) {

  // 基础
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    el: null,
    shapeFlag,
    patchFlag,
  } as VNode

  if (children) {
    // 数组children和字符串
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN
    // let type = 0
    // if (isArray(children)) {
    //   children = String(children)
    //   type = ShapeFlags.ARRAY_CHILDREN
    // } else {
    //   children = String(children)
    //   type = ShapeFlags.TEXT_CHILDREN
    // }
    // vnode.shapeFlag |= type
  }

  return vnode
}