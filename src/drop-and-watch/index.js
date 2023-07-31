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

  for (let i = 0; i < (height * 2) - 1; i += 1) {
    const y = offset + i * offset;
    coords.push([]);
    const isOdd = i % 2;

    for (let j = 0; j < (isOdd ? width + 1 : width); j += 1) {
      let x = offset + j * step;

      if (isOdd) {
        x = j * step;

        if (j === 0) {
          x += 5;
        }

        if (j === width) {
          x -= 5;
        }
      }

      coords[i].push([x, y]);

      drawCircle(ctx, [x, y], 5, 'stroke');
    }
  }

  // drawGrid(ctx, width, height);

  return coords;
}

function drawGrid(ctx, width, height) {
  for (let i = 1; i < height; i += 1) {
    ctx.moveTo(0, i * step);
    ctx.lineTo(step * width, i * step);
    ctx.stroke();
  }

  for (let j = 0; j <= width; j += 1) {
    let kX = 0;

    if (j === 0) {
      kX = 1;
    } else if (j === width) {
      kX = -1;
    }

    ctx.moveTo((j * step) + kX, 0);
    ctx.lineTo(j * step, step * height);
    ctx.stroke();
  }
}

function drawPathV1(ctx, grid, initialPoint, onGameFinish) {
  const { pathPoints, finalIndex } = getPathPoints(grid);
  let prevPoint = grid[0][initialPoint];

  if (ctx) {
    drawCircle(ctx, prevPoint, 5, 'fill');

    for (let i = 1; i < pathPoints.length; i += 1) {
      const point = pathPoints[i];

      ctx.beginPath();
      ctx.moveTo(prevPoint[0], prevPoint[1]);

      prevPoint = point;

      ctx.lineTo(point[0], point[1]);
      ctx.stroke();

      drawCircle(ctx, point, 5, 'fill');
    }
  }

  onGameFinish(finalIndex);
}

let coin = { x: 30, y: 30, speed: 0.001, t: 0, radius: 10 };
let bezierCoords = [
  { x: coin.x, y: coin.y },
  { x: 70, y: 200 },
  { x: 125, y: 295 },
  { x: 350, y: 350 }
]

function moveBallInBezierCurve(ctx) {
  let [p0, p1, p2, p3] = bezierCoords;
  //Calculate the coefficients based on where the coin currently is in the animation
  let cx = 3 * (p1.x - p0.x);
  let bx = 3 * (p2.x - p1.x) - cx;
  let ax = p3.x - p0.x - cx - bx;

  let cy = 3 * (p1.y - p0.y);
  let by = 3 * (p2.y - p1.y) - cy;
  let ay = p3.y - p0.y - cy - by;

  let t = coin.t;

  //Increment t value by speed
  coin.t += coin.speed;
  //Calculate new X & Y positions of coin
  let xt = ax * (t * t * t) + bx * (t * t) + cx * t + p0.x;
  let yt = ay * (t * t * t) + by * (t * t) + cy * t + p0.y;

  if (coin.t > 1) {
    coin.t = 1;
  }

  //We draw the coin to the canvas in the new location
  coin.x = xt;
  coin.y = yt;
  drawCircle(ctx, [coin.x, coin.y], coin.radius, 'fill', 'rgba(100, 50, 150, .8)');
}

function drawPathV4(ctx, grid, initialPoint, width, height, onGameFinish) {
  let direction = -1;
  const { pathPoints, finalIndex } = getPathPoints(grid);
  let pointIndex = 1;
  let point = grid[0][initialPoint];
  coin = { x: point[0], y: point[1], speed: 0.03, t: 0, radius: 10 };
  bezierCoords = [
    { x: coin.x, y: coin.y },
    { x: point[0], y: point[1] },
    { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] - step },
    { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] },
  ]
  let frame;

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < pointIndex; i += 1) {
        drawCircle(ctx, pathPoints[i], 5, 'fill');
      }

      moveBallInBezierCurve(ctx);

      if (pointIndex === pathPoints.length - 1 && coin.t === 1) {
        drawCircle(ctx, pathPoints[pointIndex], 5, 'fill');
        drawCircle(ctx, [coin.x, coin.y], coin.radius, 'fill', 'rgba(100, 50, 150, .8)');
        onGameFinish(finalIndex);
        window.cancelAnimationFrame(frame);
        return;
        }

      if (coin.t === 1) {
        coin.t = 0;
        drawCircle(ctx, pathPoints[pointIndex], 5, 'fill');
        pointIndex += 1;

        bezierCoords = [
          { x: coin.x, y: coin.y },
          { x: pathPoints[pointIndex - 1][0], y: pathPoints[pointIndex - 1][1] },
          { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] - step },
          { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] },
        ]
      }


      if (direction === -1 && coin.radius === 5) {
        direction = 1;
      }

      if (direction === 1 && coin.radius === 10) {
        direction = -1;
      }

      coin.radius += direction;

      frame = window.requestAnimationFrame(draw);
    }
  }

  frame = window.requestAnimationFrame(draw);
}

