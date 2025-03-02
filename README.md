# 🌦️ WeatherVue

<div align="center">
  <img src="public/images/logo.svg" alt="WeatherVue Logo" width="120" height="120">
  
  <h3>A beautiful, modern weather dashboard built with React, TypeScript, and D3.js</h3>

  <p>
    <a href="#features">Features</a> •
    <a href="#live-demo">Live Demo</a> •
    <a href="#screenshots">Screenshots</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#technologies">Technologies</a> •
    <a href="#api">API</a> •
    <a href="#license">License</a>
  </p>
</div>

## ✨ Features

- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🌡️ **Real-time Weather Data** - Current conditions with temperature, humidity, and wind speed
- 📊 **Interactive Charts** - Visualize temperature and humidity trends with D3.js
- 🔍 **Location Search** - Search for weather in any city worldwide
- 📈 **Temperature Trends** - Visual indicators showing temperature increases and decreases
- 💧 **Humidity Analysis** - Track humidity changes throughout the day
- 🌙 **Forecast** - 24-hour weather forecast with detailed information
- 🔄 **Unit Conversion** - Toggle between Celsius and Fahrenheit

## 🌐 Live Demo

Check out the live demo: [WeatherVue Demo](https://weather-vue-demo.vercel.app)

## 📸 Screenshots

<div align="center">
  <img src="public/images/dashboard.svg" alt="WeatherVue Dashboard" width="800">
  <p><em>Main dashboard showing current weather and forecast</em></p>
  
  <br>
  
  <div style="display: flex; justify-content: space-between;">
    <div style="flex: 1; padding: 0 10px;">
      <img src="public/images/temperature-chart.svg" alt="Temperature Chart" width="380">
      <p><em>Temperature forecast with trend indicators</em></p>
    </div>
    <div style="flex: 1; padding: 0 10px;">
      <img src="public/images/humidity-chart.svg" alt="Humidity Chart" width="380">
      <p><em>Humidity forecast with trend analysis</em></p>
    </div>
  </div>
</div>

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/WeatherVue.git

# Navigate to the project directory
cd WeatherVue

# Install dependencies
npm install

# Create a .env file with your WeatherAPI key
echo "VITE_WEATHER_API_KEY=your_api_key_here" > .env
```

## 📋 Usage

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## 🛠️ Technologies

- **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Data Visualization**: [D3.js](https://d3js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Weather Data**: [WeatherAPI](https://www.weatherapi.com/)

## 🌩️ API

WeatherVue uses the [WeatherAPI](https://www.weatherapi.com/) to fetch weather data. You'll need to:

1. Sign up for a free API key at [WeatherAPI.com](https://www.weatherapi.com/)
2. Add your API key to the `.env` file:

```
VITE_WEATHER_API_KEY=your_api_key_here
```

## 📊 Data Visualization

WeatherVue features advanced data visualization using D3.js:

- **Temperature Chart**: Shows 24-hour temperature forecast with trend indicators
  - Green arrows indicate temperature increases
  - Red arrows indicate temperature decreases
  
- **Humidity Chart**: Displays humidity changes throughout the day
  - Interactive bars with gradient fill
  - Trend indicators between time points
  - Detailed tooltips showing exact changes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by Your Name</p>
  <p>
    <a href="https://github.com/yourusername">GitHub</a> •
    <a href="https://twitter.com/yourusername">Twitter</a> •
    <a href="https://linkedin.com/in/yourusername">LinkedIn</a>
  </p>
</div>
