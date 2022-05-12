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

  set square(value) {
    this._square = value;
  }

  get interval() {
    return this._interval;
  }

  set interval(value) {
    this._interval = value;
  }

  constructor() {}

  setSquare = (square) => {
    if (square < this.minSquare) {
      this.square = this.minSquare;
    } else if (square > this.maxSquare) {
      this.square = this.maxSquare;
    } else {
      this.square = square;
    }
  }

  setInterval = (interval) => {
    if (interval < this.minSquare) {
      this.interval = this.minInterval;
    } else if (interval > this.maxInterval) {
      this.interval = this.maxInterval;
    } else {
      this.interval = interval;
    }
  }
}

class Game {
  config = [];
  timer;
  interval;
  position = [0, 0];
  
  get currentPosition() {
    return [...this.position];
  }
  
  set currentPosition(newPosition) {
    this.position = newPosition;
  }

  constructor(square, interval) {
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

  getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  getPosition = (render) => {
    const raw = this.currentPosition[0];
    const col = this.currentPosition[1];
    const moves = this.config[raw][col];

    this.currentPosition = moves[this.getRandomNumber(0, moves.length - 1)];

    console.log('this.currentPosition', this.currentPosition);

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

  tick = (pos) => {
    this.button.innerText = 'Stop';
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

  constructor(url) {
    this.img = new Image();

    this.img.crossOrigin = 'Anonymous';
    console.log('gg');
    this.loading = new Promise((res) => {
      this.img.onload = () => {
        this.size = {
          width: this.img.width,
          height: this.img.height,
        };
  
        this.drawToCanvasCallback();
        res();
      }
    });

    this.img.src = url;
  }

  drawToCanvasCallback() {
    this.canvas.width = this.size.width;
    this.canvas.height = this.size.height;

    this.ctx = this.canvas.getContext('2d');

    this.ctx.drawImage(this.img, 0, 0, this.size.width, this.size.height);
  }

  getImgPart = async (i, j, gridSize, element) => {
    await this.loading;
    const xStep = Math.round(this.size.width / gridSize);
    const yStep = Math.round(this.size.height / gridSize);

    const kx = xStep * j;
    const ky = yStep * i;

    const imageData = this.ctx.getImageData(kx, ky, kx + xStep, ky + yStep);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCanvasCtx = tempCanvas.getContext('2d');
    tempCanvasCtx.putImageData(imageData, 0, 0);

    element.style.backgroundImage = `url(${tempCanvas.toDataURL()})`;
  }
}


document.body.style.setProperty('--size', `${Math.min(document.body.offsetWidth, document.body.offsetHeight)}px`);

window.onload = () => {
  const wrapper = document.getElementById('wrapper');
  const inputGrid = document.getElementById('grid_input');
  const inputInterval = document.getElementById('interval_input');
  
  const pictureController = new Picture('/catch-me/assets/megumin.png');
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
      uiController.button.onclick = startMove;
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
