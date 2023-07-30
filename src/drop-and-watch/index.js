const step = 100;
const drawIterationStep = 35;

const state = {
  initialPoint: -1,
  finalPoint: -1,
}

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

function drawLineV1(ctx, grid, initialPoint) {
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

function getPathPoints(grid) {
  const pathPoints = [grid[0][state.initialPoint]];
  let finalIndex = state.initialPoint;

  for (let i = 1; i < grid.length; i += 1) {
    const raw = grid[i];
    if (finalIndex === 0) {
      finalIndex = 1;
    } else if (finalIndex === raw.length - 1) {
      finalIndex = raw.length - 2;
    } else {
      finalIndex = [
        Math.max(finalIndex - 1, 0),
        Math.min(finalIndex + 1, raw.length - 1),
      ][getRandomNumber(0, 1)];
    }

    pathPoints.push(raw[finalIndex]);
  }

  return { pathPoints, finalIndex };
}

function drawFilledCircle(ctx, center, radius = 5) {
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
  ctx.fill();
}


function drawLineV2(ctx, grid, width, height, onGameFinish) {
  const { pathPoints, finalIndex } = getPathPoints(grid);
  let frame;
  let lineCount = 1;
  let stepIndex = 1;

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawFilledCircle(ctx, pathPoints[0]);

      for (let i = 0; i < lineCount; i += 1) {
        const startPoint = pathPoints[i];
        const nextPoint = pathPoints[i + 1];
        const isFinalLine = i === lineCount - 1;
        let step = 0;

        if (isFinalLine) {
          step = stepIndex % drawIterationStep;
          stepIndex += 1;
        }

        let finalPoint = nextPoint;

        if (step) {
          finalPoint = [
            startPoint[0] + ((nextPoint[0] - startPoint[0]) / drawIterationStep) * step,
            startPoint[1] + ((nextPoint[1] - startPoint[1]) / drawIterationStep) * step,
          ];
        }

        ctx.beginPath();
        ctx.moveTo(startPoint[0], startPoint[1]);

        ctx.lineTo(finalPoint[0], finalPoint[1]);
        ctx.stroke();
        
        if (step) {
          drawFilledCircle(ctx, finalPoint, 7)
        }

        if (!step) {
          drawFilledCircle(ctx, finalPoint);

          if (isFinalLine) {
            stepIndex = 1;
            lineCount += 1;

            if (lineCount === pathPoints.length) {
              window.cancelAnimationFrame(frame);
              return onGameFinish(finalIndex);
            }
          }
        }
      }

      frame = window.requestAnimationFrame(draw);
    }
  }

  frame = window.requestAnimationFrame(draw);
}

function getUIElements() {
  const playBoard = document.getElementById('play_board');
  const dropStart = document.getElementById('drop_start');
  const dropEnd = document.getElementById('drop_end');
  const confirmBtnFail = document.getElementById('confirmBtnFail');
  const dialogFail = document.getElementById('dialogFail');
  const confirmBtnSuccess = document.getElementById('confirmBtnSuccess');
  const dialogSuccess = document.getElementById('dialogSuccess');

  if (
    !playBoard ||
    !dropStart ||
    !dropEnd ||
    !confirmBtnFail ||
    !dialogFail ||
    !confirmBtnSuccess ||
    !dialogSuccess
  ) {
    throw new Error('Some of UI elements is not defined or not loaded')
  }

  return {
    playBoard,
    dropStart,
    dropEnd,
    confirmBtnFail,
    dialogFail,
    confirmBtnSuccess,
    dialogSuccess,
  };
}

function createCanvas(width, height, className) {
  const canvas = document.createElement('canvas');

  canvas.width = width * step;
  canvas.height = height * step;

  canvas.classList.add(className);

  return canvas;
}

function setDisabledAttribute(el) {
  el.disabled = true;
}

function removeDisabledAttribute(el) {
  el.disabled = false;
  el.classList.remove('active_start_button');
}

function main() {
  const {
    playBoard,
    dropStart,
    dropEnd,
    confirmBtnFail,
    dialogFail,
    confirmBtnSuccess,
    dialogSuccess,
  } = getUIElements();
  const width = Math.min(Math.ceil(window.innerWidth / 100), 15);
  const height = Math.min(Math.ceil(window.innerHeight / 100), 15);

  const bgCanvas = createCanvas(width, height, 'bg_canvas');
  const pathCanvas = createCanvas(width, height, 'path_canvas');

  playBoard.appendChild(bgCanvas);
  playBoard.appendChild(pathCanvas);

  const bgCtx = bgCanvas.getContext("2d");
  const pathCtx = pathCanvas.getContext("2d");

  if (!bgCtx || !pathCtx) {
    throw new Error('Can\'t create CanvasRenderingContext2D!');
  }

  dropStart.style.width = `${bgCanvas.offsetWidth}px`;
  dropEnd.style.width = `${bgCanvas.offsetWidth}px`;

  let grid = preparePoints(bgCtx, width, height);

  function retry(event, variant) {
    event.preventDefault();

    if (variant === 'faile') {
      dialogFail.close();
    } else {
      dialogSuccess.close();
    }

    state.initialPoint = -1;
    state.finalPoint = -1;

    dropStart.childNodes.forEach(removeDisabledAttribute);
    dropEnd.childNodes.forEach(removeDisabledAttribute);

    if (bgCtx && pathCtx) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      pathCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
      grid = preparePoints(bgCtx, width, height);
    }
  }

  confirmBtnFail.addEventListener("click", (e) => retry(e, 'fail'));

  confirmBtnSuccess.addEventListener("click", (e) => retry(e, 'success'));


  function startButtonListener(e) {
    if (state.initialPoint === -1) {
      state.initialPoint = Number(e.target.value);
      e.target.classList.add('active_start_button');
      dropStart.childNodes.forEach(setDisabledAttribute);
    }

    if (state.finalPoint !== -1 && state.initialPoint !== -1) {
      startGame();
    }
  }

  function finalButtonListener(e) {
    if (state.finalPoint === -1) {
      state.finalPoint = Number(e.target.value);
      e.target.classList.add('active_final_button');
      dropEnd.childNodes.forEach(setDisabledAttribute);
    }

    if (state.finalPoint !== -1 && state.initialPoint !== -1) {
      startGame();
    }
  }

  function createButton(text, parent, variant = 'start') {
    const button = document.createElement('button');
    button.innerText = text + 1;
    button.value = text;
    button.classList.add('variant_button')
    parent.appendChild(button);

    if (variant === 'start') {
      button.addEventListener('click', startButtonListener);
    } else {
      button.addEventListener('click', finalButtonListener);
    }
  }

  function onGameFinish(res) {
    if (res === state.finalPoint) {
      if (dialogSuccess) {
        dialogSuccess.showModal();
        document.body.setAttribute('data-result', 'success');
      }
    } else {
      if (dialogFail) {
        dialogFail.showModal();
        document.body.setAttribute('data-result', 'fail');
      }
    }
  }

  function startGame() {
    drawLineV2(
      pathCtx,
      grid,
      pathCanvas.width,
      pathCanvas.height,
      onGameFinish,
    );
  }


  for (let i = 0; i < width; i += 1) {
    createButton(i, dropStart);
    createButton(i, dropEnd, 'end');
  }
}

window.onload = () => {
  main();
}