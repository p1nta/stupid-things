(function main() {
  function getRandomNumber(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  };

  class Params {
    static imageSources = {
      // 'girlsWithBooks': './assets/animeGirlsHoldingProgrammingBooks.json',
      girlsWithBooks: '/catch-me/assets/animeGirlsHoldingProgrammingBooks.json',
      generatedGirls: '/catch-me/assets/AIFaces.json',
      sfwWaifu: 'https://waifu.vercel.app/sfw/waifu',
      sfwNeko: 'https://waifu.vercel.app/sfw/neko',
      sfwShinobu: 'https://waifu.vercel.app/sfw/shinobu',
      sfwBully: 'https://waifu.vercel.app/sfw/bully',
      sfwCry: 'https://waifu.vercel.app/sfw/cry',
      sfwHug: 'https://waifu.vercel.app/sfw/hug',
      sfwKiss: 'https://waifu.vercel.app/sfw/kiss',
      sfwLick: 'https://waifu.vercel.app/sfw/lick',
      sfwPat: 'https://waifu.vercel.app/sfw/pat',
      sfwSmug: 'https://waifu.vercel.app/sfw/smug',
      sfwHighfive: 'https://waifu.vercel.app/sfw/highfive',
      sfwNom: 'https://waifu.vercel.app/sfw/nom',
      sfwBite: 'https://waifu.vercel.app/sfw/bite',
      sfwSlap: 'https://waifu.vercel.app/sfw/slap',
      sfwWink: 'https://waifu.vercel.app/sfw/wink',
      sfwPoke: 'https://waifu.vercel.app/sfw/poke',
      sfwDance: 'https://waifu.vercel.app/sfw/dance',
      sfwCringe: 'https://waifu.vercel.app/sfw/cringe',
      sfwBlush: 'https://waifu.vercel.app/sfw/blush',
    }

    _changed = false;
    _square = 2;
    minSquare = 2;
    maxSquare = 30;

    _interval = 1000;
    minInterval = 200;
    maxInterval = 5000;

    useDirection = true;

    source = 'girlsWithBooks';

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
      this._changed = true;
    }

    setSource = (source) => {
      if (Params.imageSources[source]) {
        this.source = source;
      } else {
        this.source = Object.keys(Params.imageSources)[0];
      }

      this._changed = true;
    }

    getSourceUrl = () => {
      return Params.imageSources[this.source];
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
    isStarted = false;
    useDirection = false;
    direction = [];
    
    get currentPosition() {
      return [...this.position];
    }
    
    set currentPosition(newPosition) {
      this.position = newPosition;
    }

    constructor(square, interval, useDirection) {
      this.square = square;
      this.useDirection = useDirection;
      this.interval = interval;
    }

    renderPosition = (position) => {
      console.log(position);
    }

    onGameCompleted = () => {};

    getDirection = () => {
      if (this.useDirection) {
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
      }
    }


    getDistance = ([x, y]) => (
      Math.sqrt(Math.pow(x - this.direction[0], 2) + Math.pow(y - this.direction[1], 2))
    );

    getPosition = () => {
      const raw = this.position[0];
      const col = this.position[1];
      const moves = this.config[raw][col];

      this.currentPosition = moves[getRandomNumber(0, moves.length - 1)];

      this.renderPosition(this.currentPosition);
    };

    getPositionByDirection = () => {
      const raw = this.currentPosition[0];
      const col = this.currentPosition[1];
      const moves = this.config[raw][col];
      const map = {};

      moves.forEach((coord) => map[coord.join('')] = this.getDistance(coord))
      const sorted = moves.sort((a, b) => map[b.join('')] - map[a.join('')]);
      const result = [];

      sorted.forEach((_el, index) => {
        const arr = new Array(index + 1).fill(index);
        result.push(...arr);
      });

      shuffleArray(result);

      const index = result[getRandomNumber(0, result.length - 1)];


      this.currentPosition = moves[index];

      this.renderPosition(this.currentPosition);
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

    catchPosition = () => {
      const pos = this.currentPosition.join('');
      const index = this.visible.indexOf(pos);

      if (index < 0) {
        this.visible.push(pos);
      } else {
        this.visible.splice(index, 1);
      }

      if (this.visible.length === Math.pow(this.square, 2)) {
        this.isStarted = false;
        this.pause();
        this.onGameCompleted();
      } else if (
        this.direction[0] === this.currentPosition[0]
        && this.direction[1] === this.currentPosition[1]
      ) {
        this.restartDirectionInterval();
      }
    }


    restart(
      square = this.square,
      interval = this.interval,
      useDirection = this.useDirection,
    ) {
      this.pause();
      this.isStarted = true;
      this.square = square;
      this.useDirection = useDirection;
      this.interval = interval;
      this.config = [];
      this.position = [0, 0];
      this.visible = [];

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

      this.continue();
    }

    continue = () => {
      this.pause();
      let getPosition = this.getPosition;

      if (this.useDirection) {
        getPosition = this.getPositionByDirection;

        this.directionChangeInterval = setInterval(
          this.getDirection,
          this.interval * this.square,
        );

        this.getDirection();
      }

      getPosition();

      this.timer = setInterval(
        () => getPosition(),
        this.interval,
      );
    };

    pause = () => {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = 0;
      }

      if (this.directionChangeInterval) {
        clearInterval(this.directionChangeInterval);
        this.directionChangeInterval = 0;
      }
    };
  }

  class UI {
    playBoard
    startButton
    pauseButton
    restartButton
    settingButton
    inputGrid
    inputInterval
    inputDirection
    configBoard
    catchButton;


    constructor(
      square,
      interval,
      useDirection,
      source,
    ) {
      document.body.style.setProperty('--width', '0px');
      document.body.style.setProperty('--height', '0px');
      document.body.style.setProperty('--interval', `${interval}ms`);
      document.body.style.setProperty('--rows', square);
      
      this.playBoard = document.getElementById('play_board');
      this.configBoard = document.getElementById('config_board');
      this.loadingBoard = document.getElementById('loading_board');

      this.startButton = document.getElementById('start');
      this.pauseButton = document.getElementById('pause');
      this.restartButton = document.getElementById('restart');
      this.settingButton = document.getElementById('settings');

      this.inputGrid = document.getElementById('grid_input');
      if (this.inputGrid) {
        this.inputGrid.value = square;
      }
      this.inputInterval = document.getElementById('interval_input');
      if (this.inputInterval) {
        this.inputInterval.value = interval;
      }
      this.inputDirection = document.getElementById('direction_input');
      if (this.inputDirection) {
        this.inputDirection.checked = useDirection;
      }
      this.inputSource = document.getElementById('source_input');
      if (this.inputSource) {
        this.inputSource.value = source;
      }

      this.catchButton = document.createElement('button');
      this.catchButton.tabIndex = -1;
      this.catchButton.classList.add('catch_button');
      this.catchButton.innerText = 'Catch';
    }

    showSettings = () => {
      this.configBoard.classList.add('m_visible');
      this.catchButton.classList.add('m_hidden');
      this.loadingBoard.classList.remove('m_visible');

      if (this.startButton) {
        this.startButton.classList.remove('m_disabled');
        this.startButton.disabled = false;
      }

      if (this.pauseButton) {
        this.pauseButton.classList.add('m_disabled');
        this.pauseButton.disabled = true;
      }

      if (this.restartButton) {
        this.restartButton.classList.remove('m_disabled');
        this.restartButton.disabled = false;
      }

      if (this.settingButton) {
        this.settingButton.classList.add('m_disabled');
        this.settingButton.disabled = true;
      }
    }

    showPause = () => {
      this.configBoard.classList.remove('m_visible');
      this.catchButton.classList.remove('m_hidden');
      this.loadingBoard.classList.remove('m_visible');

      if (this.startButton) {
        this.startButton.classList.remove('m_disabled');
        this.startButton.disabled = false;
      }

      if (this.pauseButton) {
        this.pauseButton.classList.add('m_disabled');
        this.pauseButton.disabled = true;
      }

      if (this.restartButton) {
        this.restartButton.classList.remove('m_disabled');
        this.restartButton.disabled = false;
      }

      if (this.settingButton) {
        this.settingButton.classList.remove('m_disabled');
        this.settingButton.disabled = false;
      }
    }

    showPlay = () => {
      this.configBoard.classList.remove('m_visible');
      this.catchButton.classList.remove('m_hidden');
      this.loadingBoard.classList.remove('m_visible');

      if (this.startButton) {
        this.startButton.classList.add('m_disabled');
        this.startButton.disabled = true;
      }

      if (this.pauseButton) {
        this.pauseButton.classList.remove('m_disabled');
        this.pauseButton.disabled = false;
      }

      if (this.restartButton) {
        this.restartButton.classList.add('m_disabled');
        this.restartButton.disabled = true;
      }

      if (this.settingButton) {
        this.settingButton.classList.add('m_disabled');
        this.settingButton.disabled = true;
      }
    }

    showLoading = () => {
      this.configBoard.classList.remove('m_visible');
      this.catchButton.classList.remove('m_hidden');
      this.loadingBoard.classList.add('m_visible');

      if (this.startButton) {
        this.startButton.classList.add('m_disabled');
        this.startButton.disabled = true;
      }

      if (this.pauseButton) {
        this.pauseButton.classList.add('m_disabled');
        this.pauseButton.disabled = true;
      }

      if (this.restartButton) {
        this.restartButton.classList.add('m_disabled');
        this.restartButton.disabled = true;
      }

      if (this.settingButton) {
        this.settingButton.classList.add('m_disabled');
        this.settingButton.disabled = true;
      }
    }

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

    addListeners = (
      startCallback,
      pauseCallback,
      restartCallback,
      settingCallback,
      catchCallback,
    ) => {
      if (this.inputInterval) {
        this.inputInterval.onchange = (e) => {
          const value = this.paramChanged('interval', Number(e.target.value));
          e.target.value = value;
    
          document.body.style.setProperty('--interval', `${e.target.value}ms`);
        }
      }

      if (this.inputGrid) {
        this.inputGrid.onchange = (e) => {
          const value = this.paramChanged('square', Number(e.target.value));
          e.target.value = value;

          document.body.style.setProperty('--rows', e.target.value);
        }
      }

      if (this.inputDirection) {
        this.inputDirection.onchange = () => {
          this.paramChanged('direction');
        }
      }

      if (this.inputSource) {
        this.inputSource.onchange = (e) => {
          const value = this.paramChanged('source', e.target.value);
          e.target.value = value;
        }
      }

      if (this.startButton) {
        this.startButton.onclick = () => {
          startCallback();
        }
      }

      if (this.pauseButton) {
        this.pauseButton.onclick = () => {
          pauseCallback();
        }
      }

      if (this.restartButton) {
        this.restartButton.onclick = () => {
          restartCallback();
        }
      }

      if (this.settingButton) {
        this.settingButton.onclick = () => {
          settingCallback();
        }
      }

      if (this.catchButton) {
        this.catchButton.onclick = () => {
          catchCallback();
        }
      }
    }

    paramChanged = (paramName, value) => {
      console.log(paramName, value);
    }

    build = (square, getImageFunction) => {
      this.playBoard.innerHTML = '';
      this.playBoard.style.gridTemplateColumns = `repeat(${square}, 1fr)`;

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

          getImageFunction(i, j, square)
            .then((bgUrl) => {
              back.style.backgroundImage = `url(${bgUrl})`;
            });

          this.playBoard.appendChild(div);
        }
      }
    };

    removeCatchButton = () => {
      for (let i = 1; i < this.playBoard.childNodes.length; i += 1) {
        const element = this.playBoard.childNodes[i];
        element.classList.add('m_no_border');
      }

      this.playBoard.removeChild(this.catchButton);
    }

    tick = (pos) => {
      this.catchButton.style.transform = `translate(${100 * pos[1]}%, ${100 * pos[0]}%)`;
    };

    flip = (pos) => {
      const element = this.playBoard.childNodes[pos + 1];

      if (element) {
        element.classList.toggle('m_flipped');
      }
    }
  }

  class Picture {
    canvas = document.createElement('canvas');
    ctx;
    imageSize = {};
    loading;
    width;
    height
    animeGirlsHoldingProgrammingBooks;
    AIFaces;

    constructor(width, height) {
      this.width = width - 10;
      this.height = height - 10;
    }

    loadPicture = (source) => {
      this.loading = this.getUrl(source)
        .then(this.drawToCanvasCallback)
        .then(() => {
          this.loading = null;
        });

      return this.loading;
    };

    getUrl(source) {
      if (source === Params.imageSources.girlsWithBooks) {
        if (!this.animeGirlsHoldingProgrammingBooks) {
          return fetch(source)
            .then((res) => res.json())
            .then((res) => {
              this.animeGirlsHoldingProgrammingBooks = res;
              return res[getRandomNumber(0, res.length - 1)];
            });
        }

        return Promise.resolve(this.animeGirlsHoldingProgrammingBooks[getRandomNumber(0, this.animeGirlsHoldingProgrammingBooks.length - 1)]);
      } else if (source === Params.imageSources.generatedGirls) {
        if (!this.AIFaces) {
          return fetch(source)
            .then((res) => res.json())
            .then((res) => {
              this.AIFaces = res;
              return res[getRandomNumber(0, res.length - 1)]
            });
        }

        return Promise.resolve(this.AIFaces[getRandomNumber(0, this.AIFaces.length - 1)]);
      } else {
        return Promise.resolve(`${source}?${Date.now()}`);
      }
    }

    drawToCanvasCallback = (url) => {
      const img = new Image();

      img.crossOrigin = 'Anonymous';
      img.src = url;

      return new Promise((res) => {
        img.onload = () => {
          this.imageSize = {
            width: img.width,
            height: img.height,
          };

          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx = this.canvas.getContext('2d');

          this.ctx.drawImage(img, 0, 0);

          const k = Math.max(this.imageSize.height / this.height, this.imageSize.width / this.width);

          document.body.style.setProperty('--width', `${this.imageSize.width / k}px`);
          document.body.style.setProperty('--height', `${this.imageSize.height / k}px`);
          res();
        }
      });
    }

    getImgPartUrl = async (i, j, gridSize) => {
      if (this.loading) {
        await this.loading;
      }
          
      const xStep = this.imageSize.width / gridSize;
      const yStep = this.imageSize.height / gridSize;

      const kx = xStep * j;
      const ky = yStep * i;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = xStep;
      tempCanvas.height = yStep;
      const tempCanvasCtx = tempCanvas.getContext('2d');
      const data = this.ctx.getImageData(kx, ky, kx + xStep, ky + yStep);
      tempCanvasCtx.putImageData(data, 0, 0);

      return tempCanvas.toDataURL();
    }
  }

