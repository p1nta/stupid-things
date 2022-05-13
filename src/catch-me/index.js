function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}


function getWidth(r, h) {
  return r * h;
}

function getHeight(r, w) {
  return w / r;
}

function getMaxAvailableSize(
  r,
  maxWidth,
  maxHeight,
) {
  if (maxWidth) {
    const height = getHeight(r, maxWidth);

    if (height <= maxHeight) {
      return {
        height,
        width: maxWidth,
      };
    }
  }

  return {
    width: getWidth(r, maxHeight),
    height: maxHeight,
  };
}

let images;

class Params {
  _square = 2;
  minSquare = 2;
  maxSquare = 30;

  _interval = 1000;
  minInterval = 200;
  maxInterval = 5000;

  get square() {
    return this._square;
  }

  get interval() {
    return this._interval;
  }

  constructor() {}

  setSquare = (square) => {
    if (square < this.minSquare) {
      this._square = this.minSquare;
    } else if (square > this.maxSquare) {
      this._square = this.maxSquare;
    } else {
      this._square = square;
    }
  }

  setInterval = (interval) => {
    if (interval < this.minSquare) {
      this._interval = this.minInterval;
    } else if (interval > this.maxInterval) {
      this._interval = this.maxInterval;
    } else {
      this._interval = interval;
    }
  }
}

class Game {
  square;
  config = [];
  timer;
  interval;
  position = [0, 0];
  visible = [];
  complete = false;
  
  get currentPosition() {
    return [...this.position];
  }
  
  set currentPosition(newPosition) {
    this.position = newPosition;
  }

  constructor(square, interval) {
    this.square = square;
    this.interval = interval;
    for (let i = 0; i < square; i += 1) {
      this.config.push([]);

      for (let j = 0; j < square; j += 1) {
        const res = [];

        if (i > 0) {
          res.push([i - 1, j]);
        }

        if (i < square - 1) {
          res.push([i + 1, j]);
        }

        if (j > 0) {
          res.push([i, j - 1]);
        }

        if (j < square - 1) {
          res.push([i, j + 1]);
        }

        this.config[i].push(res);
      }
    }
  }

  getPosition = (render) => {
    const raw = this.currentPosition[0];
    const col = this.currentPosition[1];
    const moves = this.config[raw][col];

    this.currentPosition = moves[getRandomNumber(0, moves.length - 1)];

    render(this.currentPosition);
  };

  start = (render) => {
    if (!this.timer) {
      this.getPosition(render);

      this.timer = setInterval(
        () => this.getPosition(render),
        this.interval,
      );
    }
  };

  stop = (callback) => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
      callback();
      const pos = this.currentPosition.join('');

      if (!this.visible.includes(pos)) {
        this.visible.push(pos);
      }

      if (this.visible.length === Math.pow(this.square, 2)) {
        this.complete = true;
      }
    }
  };
}

class UI {
  parentEl;
  button;

  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  build = (square, getImageFunction) => {
    this.parentEl.innerHTML = '';
    this.parentEl.style.gridTemplateColumns = `repeat(${square}, 1fr)`;

    this.button = document.createElement('button');
    this.button.classList.add('button');
    this.button.innerText = 'Start';
    this.parentEl.appendChild(this.button);

    for (let i = 0; i < square; i += 1) {
      for (let j = 0; j < square; j += 1) {
        const div = document.createElement('div');
        div.classList.add('content');
        const front = document.createElement('div');
        front.classList.add('flip-box-front');
        const back = document.createElement('div');
        back.classList.add('flip-box-back');
        div.appendChild(front);
        div.appendChild(back);
        if (getImageFunction) {
          getImageFunction(i, j, square, back);
        }
        this.parentEl.appendChild(div);
      }
    }
  };

  removeStartButton = () => {
    this.parentEl.removeChild(this.button);

    this.parentEl.childNodes.forEach((element) => {
      element.classList.add('no-border');
    });
  }

  tick = (pos) => {
    this.button.innerText = 'Catch';
    this.button.style.transform = `translate(${100 * pos[1]}%, ${100 * pos[0]}%)`;
  };

  finishTick = () => {
    this.button.innerText = 'Go on';
  };

