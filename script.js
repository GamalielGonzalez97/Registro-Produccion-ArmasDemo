const shiftDefinitions = {
  manana: { label: "Mañana", start: 7 },
  tarde: { label: "Tarde", start: 15 },
  noche: { label: "Noche", start: 23 },
};

const storageKey = "control-produccion-jornadas-v1";
const rowsElement = document.querySelector("#hour-rows");
const lineSelect = document.querySelector("#line-select");
const shiftSelect = document.querySelector("#shift-select");
const dateElement = document.querySelector("#journey-date");
const dialog = document.querySelector("#confirm-dialog");
let editingHour = null;
let journeys = loadJourneys();
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
}

function renderRow(index, entry) {
  const range = getTimeRange(index);
  const hourLabel = `<span class="hour-index">${String(index + 1).padStart(2, "0")}</span><span class="hour-period">${range.start}–${range.end}</span>${range.nextDay ? '<span class="next-day">DÍA SIGUIENTE</span>' : ""}`;
  const rowHeader = `<th scope="row">${hourLabel}</th>`;
  if (editingHour === index || !entry) {
    return `<tr>${rowHeader}<td colspan="3"><form class="hour-form" data-hour="${index}"><label class="hour-field"><span>Buenas</span><input name="good" type="number" min="0" step="1" inputmode="numeric" enterkeyhint="next" placeholder="0" aria-label="Piezas buenas, hora ${index + 1}" value="${entry ? entry.good : ""}" required></label><label class="hour-field"><span>Scrap</span><input name="scrap" type="number" min="0" step="1" inputmode="numeric" enterkeyhint="done" placeholder="0" aria-label="Piezas scrap, hora ${index + 1}" value="${entry ? entry.scrap : ""}" required></label><div class="hour-form-actions"><button class="button button-save" type="submit">Guardar</button>${entry ? '<button class="button button-cancel" type="button" data-action="cancel" aria-label="Cancelar edición">×</button>' : ""}</div></form></td><td class="total-cell">${entry ? (entry.good + entry.scrap).toLocaleString("es") : "—"}</td></tr>`;
  }

  const total = entry.good + entry.scrap;
  return `<tr>${rowHeader}<td>${entry.good.toLocaleString("es")}</td><td>${entry.scrap.toLocaleString("es")}</td><td class="total-cell">${total.toLocaleString("es")}</td><td><div class="row-actions"><button class="icon-button" type="button" data-action="edit" data-hour="${index}" aria-label="Editar hora ${index + 1}" title="Editar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.3-.9L19 8.4 15.6 5 4.9 15.7 4 20Z"/></svg></button><button class="icon-button delete" type="button" data-action="delete" data-hour="${index}" aria-label="Eliminar hora ${index + 1}" title="Eliminar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div></td></tr>`;
}

shiftSelect.addEventListener("change", () => {
  activeShift = shiftSelect.value;
  activeDate = getJourneyDate(activeShift);
  editingHour = null;
  render();
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
  if (
    !Number.isSafeInteger(good) ||
    !Number.isSafeInteger(scrap) ||
    good < 0 ||
    scrap < 0
  ) {
    form.reportValidity();
    return;
  }
  const entries = { ...getEntries(), [form.dataset.hour]: { good, scrap } };
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
  saveJourneys();
  editingHour = null;
  dialog.close();
  render();
});

render();
