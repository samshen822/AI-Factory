const { add, subtract } = require('../src/calc');

test('add 1 + 2 = 3', () => {
  expect(add(1, 2)).toBe(3);
});

test('subtract 5 - 3 = 2', () => {
  expect(subtract(5, 3)).toBe(2);
});

test('subtract handles negatives', () => {
  expect(subtract(-2, -5)).toBe(3);
});
