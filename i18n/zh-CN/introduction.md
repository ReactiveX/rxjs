# 介绍

RxJS是一个基于可观察对象(Observable)序列，用于异步或者事件编程的库。它提供一个核心类型，[Observable]('./overview.html#observable') ，几个卫星类型（Observer, Schedulers, Subjects）以及一些由[Array#extras](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.6) (map, filter, reduce, every等)激发的，让异步事件可以以集合的方式被处理的运算子(Operators)。

<span class="informal">可以将RxJS想象成是用于处理事件的Lodash.</span>

ReactiveX将[Observer模式](https://en.wikipedia.org/wiki/Observer_pattern)和[Iterator模式](https://en.wikipedia.org/wiki/Iterator_pattern)和对集合进行函数式编程结合起来，从而满足了对事件序列进行管理的需求。

RxJS核心的用于解决异步事件管理的概念如下：
- **Observable:** 代表数据与事件的集合，这个集合可以被调用来生成数据与事件。
- **Observer:** 回调函数的集合，并知道自己要什么数据。这些数据来自于Observable。
- **Subscription:** 用于表示一个Observable的执行状态，主要用于执行的取消。
- **Operators:** 函数式风格的纯函数，通过`map`, `filter`, `concat`, `flatMap`等操作对集合进行处理。
- **Subject:** 与EventEmitter等价，唯一可以将一个值或者事件向个多个Observer进行广播的办法。
- **Schedulers:** 一个中心化的、控制并发的分发器，允许我们可以在象`setTimeout`、`requestAnimationFrame`或者其它类似的计算中可以进行调整。


## 第一个例子

通常你是这样注册事件的侦听器(listener)的。
```js
var button = document.querySelector('button');
button.addEventListener('click', () => console.log('Clicked!'));
```
使用RxJS的话，你要创建一个Observable来替换。

```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .subscribe(() => console.log('Clicked!'));
```


### 纯粹(Purity)

让RxJS强大的是它能完全通过函数来生成数值，这也就意味着可以减少代码出错的机会。

通常你会创建比较不纯粹的函数，在这样的函数里，其它的代码片段会让你的状态变的混乱。

```js
var count = 0;
var button = document.querySelector('button');
button.addEventListener('click', () => console.log(`Clicked ${++count} times`));
```

而使用RxJS可以将你的状态进行隔离。

> 译者注： 指count不再需要定义在外面。

```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));
```

这里**scan**运算子的工作方式与**reduce**在数组里的工作方式是一样的。它从传给回调函数的值中获取值。返回的值将会作为下一次的传入值。

> 译者注：scan第二个参数0是初始值。对于上面的函数来说就可以用来侦听被点击的次数了，非常的方便。


### 流转（Flow）

RxJS有一堆的运算子可以帮助你控制事件如何在你的可观察对象里流转。

下面是你在纯JavaScript下允许一分钟最多一次点击的代码：

```js
var count = 0;
var rate = 1000;
var lastClick = Date.now() - rate;
var button = document.querySelector('button');
button.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});
```

使用RxJS后:

```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .throttleTime(1000)
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));
```

其实的流转控制运算子还有[**filter**](../class/es6/Observable.js~Observable.html#instance-method-filter), [**delay**](../class/es6/Observable.js~Observable.html#instance-method-delay), [**debounceTime**](../class/es6/Observable.js~Observable.html#instance-method-debounceTime), [**take**](../class/es6/Observable.js~Observable.html#instance-method-take), [**takeUntil**](../class/es6/Observable.js~Observable.html#instance-method-takeUntil), [**distinct**](../class/es6/Observable.js~Observable.html#instance-method-distinct), [**distinctUntilChanged**](../class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged)等。


### 值(Values)

你可以转化赋给你的观察者的值。

下面是你在纯JavaScript下添加当前鼠标的每个点击事件的x轴位置的代码：

```js
var count = 0;
var rate = 1000;
var lastClick = Date.now() - rate;
var button = document.querySelector('button');
button.addEventListener('click', (event) => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count)
    lastClick = Date.now();
  }
});
```

使用RxJS后:

```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .throttleTime(1000)
  .map(event => event.clientX)
  .scan((count, clientX) => count + clientX, 0)
  .subscribe(count => console.log(count));
```

另外几个用于生成值的运算子有[**pluck**](../class/es6/Observable.js~Observable.html#instance-method-pluck), [**pairwise**](../class/es6/Observable.js~Observable.html#instance-method-pairwise),
[**sample**](../class/es6/Observable.js~Observable.html#instance-method-sample)等。

> 译者注：这里map可以将事件里的值取出来，如果不进行map，clientX里的值就是事件本身。
> 这里要注意的是每次变换，其实对象是发生变化的。subscribe一次之后就不能再subscribe了。


