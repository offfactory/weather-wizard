export type Place = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type WeatherReport = {
  place: Place;
  current: {
    temperature: number;
    apparent: number;
    wind: number;
    humidity: number;
    code: number;
    time: string;
  };
  hourly: Array<{ time: string; temperature: number; precipitation: number; code: number }>;
  daily: Array<{ date: string; high: number; low: number; code: number; precipitation: number }>;
};

const codeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm hail",
  99: "Severe thunderstorm"
};

export function describeWeather(code: number) {
  return codeMap[code] ?? "Changing skies";
}

export function weatherIcon(code: number) {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3, 45, 48].includes(code)) return "☁️";
  if (code >= 51 && code <= 82) return "🌧️";
  if (code >= 71 && code <= 75) return "❄️";
  if (code >= 95) return "⛈️";
  return "🌦️";
}

export async function findPlace(query: string): Promise<Place> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not search for that city.");
  const data = await response.json();
  const result = data.results?.[0];
  if (!result) throw new Error("No city found. Try a nearby major city.");

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone
  };
}

export async function loadWeather(place: Place): Promise<WeatherReport> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(place.latitude));
  url.searchParams.set("longitude", String(place.longitude));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability,weather_code");
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", place.timezone ?? "auto");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather service is not responding.");
  const data = await response.json();

  return {
    place,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparent: Math.round(data.current.apparent_temperature),
      wind: Math.round(data.current.wind_speed_10m),
      humidity: Math.round(data.current.relative_humidity_2m),
      code: data.current.weather_code,
      time: data.current.time
    },
    hourly: data.hourly.time.slice(0, 12).map((time: string, index: number) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[index]),
      precipitation: data.hourly.precipitation_probability[index] ?? 0,
      code: data.hourly.weather_code[index]
    })),
    daily: data.daily.time.map((date: string, index: number) => ({
      date,
      high: Math.round(data.daily.temperature_2m_max[index]),
      low: Math.round(data.daily.temperature_2m_min[index]),
      code: data.daily.weather_code[index],
      precipitation: data.daily.precipitation_probability_max[index] ?? 0
    }))
  };
}
