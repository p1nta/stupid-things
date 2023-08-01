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
    if (this._step === 1) {
      this._step = 3;
    } else if (this._step === 2) {
      this._step = 5;
    } else {
      this._step += 1;
    }

    this._cb(this._step);
  }

  disagree() {
    if (this._step === 1) {
      this._step = 2;
    } else {
      this._step = 4;
    }

    this._cb(this._step);
  }
}

window.onload = () => {
  const body = document.body;

  window.stepsController = new Steps((step) => {
    if (step === 5) {
      const videoElement = document.getElementsByTagName('video');

      if (videoElement && videoElement[0]) {
        videoElement[0].play();
      }
    }

    body.setAttribute('data-step', step);
  });
}
