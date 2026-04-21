const { add, subtract, multiply, divide, power, factorial } = require('../src/calc');

test('add 1 + 2 = 3', () => {
  expect(add(1, 2)).toBe(3);
});

test('subtract 5 - 3 = 2', () => {
  expect(subtract(5, 3)).toBe(2);
});

test('subtract handles negatives', () => {
  expect(subtract(-2, -5)).toBe(3);
});

test('multiply 4 * 3 = 12', () => {
  expect(multiply(4, 3)).toBe(12);
});

test('multiply by zero', () => {
  expect(multiply(99, 0)).toBe(0);
});

test('divide 10 / 2 = 5', () => {
  expect(divide(10, 2)).toBe(5);
});

test('divide by zero throws', () => {
  expect(() => divide(1, 0)).toThrow('Division by zero');
});

test('power base^0 = 1', () => {
  expect(power(7, 0)).toBe(1);
});

test('power negative exponent', () => {
  expect(power(2, -3)).toBeCloseTo(0.125);
});

test('power positive exponent', () => {
  expect(power(3, 4)).toBe(81);
});

test('factorial 0 = 1', () => {
  expect(factorial(0)).toBe(1);
});

test('factorial 5 = 120', () => {
  expect(factorial(5)).toBe(120);
});

test('factorial negative throws', () => {
  expect(() => factorial(-1)).toThrow('Negative factorial');
});
