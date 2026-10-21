const assert = require("node:assert/strict");
const { calculateTargetPerformance } = require("../app-logic.js");

assert.deepEqual(calculateTargetPerformance(800, 1000), {
  percentage: 80,
  remaining: 200,
  achieved: false,
});
assert.deepEqual(calculateTargetPerformance(1200, 1000), {
  percentage: 120,
  remaining: 0,
  achieved: true,
});
assert.deepEqual(calculateTargetPerformance(0, 1000), {
  percentage: 0,
  remaining: 1000,
  achieved: false,
});
assert.equal(calculateTargetPerformance(100, 0), null);
assert.throws(() => calculateTargetPerformance(-1, 100), RangeError);

console.log("target performance tests passed");
