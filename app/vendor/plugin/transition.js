const Filter = function (options) {
  this.el = options.el;
  this.running = false;
  this.plus = false;
  this.blur = 0;
}
Filter.prototype.render = function () {
  let rafId;
  let raf = () => {
    if (this.plus) {
      this.blur += 1;
    }
    if (!this.plus) {
      this.blur -= 4;
      this.blur = this.blur < 0 ? 0 : this.blur;
    }
    this.el.style.filter = `blur(${this.blur}px)`;
    rafId = requestAnimationFrame(raf);
    if ((this.blur >= 60 && this.plus) || (this.blur <= 0 && !this.plus)) {
      this.running = false;
      if (this.blur <= 0) {
        this.el.style.filter = '';
      }
      cancelAnimationFrame(rafId);
    }
  }
  requestAnimationFrame(raf);
}
Filter.prototype.start = function () {
  if (!this.running) {
    this.plus = true;
    this.running = true;
    this.render();
  } else {
    this.plus = true;
  }
}
Filter.prototype.end = function () {
  if (!this.running) {
    this.plus = false;
    this.running = true;
    this.render();
  } else {
    this.plus = false;
  }
}

module.exports = Filter;