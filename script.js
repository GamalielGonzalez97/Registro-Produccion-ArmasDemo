const shiftDefinitions = {
  manana: { label: "Mañana", start: 7 },
  tarde: { label: "Tarde", start: 15 },
  noche: { label: "Noche", start: 23 },
};

const defectOptions = [
  { value: "sin-defecto", label: "Sin defecto" },
  { value: "desalineacion", label: "Desalineación" },
  { value: "rayado", label: "Rayado" },
  { value: "soldadura", label: "Soldadura" },
  { value: "material", label: "Material defectuoso" },
  { value: "operacion", label: "Ajuste de operación" },
];
const defaultDefectType = defectOptions[0].value;

const storageKey = "control-produccion-jornadas-v1";
const downtimeStorageKey = "control-produccion-paros-v1";
const rowsElement = document.querySelector("#hour-rows");
const lineSelect = document.querySelector("#line-select");
const shiftSelect = document.querySelector("#shift-select");
const dateElement = document.querySelector("#journey-date");
const dialog = document.querySelector("#confirm-dialog");
const downtimeForm = document.querySelector("#downtime-form");
const downtimeList = document.querySelector("#downtime-list");
let editingHour = null;
let journeys = loadJourneys();
let downtimeByJourney = loadDowntimeRecords();
let activeLine = lineSelect.value;
let activeShift = shiftSelect.value;
let activeDate = getJourneyDate(activeShift);

function loadJourneys() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
}

function loadDowntimeRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(downtimeStorageKey) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
}

