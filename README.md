# mSwiper
移动端无缝滑动组件。

关键词：

`transform`

`transition`

`transitionend事件`



#### 无缝滑动的实现原理

使用`transform`和`transition`来实现元素的切换效果。

初始化的时候将队列中的第一个元素复制到最后，将最后一个元素复制到最前面，所以实际节点比原来多2个，而这正是实现无缝切换的关键。

![](https://i.loli.net/2019/01/14/5c3c2e736ab59.jpg)

例如上图，当前元素为`1`时，如果此时向右滑动，则应该显示元素`3`。实际的操作是先正常的滑动到`3副本`，待`transition`效果执行完了之后再**切换**到实际的元素`3`，切换的过程是这样的：

当元素`1`到元素`3副本`切换完了之后会触发`transitionend`事件，我们在绑定的事件里先将transition属性去掉，防止由`3副本`到`3`的切换出现动效，实现悄无声息的切换。然后设置新的`translateX`值。

```
slide.style['transition'] = '';
slide.style['transform'] = 'translateX(-'+ this.boxWidth +'px)';
```

什么时候再恢复`transition`属性呢？这里使用了定时器来做了处理：

```javascript
setTimeout(()=>{
	this.slide.style['transition'] = 'transform .5s';
}, 0)
```

因为如果在设置了`translateX`值后立即就设置`transition`会在切换过程中就出现动画，而放在定时器中则不会触发。

