function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

function power(base, exp) {
  if (exp === 0) return 1;
  if (exp < 0) return 1 / power(base, -exp);
  let result = 1;
  for (let i = 0; i < exp; i++) result *= base;
  return result;
}

function factorial(n) {
  if (n < 0) throw new Error('Negative factorial');
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

module.exports = { add, subtract, multiply, divide, power, factorial, isPrime };
