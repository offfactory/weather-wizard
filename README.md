# Weather Wizard

Weather Wizard is a polished Windows desktop weather app by **OFF FACTORY**.

## Features

- Live city weather search powered by Open-Meteo, no API key required
- Current conditions, hourly forecast, and 7-day forecast
- Settings tab for app name, creator name, YouTube channel, and Weather Switch
- Credits tab with OFF FACTORY branding and GitHub profile link
- Wizard-style home page with login/sign-up options for Google, Discord, email, and guest mode
- Location permission support for local weather
- Notification permission support for weather alerts
- Responsive layout for iOS and mobile browsers
- Windows `.exe` launcher and NSIS wizard installer configuration
- GitHub Actions workflow to build the Windows installer on `windows-latest`
- Custom app logo and Windows `.ico` icon used for launcher and installer branding

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Build Windows installer

The most reliable path is GitHub Actions on Windows:

1. Push to `main` or run **Build Windows Installer** manually.
2. Download the `weather-wizard-windows-installer` artifact from the workflow run.

The launcher executable is named `Weather Wizard.exe` inside the Windows install.

Locally on Windows:

```bash
npm run dist:win
```

Note: this installer is unsigned, so Windows SmartScreen may warn until code signing is added.