function drawPathV3(ctx, grid, initialPoint, onGameFinish) {
  const { pathPoints, finalIndex } = getPathPoints(grid);
  let prevPoint = grid[0][initialPoint];

  if (ctx) {
    drawCircle(ctx, prevPoint, 5, 'fill');

    for (let i = 1; i < pathPoints.length; i += 1) {
      const point = pathPoints[i];

      ctx.beginPath();
      ctx.setLineDash([10, 250]);
      ctx.lineDashOffset = -250;
      ctx.moveTo(prevPoint[0], prevPoint[1]);

      ctx.bezierCurveTo(
        prevPoint[0],
        prevPoint[1],
        point[0],
        prevPoint[1] - step,
        point[0],
        point[1]
      );
      ctx.stroke();

      drawCircle(ctx, point, 5, 'fill');
      prevPoint = point;
    }
  }

  onGameFinish(finalIndex);
}

function getPathPoints(grid) {
  const pathPoints = [grid[0][state.initialPoint]];
  let finalIndex = state.initialPoint;

  for (let i = 1; i < grid.length; i += 1) {
    const raw = grid[i];
    const isOdd = i % 2;

    if (isOdd) {
      if (finalIndex === 0) {
        finalIndex = getRandomNumber(0, 1);
      } else if (finalIndex === raw.length) {
        finalIndex = [
          Math.max(finalIndex, 0),
          Math.min(finalIndex + 1, raw.length),
        ][getRandomNumber(0, 1)];
      } else {
        finalIndex = [
          Math.max(finalIndex, 0),
          Math.min(finalIndex + 1, raw.length),
        ][getRandomNumber(0, 1)];
      }

    } else {

      if (finalIndex === 0) {
        finalIndex = 0;
      } else if (finalIndex === raw.length) {
        finalIndex = raw.length - 1;
      } else {
        finalIndex = [
          Math.max(finalIndex - 1, 0),
          Math.min(finalIndex, raw.length),
        ][getRandomNumber(0, 1)];
      }
    }

    pathPoints.push(raw[finalIndex]);
  }

  return { pathPoints, finalIndex };
}

function drawCircle(ctx, center, radius = 5, type = 'fill', color = 'black') {
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
  
  if (type === 'fill') {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}


function drawPathV2(ctx, grid, width, height, onGameFinish) {
  const { pathPoints, finalIndex } = getPathPoints(grid);
  let frame;
  let lineCount = 1;
  let stepIndex = 1;
  let headRadius = 10;
  let direction = -1;

  function draw() {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawCircle(ctx, pathPoints[0], 5, 'fill');

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
          drawCircle(ctx, finalPoint, headRadius)


          if (direction === -1 && headRadius === 5) {
            direction = 1;
          }

          if (direction === 1 && headRadius === 10) {
            direction = -1;
          }

          headRadius += direction;
        }

        if (!step) {
          drawCircle(ctx, finalPoint);

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
  el.classList.remove('active_variant_button');
}

function iterateHTMLCollection(collection, callback) {
  for (let i = 0; i < collection.length; i += 1) {
    const element = collection[i];

    callback(element);
  }
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

  function closeDialog(event, variant) {
    event.preventDefault();

    if (variant === 'fail') {
      dialogFail.close();
    } else {
      dialogSuccess.close();
    }

    retry();
  }

  function retry() {
    document.body.removeAttribute('data-result');

    state.initialPoint = -1;
    state.finalPoint = -1;

    iterateHTMLCollection(dropStart.children, removeDisabledAttribute)
    iterateHTMLCollection(dropEnd.children, removeDisabledAttribute)

    if (bgCtx && pathCtx) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      pathCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
      grid = preparePoints(bgCtx, width, height);
    }
  }

  confirmBtnFail.addEventListener("click", (e) => closeDialog(e, 'fail'));

  confirmBtnSuccess.addEventListener("click", (e) => closeDialog(e, 'success'));

  dialogFail.addEventListener("close", () => retry());

  dialogSuccess.addEventListener("close", () => retry());


  function startButtonListener(e) {
    if (state.initialPoint !== -1) {
      dropStart.children[state.initialPoint].classList.remove('active_variant_button');
    }
    state.initialPoint = Number(e.target.value);
    e.target.classList.add('active_variant_button');

    if (state.finalPoint !== -1 && state.initialPoint !== -1) {
      startGame();
    }
  }

  function finalButtonListener(e) {
    if (state.finalPoint !== -1) {
      dropEnd.children[state.finalPoint].classList.remove('active_variant_button');
    }
    state.finalPoint = Number(e.target.value);
    e.target.classList.add('active_variant_button');

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
    iterateHTMLCollection(dropStart.children, setDisabledAttribute)
    iterateHTMLCollection(dropEnd.children, setDisabledAttribute)

    // drawPathV1(
    //   pathCtx,
    //   grid,
    //   state.initialPoint,
    //   onGameFinish,
    // );

    // drawPathV2(
    //   pathCtx,
    //   grid,
    //   pathCanvas.width,
    //   pathCanvas.height,
    //   onGameFinish,
    // );

    // drawPathV3(
    //   pathCtx,
    //   grid,
    //   state.initialPoint,
    //   onGameFinish,
    // );

    drawPathV4(
      pathCtx,
      grid,
      state.initialPoint,
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