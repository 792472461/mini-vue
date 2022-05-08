export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>

export function shallowReadonlyHandlers() { }

export function shallowReadonlyCollectionHandlers() { }

export function mutableHandlers() { }

export function mutableCollectionHandlers() {}