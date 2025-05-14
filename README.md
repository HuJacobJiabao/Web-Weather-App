
# 🌤️ Angular Weather App

A full-featured, mobile-friendly weather forecast web application built using **Angular**, **Node.js**, and **MongoDB Atlas**, with real-time data from **Tomorrow.io** and interactive maps from **Google Maps API**.

## 🚀 Features

- 🔍 **Search by Address** or detect **Current Location** using IP.
- 📍 **Google Places Autocomplete** for city suggestions.
- 📊 View **Daily Forecast**, **Temperature Chart**, and **Meteogram** (5-day hourly).
- ⭐ **Add/Remove Favorites** — persists across sessions using **MongoDB Atlas**.
- 🗺️ **Interactive Google Map** displays weather location.
- 🐦 **Tweet Weather** — share current forecast to Twitter/X.
- 📱 Fully **Responsive** on mobile & desktop (using Bootstrap 5 + Angular Material).
- 🌐 **Deployed on AWS**

## Tech Stack

### Frontend:
- Angular 17+
- Bootstrap 5.3
- Angular Material
- Highcharts (via highcharts-angular)
- Google Maps JavaScript SDK

### Backend:
- Node.js + Express.js
- MongoDB Atlas
- Tomorrow.io API
- Google Places & Geocode API
- IPinfo API

## 📸 Demo

<video controls src = https://github.com/user-attachments/assets/95aae0e8-3ea4-4c7e-acf6-dd827b902dc0 width = 70%> </video>

## 📁 Project Structure

```
Web-Weather-App/
├── weather-app/           # Angular frontend
│   ├── src/               # Angular source files
│   ├── dist/              # Build output
│   ├── node_modules/
│   ├── angular.json
│   └── package.json
├── weather-backend/       # Node.js backend
│   ├── server.js
│   ├── node_modules/
│   └── package.json
└── README.md
```

## 🧪 APIs Used

| API | Purpose |
|-----|---------|
| [Tomorrow.io](https://docs.tomorrow.io/) | Weather data |
| [Google Maps JS API](https://developers.google.com/maps/documentation/javascript/overview) | Map visualization |
| [Google Places API](https://developers.google.com/maps/documentation/places/web-service/autocomplete) | City autocomplete |
| [Google Geocode API](https://developers.google.com/maps/documentation/geocoding/start) | Address to coordinates |
| [IPinfo](https://ipinfo.io/) | Detect user's current location |
| [MongoDB Atlas](https://www.mongodb.com/) | Persistent favorites |
| [Twitter Intent](https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview) | Share forecast |

## 🔧 Setup Instructions

### 1. Frontend (Angular)
```bash
cd weather-app
npm install
ng serve
```

### 2. Backend (Node.js)
```bash
cd weather-backend
npm install
node server.js
```

### 3. Build Angular & Deploy Together
```bash
ng build
# Copy `dist/weather-app/browser` to backend `dist/`
# Ensure `express.static()` is configured in backend to serve it
```
You also need to change the api keys in your backend file.

## 📝 Deployment

- The backend and frontend are hosted together using AWS.
- API keys are stored securely via backend proxying.
- The app supports live traffic with autoscaling.

## 📚 References

- [Bootstrap](https://getbootstrap.com/)
- [Highcharts for Angular](https://www.npmjs.com/package/highcharts-angular)
- [Angular Material](https://material.angular.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 👨‍💻 Author

Jiabao Hu – [GitHub](https://github.com/HuJacobJiabao)
