const express = require('express');
const axios = require('axios');
const cors = require('cors');
const {MongoClient, ObjectId} = require('mongodb');
const path = require('path');

const app = express();
app.use(cors());
// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/weather-app/browser')));

app.use(express.json());

// API keys
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const TOMORROW_API_KEY = 'YOUR_TOMORROW_API_KEY';


// MongoDB connection string
const uri = 'mongodb+srv://jiabaoh:Hujiabao11111@cluster0.5jwd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');
    // You can now perform database operations with `collection`

  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
}

// Call the function to connect to the database
connectToMongoDB();

// Access the specific database and collection
const db = client.db('571HW3');
const collection = db.collection('jiabao');

// POST route to save a favorite city
app.post('/api/favorites', async (req, res) => {
  try {
    const { city, state, lat, lng } = req.body;
    const newFavorite = { city, state, lat, lng };
    await collection.insertOne(newFavorite); // Insert the new favorite into the collection
    res.status(201).json({ message: 'City saved successfully' });
  } catch (error) {
    console.error('Error saving city:', error);
    res.status(500).json({ error: 'Failed to save city' });
  }
});

// DELETE route to remove a favorite city
app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ObjectId' });
    }

    const result = await collection.deleteOne({ _id: new ObjectId(id) }); // Use ObjectId to remove by ID

    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'City deleted successfully' });
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ error: 'Failed to delete city' });
  }
});

// GET route to fetch all favorite cities
app.get('/api/get_favorites', async (req, res) => {
  try {
    const favorites = await collection.find().toArray(); // Retrieve all documents from the collection
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Endpoint to proxy Google Maps API Autocomplete requests
app.get('/api/place/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
      params: { input, key: GOOGLE_MAPS_API_KEY, types: '(cities)' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google API:', error);
    res.status(500).send('Error fetching data from Google API');
  }
});

// Endpoint to get location information based on address
app.get('/get_location', async (req, res) => {
  const { street, city, state } = req.query;
  const address = `${street}, ${city}, ${state}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === 'OK') {
      const location = data.results[0].geometry.location;
      res.json({
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: `${city}, ${state}`,
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// // Endpoint to get location information based on IP
// app.get('/get_location_ip', async (req, res) => {
//   const url = `https://ipinfo.io/json?token=${IPINFO_TOKEN}`;

//   try {
//     const response = await axios.get(url);
//     const data = response.data;

//     if (data.loc) {
//       const [lat, lng] = data.loc.split(',');
//       const formattedAddress = `${data.city}, ${data.region}`;
//       res.json({
//         latitude: lat,
//         longitude: lng,
//         formatted_address: formattedAddress,
//       });
//     } else {
//       res.status(404).json({ error: 'Location not found' });
//     }
//   } catch (error) {
//     console.error('Error fetching IP location data:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Endpoint to get weather information
app.get('/get_weather', async (req, res) => {
  const { lat, lng } = req.query;
  const commonFields = [
    'temperature', 'temperatureApparent', 'temperatureMin', 'temperatureMax',
    'windSpeed', 'windDirection', 'humidity', 'pressureSeaLevel', 'weatherCode',
    'precipitationProbability', 'precipitationType', 'visibility', 'cloudCover',
  ];
  const currentFields = [...commonFields, 'uvIndex'];
  const dailyFields = [...commonFields, 'sunriseTime', 'sunsetTime', 'moonPhase'];
  const timesteps = 'current,1h,1d';

  const weatherUrl = `https://api.tomorrow.io/v4/timelines?location=${lat},${lng}&fields=${[...new Set([...currentFields, ...dailyFields])].join(',')}&timesteps=${timesteps}&units=imperial&timezone=America/Los_Angeles&apikey=${TOMORROW_API_KEY}`;

  try {
    const response = await axios.get(weatherUrl);
    const data = response.data;

    if (data.data) {
      const timelines = data.data.timelines;
      const weatherData = {
        current: timelines.find(t => t.timestep === 'current')?.intervals[0]?.values || {},
        '1h': timelines.find(t => t.timestep === '1h')?.intervals || [],
        '1d': timelines.find(t => t.timestep === '1d')?.intervals || [],
      };
      res.json(weatherData);
    } else {
      res.status(404).json({ error: 'Weather data not found' });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Handle all other routes to serve the Angular app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/weather-app/browser/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
