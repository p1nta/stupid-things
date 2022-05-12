/**
 * States
 * 0 - question name
 * 1 - question surname
 * 2 - bad response
 * 3 - good response
 */
class Steps {
  constructor(cb) {
    this._step = 0;
    this._cb = cb;

    this.init();
  }

  init() {
    this._cb(this._step);
  }

  agree() {
    if (this._step < 2) {
      this._step += 1;
    }

    this._cb(this._step);
  }

  disagree() {
    this._step = 3;

    this._cb(this._step);
  }
}

const body = document.body;

window.stepsController = new Steps((step) => {
  body.setAttribute('data-step', step);
});
