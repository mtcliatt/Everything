'use strict';


// Color and thickness of the grid's lines
const gridColor = 'grey';
const gridThickness = 2;

const rectangleActiveColor = 'white';
const rectangleInactiveColor = 'black';

// The number of rectangles in the grid
const numRectanglesWide = 106;
const numRectanglesHigh = 17;

// The total size of the grid lines
const verticalLineSize = numRectanglesWide * gridThickness;
const horizontalLineSize = numRectanglesHigh * gridThickness;

(() => {

  // Find the canvas, use the 2d context to draw on it
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  canvas.oncontextmenu = e => e.preventDefault();

  // .9 and .4 were chosen so the grid wasn't too stretched out
  canvas.width = .95 * window.innerWidth;
  canvas.height = .3 * window.innerHeight;

  // The room left for the rectangles is the canvas size excluding the room
  // needed to draw the grid lines.
  const rectangleWidth = (canvas.width - verticalLineSize) / numRectanglesWide;
  const rectangleHeight = (canvas.height - horizontalLineSize) / numRectanglesHigh;

  const grid = [];

  // Initialize the grid with all false values, i.e. the inactive state
  for (let i = 0; i < numRectanglesWide; i++) {
    grid.push([]);
    for (let j = 0; j < numRectanglesHigh; j++) {
      grid[i].push(false);
    }
  }

  // TODO: Make these functions
  const rectangleToCoordinate = (x, y) => {

  }

  const coordinateToRectangle = (x, y) => {

  }

  const drawLine = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const drawRectangle = (x, y, color) => {
    ctx.clearRect(x, y, rectangleWidth, rectangleHeight);

    const rectangle = new Path2D();
    rectangle.rect(x, y, rectangleWidth, rectangleHeight);
    ctx.fillStyle = color;
    ctx.fill(rectangle);
  }

  const drawGrid = (() => {
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;

    // Since we draw the lines on the left and top sides of each rectangle,
    // we need to use <= instead of < so that the last border is drawn
    for (let i = 0; i <= numRectanglesWide; i++) {
      const x = i * rectangleWidth + i * gridThickness;
      drawLine(x, 0, x, canvas.height);
    }

    for (let i = 0; i <= numRectanglesHigh; i++) {
      const y = i * rectangleHeight + i * gridThickness;
      drawLine(0, y, canvas.width, y);
    }

    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        const x = i * rectangleWidth + i * gridThickness + 1;
        const y = j * rectangleHeight + j * gridThickness + 1;
        drawRectangle(x, y, rectangleInactiveColor);
      }
    }
  })();


  const changeRectangle = newState => {

    const color = newState ? rectangleActiveColor : rectangleInactiveColor;

    return (x, y) => {
      const xcoord = x * rectangleWidth + x * gridThickness + gridThickness / 2;
      const ycoord = y * rectangleHeight + y * gridThickness + gridThickness / 2;

      grid[x][y] = newState;
      drawRectangle(xcoord, ycoord, color);
    }

  }

  const activateRectangle = changeRectangle(true);
  const deactivateRectangle = changeRectangle(false);

  const toggleRectangle = (x, y) => {

    if (grid[x][y]) {
      deactivateRectangle(x, y);
    } else {
      activateRectangle(x, y);
    }

  }

  let leftButtonDown = false;
  let rightButtonDown = false;

  document.addEventListener('mousedown', evt => {
    if (evt.button == 0) {
      leftButtonDown = true;
    } else if (evt.button == 2) {
      rightButtonDown = true;
    }
  });

  document.addEventListener('mouseup', evt => {
    if (evt.button == 0) {
      leftButtonDown = false;
    } else if (evt.button == 2) {
      rightButtonDown = false;
    }
  });

  // When a rectangle is clicked, toggle its state (active or not active)
  canvas.addEventListener('click', evt => {

    // Get the position of the mouse, relative to the top left of the canvas
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;

    const rx = Math.ceil(x / (rectangleWidth + gridThickness) - gridThickness / 2);
    const ry = Math.ceil(y / (rectangleHeight + gridThickness) - gridThickness / 2);

    toggleRectangle(rx, ry);

  });

  canvas.addEventListener('mousemove', (evt) => {
    const rect = canvas.getBoundingClientRect();

    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    const rx = Math.ceil(x / (rectangleWidth + gridThickness) - gridThickness / 2);
    const ry = Math.ceil(y / (rectangleHeight + gridThickness) - gridThickness / 2);

    if (leftButtonDown && !grid[rx][ry]) {
      activateRectangle(rx, ry);
    } else if (rightButtonDown && grid[rx][ry]) {
      deactivateRectangle(rx, ry);
    }
  });

  const plotBinary = string => {

    console.log('about to plot: ' + string);

    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        deactivateRectangle(i, j);
      }
    }

    let column = 0;
    let row = 0;

    for (let i = string.length - 1; i >= 0; i--) {
      let digit = string.charAt(i);
      //console.log('Digit #' + i + ' is ' + digit);
      //console.log('At row ' + row + ', column ' + column);

      if (digit === '1') {
        activateRectangle(105 - column, row);
      }

      row++;
      if (row % 17 == 0) {
        row = 0;
        column++;
      }
    }

    console.log('done');

  };

  const readInputButton = document.getElementById('readInputButton');
  const getOutputButton = document.getElementById('getOutputButton');
  const outputTextarea = document.getElementById('outputArea');
  const inputTextarea = document.getElementById('inputArea');

  outputTextarea.innerHTML = '';
  inputTextarea.innerHTML = '';

  const sn = SchemeNumber;
  const fn = sn.fn;
  const ns = fn['number->string'];
  const multiply = fn['*'];
  const divide = fn['/'];

  getOutputButton.addEventListener('click', () => {
    let plotString = '#b';

    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = numRectanglesHigh - 1; j >= 0; j--) {
        plotString += grid[i][j] ? '1' : '0';
      }
    }

    plotString = multiply(plotString, sn('17'));
    outputTextarea.value = ns(plotString);
  });

  readInputButton.addEventListener('click', () => {
    let inputNumber = fn['string->number'](inputTextarea.value);
    let remainder = fn['mod'](inputNumber, sn('17'));

    if (!fn['='](remainder, sn('0'))) {
      console.log('Not divisible by 17!');
      return;
    }

    inputNumber = divide(inputNumber, sn('17'));

    let binaryNumber = ns(inputNumber, sn('2'));

    //console.log(ns(inputNumber));
    //console.log(ns(binaryNumber));

    plotBinary(binaryNumber);

  });

})();
