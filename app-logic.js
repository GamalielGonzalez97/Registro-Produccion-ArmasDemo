(function (global) {
  const defectOptions = [
    { value: "sin-defecto", label: "Sin defecto" },
    { value: "desalineacion", label: "Desalineación" },
    { value: "rayado", label: "Rayado" },
    { value: "soldadura", label: "Soldadura" },
    { value: "material", label: "Material defectuoso" },
    { value: "operacion", label: "Ajuste de operación" },
  ];

  const defaultDefectType = defectOptions[0].value;

  function getDefectLabel(type) {
    return (
      defectOptions.find((option) => option.value === type)?.label ||
      defectOptions[0].label
    );
  }

  function calculateJourneySummary(entries = {}) {
    const totals = Object.values(entries).reduce(
      (result, entry) => {
        if (!entry || typeof entry !== "object") {
          return result;
        }
        result.good += Number(entry.good) || 0;
        result.scrap += Number(entry.scrap) || 0;
        return result;
      },
      { good: 0, scrap: 0 },
    );

    const total = totals.good + totals.scrap;
    const scrapRate = total === 0 ? 0 : (totals.scrap / total) * 100;

    return {
      good: totals.good,
      scrap: totals.scrap,
      total,
      scrapRate: Number(scrapRate.toFixed(1)),
    };
  }

  function calculateDefectBreakdown(entries = {}) {
    const defectCounts = {};
    Object.values(entries).forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }
      const scrap = Number(entry.scrap) || 0;
      if (scrap <= 0) {
        return;
      }
      const defectType = defectOptions.some(
        (option) => option.value === entry.defectType,
      )
        ? entry.defectType
        : defaultDefectType;
      defectCounts[defectType] = (defectCounts[defectType] || 0) + scrap;
    });

    const totalScrap = Object.values(defectCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return defectOptions
      .filter((option) => defectCounts[option.value])
      .map((option) => ({
        value: option.value,
        label: option.label,
        count: defectCounts[option.value],
        share:
          totalScrap === 0
            ? 0
            : Number(((defectCounts[option.value] / totalScrap) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);
  }

  const api = {
    defectOptions,
    defaultDefectType,
    getDefectLabel,
    calculateJourneySummary,
    calculateDefectBreakdown,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.productionCalculations = api;
})(typeof window !== "undefined" ? window : globalThis);
