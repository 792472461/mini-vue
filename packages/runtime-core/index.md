# Vue Runtime

首先要了解几个概念

1. runtime-dom vue的浏览器渲染器模块
1. runtime-core vue的渲染器驱动模块，核心模块，通过这个我们可以实现自己的渲染器模块，比如说小程序，canvas这些

## 组件渲染：vnode 到真实 DOM 是如何转变的

在vue3中，组件是一个非常重要的概念，整个应用的页面都是通过组件渲染来实现的，譬如一个`heloo-world`组件，在页面中使用他

```html
<hello-world></hello-world>
```

组件是一个抽象的概念，是对一棵DOM树的抽象，就比如说上面这个组件，最终渲染成什么样子，他并不会在页面上直接渲染一个`hello-world`标签，而是取决于我们引入了怎么样的一个HelloWorld组件模板，比如说我们的组件模板是这样的

```html
<template>
  <div>
    <p>Hello World</p>
  </div>
</template>
```

那这个组件最终会通过这些编写的元素通过ast解析生成vnode，然后再去渲染vnode，最终才是真是的dom

## 页面初始化

Vue3常见的入口文件通常是这样的

```javascript
import { createApp } from 'vue'
import App from './app'
const app = createApp(App)
app.mount('#app')
```

可以看到，通过`createApp`入口函数创建了一个`vue`实例，然后实例上含有`mount`方法

代码如下:

```typescript
// 代码位置: src/runtime-dom/src/index.ts
const createApp = ((...args) => {

  // 创建 app 对象
  const app = ensureHydrationRenderer().createApp(...args)

  const { mount } = app

  // 重写 mount 方法
  app.mount = (containerOrSelector) => {
    // ...
  }

  return app
})

```

从代码中可以看出 `createApp` 主要做了两件事情：创建 `app 对象`和重写 `app.mount` 方法

### 1.创建app 对象

首先会使用`ensureRenderer().createApp()`创建app对象

```typescript
const app = ensureRenderer().createApp(...args)
```

其中 `ensureRenderer()` 用来创建一个渲染器对象，它的内部代码是这样的：

```typescript
// 渲染相关的一些配置，比如更新属性的方法，操作 DOM 的方法
const rendererOptions = {
  patchProp,
  ...nodeOps
}

let renderer

// 延时创建渲染器，当用户只依赖响应式包的时候，可以通过 tree-shaking 移除核心渲染逻辑相关的代码
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  function render(vnode, container) {
    // 组件渲染的核心逻辑
  }

  return {
    render,
    createApp: createAppAPI(render)
  }
}

function createAppAPI(render) {
  // createApp createApp 方法接受的两个参数：根组件的对象和 prop
  return function createApp(rootComponent, rootProps = null) {
    const app = {
      _component: rootComponent,
      _props: rootProps,
      mount(rootContainer) {
        // 创建根组件的 vnode
        const vnode = createVNode(rootComponent, rootProps)
        // 利用渲染器渲染 vnode
        render(vnode, rootContainer)
        app._container = rootContainer
        return vnode.component.proxy
      }
    }
    return app
  }
}
```

这里用 `ensureRenderer()` 来延时创建渲染器，这样做的好处是当用户只依赖响应式包的时候，就不会创建渲染器，因此可以通过 `tree-shaking` 的方式移除核心渲染逻辑相关的代码。

在这里里面有用到 `runtime-dom` 的东西，这个东西是可以做跨平台的，不光是可以渲染`html`，也同样可以用来渲染其他平台的东西

然后在以上代码中内部通过 `createRenderer` 创建一个渲染器，这个渲染器内部会有一个 `createApp` 方法，它是执行 `createAppAPI` 方法返回的函数，接受了 `rootComponent` 和 `rootProps` 两个参数，我们在应用层面执行 createApp(App) 方法时，会把 `App` 组件对象作为根组件传递给 `rootComponent`。这样，`createApp` 内部就创建了一个 `app` 对象，它会提供 `mount` 方法，这个方法是用来挂载组件的。

在整个 `app` 对象创建过程中，`Vue.js` 利用闭包和函数柯里化的技巧，很好地实现了参数保留。比如，在执行 `app.mount` 的时候，并不需要传入渲染器 `render`，这是因为在执行 `createAppAPI` 的时候渲染器 `render` 参数已经被保留下来了。
