function randInt(max = 10, min = 1) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function easyExpression() {
  const operators = ["+", "-", "*"];
  const maxCoeff = 10;

  // Choose a random operator based on difficulty
  const operation = operators[Math.floor(Math.random() * operators.length)];

  // Generate random coefficients
  const coeff1 = randInt(maxCoeff);
  const coeff2 = randInt(maxCoeff + coeff1, coeff1);

  let expression = `${coeff2} ${operation} ${coeff1}`;
  return expression;
}

function mediumExpression() {
  const operators = ["-", "*", "/", "^"];
  const maxCoeff = 20;

  // Choose a random operator based on difficulty
  const operation = operators[Math.floor(Math.random() * operators.length)];

  // Generate random coefficients
  let coeff1 = randInt(maxCoeff);
  let coeff2 = randInt(maxCoeff + coeff1, coeff1);

  switch (operation) {
    case "-":
      coeff1 = Math.random() < 0.5 ? -coeff1 : coeff1;
      break;
    case "/":
      coeff2 = Math.floor(Math.random() * 10) * coeff1;
      break;
    case "^":
      coeff2 = coeff1;
      coeff1 = 2;
      break;
  }

  let expression = `${coeff2} ${operation} ${coeff1}`;
  return expression;
}

function hardEquation() {
  const operators = ["+", "-", "/"];
  const maxCoeff = 5;

  // Choose a random operator based on difficulty
  const operation = operators[Math.floor(Math.random() * operators.length)];

  // Generate random coefficients
  let coeff1 = randInt(maxCoeff);
  let coeff2 = randInt(maxCoeff + coeff1, coeff1);

  switch (operation) {
    case "-":
      coeff1 = Math.random() < 0.5 ? -coeff1 : coeff1;
      break;
    case "/":
      coeff2 = Math.floor(1 + Math.random() * 3) * coeff1;
      break;
    case "^":
      coeff2 = coeff1;
      coeff1 = 2;
      break;
  }

  let expression = `${coeff2}*x ${operation} ${coeff1}`;
  return expression;
}

function generateExpression(difficulty = "easy") {
  let exp = null;

  switch (difficulty) {
    case "easy":
      exp = easyExpression();
      break;
    case "medium":
      exp = mediumExpression();
      break;
    case "difficult":
      exp = hardExpression();
      break;
  }
  return exp;
}

// export { generateExpression };