function getJourneyDate(shift, now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (shift === "noche" && now.getHours() < 7) date.setDate(date.getDate() - 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getJourneyKey() {
  const journeyKey = `${activeDate}:${activeShift}`;
  return activeLine === "linea-01" ? journeyKey : `${journeyKey}:${activeLine}`;
}

function getEntries() {
  return journeys[getJourneyKey()] || {};
}

function saveJourneys() {
  localStorage.setItem(storageKey, JSON.stringify(journeys));
}

function getDowntimeRecords() {
  const records = downtimeByJourney[getJourneyKey()];
  return Array.isArray(records) ? records : [];
}

function saveDowntimeRecords() {
  localStorage.setItem(downtimeStorageKey, JSON.stringify(downtimeByJourney));
}

function formatTime(hour) {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function getTimeRange(hourIndex) {
  const start = shiftDefinitions[activeShift].start + hourIndex;
  return {
    start: formatTime(start),
    end: formatTime(start + 1),
    nextDay: start + 1 >= 24,
  };
}

function getDefectLabel(type) {
  return (
    defectOptions.find((option) => option.value === type)?.label ||
    defectOptions[0].label
  );
}

function renderAnalysis(entries) {
  const summary = productionCalculations.calculateJourneySummary(entries);
  const defectBreakdown = productionCalculations.calculateDefectBreakdown(entries);
  const defectList = document.querySelector("#defect-list");
  const hourBandList = document.querySelector("#hour-band-list");
  const highlight = document.querySelector("#turno-highlight");

  if (!defectBreakdown.length) {
    defectList.innerHTML = '<li class="empty-state">Sin scrap registrado</li>';
    highlight.textContent = summary.total > 0
      ? `Calidad estable en ${summary.total.toLocaleString("es")} piezas registradas.`
      : "Sin producción registrada";
    hourBandList.innerHTML = Array.from({ length: 8 }, (_, index) => {
      const entry = entries[index];
      const total = entry ? entry.good + entry.scrap : 0;
      return `
        <div class="hour-band-item">
          <div class="hour-band-meta">
            <span>H${String(index + 1).padStart(2, "0")}</span>
            <strong>${total.toLocaleString("es")}</strong>
          </div>
          <div class="hour-bar-track"><span style="width: ${Math.min((total / 200) * 100, 100)}%"></span></div>
        </div>
      `;
    }).join("");
    return;
  }

  const maxDefectCount = Math.max(...defectBreakdown.map((item) => item.count));
  defectList.innerHTML = defectBreakdown
    .slice(0, 4)
    .map(
      (item) => `
        <li>
          <div class="defect-row">
            <span>${item.label}</span>
            <strong>${item.count.toLocaleString("es")}</strong>
          </div>
          <div class="defect-bar-track"><span style="width: ${Math.max((item.count / maxDefectCount) * 100, 12)}%"></span></div>
          <small>${item.share}% del scrap</small>
        </li>
      `,
    )
    .join("");

  const strongestHour = Array.from({ length: 8 }, (_, index) => {
    const entry = entries[index];
    if (!entry) return null;
    const total = entry.good + entry.scrap;
    const qualityRate = total === 0 ? 0 : (entry.good / total) * 100;
    return { index, qualityRate, total };
  })
    .filter(Boolean)
    .sort((a, b) => b.qualityRate - a.qualityRate)[0];

  if (strongestHour) {
    highlight.textContent = `Máxima calidad en H${String(strongestHour.index + 1).padStart(2, "0")}: ${Math.round(strongestHour.qualityRate)}% conformes.`;
  } else {
    highlight.textContent = `Calidad estable en ${summary.total.toLocaleString("es")} piezas registradas.`;
  }

  hourBandList.innerHTML = Array.from({ length: 8 }, (_, index) => {
    const entry = entries[index];
    const total = entry ? entry.good + entry.scrap : 0;
    const ratio = Math.min((total / 220) * 100, 100);
    const defectCount = entry ? entry.scrap : 0;
    return `
      <div class="hour-band-item">
        <div class="hour-band-meta">
          <span>H${String(index + 1).padStart(2, "0")}</span>
          <strong>${total.toLocaleString("es")}</strong>
        </div>
        <div class="hour-bar-track"><span style="width: ${ratio}%"></span></div>
        <small>${defectCount} scrap</small>
      </div>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

function renderDowntime() {
  const records = getDowntimeRecords();
  const summary = productionCalculations.calculateDowntimeSummary(records);
  document.querySelector("#downtime-total").textContent =
    formatDuration(summary.totalMinutes);
  document.querySelector("#downtime-count").textContent =
    `${summary.count} ${summary.count === 1 ? "evento" : "eventos"}`;
  const causeSummary = document.querySelector("#downtime-cause-summary");
  causeSummary.innerHTML = summary.byReason
    .map(
      (item) => `
        <span class="downtime-cause-item">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${formatDuration(item.minutes)}</span>
        </span>
      `,
    )
    .join("");
  causeSummary.hidden = summary.byReason.length === 0;

  if (!records.length) {
    downtimeList.innerHTML = '<li class="empty-state">Sin paros registrados</li>';
    return;
  }

  downtimeList.innerHTML = records
    .map((record) => {
      const duration = productionCalculations.calculateDowntimeMinutes(
        record.startTime,
        record.endTime,
      );
      if (duration === null) return "";
      const reason = productionCalculations.downtimeReasons.find(
        (option) => option.value === record.reason,
      )?.label || "Otro";
      const additionalInfo = [record.responsible, record.details]
        .filter(Boolean)
        .map(escapeHtml)
        .join(" · ");
      return `
        <li class="downtime-item">
          <div class="downtime-interval">
            <strong>${escapeHtml(record.startTime)}–${escapeHtml(record.endTime)}</strong>
            <span>${formatDuration(duration)}</span>
          </div>
          <div class="downtime-description">
            <strong>${escapeHtml(reason)}</strong>
            ${additionalInfo ? `<small>${additionalInfo}</small>` : ""}
          </div>
          <button class="icon-button delete" type="button" data-downtime-action="delete" data-id="${escapeHtml(record.id)}" aria-label="Eliminar paro ${escapeHtml(record.startTime)} a ${escapeHtml(record.endTime)}" title="Eliminar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
          </button>
        </li>
      `;
    })
    .join("");
}

function render() {
  const shift = shiftDefinitions[activeShift];
  const entries = getEntries();
  document.querySelector("#active-line-label").textContent =
    lineSelect.selectedOptions[0].text.toUpperCase();
  const [year, month, day] = activeDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  dateElement.dateTime = activeDate;
  dateElement.textContent = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  document.querySelector("#shift-caption").innerHTML =
    `8 franjas horarias <span>·</span> ${formatTime(shift.start)}–${formatTime(shift.start + 8)}`;
  rowsElement.innerHTML = Array.from({ length: 8 }, (_, index) =>
    renderRow(index, entries[index]),
  ).join("");

  const totals = Object.values(entries).reduce(
    (result, entry) => {
      result.good += entry.good;
      result.scrap += entry.scrap;
      return result;
    },
    { good: 0, scrap: 0 },
  );
  const produced = totals.good + totals.scrap;
  const scrapRate = produced === 0 ? 0 : (totals.scrap / produced) * 100;
  const registeredCount = Object.keys(entries).length;

  document.querySelector("#total-good").textContent =
    totals.good.toLocaleString("es");
  document.querySelector("#total-scrap").textContent =
    totals.scrap.toLocaleString("es");
  document.querySelector("#total-produced").textContent =
    produced.toLocaleString("es");
  document.querySelector("#scrap-rate").innerHTML =
    `${scrapRate.toLocaleString("es", { maximumFractionDigits: 1 })}<span class="percent-sign">%</span>`;
  document.querySelector("#scrap-bar").style.width =
    `${Math.min(scrapRate, 100)}%`;
  document.querySelector("#entry-count").textContent =
    `${registeredCount} de 8 horas registradas`;
  document.querySelector("#table-good").textContent =
    totals.good.toLocaleString("es");
  document.querySelector("#table-scrap").textContent =
    totals.scrap.toLocaleString("es");
  document.querySelector("#table-produced").textContent =
    produced.toLocaleString("es");

  renderAnalysis(entries);
  renderDowntime();
}

function renderRow(index, entry) {
  const range = getTimeRange(index);
  const hourLabel = `<span class="hour-index">${String(index + 1).padStart(2, "0")}</span><span class="hour-period">${range.start}–${range.end}</span>${range.nextDay ? '<span class="next-day">DÍA SIGUIENTE</span>' : ""}`;
  const rowHeader = `<th scope="row">${hourLabel}</th>`;
  const defectType = defectOptions.some(
    (option) => option.value === entry?.defectType,
  )
    ? entry.defectType
    : defaultDefectType;
  const defectLabel = getDefectLabel(defectType);
  if (editingHour === index || !entry) {
    const form = `<form class="hour-form" data-hour="${index}">
      <label class="hour-field"><span>Buenas</span><input name="good" type="number" min="0" step="1" inputmode="numeric" enterkeyhint="next" placeholder="0" aria-label="Piezas buenas, hora ${index + 1}" value="${entry?.good ?? ""}" required></label>
      <label class="hour-field"><span>Scrap</span><input name="scrap" type="number" min="0" step="1" inputmode="numeric" enterkeyhint="done" placeholder="0" aria-label="Piezas scrap, hora ${index + 1}" value="${entry?.scrap ?? ""}" required></label>
      <label class="hour-field hour-field-defect"><span>Tipo de defecto</span><select name="defectType" aria-label="Tipo de defecto, hora ${index + 1}">${defectOptions.map((option) => `<option value="${option.value}" ${option.value === defectType ? "selected" : ""}>${option.label}</option>`).join("")}</select></label>
      <div class="hour-form-actions"><button class="button button-save" type="submit">Guardar</button>${entry ? '<button class="button button-cancel" type="button" data-action="cancel" aria-label="Cancelar edición">×</button>' : ""}</div>
    </form>`;
    const total = entry ? (entry.good + entry.scrap).toLocaleString("es") : "—";
    return `<tr>${rowHeader}<td colspan="3">${form}</td><td class="total-cell">${total}</td><td></td></tr>`;
  }

  const total = entry.good + entry.scrap;
  return `<tr>${rowHeader}<td>${entry.good.toLocaleString("es")}</td><td>${entry.scrap.toLocaleString("es")}</td><td><span class="defect-badge">${defectLabel}</span></td><td class="total-cell">${total.toLocaleString("es")}</td><td><div class="row-actions"><button class="icon-button" type="button" data-action="edit" data-hour="${index}" aria-label="Editar hora ${index + 1}" title="Editar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.3-.9L19 8.4 15.6 5 4.9 15.7 4 20Z"/></svg></button><button class="icon-button delete" type="button" data-action="delete" data-hour="${index}" aria-label="Eliminar hora ${index + 1}" title="Eliminar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div></td></tr>`;
}

shiftSelect.addEventListener("change", () => {
  activeShift = shiftSelect.value;
  activeDate = getJourneyDate(activeShift);
  editingHour = null;
  render();
});

downtimeForm.querySelector('[name="reason"]').innerHTML =
  productionCalculations.downtimeReasons
    .map((reason) => `<option value="${reason.value}">${reason.label}</option>`)
    .join("");

downtimeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!downtimeForm.reportValidity()) return;

  const formData = new FormData(downtimeForm);
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const duration = productionCalculations.calculateDowntimeMinutes(
    startTime,
    endTime,
  );
  const endInput = downtimeForm.elements.endTime;
  endInput.setCustomValidity(
    duration === null ? "La hora de fin debe ser distinta y válida." : "",
  );
  if (!downtimeForm.reportValidity()) return;

  const record = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    startTime,
    endTime,
    reason: formData.get("reason"),
    responsible: formData.get("responsible").trim(),
    details: formData.get("details").trim(),
  };
  downtimeByJourney[getJourneyKey()] = [...getDowntimeRecords(), record];
  saveDowntimeRecords();
  downtimeForm.reset();
  renderDowntime();
});

downtimeForm.elements.endTime.addEventListener("input", (event) => {
  event.currentTarget.setCustomValidity("");
});

downtimeList.addEventListener("click", (event) => {
  const button = event.target.closest('[data-downtime-action="delete"]');
  if (!button) return;
  downtimeByJourney[getJourneyKey()] = getDowntimeRecords().filter(
    (record) => record.id !== button.dataset.id,
  );
  saveDowntimeRecords();
  renderDowntime();
});

lineSelect.addEventListener("change", () => {
  activeLine = lineSelect.value;
  editingHour = null;
  render();
});

rowsElement.addEventListener("submit", (event) => {
  const form = event.target.closest(".hour-form");
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const good = Number(formData.get("good"));
  const scrap = Number(formData.get("scrap"));
  const defectType = formData.get("defectType");
  if (
    !Number.isSafeInteger(good) ||
    !Number.isSafeInteger(scrap) ||
    good < 0 ||
    scrap < 0 ||
    !defectOptions.some((option) => option.value === defectType)
  ) {
    form.reportValidity();
    return;
  }
  const entries = {
    ...getEntries(),
    [form.dataset.hour]: { good, scrap, defectType },
  };
  journeys[getJourneyKey()] = entries;
  saveJourneys();
  editingHour = null;
  render();
});

rowsElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const hour = Number(button.dataset.hour);
  if (button.dataset.action === "edit") editingHour = hour;
  if (button.dataset.action === "cancel") editingHour = null;
  if (button.dataset.action === "delete") {
    const entries = { ...getEntries() };
    delete entries[hour];
    journeys[getJourneyKey()] = entries;
    saveJourneys();
    editingHour = null;
  }
  render();
});

document
  .querySelector("#clear-day")
  .addEventListener("click", () => dialog.showModal());
document.querySelector("#confirm-clear").addEventListener("click", (event) => {
  event.preventDefault();
  delete journeys[getJourneyKey()];
  delete downtimeByJourney[getJourneyKey()];
  saveJourneys();
  saveDowntimeRecords();
  editingHour = null;
  dialog.close();
  render();
});

render();
