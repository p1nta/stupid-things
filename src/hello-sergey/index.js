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
let isSergey = false

window.stepsController = new Steps((step) => {
  const score = Number(localStorage.getItem('score')) || 0;

  if (step === 1) {
    isSergey = true;
  }

  if (step === 3) {
    const newScore = score + 1;
    localStorage.setItem('score', String(newScore));

    if (isSergey && score > 3) {
      localStorage.removeItem('score');

      body.setAttribute('data-step', 4);

      const videoElement = document.getElementsByTagName('video')[0];

      if (videoElement) {
        videoElement.play();
      }

      return;
    }
  }

  body.setAttribute('data-step', step);
});