class Main {
  gameController;
  uiController;
  pictureController;
  paramsController;

  constructor() {
    this.paramsController = new Params();

    this.uiController = new UI(
      this.paramsController.square,
      this.paramsController.interval,
      this.paramsController.useDirection,
      this.paramsController.source,
    );
    

    this.gameController = new Game(
      this.paramsController.square,
      this.paramsController.interval,
      this.paramsController.useDirection,
    );

    this.pictureController = new Picture(
      this.uiController.playBoard.parentElement.clientWidth,
      this.uiController.playBoard.parentElement.clientHeight,
    );
  }

  init = () => {
    this.uiController.paramChanged = this.paramChanged;
    this.gameController.renderPosition = this.uiController.tick;
    this.gameController.onGameCompleted = this.onGameCompleted;

    this.uiController.addListeners(
      this.startGame,
      this.pauseGame,
      this.restartGame,
      this.settingsClick,
      this.catchTile,
    );
  };

  paramChanged = (paramName, value) => {
    switch (paramName) {
      case 'square': {
        this.paramsController.setSquare(value);
        return this.paramsController.square;
      }

      case 'interval': {
        this.paramsController.setInterval(value);
        return this.paramsController.interval;
      }

      case 'direction': {
        return this.paramsController.toggleDirection();
      }

      case 'source': {
        this.paramsController.setSource(value);
        return this.paramsController.source;
      }
    }
  };

