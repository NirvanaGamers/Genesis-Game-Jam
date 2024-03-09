import {generateExpression} from "./expression.js"


function genEasyGrid() {
  let grid = [];
  for (let i = 0; i < 3; i++) {
    grid.push(generateExpression("easy"));
  }

  return grid;
}

function genMediumGrid() {
  let grid = [];
  for (let i = 0; i < 6; i++) {
    grid.push(generateExpression("medium"));
  }

  return grid;
}

function genHardGrid() {
  let grid = [];
  for (let i = 0; i < 9; i++) {
    grid.push(generateExpression("hard"));
  }

  return grid;
}

function generateGrid(difficulty = "easy") {
  let grid = [];

  switch (difficulty) {
    case "easy":
      grid = genEasyGrid();
      break;
    case "medium":
      grid = genMediumGrid();
      break;
    case "difficult":
      grid = genDifficultGrid();
      break;
  }

  return grid
}

export { generateGrid };
