import { NoiseSensor, NOISE_LIMITS, VALID_NOISE_RANGE } from "./models/NoiseSensor.js";
import { NoiseMeasurement } from "./models/NoiseMeasurement.js";
import { MonitoringSystem } from "./services/MonitoringSystem.js";

// 1. Попередні вихідні дані та ініціалізація системи (Лаб. №5)
const noiseLevels = [
  42, 55, 61, 78, 83, 67,
  53, 47, 88, 69, 74, 82,
  49, 72, 91, 58,
  64, 76, 95, 51,
  71, -1, 85, 63,
  79, 39, 141, 86
];

const system = new MonitoringSystem();
const sensor = new NoiseSensor("NS-01");
system.addSensor(sensor);

const invalidItems = [];

noiseLevels.forEach((value, index) => {
  if (!NoiseSensor.isValidNoiseLevel(value)) {
    invalidItems.push({ position: index + 1, value });
    return;
  }
  sensor.addMeasurement(new NoiseMeasurement(value));
});

// Консольні звіти (зберігаємо з минулої лаби)
console.group("Акустична варта — лабораторна робота №5 та №6");
console.log(`Пороги за методичкою: normal ≤ ${NOISE_LIMITS.normalMax} dB; warning ≤ ${NOISE_LIMITS.warningMax} dB; critical > ${NOISE_LIMITS.warningMax} dB`);
console.log(`Усього вимірювань: ${noiseLevels.length}`);
console.groupEnd();


// ==========================================
// 2. ЛОГІКА ЛАБОРАТОРНОЇ РОБОТИ №6 (DOM та фільтрація)
// ==========================================

// Розширений масив сенсорів для демонстрації фільтрації за районами та статусами
const sensors = [
  { id: "NS-01", district: "Галицький", location: "просп. Свободи, 14", noiseLevel: 52, status: "normal" },
  { id: "NS-02", district: "Франківський", location: "вул. Наукова, 8", noiseLevel: 68, status: "warning" },
  { id: "NS-03", district: "Шевченківський", location: "просп. Чорновола, 21", noiseLevel: 83, status: "critical" },
  { id: "NS-04", district: "Сихівський", location: "вул. Зелена, 102", noiseLevel: 49, status: "normal" },
  { id: "NS-05", district: "Личаківський", location: "вул. Пасічна, 30", noiseLevel: 71, status: "warning" },
  { id: "NS-06", district: "Залізничний", location: "вул. Городоцька, 155", noiseLevel: 86, status: "critical" }
];

// Пошук потрібних DOM-елементів через querySelector()
const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

// Функція створення картки сенсора
function createSensorCard(sensor) {
  const card = document.createElement("article");
  card.classList.add("sensor-card");
  card.classList.add(`sensor-card--${sensor.status}`);

  const topDiv = document.createElement("div");
  topDiv.classList.add("sensor-card__top");

  const title = document.createElement("h3");
  title.classList.add("sensor-card__id");
  title.textContent = sensor.id;

  const statusBadge = document.createElement("span");
  statusBadge.classList.add("sensor-card__status");
  statusBadge.textContent = sensor.status;

  topDiv.append(title, statusBadge);

  const district = document.createElement("p");
  district.classList.add("sensor-card__address");
  district.textContent = `Район: ${sensor.district}`;

  const location = document.createElement("p");
  location.classList.add("sensor-card__caption");
  location.textContent = `Локація: ${sensor.location}`;

  const level = document.createElement("p");
  level.classList.add("sensor-card__value");
  level.innerHTML = `${sensor.noiseLevel} <span>дБ</span>`;

  card.append(topDiv, district, location, level);
  return card;
}

// Функція відображення (рендерингу) масиву сенсорів
function renderSensors(sensorArray) {
  if (!sensorList) return;
  sensorList.replaceChildren(); // Очищення контейнера перед новим рендером
  
  sensorArray.forEach((sensor) => {
    const card = createSensorCard(sensor);
    sensorList.append(card);
  });
}

// Функція фільтрації сенсорів
function applyFilters() {
  const selectedDistrict = districtFilter ? districtFilter.value : "all";
  const criticalOnly = criticalFilter ? criticalFilter.checked : false;

  const filteredSensors = sensors.filter((sensor) => {
    const matchesDistrict = selectedDistrict === "all" || sensor.district === selectedDistrict;
    const matchesStatus = !criticalOnly || sensor.status === "critical";
    return matchesDistrict && matchesStatus;
  });

  renderSensors(filteredSensors);
}

// Додавання обробників подій change для фільтрів
if (districtFilter && criticalFilter) {
  districtFilter.addEventListener("change", applyFilters);
  criticalFilter.addEventListener("change", applyFilters);
}

// Початковий вивід усіх сенсорів при завантаженні сторінки
renderSensors(sensors);

// Для перевірки з Console
window.noiseMonitoring = { system, sensor, NoiseSensor, NoiseMeasurement, MonitoringSystem };