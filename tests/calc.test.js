const { add, subtract, multiply, divide } = require('../src/calc');

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
