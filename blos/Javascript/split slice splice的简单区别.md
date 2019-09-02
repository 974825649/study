# split slice splice的简单区别 
split: 分割
```js
//字符串方法  string.split
let str = 'hello world';
//str.split('')  以什么东西分割
str.split(''); // 返回数组[h,e,l,l,o, ,w,o,r,l,d]
```
slice: 裁剪
```js
//数组方法  arr.split
let arr = ['h','u','n','p','o'];
/*   
     传一个参数：arr.slice(start) end默认数组最后一位
     传两个参数：arr.slice(start，end) 返回开始到结束的数组
 */
arr.slice( 1, 3) // 返回数组[u,n]，包括end  原数组不变,返回新数组，
```
splice: 拼接
```js
//数组方法  arr.splice
let arr = ['h','u','n','p','o'];
/*     
     传一个参数：arr.splice(start) 就将后面start后面的全部删除
     传两个参数：arr.splice(start,n) 从start的下标开始，删除n个数
     传三个及以上参数：arr.splice(start,n,str) 用str来替换被删除的数据
 */ 
arr.slice( 2, 2) // 返回数组[n,p]  原数组改变
```


