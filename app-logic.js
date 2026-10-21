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
  const downtimeReasons = [
    { value: "maquinaria", label: "Falla de maquinaria" },
    { value: "material", label: "Falta de material" },
    { value: "ajuste", label: "Ajuste o calibración" },
    { value: "calidad", label: "Problema de calidad" },
    { value: "cambio-modelo", label: "Cambio de modelo" },
    { value: "personal", label: "Falta de personal" },
    { value: "seguridad", label: "Seguridad" },
    { value: "otro", label: "Otro" },
  ];

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

  function calculateTargetPerformance(good, target) {
    if (!Number.isSafeInteger(good) || good < 0) {
      throw new RangeError("La producción buena debe ser un entero no negativo.");
    }
    if (!Number.isSafeInteger(target) || target <= 0) return null;

    return {
      percentage: Number(((good / target) * 100).toFixed(1)),
      remaining: Math.max(target - good, 0),
      achieved: good >= target,
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

  function calculateDowntimeMinutes(startTime, endTime) {
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(startTime) || !timePattern.test(endTime)) return null;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const duration = (end - start + 1440) % 1440;
    return duration > 0 ? duration : null;
  }

  function calculateDowntimeSummary(stoppages = []) {
    const reasons = {};
    let count = 0;
    let totalMinutes = 0;

    stoppages.forEach((stoppage) => {
      if (!stoppage || typeof stoppage !== "object") return;
      const duration = calculateDowntimeMinutes(
        stoppage.startTime,
        stoppage.endTime,
      );
      if (duration === null) return;

      const reason = downtimeReasons.some(
        (option) => option.value === stoppage.reason,
      )
        ? stoppage.reason
        : "otro";
      count += 1;
      totalMinutes += duration;
      reasons[reason] = (reasons[reason] || 0) + duration;
    });

    return {
      count,
      totalMinutes,
      byReason: Object.entries(reasons)
        .map(([value, minutes]) => ({
          value,
          label: downtimeReasons.find((option) => option.value === value).label,
          minutes,
        }))
        .sort((a, b) => b.minutes - a.minutes),
    };
  }

  const api = {
    defectOptions,
    defaultDefectType,
    downtimeReasons,
    getDefectLabel,
    calculateJourneySummary,
    calculateTargetPerformance,
    calculateDefectBreakdown,
    calculateDowntimeMinutes,
    calculateDowntimeSummary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.productionCalculations = api;
})(typeof window !== "undefined" ? window : globalThis);
