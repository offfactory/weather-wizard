import { useEffect, useMemo, useState } from "react";
import { CloudSun, Code2, Compass, Mail, PlayCircle, Search, Settings, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { describeWeather, findPlace, loadWeather, Place, WeatherReport, weatherIcon } from "./weather";

type Tab = "home" | "weather" | "settings" | "credits";
type AuthProvider = "Google" | "Discord" | "Email" | "Guest";

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
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem("signedIn") === "yes" ? "weather" : "home"));
  const [appName, setAppName] = useState(() => localStorage.getItem("appName") || "Weather Wizard");
  const [creatorName, setCreatorName] = useState(() => localStorage.getItem("creatorName") || "OFF FACTORY");
  const [youtubeUrl, setYoutubeUrl] = useState(() => localStorage.getItem("youtubeUrl") || "");
  const [weatherSwitch, setWeatherSwitch] = useState(() => localStorage.getItem("weatherSwitch") !== "off");
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem("signedIn") === "yes");
  const [signedInWith, setSignedInWith] = useState(() => localStorage.getItem("signedInWith") || "");
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
    localStorage.setItem("signedIn", signedIn ? "yes" : "no");
    localStorage.setItem("signedInWith", signedInWith);
  }, [appName, creatorName, youtubeUrl, weatherSwitch, signedIn, signedInWith]);

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

  function signIn(provider: AuthProvider) {
    setSignedIn(true);
    setSignedInWith(provider);
    setTab("weather");
  }

  function signOut() {
    setSignedIn(false);
    setSignedInWith("");
    setTab("home");
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
          <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><Compass size={18} /> Home</button>
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

        {signedIn && (
          <button className="signout-button" onClick={signOut}>Signed in with {signedInWith} · Sign out</button>
        )}
      </aside>

      <section className="content panel">
        {tab === "home" && <HomeTab appName={appName} creatorName={creatorName} signedIn={signedIn} signedInWith={signedInWith} onSignIn={signIn} onStart={() => setTab(signedIn ? "weather" : "home")} />}
        {tab === "weather" && (signedIn ? <WeatherTab report={report} loading={loading} error={error} enabled={weatherSwitch} /> : <HomeTab appName={appName} creatorName={creatorName} signedIn={signedIn} signedInWith={signedInWith} onSignIn={signIn} onStart={() => setTab("home")} />)}
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

function HomeTab({ appName, creatorName, signedIn, signedInWith, onSignIn, onStart }: { appName: string; creatorName: string; signedIn: boolean; signedInWith: string; onSignIn: (provider: AuthProvider) => void; onStart: () => void }) {
  return (
    <div className="home-page">
      <section className="wizard-hero">
        <div>
          <p className="eyebrow">Wizard step 1</p>
          <h2>{appName}</h2>
          <p className="home-copy">Sign in or sign up, then cast live forecasts with the OFF FACTORY Weather Switch.</p>
          <div className="wizard-steps">
            <span className="done">1 Login</span>
            <span>2 Search weather</span>
            <span>3 Save your setup</span>
          </div>
        </div>
        <img src="/weather-logo.svg" alt="Weather Wizard app icon" className="hero-logo" />
      </section>

      <section className="auth-panel">
        <div>
          <p className="eyebrow">Login or sign up</p>
          <h3>{signedIn ? `Ready, signed in with ${signedInWith}` : "Choose your magic door"}</h3>
          <p>Google and Discord buttons are launcher-ready placeholders for the desktop app. Guest mode works now without setup.</p>
        </div>
        <div className="auth-grid">
          <button onClick={() => onSignIn("Google")}><ShieldCheck /> Continue with Google</button>
          <button onClick={() => onSignIn("Discord")}><Sparkles /> Continue with Discord</button>
          <button onClick={() => onSignIn("Email")}><Mail /> Sign up with email</button>
          <button onClick={() => onSignIn("Guest")}><Wand2 /> Continue as guest</button>
        </div>
        <button className="primary-wide" onClick={onStart}>{signedIn ? "Open Weather Wizard" : "Pick a sign-in option above"}</button>
      </section>

      <section className="wizard-strip">
        <div><strong>Wizard style</strong><span>Dark glass UI, magic weather icon, installer-ready identity.</span></div>
        <div><strong>Desktop launcher</strong><span>Electron app with custom Weather Wizard `.exe` icon.</span></div>
        <div><strong>Setup wizard</strong><span>NSIS installer creates desktop and Start Menu shortcuts.</span></div>
      </section>
    </div>
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
