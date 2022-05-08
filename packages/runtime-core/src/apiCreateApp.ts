import { Data } from "./component"

export interface App<HostElement = any> {
  version: string
  config: any
  use(plugin: Plugin, ...options: any[]): this
  mixin(mixin: any): this
  component(name: string): any | undefined
  component(name: string, component: any): this
  directive(name: string): any | undefined
  directive(name: string, directive: any): this
  mount(
    rootContainer: HostElement | string,
    isHydrate?: boolean,
    isSVG?: boolean
  ): any
  unmount(): void
  // provide<T>(key: InjectionKey<T> | string, value: T): this

  // internal, but we need to expose these for the server-renderer and devtools
  _uid: number
  _props: Data | null
  _container: HostElement | null
  // _context: AppContext
  // _instance: ComponentInternalInstance | null


  /**
   * @internal v3 compat only
   */
  // _createRoot?(options: ComponentOptions): ComponentPublicInstance
}