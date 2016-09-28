'use strict';


// Color and thickness of the grid's lines
const gridColor = 'grey';
const gridThickness = 2;

const rectangleActiveColor = 'white';
const rectangleInactiveColor = 'black';

// The number of rectangles in the grid
const numRectanglesWide = 106;
const numRectanglesHigh = 17;


(() => {

  // The canvas DOM element and the context to use for drawing
  let canvas;
  let ctx;
  setupCanvas();

  // The total size of the grid lines
  const totalVerticalLineSize = numRectanglesWide * gridThickness;
  const totalHorizontalLineSize = numRectanglesHigh * gridThickness;

  // The room for the rectangles is what is left over after the lines are drawn
  const rectangleWidth = (canvas.width - totalVerticalLineSize) / numRectanglesWide;
  const rectangleHeight = (canvas.height - totalHorizontalLineSize) / numRectanglesHigh;

  const drawRectangle = (x, y, color) => {
    //console.log(`about to draw on ${x}, ${y}`)
    ctx.clearRect(x, y, rectangleWidth, rectangleHeight);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, rectangleWidth, rectangleHeight);
  }

  const clampValueBetween = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  }

  const rectangleToCoordinate = (x, y) => {
    const maxy = numRectanglesHigh * rectangleHeight + numRectanglesHigh * gridThickness;
    const xcoord = x * rectangleWidth + x * gridThickness + gridThickness / 2;
    const ycoord =  maxy - ((y + 1) * rectangleHeight + y * gridThickness + gridThickness / 2);

    return {
      xcoord,
      ycoord
    };
  }

  const coordinateToRectangle = (x, y) => {
    let rectangleColumn = Math.ceil(x / (rectangleWidth + gridThickness) - gridThickness / 2);
    let rectangleRow = 16 - Math.ceil(y / (rectangleHeight + gridThickness) - gridThickness / 2);

    rectangleColumn = clampValueBetween(rectangleColumn, 0, numRectanglesWide - 1);
    rectangleRow = clampValueBetween(rectangleRow, 0, numRectanglesHigh - 1);

    //console.log(`c2r found (column, row) = (${rectangleColumn}, ${rectangleRow})`);

    return {
      x: rectangleColumn,
      y: rectangleRow
    };
  }

  // A closure to generate the activating and deactivating functions
  const setRectangleState = newState => {
    const color = newState ? rectangleActiveColor : rectangleInactiveColor;

    return (x, y) => {
      const {xcoord, ycoord} = rectangleToCoordinate(x, y);
      grid[x][y] = newState;
      drawRectangle(xcoord, ycoord, color);
    }
  }

  const activateRectangle = setRectangleState(true);
  const deactivateRectangle = setRectangleState(false);

  const toggleRectangle = (x, y) => {
    if (grid[x][y]) {
      deactivateRectangle(x, y);
    } else {
      activateRectangle(x, y);
    }
  }

  const clearGrid = () => {
    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        deactivateRectangle(i, j);
      }
    }
  }

  // This array will hold the states of each 'cell'
  let grid;
  setupGrid();
  clearGrid();

  // Finds the canvas DOM element and uses the 2d context to draw on it
  function setupCanvas() {
    canvas = document.getElementById('canvas');

    if (!canvas.getContext) {
      console.log('This browser does not support the canvas element.');
      return;
    }

    ctx = canvas.getContext('2d');

    canvas.width = .95 * window.innerWidth;
    canvas.height = .3 * window.innerHeight;
    canvas.oncontextmenu = e => e.preventDefault();

  }

  // Creates the array to hold the "cell's" states and draws the grid's lines
  function setupGrid() {
    grid = [];

    // Initialize the grid with all false values, i.e. the inactive state
    for (let i = 0; i < numRectanglesWide; i++) {
      grid.push([]);
      for (let j = 0; j < numRectanglesHigh; j++) {
        grid[i].push(false);
      }
    }

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridThickness;

    const drawLine = (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
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
  }

  setupIO();

  function setupIO() {
    let leftButtonDown = false;
    let rightButtonDown = false;

    document.addEventListener('mousedown', evt => {
      if (evt.button === 0) {
        leftButtonDown = true;
      } else if (evt.button === 2) {
        rightButtonDown = true;
      }
    });

    document.addEventListener('mouseup', evt => {
      if (evt.button === 0) {
        leftButtonDown = false;
      } else if (evt.button === 2) {
        rightButtonDown = false;
      }
    });

    const getMouseCoordinate = evt => {
      const canvasRectangle = canvas.getBoundingClientRect();

      return {
        x: evt.clientX - canvasRectangle.left,
        y: evt.clientY - canvasRectangle.top
      };
    }

    const handleMouseAction = (evt, isClick = false)  => {
      const {x: mousex, y: mousey} = getMouseCoordinate(evt);
      const {x: rectx, y: recty} = coordinateToRectangle(mousex, mousey);

      if (rectx < 0 || recty < 0 ||
          rectx > numRectanglesWide || recty > numRectanglesHigh) {
            return;
      }

      if (leftButtonDown) {
        activateRectangle(rectx, recty);
      } else if (rightButtonDown) {
        deactivateRectangle(rectx, recty);
      } else if (isClick) {
        toggleRectangle(rectx, recty);
      }
    }

    canvas.addEventListener('mousedown', evt => handleMouseAction(evt, true));
    canvas.addEventListener('mousemove', handleMouseAction);

    const readInputButton = document.getElementById('readInputButton');
    const getOutputButton = document.getElementById('getOutputButton');
    const outputTextarea = document.getElementById('outputArea');
    const inputTextarea = document.getElementById('inputArea');

    const sn = SchemeNumber;
    const fn = sn.fn;
    const ns = fn['number->string'];
    const multiply = fn['*'];
    const divide = fn['/'];

    const plotBinary = string => {
      clearGrid();

      console.log(`Plotting: ${string}`);

      for (let i = 0; i < string.length; i++) {
        let digit = string.charAt(string.length - i - 1);

        if (digit === '1') {

          const row = i % 17;
          const column = Math.floor(i / 17);

          console.log(`\tdigit ${i} => (${row}, ${column})`);

          activateRectangle(column, row);
        }
      }

    };

    getOutputButton.addEventListener('click', () => {
      let plotString = '#b';

      for (let i = numRectanglesWide - 1; i >= 0; i--) {
        for (let j = numRectanglesHigh - 1; j >= 0; j--) {
          plotString += grid[i][j] ? '1' : '0';
        }
      }
      //console.log(`Binary digits: ${plotString}`);

      plotString = multiply(plotString, sn('17'));
      outputTextarea.value = ns(plotString);
    });

    readInputButton.addEventListener('click', () => {
      let inputNumber = fn['string->number'](inputTextarea.value.trim());
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
  }

})();
