import { Parser } from "expr-eval";

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOperator() {
  const operators = ["+", "-", "*", "/"];
  return operators[randomNumber(0, operators.length - 1)];
}

export function generateMathQuestion(): { question: string; answer: number } {
  const howManyNumbers = randomNumber(2, 4);
  const howManyOperators = howManyNumbers - 1;

  const question = Array.from(
    { length: howManyNumbers + howManyOperators },
    (_, index) => {
      return index % 2 === 0 ? randomNumber(1, 9) : randomOperator();
    }
  ).join(" ");

  // dumb and fast, no type safety, no security, no checks
  const parser = new Parser();
  const answer = parser.parse(question).evaluate();

  return { question, answer: answer };
}