  flip = (pos) => {
    console.log(pos);
    this.parentEl.childNodes[pos + 1].classList.add('flipped');
  }
}

class Picture {
  canvas = document.createElement('canvas');
  ctx;
  img;
  size = {};
  loading;

  constructor() {
    this.loading = this.getConfig()
      .then(() => {
        this.img = new Image();

        const url = images[getRandomNumber(0, images.length - 1)];

        this.img.crossOrigin = 'Anonymous';

        const promise = new Promise((res) => {
          this.img.onload = () => {
            this.size = {
              width: this.img.width,
              height: this.img.height,
            };

            const { offsetHeight, offsetWidth } = document.body;
            let k = Math.max(this.size.height / (offsetHeight - 50), this.size.width / (offsetWidth - 50));

            if (k < 1) {
              let k = Math.min(this.size.height / (offsetHeight - 50), this.size.width / (offsetWidth - 50));
            }

            document.body.style.setProperty('--width', `${this.size.width / k}px`);
            document.body.style.setProperty('--height', `${this.size.height / k}px`);
      
            this.drawToCanvasCallback();
            res();
          }
        });
    
        this.img.src = url;

        return promise;
      });
  }

  getConfig() {
    if (!images) {
      return fetch('/catch-me/assets/images.json')
        .then((res) => res.json())
        .then((res) => {
          images = res;
        });
    }

    return Promise.resolve();
  }

  drawToCanvasCallback() {
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;

    this.ctx = this.canvas.getContext('2d');

    this.ctx.drawImage(this.img, 0, 0, this.size.width, this.size.height);
  }

  getImgPart = async (i, j, gridSize, element) => {
    if (this.loading) {
      await this.loading;
        
      const xStep = Math.round(this.size.width / gridSize);
      const yStep = Math.round(this.size.height / gridSize);

      const kx = xStep * j;
      const ky = yStep * i;

      const imageData = this.ctx.getImageData(kx, ky, xStep, yStep);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCanvasCtx = tempCanvas.getContext('2d');
      tempCanvasCtx.putImageData(imageData, 0, 0);

      element.style.backgroundImage = `url(${tempCanvas.toDataURL()})`;
    }
  }
}


document.body.style.setProperty('--width', '0px');
document.body.style.setProperty('--height', '0px');

window.onload = () => {
  const wrapper = document.getElementById('wrapper');
  const inputGrid = document.getElementById('grid_input');
  const inputInterval = document.getElementById('interval_input');
  
  const pictureController = new Picture();
  const uiController = new UI(wrapper);
  const paramsController = new Params();

  inputGrid.value = paramsController.square;
  inputInterval.value = paramsController.interval;

  const showInputs = () => {
    inputGrid.readonly = false;
    inputGrid.classList.remove('m_invisible');

    inputInterval.readonly = false;
    inputInterval.classList.remove('m_invisible');
  };

  const hideInputs = () => {
    inputGrid.classList.add('m_invisible');
    inputGrid.readonly = true;

    inputInterval.classList.add('m_invisible');
    inputInterval.readonly = true;
  };

  const rerender = () => {
    const gameController = new Game(paramsController.square, paramsController.interval);
    uiController.build(paramsController.square, pictureController.getImgPart);

    const stopMove = () => {
      showInputs();
      gameController.stop(uiController.finishTick);
      console.log(gameController.currentPosition);
      uiController.flip(gameController.currentPosition[0] * paramsController.square + gameController.currentPosition[1]);

      if (gameController.complete) {
        uiController.removeStartButton();
      } else {
        uiController.button.onclick = startMove;
      }
    }

    const startMove = () => {
      hideInputs();
      gameController.start(uiController.tick);
      uiController.button.onclick = stopMove;
    }

    uiController.button.onclick = startMove;
  }

  inputGrid.onchange = (e) => {
    paramsController.setSquare(Number(e.target.value));
    e.target.value = paramsController.square;

    document.body.style.setProperty('--rows', paramsController.square.toString());
    rerender();
  };

  inputInterval.onchange = (e) => {
    paramsController.setInterval(Number(e.target.value));
    e.target.value = paramsController.interval;

    document.body.style.setProperty('--interval', `${paramsController.interval}ms`);
    rerender();
  };

  rerender();
}
