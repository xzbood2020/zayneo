
const apiKey = "7d43360714bcc522721370c36b8627f0";
let currentLang = localStorage.getItem("lang") || "ar";
let isDark = localStorage.getItem("darkMode") !== "false";

const translations = {
  ar: {
    title: "🌦️ WeatherNow",
    placeholder: "ادخل اسم المدينة",
    search: "عرض الطقس",
    locationWeather: "📍 الطقس في موقعي الحالي",
    temp: "درجة الحرارة:",
    humidity: "الرطوبة:",
    wind: "الرياح:",
    pressure: "الضغط الجوي:",
    notFound: "لم يتم العثور على المدينة",
    dark: "الوضع الليلي",
    light: "الوضع النهاري",
    lang: "English",
  },
  en: {
    title: "🌦️ WeatherNow",
    placeholder: "Enter city name",
    search: "Get Weather",
    locationWeather: "📍 Weather at my location",
    temp: "Temperature:",
    humidity: "Humidity:",
    wind: "Wind:",
    pressure: "Pressure:",
    notFound: "City not found",
    dark: "Dark Mode",
    light: "Light Mode",
    lang: "العربية",
  }
};

function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("❗ " + translations[currentLang].placeholder);

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return alert(translations[currentLang].notFound);
      updateWeather(data);
      localStorage.setItem("lastCity", city);
    });
}

function updateWeather(data) {
  document.getElementById("weatherBox").style.display = "block";
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").textContent = Math.round(data.main.temp);
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed;
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("description").textContent = data.weather[0].description;

  const iconCode = data.weather[0].icon;
  document.getElementById("icon").innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" />`;

  setBackground(data.weather[0].main.toLowerCase());
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=${currentLang}`)
        .then(res => res.json())
        .then(data => {
          updateWeather(data);
          localStorage.setItem("lastCity", data.name);
        });
    });
  } else {
    alert("الموقع غير مدعوم في هذا المتصفح");
  }
}

function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem("lang", currentLang);
  applyLanguage();
}

function applyLanguage() {
  const t = translations[currentLang];
  document.documentElement.lang = currentLang;
  document.getElementById("title").textContent = t.title;
  document.getElementById("cityInput").placeholder = t.placeholder;
  document.getElementById("searchBtn").textContent = t.search;
  document.getElementById("locBtn").textContent = t.locationWeather;
  document.getElementById("tempLabel").textContent = t.temp;
  document.getElementById("humidityLabel").textContent = t.humidity;
  document.getElementById("windLabel").textContent = t.wind;
  document.getElementById("pressureLabel").textContent = t.pressure;
  document.getElementById("langBtn").textContent = t.lang;
  document.getElementById("modeBtn").textContent = isDark ? t.light : t.dark;
}

function toggleMode() {
  isDark = !isDark;
  localStorage.setItem("darkMode", isDark);
  applyMode();
}

function applyMode() {
  document.body.classList.toggle("light", !isDark);
  document.getElementById("modeBtn").textContent = isDark
    ? translations[currentLang].light
    : translations[currentLang].dark;
}

function setBackground(condition) {
  let bg;
  if (condition.includes("clear")) bg = "#fde68a";
  else if (condition.includes("cloud")) bg = "#cbd5e1";
  else if (condition.includes("rain")) bg = "#60a5fa";
  else if (condition.includes("snow")) bg = "#e0f2fe";
  else bg = isDark ? "#0f172a" : "#fefce8";

  document.body.style.background = `linear-gradient(to top, ${bg}, #ffffff20)`;
}

window.onload = () => {
  applyLanguage();
  applyMode();
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
};
