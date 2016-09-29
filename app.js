'use strict';

// Color and thickness of the grid's lines
const gridColor = 'grey';
const gridThickness = 2;

const rectangleActiveColor = 'green';
const rectangleInactiveColor = 'black';

// The number of rectangles in the grid
const numRectanglesWide = 106;
const numRectanglesHigh = 17;

// The total size of the grid lines
const totalVerticalLineSize = numRectanglesWide * gridThickness;
const totalHorizontalLineSize = numRectanglesHigh * gridThickness;

(function() {

  // The canvas DOM element and the context to use for drawing
  let canvas;
  let ctx;

  // This array will hold the states of each 'cell'
  let grid;

  // Before we start, make sure we can access and draw on the canvas
  checkAndInitCanvas();

  // The room for the rectangles is what is left over after the lines are drawn
  const rectangleWidth = (canvas.width - totalVerticalLineSize) / numRectanglesWide;
  const rectangleHeight = (canvas.height - totalHorizontalLineSize) / numRectanglesHigh;

  // Draw the grid lines and ..............................
  setupGrid();
  clearGrid();
  setupIO();

  // Helper function that returns value limited to the range of min-max
  function clampValueBetween(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Clears the canvas from (x, y) to (x + rectangleWidth, y + rectangleHeight)
  // and fills a rectangle there with the specified color
  function drawRectangle(x, y, color) {
    ctx.clearRect(x, y, rectangleWidth, rectangleHeight);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, rectangleWidth, rectangleHeight);
  }

  // Returns coord's of the bottom left corner of the rectangle at (column, row)
  function rectangleToCoordinate(column, row) {

   /*
    * Since the canvas element begins its coordinates in the top left corner and we count
    * rectangles starting from the bottom right, we need to some conversion.
    * We need 0 to be the max y coord, and the max y coord to be 0.
    *
    * In order to convert, we figure out the maximum possible value for the
    * y coordinate and subtract our y-coordinate value from that.
    *
    * We also have to take into account the top and left grid line which takes
    * up half the space of the normal grid lines.
    */

    // The max amount of vertical space rectangles and grid lines could take up
    // -1 because the coordinate of the rectangles begin at their top left
    const maxRectSpace = (numRectanglesHigh - 1) * rectangleHeight;
    const maxGridSpace = numRectanglesHigh * gridThickness;
    const maxy = maxRectSpace + maxGridSpace;

    // The actual amount of space, up to the column specified
    const rectSpaceHorizontal = column * rectangleWidth;
    const gridSpaceHorizontal = column * gridThickness + gridThickness / 2;

    // The actual amount of space, up to the row specified
    const rectSpaceVertical = row * rectangleHeight;
    const gridSpaceVertical = row * gridThickness + gridThickness / 2;

    const x = rectSpaceHorizontal + gridSpaceHorizontal;
    const y = maxy - (rectSpaceVertical + gridSpaceVertical);

    return { x, y };
  }

  // Returns the column and row of the rectangle intersected by (x, y)
  function coordinateToRectangle(x, y){
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

  // Turns on/off the rectangle at the given column and row
  function setRectangleState(column, row, newState) {
    grid[column][row] = newState;

    const color = newState ? rectangleActiveColor : rectangleInactiveColor;
    const {x, y} = rectangleToCoordinate(column, row);
    drawRectangle(x, y, color);
  }

  // Toggles the state of the rectangle at the given column and row
  function toggleRectangle(column, row) {
    setRectangleState(column, row, !grid[column][row]);
  }

  // Finds the canvas DOM element and uses the 2d context to draw on it
  function checkAndInitCanvas() {
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

  // Turns every rectangle off
  function clearGrid() {
    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        setRectangleState(i, j, false);
      }
    }
  }

  function setupIO() {
    const readInputButton = document.getElementById('readInputButton');
    const getOutputButton = document.getElementById('getOutputButton');
    const outputTextarea = document.getElementById('outputArea');
    const inputTextarea = document.getElementById('inputArea');
    const cleanInputButton = document.getElementById('cleanInputButton')
    const errorMessage = document.getElementById('errorMessage');

    let leftButtonDown = false;
    let rightButtonDown = false;

    const setButton = (button, isDown) => {
      if (button === 0) {
        leftButtonDown = isDown;
      } else if (button === 2) {
        rightButtonDown = isDown;
      }
    }

    document.addEventListener('mousedown', evt => setButton(evt.button, true));
    document.addEventListener('mouseup', evt => setButton(evt.button, false));

    cleanInputButton.addEventListener('click', () => {
      let input = inputTextarea.value;

      // Replace any number of whitespace characters with nothing
      input = input.replace(/\s+/g, '');

      // Replace any number of non-numeric characters with nothing
      input = input.replace(/\D+/g, '');

      // Insert a newline character after every 64th character
      input = input.replace(/(.{64})/g, '$1\n');
      inputTextarea.value = input;
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
        setRectangleState(rectx, recty, true);
      } else if (rightButtonDown) {
        setRectangleState(rectx, recty, false);
      } else if (isClick) {
        toggleRectangle(rectx, recty);
      }
    }

    canvas.addEventListener('mousedown', evt => handleMouseAction(evt, true));
    canvas.addEventListener('mousemove', handleMouseAction);

    const showError = message => {
      console.log('showing ' + message);
      errorMessage.innerHTML = 'Error: ' + message;
      errorMessage.style.visibility = 'visible';
    }

    const hideErrorMessage = () => errorMessage.style.visibility = 'hidden';

    const sn = SchemeNumber;
    const fn = sn.fn;
    const ns = fn['number->string'];

    const plotBinary = string => {
      clearGrid();

      for (let i = 0; i < string.length; i++) {
        let digit = string.charAt(string.length - i - 1);

        if (digit === '1') {
          const row = i % 17;
          const column = Math.floor(i / 17);
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

      plotString = fn['*'](plotString, sn('17'));
      outputTextarea.value = ns(plotString);
    });

    readInputButton.addEventListener('click', () => {
      hideErrorMessage();

      let inputString = inputTextarea.value;
      inputString = inputString.replace(/\s+/g, '');
      inputString = inputString.replace(/\D+/g, '');

      let inputNumber = fn['string->number'](inputString);
      let remainder = fn['mod'](inputNumber, sn('17'));

      if (!fn['='](remainder, sn('0'))) {
        showError('K is not divisible by 17');
        return;
      }

      inputNumber = fn['/'](inputNumber, sn('17'));
      let binaryNumber = ns(inputNumber, sn('2'));

      plotBinary(binaryNumber);

    });
  }

})();
