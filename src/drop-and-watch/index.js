const step = 100;

function getRandomNumber(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function preparePoints(ctx, width, height) {
  const offset = step / 2;
  const coords = [];

  for (let i = 0; i < height; i += 1) {
    const y = offset + i * step;
    coords.push([]);

    for (let j = 0; j < width; j += 1) {
      const x = offset + j * step;

      coords[i].push([x, y]);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  drawGrid(ctx, width, height);

  return coords;
}

function drawGrid(ctx, width, height) {
  for (let i = 1; i < height; i += 1) {
    ctx.moveTo(0, i * step);
    ctx.lineTo(step * width, i * step);
    ctx.stroke();
  }

  for (let j = 0; j <= width; j += 1) {
    ctx.moveTo(j * step, 0);
    ctx.lineTo(j * step, step * height);
    ctx.stroke();
  }
}

function drawLine(ctx, grid, initialPoint) {
  let res = initialPoint;
  let prevPoint = grid[0][initialPoint];

  if (ctx) {
    ctx.beginPath();
    ctx.arc(prevPoint[0], prevPoint[1], 5, 0, 2 * Math.PI);
    ctx.fill();

    for (let i = 1; i < grid.length; i += 1) {
      const raw = grid[i];
      if (res === 0) {
        res = 1;
      } else if (res === raw.length - 1) {
        res = raw.length - 2;
      } else {
        res = [
          Math.max(res - 1, 0),
          Math.min(res + 1, raw.length - 1),
        ][getRandomNumber(0, 1)];
      }

      ctx.beginPath();
      ctx.moveTo(prevPoint[0], prevPoint[1]);

      prevPoint = raw[res];

      ctx.lineTo(prevPoint[0], prevPoint[1]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(prevPoint[0], prevPoint[1], 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  return res;
}

function main() {
  let initialPoint;
  let finalPoint;

  const width = Math.min(Math.ceil(window.innerWidth / 100), 15);
  const height = Math.min(Math.ceil(window.innerHeight / 100), 15);

  const playBoard = document.getElementById('play_board');
  const dropStart = document.getElementById('drop_start');
  const dropEnd = document.getElementById('drop_end');

  const canvas = document.createElement('canvas');
  canvas.width = step * width;
  canvas.height = step * height;
  canvas.classList.add('canvas')
  playBoard?.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  dropStart.style.width = `${canvas.offsetWidth}px`;
  dropEnd.style.width = `${canvas.offsetWidth}px`;

  let grid = preparePoints(ctx, width, height);

  const confirmBtnFail = document.getElementById('confirmBtnFail');
  const dialogFail = document.getElementById('dialogFail');
  const confirmBtnSuccess = document.getElementById('confirmBtnSuccess');
  const dialogSuccess = document.getElementById('dialogSuccess');

  function retry(variant) {
    if (variant === 'faile') {
      dialogFail.close();
    } else {
      dialogSuccess.close();
    }

    initialPoint = undefined;
    finalPoint = undefined;

    dropStart?.childNodes.forEach(el => {
      el.disabled = false;
      el.classList.remove('active_start_button');
    });
    dropEnd?.childNodes.forEach(el => {
      el.disabled = false;
      el.classList.remove('active_final_button');
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid = preparePoints(ctx, width, height);
  }

  confirmBtnFail.addEventListener("click", () => retry('fail'));

  confirmBtnSuccess.addEventListener("click", () => retry('success'));


  function startButtonListener(e) {
    if (typeof initialPoint === 'undefined') {
      initialPoint = Number(e.target.value);
      e.target.classList.add('active_start_button');
      dropStart?.childNodes.forEach(el => el.disabled = true);
    }

    if (typeof finalPoint !== 'undefined' && typeof initialPoint !== 'undefined') {
      startGame();
    }
  }

  function finalButtonListener(e) {
    if (typeof finalPoint === 'undefined') {
      finalPoint = Number(e.target.value);
      e.target.classList.add('active_final_button');
      dropEnd?.childNodes.forEach(el => el.disabled = true);
    }

    if (typeof finalPoint !== 'undefined' && typeof initialPoint !== 'undefined') {
      startGame();
    }
  }

  function createButton(text, parent, variant = 'start') {
    const button = document.createElement('button');
    button.innerText = text;
    button.value = text;
    button.classList.add('variant_button')
    parent?.appendChild(button);

    if (variant === 'start') {
      button.addEventListener('click', startButtonListener);
    } else {
      button.addEventListener('click', finalButtonListener);
    }
  }

  function startGame() {
    const res = drawLine(ctx, grid, initialPoint);

    console.log(res, finalPoint);

    if (res === finalPoint) {
      dialogSuccess.showModal();
      document.body.setAttribute('data-result', 'success');
    } else {
      dialogFail.showModal();
      document.body.setAttribute('data-result', 'fail');
    }
  }


  for (let i = 0; i < width; i += 1) {
    createButton(i, dropStart);
    createButton(i, dropEnd, 'end');
  }
}

window.onload = () => {
  main();
}