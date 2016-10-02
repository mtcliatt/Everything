'use strict';

/* TODO:

  - Add other number functionality stuff

  - Add color options

  - Add error message for bad number input

  - Add option to reverse number

  - Make function to go from string to binary number (with argument for reversing)

  - Make it so the plot functions gets the coords and draws, not passes to drawRect

  - Make clipboard success notification

  - Add option to reverse number
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
  function setAndPlotRectangle(column, row, newState) {
    grid[column][row] = newState;
    plotRectangle(column, row);
  }

  // Flips the state of and plots the rect at (column, row)
  function toggleRectangle(column, row) {
    setAndPlotRectangle(column, row, !grid[column][row]);
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

  // Calls setAndPlotRectangle on every rectangle to set them as inactive
  function clearGrid() {
    for (let i = 0; i < numRectanglesWide; i++) {
      for (let j = 0; j < numRectanglesHigh; j++) {
        setAndPlotRectangle(i, j, false);
      }
    }
  }

  function plotRectangle(column, row) {
    const {x, y} = rectangleToCoordinate(column, row);
    let color = grid[column][row] ? rectangleActiveColor : rectangleInactiveColor;

    drawRectangle(x, y, color);
  }

  // Plots rectangles based on the states in the grid array
  function plotGrid() {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        plotRectangle(i, j);
      }
    }
  }

  function setGridFromBinary(binaryString) {
    clearGrid();

    for (let i = 0; i < binaryString.length; i++) {
      let digit = binaryString.charAt(binaryString.length - i - 1);

      const row = i % 17;
      const column = Math.floor(i / 17);

      // If the digit is a 1, set the rectangle to true and to false otherwise
      grid[column][row] = digit === '1';
    }
  }

  // Sets up IO functions like reading a K value from the input textarea,
  // mouse actions to turn on/off rectangles, showing errors, etc.
  function setupIO() {

    // The DOM elements interacted with
    const readInputButton = document.getElementById('readInputButton');
    const getOutputButton = document.getElementById('getOutputButton');
    const outputTextarea = document.getElementById('outputArea');
    const inputTextarea = document.getElementById('inputArea');
    const cleanInputButton = document.getElementById('cleanInputButton');
    const errorMessage = document.getElementById('errorMessage');

    // Needed to handle large numbers
    const sn = SchemeNumber;

    // Shows the error alert with the given message
    const showError = message => {
      errorMessage.innerHTML = 'Error: ' + message;
      errorMessage.style.visibility = 'visible';
    };

    // Hides the error alert
    const hideErrorMessage = () => errorMessage.style.visibility = 'hidden';

    // Used to clean user's input
    const cleanString = string => string.replace(/\D+/g, '');

    // Uses the bounding rectangle of the canvas to determine the location
    // of the mouse relative to the upper left corner of the canvas
    const getMouseCoordinate = evt => {
      const canvasRectangle = canvas.getBoundingClientRect();

      return {
        x: evt.clientX - canvasRectangle.left,
        y: evt.clientY - canvasRectangle.top
      };
    };

    // Instantiates clipboard.js so we can copy text
    const clipboard = new Clipboard('.btn-clipboard');

    // Used to determine if the user is drawing when they move the mouse
    let leftButtonDown = false;
    let rightButtonDown = false;

    // If button === 0, sets leftButtonDown to isDown,
    // else if button === 2 sets rightButton to isDown
    const setButtonDown = (button, isDown) => {
      if (button === 0) {
        leftButtonDown = isDown;
      } else if (button === 2) {
        rightButtonDown = isDown;
      }
    };

    // When a mouse button is clicked, set the state of that button
    document.addEventListener('mousedown', evt => setButtonDown(evt.button, true));
    document.addEventListener('mouseup', evt => setButtonDown(evt.button, false));

    // When the clean input button is pressed, remove any non-numerics from it
    cleanInputButton.addEventListener('click', () => {
      inputTextarea.value = cleanString(inputTextarea.value);
    });

    // When a button is pressed or the mouse moves, determine if any
    // rectangles should be updated
    const handleMouseAction = (evt, isClick = false)  => {
      const {x: mousex, y: mousey} = getMouseCoordinate(evt);
      const {x: rectx, y: recty} = coordinateToRectangle(mousex, mousey);

      if (rectx < 0 || recty < 0 ||
          rectx > numRectanglesWide || recty > numRectanglesHigh) {
            return;
      }

      if (leftButtonDown) {
        setAndPlotRectangle(rectx, recty, true);
      } else if (rightButtonDown) {
        setAndPlotRectangle(rectx, recty, false);
      } else if (isClick) {
        toggleRectangle(rectx, recty);
      }
    };

    canvas.addEventListener('mousedown', evt => handleMouseAction(evt, true));
    canvas.addEventListener('mousemove', handleMouseAction);

    getOutputButton.addEventListener('click', () => {
      let plotString = '#b';

      for (let i = numRectanglesWide - 1; i >= 0; i--) {
        for (let j = numRectanglesHigh - 1; j >= 0; j--) {
          plotString += grid[i][j] ? '1' : '0';
        }
      }

      // Multiply result by 17
      plotString = sn.fn['*'](plotString, sn('17'));

      // Convert to string before plugging in textarea
      outputTextarea.value = sn.fn['number->string'](plotString);
    });

    readInputButton.addEventListener('click', () => {
      hideErrorMessage();

      // Remove any non-numeric characters
      const inputString = inputTextarea.value.replace(/\D+/g, '');

      let inputNumber = sn.fn['string->number'](inputString);

      if (!inputNumber) {
        showError('Not a valid number, maybe use the input clean up button?');
        return;
      }

      // K must be divisible by 17
      let remainder = sn.fn['mod'](inputNumber, sn('17'));

      // If K is not divisible by 17 show an error
      if (!sn.fn['='](remainder, sn('0'))) {
        showError('K is not divisible by 17');
        return;
      }

      // Divide the input by 17
      inputNumber = sn.fn['/'](inputNumber, sn('17'));

      // Convert the input into binary
      let binaryNumber = sn.fn['number->string'](inputNumber, sn('2'));

      // Use the new binary number to set the state of each rectangle
      setGridFromBinary(binaryNumber);

      // Plot the state of each rectangle
      plotGrid();
    });

    // To plot the formula that is plugged into the field by default
    readInputButton.click();
  }
})();
