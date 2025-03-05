# D3.js Installation Instructions for WeatherVue

To use the interactive charts in WeatherVue, you need to install D3.js and its TypeScript types. Since we encountered permission issues with npm, here are alternative ways to install these dependencies.

## Option 1: Fix npm permissions and install dependencies

1. Run the following command to fix npm cache permissions:
   ```bash
   sudo chown -R $(whoami) ~/.npm
   ```

2. Then install D3.js and its TypeScript types:
   ```bash
   cd /Users/ashishjha/Desktop/Projects/WeatherVue
   npm install d3 @types/d3
   ```

## Option 2: Use yarn instead of npm

If you prefer using Yarn:

1. Install Yarn globally if not already installed:
   ```bash
   npm install -g yarn
   ```

2. Install dependencies using yarn:
   ```bash
   cd /Users/ashishjha/Desktop/Projects/WeatherVue
   yarn add d3 @types/d3
   ```

## Option 3: Add dependencies to package.json manually and use npm install

1. Add the following to your `package.json` file in the dependencies section:
   ```json
   "dependencies": {
     "chart.js": "^4.4.8",
     "d3": "^7.8.5",
     "react-chartjs-2": "^5.3.0"
   },
   "devDependencies": {
     "@types/d3": "^7.4.3"
   }
   ```

2. Then run:
   ```bash
   cd /Users/ashishjha/Desktop/Projects/WeatherVue
   npm install
   ```

## Verifying the Installation

After installation, ensure you have:
- The `d3` package installed in your node_modules folder
- The `@types/d3` package installed for TypeScript support

If you still encounter errors related to the `d3` module not being found, try restarting your development server.

## Using the Chart Components

Once D3.js is installed, the interactive temperature and humidity charts will automatically appear in your WeatherVue application when you search for a location. 