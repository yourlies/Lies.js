# Lies.js
借鉴最新框架的思想实现的一个基于js的前端框架
# usage
```html
<div ref="demo">
  <a>{{ testStr }}</a>
</div>
<script src="./lies.js"></script>
<script>
  var demo = new Lies({
    id: 'demo',
    data: function () {
      return { testStr: 'I am rendering success' }
    }
  });
  new Refs(demo)
</script>
```
