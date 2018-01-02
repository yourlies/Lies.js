const Router = function (options = {}) {
  this.el = options.app || '#app';
  const app = document.querySelector(this.el);
  this.afterRedirect = options.afterRedirect || function () {};
  this.cache = {};
  window.onpopstate = (e) => {
    let pageIndex = 0;
    if (e.state) {
      pageIndex = e.state.pageIndex;
    }
    const app = document.querySelector(this.el);
    const cacheApp = this.cache[location.pathname];
    if (!cacheApp) {
      this.push({ path: location.pathname });
      return false;
    }
    app.parentNode.replaceChild(cacheApp, app);
    this.afterRedirect();
  }
};
Router.prototype.push = function (req) {
  history.pushState({}, 'title', req.path);
  if (this.cache[req.path]) {
    const app = document.querySelector(this.el);
    const cacheApp = this.cache[req.path];
    app.parentNode.replaceChild(cacheApp, app);
    this.cache[req.path] = cacheApp;
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
    oldApp.parentNode.replaceChild(app, oldApp);
    eval(processor);
    this.cache[req.path] = app;
    this.afterRedirect();
  })
};

Router.prototype.back = function () {
  history.back();
}

module.exports = Router;