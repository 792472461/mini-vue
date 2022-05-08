import { TrackOpTypes, TriggerOpTypes } from './operations'
import { EffectScope } from './effectScope'
import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export type DebuggerEvent = {
  effect: ReactiveEffect
} & DebuggerEventExtraInfo

export type EffectScheduler = (...args: any[]) => any

export type DebuggerEventExtraInfo = {
  target: object
  type: TrackOpTypes | TriggerOpTypes
  key: any
  newValue?: any
  oldValue?: any
  oldTarget?: Map<any, any> | Set<any>
}

export interface DebuggerOptions {
  onTrack?: (event: DebuggerEvent) => void
  onTrigger?: (event: DebuggerEvent) => void
}

export interface ReactiveEffectOptions extends DebuggerOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
  scope?: EffectScope
  allowRecurse?: boolean
  onStop?: () => void
}

export function track(target: object, type: TrackOpTypes, key: unknown) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  dep.add(activeEffect!)
}

export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  // let deps: (Dep | undefined)[] = []
  const deps = depsMap.get(key)
  if (!deps) return

  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }

}

export class ReactiveEffect<T = any> {
  constructor(
    public fn: () => T,
    public scheduler?: () => T
  ) {
  }

  run() {
    activeEffect = this
    this.fn()
  }
}

export function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
) {
  const _effect = new ReactiveEffect(fn, options?.scheduler)
  if (!options || !options.lazy) {
    _effect.run()
  }

  return _effect.run.bind(_effect)
}