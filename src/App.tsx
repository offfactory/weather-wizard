import { useEffect, useMemo, useState } from "react";
import { CloudSun, Code2, PlayCircle, Search, Settings, Sparkles, Wand2 } from "lucide-react";
import { describeWeather, findPlace, loadWeather, Place, WeatherReport, weatherIcon } from "./weather";

type Tab = "weather" | "settings" | "credits";

const defaultPlace: Place = {
  name: "New York",
  country: "United States",
  latitude: 40.7143,
  longitude: -74.006,
  timezone: "America/New_York"
};

const githubUrl = "https://github.com/offfactory";
const youtubeFallback = "Add your YouTube channel in Settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("weather");
  const [appName, setAppName] = useState(() => localStorage.getItem("appName") || "Weather Wizard");
  const [creatorName, setCreatorName] = useState(() => localStorage.getItem("creatorName") || "OFF FACTORY");
  const [youtubeUrl, setYoutubeUrl] = useState(() => localStorage.getItem("youtubeUrl") || "");
  const [weatherSwitch, setWeatherSwitch] = useState(() => localStorage.getItem("weatherSwitch") !== "off");
  const [query, setQuery] = useState("New York");
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subtitle = useMemo(() => `Weather Switch by ${creatorName}`, [creatorName]);

  useEffect(() => {
    localStorage.setItem("appName", appName);
    localStorage.setItem("creatorName", creatorName);
    localStorage.setItem("youtubeUrl", youtubeUrl);
    localStorage.setItem("weatherSwitch", weatherSwitch ? "on" : "off");
  }, [appName, creatorName, youtubeUrl, weatherSwitch]);

  useEffect(() => {
    load(defaultPlace);
  }, []);

  async function load(place: Place) {
    setLoading(true);
    setError("");
    try {
      setReport(await loadWeather(place));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const place = await findPlace(query.trim());
      await load(place);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      <aside className="sidebar panel">
        <div className="brand-lockup">
          <img src="/weather-logo.svg" alt="Weather Wizard logo" className="logo" />
          <div>
            <p className="eyebrow">Desktop forecast</p>
            <h1>{appName}</h1>
            <span>{subtitle}</span>
          </div>
        </div>

        <nav className="tabs" aria-label="App sections">
          <button className={tab === "weather" ? "active" : ""} onClick={() => setTab("weather")}><CloudSun size={18} /> Weather</button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}><Settings size={18} /> Settings</button>
          <button className={tab === "credits" ? "active" : ""} onClick={() => setTab("credits")}><Sparkles size={18} /> Credits</button>
        </nav>

        <form onSubmit={onSearch} className="search-card">
          <label htmlFor="city">Search city</label>
          <div className="search-row">
            <Search size={18} />
            <input id="city" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or town" />
          </div>
          <button type="submit" disabled={loading || !weatherSwitch}>{loading ? "Casting..." : "Cast forecast"}</button>
        </form>

        <div className="mini-card">
          <Wand2 size={20} />
          <div>
            <strong>Installer ready</strong>
            <p>NSIS wizard setup, desktop shortcut, Start Menu shortcut, and EXE icon.</p>
          </div>
        </div>
      </aside>

      <section className="content panel">
        {tab === "weather" && <WeatherTab report={report} loading={loading} error={error} enabled={weatherSwitch} />}
        {tab === "settings" && (
          <SettingsTab
            appName={appName}
            setAppName={setAppName}
            creatorName={creatorName}
            setCreatorName={setCreatorName}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            weatherSwitch={weatherSwitch}
            setWeatherSwitch={setWeatherSwitch}
          />
        )}
        {tab === "credits" && <CreditsTab creatorName={creatorName} youtubeUrl={youtubeUrl} />}
      </section>
    </main>
  );
}