  startGame = () => {
    if (this.gameController.isStarted && !this.paramsController.changed) {
      this.uiController.showPlay();
      this.gameController.continue();
    } else {
      this.restartGame();
    }
  };

  restartGame = () => {
    this.paramsController.makeActual();
    this.uiController.showPlay();

    this.uiController.showLoading();
    this.pictureController.loadPicture(this.paramsController.getSourceUrl())
      .then(() => this.uiController.build(this.paramsController.square, this.pictureController.getImgPartUrl))
      .then(() => this.gameController.restart(
        this.paramsController.square,
        this.paramsController.interval,
        this.paramsController.useDirection,
      ))
      .then(() => this.uiController.showPlay())
      .catch(() => this.uiController.showSettings());
  };

  pauseGame = () => {
    this.uiController.showPause();
    this.gameController.pause();
  };

  settingsClick = () => {
    this.uiController.showSettings();

    if (this.gameController.isStarted) {
      this.gameController.pause();
    }
  };

  catchTile = () => {
    this.uiController.flip(this.gameController.currentPosition[0] * this.paramsController.square + this.gameController.currentPosition[1]);
    this.gameController.catchPosition();
  };

  onGameCompleted = () => {
    this.uiController.showPause();
    this.uiController.removeCatchButton();

    if (startConfetti) {
      startConfetti();

      const timeout = setTimeout(stopConfetti, 3000);

      function callback() {
        stopConfetti();
        clearTimeout(timeout);
        document.body.removeEventListener('click', callback);
      }

      document.body.addEventListener('click', callback);
    }
  }
}

  window.onload = () => {
    const main = new Main();

    main.init();
  }
})();
