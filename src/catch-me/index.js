(function main() {
  function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }

  let images;

  // // for local development
  // let images = [
  //   './assets/megumin.png'
  // ];

  class Params {
    _changed = false;
    _square = 2;
    minSquare = 2;
    maxSquare = 30;

    _interval = 1000;
    minInterval = 200;
    maxInterval = 5000;

    useDirection = false;

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

    toggleDirection = () => {
      this.useDirection = !this.useDirection;
    }
  }

  class Game {
    square;
    config = [];
    timer;
    directionChangeInterval;
    interval;
    position = [0, 0];
    visible = [];
    complete = false;
    useDirection = false;
    direction = [];
    
    get currentPosition() {
      return [...this.position];
    }
    
    set currentPosition(newPosition) {
      this.position = newPosition;
    }

    constructor(square, interval, useDirection, highlightElement) {
      this.init(square, interval, useDirection, highlightElement)
    }

    getDirection = () => {
      if (this.useDirection) {
        if (this.direction.length) {
          this.highlightElement(this.direction[0] * this.square + this.direction[1]);
        }
        const notVisible = []
        for (let i = 0; i < this.square; i += 1) {
          for (let j = 0; j < this.square; j += 1) {

            if (!this.visible.includes(`${i}${j}`)) {
              notVisible.push([i, j]);
            }
          }
        }
        const randomNotVisibleIndex = getRandomNumber(0 , notVisible.length - 1);

        this.direction = notVisible[randomNotVisibleIndex];
        this.highlightElement(this.direction[0] * this.square + this.direction[1]);
      }
    }

    init(square, interval, useDirection, highlightElement) {
      this.stop();
      this.square = square;
      this.highlightElement = highlightElement;
      this.useDirection = useDirection;
      this.interval = interval;
      this.config = [];
      this.position = [0, 0];
      this.visible = [];
      this.complete = false;

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

    getDistance = ([x, y]) => (
      Math.sqrt(Math.pow(x - this.direction[0], 2) + Math.pow(y - this.direction[1],2))
    );

    getPositionByDirection = (render) => {
      const raw = this.currentPosition[0];
      const col = this.currentPosition[1];
      const moves = this.config[raw][col];
      const map = {};

      moves.forEach((coord) => map[coord.join('')] = this.getDistance(coord))
      const sorted = moves.sort((a, b) => map[b] - map[a]);
      const result = [];

      sorted.forEach((_el, index) => {
        const arr = new Array(index + 1).fill(index);
        result.push(...arr);
      });

      shuffleArray(result);

      console.table('=====================================');
      console.table(sorted)
      console.table(result.map(el => moves[el]))
      console.table('=====================================');

      const index = result[getRandomNumber(0, result.length - 1)];


      this.currentPosition = moves[index];

      render(this.currentPosition);
    };

    start = (render) => {
      if (!this.timer) {
        document.body.setAttribute('data-game-started', 'true');
        let callback = this.getPosition;

        if (this.useDirection) {
          callback = this.getPositionByDirection;

          this.directionChangeInterval = setInterval(
            this.getDirection,
            this.interval * this.square,
          );
        }

        if (render) {
          this.getDirection();
          callback(render);
        }

        this.timer = setInterval(
          () => callback(render),
          this.interval,
        );
      }
    };

    stop = () => {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = 0;
      }

      if (this.directionChangeInterval) {
        clearInterval(this.directionChangeInterval);
        this.directionChangeInterval = 0;
      }
    };

    restartDirectionInterval = () => {
      if (this.directionChangeInterval) {
        clearInterval(this.directionChangeInterval);
        this.directionChangeInterval = 0;
      }

      this.directionChangeInterval = setInterval(
        this.getDirection,
        this.interval * this.square,
      );

      this.getDirection();
    }

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

      if (this.direction[0] === this.currentPosition[0] && this.direction[1] === this.currentPosition[1]) {
        this.restartDirectionInterval();
      }

      if (this.visible.length === Math.pow(this.square, 2)) {
        this.complete = true;
        this.stop();
      }
    }
  }

  class UI {
    playBoard
    startButton
    inputGrid
    inputInterval
    inputDirection;
    catchButton;

    constructor(
      {
        playBoard,
        startButton,
        inputGrid,
        inputInterval,
        inputDirection,
      },
      paramsController,
    ) {
      this.paramsController = paramsController;
      this.playBoard = playBoard;
      this.startButton = startButton;
      this.inputGrid = inputGrid;
      this.inputInterval = inputInterval;
      this.inputDirection = inputDirection;

      this.addListeners();
    }

    enableConfigEditing = () => {
      if (this.inputGrid) {
        this.inputGrid.disabled = false;
        this.inputGrid.classList.remove('m_disabled_input');
      }

      if (this.inputInterval) {
        this.inputInterval.disabled = false;
        this.inputInterval.classList.remove('m_disabled_input');
      }

      if (this.inputDirection) {
        this.inputDirection.disabled = false;
        this.inputDirection.classList.remove('m_disabled_input');
      }
    };

    disableConfigEditing = () => {
      if (this.inputGrid) {
        this.inputGrid.classList.add('m_disabled_input');
        this.inputGrid.disabled = true;
      }

      if (this.inputInterval) {
        this.inputInterval.classList.add('m_disabled_input');
        this.inputInterval.disabled = true;
      }


      if (this.inputDirection) {
        this.inputDirection.classList.add('m_disabled_input');
        this.inputDirection.disabled = true;
      }
    };

    setInputGridValue = (value) => {
      if (this.inputGrid) {
        this.inputGrid.value = value;
      }
    }

    setInputIntervalValue = (value) => {
      if (this.inputInterval) {
        this.inputInterval.value = value;
      }
    }

    addListeners = () => {
      if (this.inputInterval) {
        this.inputInterval.onchange = (e) => {
          this.startButton.innerText = 'Start';
          this.playBoard.innerHTML = ''
          document.body.setAttribute('data-game-started', 'false');

          this.paramsController.setInterval(Number(e.target.value));
          e.target.value = this.paramsController.interval;
    
          document.body.style.setProperty('--interval', `${e.target.value}ms`);
        }
      }

      if (this.inputGrid) {
        this.inputGrid.onchange = (e) => {
          this.startButton.innerText = 'Start';
          this.playBoard.innerHTML = ''
          document.body.setAttribute('data-game-started', 'false');

          this.paramsController.setSquare(Number(e.target.value));
          e.target.value = this.paramsController.square;

          document.body.style.setProperty('--rows', e.target.value);
        }
      }

      if (this.inputDirection) {
        this.inputDirection.onchange = () => {
          this.startButton.innerText = 'Start';
          this.playBoard.innerHTML = ''
          document.body.setAttribute('data-game-started', 'false');

          this.paramsController.toggleDirection();
        }
      }
    }

    build = (square, getImageFunction) => {
      this.playBoard.innerHTML = '';
      this.playBoard.style.gridTemplateColumns = `repeat(${square}, 1fr)`;

      this.catchButton = document.createElement('button');
      this.catchButton.tabIndex = -1;
      this.catchButton.classList.add('catch_button');
      this.catchButton.innerText = 'Catch';
      this.playBoard.appendChild(this.catchButton);

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
          this.playBoard.appendChild(div);
        }
      }
    };

    removeCatchButton = () => {
      this.playBoard.removeChild(this.catchButton);

      this.playBoard.childNodes.forEach((element) => {
        element.classList.add('m_no_border');
      });
    }

    tick = (pos) => {
      this.catchButton.innerText = 'Catch';
      this.catchButton.style.transform = `translate(${100 * pos[1]}%, ${100 * pos[0]}%)`;
    };

    flip = (pos) => {
      this.playBoard.childNodes[pos + 1].classList.toggle('m_flipped');
    }

    highlight = (pos) => {
      this.playBoard.childNodes[pos + 1].classList.toggle('m_highlighted');
    }
  }

  class Picture {
    canvas = document.createElement('canvas');
    ctx;
    img;
    size = {};
    loading;

    constructor(width, height) {
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

              const h = height - 5;
              const w = width - 10;

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
        // return fetch('/catch-me/assets/images.json')
        return fetch('./assets/images.json')
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
    const paramsController = new Params();
    const uiController = new UI(
      {
        playBoard: document.getElementById('play_board'),
        startButton: document.getElementById('restart'),
        inputGrid: document.getElementById('grid_input'),
        inputInterval: document.getElementById('interval_input'),
        inputDirection: document.getElementById('direction_input'),
      },
      paramsController,
    );
    const gameController = new Game(
      paramsController.square,
      paramsController.interval,
      paramsController.useDirection,
      uiController.highlight,
    );

    uiController.setInputGridValue(paramsController.square);
    uiController.setInputIntervalValue(paramsController.interval);

    function rerender(startGame) {
      document.body.setAttribute('data-game-started', 'false')
      document.body.style.setProperty('--width', '0px');
      document.body.style.setProperty('--height', '0px');

      const pictureController = new Picture(uiController.playBoard.parentElement.clientWidth, uiController.playBoard.parentElement.clientHeight);

      gameController.stop();
      gameController.init(paramsController.square, paramsController.interval, paramsController.useDirection, uiController.highlight);
      paramsController.makeActual();

      const catchPosition = () => {
        gameController.catchPosition();
        uiController.flip(gameController.currentPosition[0] * paramsController.square + gameController.currentPosition[1]);

        if (gameController.complete) {
          uiController.removeCatchButton();
          uiController.enableConfigEditing();
          uiController.startButton.innerText = 'Restart';
          uiController.startButton.onclick = () =>  rerender(true);
        }
      }


      if (startGame) {
        uiController.build(paramsController.square, pictureController.getImgPart);
        uiController.disableConfigEditing();
        gameController.start(uiController.tick);
        uiController.catchButton.onclick = catchPosition;

        const callback = () => {
          if (!paramsController.changed) {
            gameController.toggleGame(uiController.tick);
            
            if (gameController.timer) {
              uiController.startButton.innerText = 'Pause';
              uiController.catchButton.style.visibility = 'visible'
              uiController.catchButton.onclick = catchPosition;
              uiController.disableConfigEditing();
            } else {
              uiController.startButton.innerText = 'Continue';
              uiController.catchButton.style.visibility = 'hidden'
              uiController.catchButton.onclick = null;
              uiController.enableConfigEditing();
            }
          } else {
            rerender(true);
          }
        }

        uiController.startButton.innerText = 'Pause';
        uiController.startButton.onclick = callback;
      }
    }

    uiController.startButton.onclick = () =>  rerender(true);
  }
})();