function WeatherTab({ report, loading, error, enabled }: { report: WeatherReport | null; loading: boolean; error: string; enabled: boolean }) {
  if (!enabled) {
    return <EmptyState title="Weather Switch is off" body="Turn it on in Settings to load live forecasts." />;
  }
  if (loading) return <EmptyState title="Casting the forecast..." body="Pulling fresh weather from Open-Meteo." />;
  if (error) return <EmptyState title="Forecast spell failed" body={error} />;
  if (!report) return null;

  return (
    <div className="weather-grid">
      <section className="hero-weather">
        <div>
          <p className="eyebrow">{report.place.name}, {report.place.country}</p>
          <h2>{report.current.temperature}°</h2>
          <p className="condition">{describeWeather(report.current.code)} · feels like {report.current.apparent}°</p>
        </div>
        <div className="weather-mark" aria-hidden="true">{weatherIcon(report.current.code)}</div>
        <div className="metric-row">
          <Metric label="Wind" value={`${report.current.wind} mph`} />
          <Metric label="Humidity" value={`${report.current.humidity}%`} />
          <Metric label="Updated" value={new Date(report.current.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} />
        </div>
      </section>

      <section className="forecast-section">
        <h3>Hourly magic</h3>
        <div className="hour-row">
          {report.hourly.map((hour) => (
            <div className="hour-card" key={hour.time}>
              <span>{new Date(hour.time).toLocaleTimeString([], { hour: "numeric" })}</span>
              <strong>{weatherIcon(hour.code)}</strong>
              <b>{hour.temperature}°</b>
              <small>{hour.precipitation}% rain</small>
            </div>
          ))}
        </div>
      </section>

      <section className="forecast-section daily">
        <h3>7-day forecast</h3>
        {report.daily.map((day) => (
          <div className="day-card" key={day.date}>
            <span>{new Date(`${day.date}T12:00:00`).toLocaleDateString([], { weekday: "long" })}</span>
            <b>{weatherIcon(day.code)} {describeWeather(day.code)}</b>
            <strong>{day.high}° / {day.low}°</strong>
          </div>
        ))}
      </section>
    </div>
  );
}

function SettingsTab(props: {
  appName: string;
  setAppName: (value: string) => void;
  creatorName: string;
  setCreatorName: (value: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (value: string) => void;
  weatherSwitch: boolean;
  setWeatherSwitch: (value: boolean) => void;
}) {
  return (
    <div className="settings-page">
      <header>
        <p className="eyebrow">Customize</p>
        <h2>Settings</h2>
        <span>Rename the app, control Weather Switch, and add your YouTube channel.</span>
      </header>

      <label className="field">
        <span>Name of weather app</span>
        <input value={props.appName} onChange={(e) => props.setAppName(e.target.value)} />
      </label>

      <label className="field">
        <span>Weather Switch by</span>
        <input value={props.creatorName} onChange={(e) => props.setCreatorName(e.target.value)} />
      </label>

      <label className="field">
        <span>YouTube channel link</span>
        <input value={props.youtubeUrl} onChange={(e) => props.setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/@yourchannel" />
      </label>

      <div className="switch-row">
        <div>
          <strong>Weather Switch</strong>
          <p>Turn live forecast search on or off.</p>
        </div>
        <button className={props.weatherSwitch ? "switch on" : "switch"} onClick={() => props.setWeatherSwitch(!props.weatherSwitch)}>
          <span />
        </button>
      </div>
    </div>
  );
}

function CreditsTab({ creatorName, youtubeUrl }: { creatorName: string; youtubeUrl: string }) {
  return (
    <div className="credits-page">
      <p className="eyebrow">Credits</p>
      <h2>Made by {creatorName}</h2>
      <p className="credits-copy">Weather Wizard uses free Open-Meteo forecast data and custom OFF FACTORY desktop branding.</p>
      <div className="link-grid">
        <a href={githubUrl} target="_blank" rel="noreferrer"><Code2 /> GitHub profile <span>{githubUrl}</span></a>
        <a href={youtubeUrl || "#"} target={youtubeUrl ? "_blank" : undefined} rel="noreferrer"><PlayCircle /> YouTube channel <span>{youtubeUrl || youtubeFallback}</span></a>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty"><CloudSun size={56} /><h2>{title}</h2><p>{body}</p></div>;
}
