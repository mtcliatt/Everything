'use strict';

/* TODO:

  - Refactor setupIO

  - Add other number functionality stuff

  - Add color options


*/

// Color and thickness of the grid's lines
const gridColor = 'grey';
const gridThickness = 2;

const rectangleActiveColor = 'blue';
const rectangleInactiveColor = 'black';

// The number of rectangles in the grid
const numRectanglesWide = 106;
const numRectanglesHigh = 17;

// The total size of the grid lines
const totalVerticalLineSize = numRectanglesWide * gridThickness;
const totalHorizontalLineSize = numRectanglesHigh * gridThickness;

(function() {

  // This array will hold the states of each rectangle
  const grid = [];

  // The canvas DOM element and the context to use for drawing
  const canvas = document.getElementById('canvas');

  // If this function exists, the canvas can be used for drawing on
  if (!canvas.getContext) {
    console.log('This browser does not support the canvas element.');
    return;
  }

  // The canvas's context used for drawing
  const ctx = canvas.getContext('2d');

  // The width and height JS will use
  canvas.width = .75 * window.innerWidth;
  canvas.height = .4 * window.innerHeight;

  // The room for the rectangles is what is left over after the lines are drawn
  const rectangleWidth = (canvas.width - totalVerticalLineSize) / numRectanglesWide;
  const rectangleHeight = (canvas.height - totalHorizontalLineSize) / numRectanglesHigh;

  // Prevent the right-click menu from popping up
  canvas.oncontextmenu = e => e.preventDefault();

  // Draw the grid lines and initializes the array holding the state of the grid
  setupGrid();

  // Draws inactive rectangles on the grid
  clearGrid();

  // Sets up IO functions like reading a K value from a textarea, clicking to
  // turn on/off rectangles, etc
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

    // The space a single rectangle and border occupies
    const unitWidth = rectangleWidth + gridThickness;
    const unitHeight = rectangleHeight + gridThickness;

    // We need to take into account the extra border at the top/left sides
    // of the canvas, before performing the calculation
    const extraBorder = gridThickness / 2;

    // The grid counts rectangles starting at the bottom, but coordinates start
    // at the top, so the row needs to be inverted (0 -> max, max -> 0, etc.)
    const maxRow = numRectanglesHigh - 1;

    let column = Math.ceil(x / unitWidth - extraBorder);
    let row = maxRow - Math.ceil(y / unitHeight - extraBorder);

    column = clampValueBetween(column, 0, numRectanglesWide - 1);
    row = clampValueBetween(row, 0, numRectanglesHigh - 1);

    return {
      x: column,
      y: row
    };
  }

  // Turns on/off the rectangle at the given column and row
  function setRectangleState(column, row, newState) {
    grid[column][row] = newState;

    let color;

    if (newState) {
      color = rectangleActiveColor;
    }
    else {
      color = rectangleInactiveColor;
    }

    const {x, y} = rectangleToCoordinate(column, row);
    drawRectangle(x, y, color);
  }

  // Toggles the state of the rectangle at the given column and row
  function toggleRectangle(column, row) {
    setRectangleState(column, row, !grid[column][row]);
  }

  // Creates the array to hold the "cell's" states and draws the grid's lines
  function setupGrid() {

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
    };

    // Since we draw the lines on the left and top sides of each rectangle,
    // we need to use <= instead of < so that the last border is drawn

    // Draws vertical grid lines
    for (let i = 0; i <= numRectanglesWide; i++) {
      const x = i * rectangleWidth + i * gridThickness;
      drawLine(x, 0, x, canvas.height);
    }

    // Draws horizontal grid lines
    for (let i = 0; i <= numRectanglesHigh; i++) {
      const y = i * rectangleHeight + i * gridThickness;
      drawLine(0, y, canvas.width, y);
    }
  }

  // Calls setRectangleState on every rectangle to set them as inactive
  function clearGrid() {
    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        setRectangleState(i, j, false);
      }
    }
  }

  // Sets up IO functions like reading a K value from a textarea, clicking to
  // turn on/off rectangles, etc
  function setupIO() {
    const readInputButton = document.getElementById('readInputButton');
    const getOutputButton = document.getElementById('getOutputButton');
    const outputTextarea = document.getElementById('outputArea');
    const inputTextarea = document.getElementById('inputArea');
    const cleanInputButton = document.getElementById('cleanInputButton');
    const errorMessage = document.getElementById('errorMessage');

    let leftButtonDown = false;
    let rightButtonDown = false;

    const setButton = (button, isDown) => {
      if (button === 0) {
        leftButtonDown = isDown;
      } else if (button === 2) {
        rightButtonDown = isDown;
      }
    };

    // Instantiates clipboard.js so we can copy text
    const clipboard = new Clipboard('.btn-clipboard');

    clipboard.on('success', e => {
      console.log('Action: ' + e.action);
      console.log('Text: ' + e.text);
      console.log('Trigger: ' + e.trigger);
    });

    clipboard.on('error ', e => {
      console.log('Action: ', e.action);
      console.log('Trigger: ', e.trigger);
    });

    document.addEventListener('mousedown', evt => setButton(evt.button, true));
    document.addEventListener('mouseup', evt => setButton(evt.button, false));

    cleanInputButton.addEventListener('click', () => {
      let input = inputTextarea.value;

      // Replace any number of whitespace characters with nothing
      input = input.replace(/\s+/g, '');

      // Replace any number of non-numeric characters with nothing
      input = input.replace(/\D+/g, '');

      inputTextarea.value = input;
    });

    const getMouseCoordinate = evt => {
      const canvasRectangle = canvas.getBoundingClientRect();

      return {
        x: evt.clientX - canvasRectangle.left,
        y: evt.clientY - canvasRectangle.top
      };
    };

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
    };

    canvas.addEventListener('mousedown', evt => handleMouseAction(evt, true));
    canvas.addEventListener('mousemove', handleMouseAction);

    const showError = message => {
      errorMessage.innerHTML = 'Error: ' + message;
      errorMessage.style.visibility = 'visible';
    };

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
          setRectangleState(column, row, true);
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
