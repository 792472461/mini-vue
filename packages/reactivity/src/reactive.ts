import { isObject } from '@mini-vue/shared'
import { track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { Ref, UnwrapRefSimple } from './ref'
// import { mutableHandlers, mutableCollectionHandlers } from './collectionHandlers'

export type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRefSimple<T>

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

export declare const ShallowReactiveMarker: unique symbol

export const reactiveMap = new WeakMap<Target, any>()
export const shallowReadonlyMap = new WeakMap<Target, any>()

/**
 * 将数据转化成响应式数据
 * ```js
 * const count = ref(0)
 * const obj = reactive({
 *   count
 * })
 *
 * obj.count++
 * obj.count // -> 1
 * count.value // -> 1
 * ```
 */
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive(target: object) {
  // 如果是只读对象，只返回代理对象
  if (isReadonly(target)) {
    return target
  }
  return createReactiveObject(
    target,
    // false,
    // mutableHandlers,
    // mutableCollectionHandlers,
    // reactiveMap
  )
}

function createReactiveObject(
  target: Target,
  // isReadonly: boolean,
  // baseHandlers: ProxyHandler<any>,
  // collectionHandlers: ProxyHandler<any>,
  // proxyMap: WeakMap<Target, any>
) {
  // 如果不是一个对象直接返回
  if (!isObject(target)) return target

  return new Proxy(target, {
    get(target, key) {
      const res = Reflect.get(target, key)
      // 依赖收集
      track(target, TrackOpTypes.GET, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      trigger(target, TriggerOpTypes.SET, key)
      return res
    }
  })
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY])
}