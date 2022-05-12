class Params {
  square = 2;
  minSquare = 2;
  maxSquare = 30;

  interval = 200;
  minInterval = 200;
  maxInterval = 5000;

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
  currentPosition = [0, 0];
  timer;
  interval;

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

  build = (square, className) => {
    this.parentEl.innerHTML = '';
    this.parentEl.style.gridTemplateColumns = `repeat(${square}, 1fr)`;

    this.button = document.createElement('button');
    this.button.classList.add('button');
    this.button.innerText = 'Start';
    this.parentEl.appendChild(this.button);

    for (let i = 0; i < square; i += 1) {
      for (let j = 0; j < square; j += 1) {
        const div = document.createElement('div');
        if (className) {
          div.classList.add(className);
        }
        this.parentEl.appendChild(div);
      }
    }
  };

  tick = (pos) => {
    this.button.innerText = 'Stop';
    this.button.style.transform = `translate(${100 * pos[0]}%, ${100 * pos[1]}%)`;
  };

  finishTick = () => {
    this.button.innerText = 'Go on';
  };
}


document.body.style.setProperty('--size', `${Math.min(document.body.offsetWidth, document.body.offsetHeight)}px`);

window.onload = () => {
  const wrapper = document.getElementById('wrapper');
  const inputGrid = document.getElementById('grid_input');
  const inputInterval = document.getElementById('interval_input');
  
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
    uiController.build(paramsController.square, 'content');

    const stopMove = () => {
      showInputs();
      gameController.stop(uiController.finishTick);
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
