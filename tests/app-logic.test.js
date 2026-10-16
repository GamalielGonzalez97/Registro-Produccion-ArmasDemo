const assert = require("node:assert/strict");
const { calculateJourneySummary, calculateDefectBreakdown } = require("../app-logic.js");

const entries = {
  0: { good: 120, scrap: 10, defectType: "desalineacion" },
  1: { good: 90, scrap: 12, defectType: "rayado" },
  2: { good: 110, scrap: 0, defectType: "sin-defecto" },
  3: { good: 100, scrap: 20, defectType: "material" },
  4: { good: 150, scrap: 5, defectType: "soldadura" },
};

const summary = calculateJourneySummary(entries);
assert.equal(summary.good, 570);
assert.equal(summary.scrap, 47);
assert.equal(summary.total, 617);
assert.equal(summary.scrapRate, 7.6);

const defectBreakdown = calculateDefectBreakdown(entries);
assert.equal(defectBreakdown[0].label, "Material defectuoso");
assert.equal(defectBreakdown[0].count, 20);
assert.equal(defectBreakdown[0].share, 42.6);
assert.equal(defectBreakdown[1].label, "Rayado");
assert.equal(defectBreakdown[1].count, 12);
assert.equal(defectBreakdown[1].share, 25.5);
assert.equal(
  defectBreakdown.find((item) => item.label === "Desalineación")?.count,
  10,
);

console.log("app-logic tests passed");
