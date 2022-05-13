(function main() {
  function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  let images;

  class Params {
    _changed = false;
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

    get changed() {
      return this._changed;
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

      this._changed = true;
    }

    setInterval = (interval) => {
      if (interval < this.minInterval) {
        this._interval = this.minInterval;
      } else if (interval > this.maxInterval) {
        this._interval = this.maxInterval;
      } else {
        this._interval = interval;
      }

      this._changed = true;
    }

    makeActual = () => {
      this._changed = false;
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
      const raw = this.position[0];
      const col = this.position[1];
      const moves = this.config[raw][col];

      this.currentPosition = moves[getRandomNumber(0, moves.length - 1)];

      render(this.currentPosition);
    };

    start = (render) => {
      if (!this.timer) {
        document.body.setAttribute('data-game-started', 'true');
        if (render) {
          this.getPosition(render);
        }

        this.timer = setInterval(
          () => this.getPosition(render),
          this.interval,
        );
      }
    };

    stop = () => {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = 0;
      }
    };

    toggleGame = (render) => {
      if (this.timer) {
        this.stop()
      } else {
        this.start(render);
      }
    }

    catchPosition = () => {
      const pos = this.currentPosition.join('');
      const index = this.visible.indexOf(pos);

      if (index < 0) {
        this.visible.push(pos);
      } else {
        this.visible.splice(index, 1);

      }

      if (this.visible.length === Math.pow(this.square, 2)) {
        this.complete = true;
        this.stop();
      }
    }
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
      this.button.tabIndex = -1;
      this.button.classList.add('catch_button');
      this.button.innerText = 'Catch';
      this.parentEl.appendChild(this.button);

      for (let i = 0; i < square; i += 1) {
        for (let j = 0; j < square; j += 1) {
          const div = document.createElement('div');
          div.classList.add('flip_box');
          const front = document.createElement('div');
          front.classList.add('flip_box_front');
          const back = document.createElement('div');
          back.classList.add('flip_box_back');
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
        element.classList.add('m_no_border');
      });
    }

    tick = (pos) => {
      this.button.innerText = 'Catch';
      this.button.style.transform = `translate(${100 * pos[1]}%, ${100 * pos[0]}%)`;
    };

    flip = (pos) => {
      this.parentEl.childNodes[pos + 1].classList.toggle('m_flipped');
    }
  }

  class Picture {
    canvas = document.createElement('canvas');
    ctx;
    img;
    size = {};
    loading;

    constructor(wrapperEl) {
      this.loading = this.getConfig()
        .then(() => {
          this.img = new Image();

          const url = images[getRandomNumber(0, images.length - 1)];
          // const url = './assets/megumin.png';

          this.img.crossOrigin = 'Anonymous';

          const promise = new Promise((res) => {
            this.img.onload = () => {
              this.size = {
                width: this.img.width,
                height: this.img.height,
              };

              const { clientHeight, clientWidth } = wrapperEl;
              const h = clientHeight - 5;
              const w = clientWidth - 10;

              let k = Math.max(this.size.height / h, this.size.width / w);

              if (k < 1) {
                let k = Math.min(this.size.height / h, this.size.width / w);
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
        // return fetch('./assets/images.json')
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
          
        const xStep = this.size.width / gridSize;
        const yStep = this.size.height / gridSize;

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
  document.body.style.setProperty('--interval', '1000ms');

  window.onload = () => {
    const playBoard = document.getElementById('play_board');
    const startButton = document.getElementById('restart');
    const inputGrid = document.getElementById('grid_input');
    const inputInterval = document.getElementById('interval_input');
    
    const uiController = new UI(playBoard);
    const paramsController = new Params();
    let gameController = new Game(paramsController.square, paramsController.interval);

    inputGrid.value = paramsController.square;
    inputInterval.value = paramsController.interval;

    const enableConfigEditing = () => {
      inputGrid.disabled = false;
      inputGrid.classList.remove('m_disabled_input');

      inputInterval.disabled = false;
      inputInterval.classList.remove('m_disabled_input');
    };

    const disableConfigEditing = () => {
      inputGrid.classList.add('m_disabled_input');
      inputGrid.disabled = true;

      inputInterval.classList.add('m_disabled_input');
      inputInterval.disabled = true;
    };

    function rerender(startGame) {
      document.body.setAttribute('data-game-started', 'false')
      document.body.style.setProperty('--width', '0px');
      document.body.style.setProperty('--height', '0px');
      const pictureController = new Picture(playBoard.parentElement);
      gameController.stop();
      gameController = new Game(paramsController.square, paramsController.interval);
      paramsController.makeActual();

      const catchPosition = () => {
        gameController.catchPosition();
        uiController.flip(gameController.currentPosition[0] * paramsController.square + gameController.currentPosition[1]);

        if (gameController.complete) {
          uiController.removeStartButton();
          enableConfigEditing();
          startButton.innerText = 'Restart';
          startButton.onclick = () =>  rerender(true);
        }
      }


      if (startGame) {
        uiController.build(paramsController.square, pictureController.getImgPart);
        disableConfigEditing();
        gameController.start(uiController.tick);
        uiController.button.onclick = catchPosition;

        const callback = () => {
          if (!paramsController.changed) {
            gameController.toggleGame(uiController.tick);
            
            if (gameController.timer) {
              startButton.innerText = 'Pause';
              uiController.button.style.visibility = 'visible'
              uiController.button.onclick = catchPosition;
              disableConfigEditing();
            } else {
              startButton.innerText = 'Continue';
              uiController.button.style.visibility = 'hidden'
              uiController.button.onclick = null;
              enableConfigEditing();
            }
          } else {
            rerender(true);
          }
        }

        startButton.innerText = 'Pause';
        startButton.onclick = callback;
      }
    }

    inputGrid.onchange = (e) => {
      paramsController.setSquare(Number(e.target.value));
      e.target.value = paramsController.square;

      document.body.style.setProperty('--rows', paramsController.square.toString());

      startButton.innerText = 'Start';
      playBoard.innerHTML = ''
      document.body.setAttribute('data-game-started', 'false');
    };

    inputInterval.onchange = (e) => {
      paramsController.setInterval(Number(e.target.value));
      e.target.value = paramsController.interval;

      document.body.style.setProperty('--interval', `${paramsController.interval}ms`);

      startButton.innerText = 'Start';
      playBoard.innerHTML = ''
      document.body.setAttribute('data-game-started', 'false');
    };

    startButton.onclick = () =>  rerender(true);
  }
})();
