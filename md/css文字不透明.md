##css实现背景透明文字不透明

>设置元素的透明度：

```css
 -moz-opacity:0.8; /*在Firefox中设置元素透明度
 filter: alpha(opacity=80); /*ie使用滤镜设置透明
```
>但是当我们对一个标签设置背景的透明度时，往往我们并不希望该标签上的文字图片也变成半透明了。

例如：
```
 <div><p>不透明</p></div>
```
```css
div{-moz-opacity:0.3;filter:alpha(opacity=30);background:#000;width:500px;
 height:500px;color:#F30; font-size:32px; font-weight:bold; }
```

>可以很明显的看出文字也被半透明的，这是我们不想看到的效果。
 以前我曾经是绝对定位的方法解决这个问题，也就是现在的p并不是div的子元素。
```
<div></div>
<p>不透明</p>
```
这样div的半透明效果也就不会影响到元素p了。最后在将p定位到需要的位置。
 但是很多时候这样的标签并不是很合理，有可能还会多浪费几个标签。

下面的这种方法就可以解决上面的问题了：
```css
 div{background:rgba(0,0,0,0.2) none repeat scroll !important; /*实现FF背景透明，文字不透明*/
background:#000; filter:Alpha(opacity=20);/*实现IE背景透明*/ 
 width:500px; height:500px; color:#F30; font-size:32px; font-weight:bold;}
 div p{ position:relative;}/*实现IE文字不透明*/
```
火狐我们直接用rgba颜色就可以解决子标签跟着半透明的问题了，但是ie还不是能很好的支持。
 所以我们给不想被透明的标签设置一个定位属性，问题接能解决了。
>
>

