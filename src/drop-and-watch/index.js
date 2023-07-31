function main() {
  const pointsDistance = 100;
  const scaleCoefficient = (Math.max(window.innerHeight, window.innerWidth)) / 10;
  const maxColumns = 15;
  const drawIterationStep = 35;
  const isDrawGrid = false;

  const gridPointRadius = Math.ceil(scaleCoefficient / 100 * 5);
  const drawVersion = 3;

  const state = {
    initialPoint: -1,
    finalPoint: -1,
  }

  let coin = {
    x: 0,
    y: 0,
    speed: 0.001,
    t: 0,
    radius: gridPointRadius,
    maxRadius: gridPointRadius * 2,
    minRadius: gridPointRadius,
    radiusChangeDirection: 1,
  };
  let bezierCoords = [
    { x: coin.x, y: coin.y },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 }
  ]

  const utils = {
    getNextIndex() {
      if (Math.random() < 0.33) {
        return 1;
      }
      
      return 0;
    },

    getRandomNumber(min, max) {
      return Math.round(Math.random() * (max - min) + min);
    },

    createCanvas(width, height, className) {
      const canvas = document.createElement('canvas');

      canvas.width = width * pointsDistance;
      canvas.height = height * pointsDistance;

      canvas.classList.add(className);

      return canvas;
    },

    setDisabledAttribute(el) {
      el.disabled = true;
    },

    removeDisabledAttribute(el) {
      el.disabled = false;
      el.classList.remove('active_variant_button');
    },

    iterateHTMLCollection(collection, callback) {
      for (let i = 0; i < collection.length; i += 1) {
        const element = collection[i];

        callback(element);
      }
    },

    drawCircle(ctx, center, radius = coin.minRadius, type = 'fill', color = 'black') {
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);

      if (type === 'fill') {
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    },
  }


  function changeCoinRadius() {
    if (coin.radiusChangeDirection === -1 && coin.radius === coin.minRadius) {
      coin.radiusChangeDirection = 1;
    }

    if (coin.radiusChangeDirection === 1 && coin.radius === coin.maxRadius) {
      coin.radiusChangeDirection = -1;
    }

    coin.radius += coin.radiusChangeDirection;
  }

  function getPathPoints(grid) {
    const pathPoints = [grid[0][state.initialPoint]];
    let finalIndex = state.initialPoint;

    for (let i = 1; i < grid.length; i += 1) {
      const raw = grid[i];
      const isOdd = i % 2;

      if (isOdd) {
        if (finalIndex === 0) {
          finalIndex = utils.getNextIndex();
        } else {
          finalIndex = utils.getNextIndex() ?
            Math.min(finalIndex + 1, raw.length) :
            Math.max(finalIndex - 1, 0);
        }

      } else {

        if (finalIndex === 0) {
          finalIndex = 0;
        } else if (finalIndex === raw.length) {
          finalIndex = raw.length - 1;
        } else {
          utils.getNextIndex() ?
            Math.min(finalIndex, raw.length) :
            Math.max(finalIndex - 1, 0);
        }
      }

      pathPoints.push(raw[finalIndex]);
    }

    return { pathPoints, finalIndex };
  }

  function getPathPointsV1(grid) {
    const pathPoints = [
      grid[0][state.initialPoint],
    ];
    const odd = [state.initialPoint];
    const even = [];
    
    for (let i = 2; i < grid.length; i += 2) {
      const prevIndex = odd[odd.length - 1];
      const rawLastIndex = grid[i].length - 1;


      if (prevIndex === 0) {
        odd.push(utils.getRandomNumber(prevIndex, prevIndex + 1));
        
        continue;
      }

      if (prevIndex === rawLastIndex) {
        odd.push(utils.getRandomNumber(prevIndex - 1, prevIndex));
        
        continue;
      }

      odd.push(utils.getRandomNumber(prevIndex - 1, prevIndex + 1));
    }

    for (let i = 1; i <= odd.length - 1; i += 1) {
      const prevOddIndex = odd[i - 1];
      const oddIndex = odd[i];
      const rowIndex = i * 2;
      let indexInRaw = utils.getRandomNumber(oddIndex, oddIndex + 1);

      
      if (oddIndex - prevOddIndex === 1) {
        indexInRaw = oddIndex;
      } else if (oddIndex - prevOddIndex === -1) {
        indexInRaw = prevOddIndex;
      }

      pathPoints.push(grid[rowIndex - 1][indexInRaw])
      pathPoints.push(grid[rowIndex][oddIndex])
    }



    return {
      pathPoints,
      finalIndex: odd[odd.length - 1]
    };
  }

  function prepareGrid(ctx, width, height) {
    const offset = pointsDistance / 2;
    const coords = [];

    for (let i = 0; i < (height * 2) - 1; i += 1) {
      const y = offset + i * offset;
      coords.push([]);
      const isOdd = i % 2;

      for (let j = 0; j < (isOdd ? width + 1 : width); j += 1) {
        let x = offset + j * pointsDistance;

        if (isOdd) {
          x = j * pointsDistance;

          if (j === 0) {
            x += coin.minRadius;
          }

          if (j === width) {
            x -= coin.minRadius;
          }
        }

        coords[i].push([x, y]);

        utils.drawCircle(ctx, [x, y], coin.minRadius, 'stroke');
      }
    }

    if (isDrawGrid) {
      drawGrid(ctx, width, height);
    }

    return coords;
  }

  function drawGrid(ctx, width, height) {
    for (let i = 1; i < height; i += 1) {
      ctx.moveTo(0, i * pointsDistance);
      ctx.lineTo(pointsDistance * width, i * pointsDistance);
      ctx.stroke();
    }

    for (let j = 0; j <= width; j += 1) {
      let kX = 0;

      if (j === 0) {
        kX = 1;
      } else if (j === width) {
        kX = -1;
      }

      ctx.moveTo((j * pointsDistance) + kX, 0);
      ctx.lineTo(j * pointsDistance, pointsDistance * height);
      ctx.stroke();
    }
  }

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
    utils.drawCircle(ctx, [coin.x, coin.y], coin.radius, 'fill', 'rgba(100, 50, 150, .8)');
  }

  function drawPathV0(ctx, grid, initialPoint, onGameFinish) {
    const { pathPoints, finalIndex } = getPathPointsV1(grid);
    let prevPoint = grid[0][initialPoint];

    if (ctx) {
      utils.drawCircle(ctx, prevPoint, coin.minRadius, 'fill');

      for (let i = 1; i < pathPoints.length; i += 1) {
        const point = pathPoints[i];

        ctx.beginPath();
        ctx.moveTo(prevPoint[0], prevPoint[1]);

        prevPoint = point;

        ctx.lineTo(point[0], point[1]);
        ctx.stroke();

        utils.drawCircle(ctx, point, coin.minRadius, 'fill');
      }
    }

    onGameFinish(finalIndex);
  }

  function drawPathV1(ctx, grid, width, height, onGameFinish) {
    const { pathPoints, finalIndex } = getPathPointsV1(grid);
    let frame;
    let lineCount = 1;
    let stepIndex = 1;

    function tick() {
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        utils.drawCircle(ctx, pathPoints[0], coin.minRadius, 'fill');

        for (let i = 0; i < lineCount; i += 1) {
          const startPoint = pathPoints[i];
          const nextPoint = pathPoints[i + 1];
          const isFinalLine = i === lineCount - 1;
          let kOffset = 0;

          if (isFinalLine) {
            kOffset = stepIndex % drawIterationStep;
            stepIndex += 1;
          }

          let finalPoint = nextPoint;

          if (kOffset) {
            finalPoint = [
              startPoint[0] + ((nextPoint[0] - startPoint[0]) / drawIterationStep) * kOffset,
              startPoint[1] + ((nextPoint[1] - startPoint[1]) / drawIterationStep) * kOffset,
            ];
          }

          ctx.beginPath();
          ctx.moveTo(startPoint[0], startPoint[1]);

          ctx.lineTo(finalPoint[0], finalPoint[1]);
          ctx.stroke();

          if (kOffset) {
            utils.drawCircle(ctx, finalPoint, coin.radius)

            changeCoinRadius();
          }

          if (!kOffset) {
            utils.drawCircle(ctx, finalPoint);

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

        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
  }

  function drawPathV2(ctx, grid, initialPoint, onGameFinish) {
    const { pathPoints, finalIndex } = getPathPointsV1(grid);
    let prevPoint = grid[0][initialPoint];

    if (ctx) {
      utils.drawCircle(ctx, prevPoint, coin.minRadius, 'fill');

      for (let i = 1; i < pathPoints.length; i += 1) {
        const point = pathPoints[i];

        ctx.beginPath();
        // ctx.setLineDash([10, 250]);
        // ctx.lineDashOffset = -250;
        ctx.moveTo(prevPoint[0], prevPoint[1]);

        ctx.bezierCurveTo(
          prevPoint[0],
          prevPoint[1],
          point[0],
          prevPoint[1] - pointsDistance,
          point[0],
          point[1]
        );
        ctx.stroke();

        utils.drawCircle(ctx, point, coin.minRadius, 'fill');
        prevPoint = point;
      }
    }

    onGameFinish(finalIndex);
  }

  function drawPathV3(ctx, grid, initialPoint, width, height, onGameFinish) {
    const { pathPoints, finalIndex } = getPathPointsV1(grid);
    let pointIndex = 1;
    let point = grid[0][initialPoint];
    coin = {
      x: point[0],
      y: point[1],
      speed: 0.03,
      t: 0,
      radius: coin.minRadius,
      maxRadius: coin.minRadius * 2,
      minRadius: coin.minRadius,
      radiusChangeDirection: 1,
    };
    bezierCoords = [
      { x: coin.x, y: coin.y },
      { x: point[0], y: point[1] },
      { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] - pointsDistance },
      { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] },
    ]
    let frame;

    function tick() {
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < pointIndex; i += 1) {
          utils.drawCircle(ctx, pathPoints[i], coin.minRadius, 'fill');
        }

        moveBallInBezierCurve(ctx);

        if (pointIndex === pathPoints.length - 1 && coin.t === 1) {
          utils.drawCircle(ctx, pathPoints[pointIndex], coin.minRadius, 'fill');
          utils.drawCircle(ctx, [coin.x, coin.y], coin.radius, 'fill', 'rgba(100, 50, 150, .8)');
          onGameFinish(finalIndex);
          window.cancelAnimationFrame(frame);

          return;
        }

        if (coin.t === 1) {
          coin.t = 0;
          utils.drawCircle(ctx, pathPoints[pointIndex], coin.minRadius, 'fill');
          pointIndex += 1;

          bezierCoords = [
            { x: coin.x, y: coin.y },
            { x: pathPoints[pointIndex - 1][0], y: pathPoints[pointIndex - 1][1] },
            { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] - pointsDistance },
            { x: pathPoints[pointIndex][0], y: pathPoints[pointIndex][1] },
          ]
        }

        changeCoinRadius();

        frame = window.requestAnimationFrame(tick);
      }
    }

    frame = window.requestAnimationFrame(tick);
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

    utils.iterateHTMLCollection(dropStart.children, utils.removeDisabledAttribute)
    utils.iterateHTMLCollection(dropEnd.children, utils.removeDisabledAttribute)

    if (bgCtx && pathCtx) {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      pathCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
      grid = prepareGrid(bgCtx, width, height);
    }
  }

  function startButtonListener(e) {
    if (state.initialPoint !== -1) {
      dropStart.children[state.initialPoint].classList.remove('active_variant_button');
    }
    state.initialPoint = Number(e.target.value);
    e.target.classList.add('active_variant_button');

    if (state.finalPoint !== -1 && state.initialPoint !== -1) {
      e.target.blur();
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
      e.target.blur();
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
    utils.iterateHTMLCollection(dropStart.children, utils.setDisabledAttribute);
    utils.iterateHTMLCollection(dropEnd.children, utils.setDisabledAttribute);

    switch (drawVersion) {
      case 0:
        drawPathV0(
          pathCtx,
          grid,
          state.initialPoint,
          onGameFinish,
        );
        break;

      case 1:
        drawPathV1(
          pathCtx,
          grid,
          pathCanvas.width,
          pathCanvas.height,
          onGameFinish,
        );
        break;

      case 2:
        drawPathV2(
          pathCtx,
          grid,
          state.initialPoint,
          onGameFinish,
        );
        break;

      case 3:
      default:
        drawPathV3(
          pathCtx,
          grid,
          state.initialPoint,
          pathCanvas.width,
          pathCanvas.height,
          onGameFinish,
        );
        break;
    }
  }

  const {
    playBoard,
    dropStart,
    dropEnd,
    confirmBtnFail,
    dialogFail,
    confirmBtnSuccess,
    dialogSuccess,
  } = getUIElements();
  const width = Math.min(
    Math.ceil(window.innerWidth / scaleCoefficient),
    maxColumns,
  );
  const height = Math.min(
    Math.ceil(window.innerHeight / scaleCoefficient),
    maxColumns,
  );

  const bgCanvas = utils.createCanvas(width, height, 'bg_canvas');
  const pathCanvas = utils.createCanvas(width, height, 'path_canvas');

  playBoard.appendChild(bgCanvas);
  playBoard.appendChild(pathCanvas);

  const bgCtx = bgCanvas.getContext("2d");
  const pathCtx = pathCanvas.getContext("2d");

  if (!bgCtx || !pathCtx) {
    throw new Error('Can\'t create CanvasRenderingContext2D!');
  }

  dropStart.parentElement.style.width = `${bgCanvas.offsetWidth}px`;
  dropEnd.parentElement.style.width = `${bgCanvas.offsetWidth}px`;

  let grid = prepareGrid(bgCtx, width, height);

  confirmBtnFail.addEventListener("click", (e) => closeDialog(e, 'fail'));

  confirmBtnSuccess.addEventListener("click", (e) => closeDialog(e, 'success'));

  dialogFail.addEventListener("close", () => retry());

  dialogSuccess.addEventListener("close", () => retry());


  for (let i = 0; i < width; i += 1) {
    createButton(i, dropStart);
    createButton(i, dropEnd, 'end');
  }
}

window.onload = () => {
  main();
}
