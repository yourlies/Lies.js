const Router = function (options = {}) {
  this.el = options.app || '#app';
  const app = document.querySelector(this.el);
  const style = document.querySelector('style');
  this.afterRedirect = options.afterRedirect || function () {};
  this.afterRetrain = options.afterRetrain || function () {};
  this.cache = { app: {
    [location.pathname]: app
  }, style: {
    [location.pathname]: style
  } };
  window.onpopstate = (e) => {
    let pageIndex = 0;
    if (e.state) {
      pageIndex = e.state.pageIndex;
    }
    const app = document.querySelector(this.el);
    const cacheApp = this.cache.app[location.pathname];
    if (!cacheApp) {
      this.push({ path: location.pathname });
      return false;
    }
    app.parentNode.replaceChild(cacheApp, app);

    const style = document.querySelector('style');
    const cacheStyle = this.cache.style[location.pathname];
    style.parentNode.replaceChild(cacheStyle, style);
    this.cache.style[location.pathname] = cacheStyle;
    this.afterRetrain(location.pathname);
    this.afterRedirect();
  }
};
Router.prototype.push = function (req) {
  history.pushState({}, 'title', req.path);
  if (this.cache.app[req.path]) {
    const app = document.querySelector(this.el);
    const cacheApp = this.cache.app[req.path];
    app.parentNode.replaceChild(cacheApp, app);
    this.cache.app[req.path] = cacheApp;

    const style = document.querySelector('style');
    const cacheStyle = this.cache.style[req.path];
    style.parentNode.replaceChild(cacheStyle, style);
    this.cache.style[req.path] = cacheStyle;

    this.afterRedirect();
    return false;
  }
  fetch(req.path)
  .then((res) => {
    return res.text();
  })
  .then((res) => {
    const container = document.createElement('div');
    container.innerHTML = res.match(/<body(.|\t|\n)*?>((.|\t|\n)*?)<\/body>/)[2].trim();
    const app = container.querySelector(this.el);
    const processor = container.querySelector('[processor]').innerHTML.trim();
    const oldApp = document.querySelector(this.el);

    const style = document.createElement('style');
    style.innerHTML = res.match(/<style(.|\t|\n)*?>((.|\t|\n)*?)<\/style>/)[2].trim();
    const oldStyle = document.querySelector('style');
    oldStyle.parentNode.replaceChild(style, oldStyle);

    oldApp.parentNode.replaceChild(app, oldApp);
    eval(processor);
    this.cache.app[req.path] = app;
    this.cache.style[req.path] = style;
    this.afterRedirect();
  })
};

Router.prototype.back = function () {
  history.back();
}

module.exports = Router;