
import { createRenderer, Renderer } from '@mini-vue/runtime-core';
import { RootRenderFunction } from 'packages/runtime-core/src/renderer';
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = Object.assign({ patchProp }, nodeOps)

let renderer: Renderer<Element | ShadowRoot>

function ensureRenderer() {
  // 如果 renderer 有值的话，那么以后都不会初始化了
  return (
    renderer ||
    (renderer = createRenderer(renderOptions))
  );
}

export const createApp = (...args: Element[]) => {
  return ensureRenderer().createApp(...args);
};

export const render = ((...args) => {
  ensureRenderer().render(...args)
}) as RootRenderFunction<Element | ShadowRoot>


export * from '@mini-vue/runtime-core'
