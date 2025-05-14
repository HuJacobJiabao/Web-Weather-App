import { Component, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule

import { TempChartComponent } from '../temp-chart/temp-chart.component';
import { MeteogramComponent } from '../meteogram/meteogram.component';
import { WeatherDetailsComponent } from '../weather-details/weather-details.component';
import { FavoritesTabComponent } from '../favorites-tab/favorites-tab.component';

@Component({
  selector: 'app-weather-form',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    FormsModule,
    TempChartComponent,
    MeteogramComponent,
    WeatherDetailsComponent,
    FavoritesTabComponent
  ],
  templateUrl: './weather-form.component.html',
  styleUrls: ['./weather-form.component.css']
})
export class WeatherFormComponent {
  @ViewChild('formCheck') formCheckElement!: ElementRef;

  activeButton: string = 'results';
  street: string = '';
  city: string = '';
  cityOptions: { city: string; state: string }[] = [];
  state: string = '';
  resultCity: string = '';
  resultState: string = '';
  showErrorAlert: boolean = false;
  isLoading: boolean = false;

  currentLocationChecked: boolean = false;
  lng: number = 0;
  lat: number = 0;

  streetError: string = '';
  cityError: string = '';

  formattedAddress: string = '';
  weatherData: any;

  transformedWeatherData: any[] = [];

  activeTab: string = 'day-view';

  selectedIndex: number | null = null;
  selectedDateData: any;

  showDetails: boolean = false;

  favorites: { _id: string; city: string; state: string; lat: number; lng: number }[] = []

  weatherCodeMapping: { [key: string]: { description: string; icon: string } } = {
    "4201": { description: "Heavy Rain", icon: "rain_heavy.svg" },
    "4001": { description: "Rain", icon: "rain.svg" },
    "4200": { description: "Light Rain", icon: "rain_light.svg" },
    "6201": { description: "Heavy Freezing Rain", icon: "freezing_rain_heavy.svg" },
    "6001": { description: "Freezing Rain", icon: "freezing_rain.svg" },
    "6200": { description: "Light Freezing Rain", icon: "freezing_rain_light.svg" },
    "6000": { description: "Freezing Drizzle", icon: "freezing_drizzle.svg" },
    "4000": { description: "Drizzle", icon: "drizzle.svg" },
    "7101": { description: "Heavy Ice Pellets", icon: "ice_pellets_heavy.svg" },
    "7000": { description: "Ice Pellets", icon: "ice_pellets.svg" },
    "7102": { description: "Light Ice Pellets", icon: "ice_pellets_light.svg" },
    "5101": { description: "Heavy Snow", icon: "snow_heavy.svg" },
    "5000": { description: "Snow", icon: "snow.svg" },
    "5100": { description: "Light Snow", icon: "snow_light.svg" },
    "5001": { description: "Flurries", icon: "flurries.svg" },
    "8000": { description: "Thunderstorm", icon: "tstorm.svg" },
    "2100": { description: "Light Fog", icon: "fog_light.svg" },
    "2000": { description: "Fog", icon: "fog.svg" },
    "1001": { description: "Cloudy", icon: "cloudy.svg" },
    "1102": { description: "Mostly Cloudy", icon: "mostly_cloudy.svg" },
    "1101": { description: "Partly Cloudy", icon: "partly_cloudy_day.svg" },
    "1100": { description: "Mostly Clear", icon: "mostly_clear_day.svg" },
    "1000": { description: "Clear, Sunny", icon: "clear_day.svg" }
  };
  
  
    // State abbreviation to full name mapping
    stateMap: { [key: string]: string } = {
      AL: 'Alabama',
      AK: 'Alaska',
      AZ: 'Arizona',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DE: 'Delaware',
      DC: 'District Of Columbia',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'Tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virginia',
      WI: 'Wisconsin',
      WY: 'Wyoming'
    };

    stateNames: string[] = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
      'Connecticut', 'Delaware', 'District Of Columbia', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
      'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
      'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
      'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
      'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    // Load favorites from local storage on component init
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      this.favorites = JSON.parse(storedFavorites);
    }
  }

  ngOnInit() {
    // Fetch favorites from the backend on component init
    this.fetchFavorites();
  }

  // Toggle disabling of inputs
  toggleCurrentLocation() {
    this.currentLocationChecked = !this.currentLocationChecked;
    if (this.currentLocationChecked) {
      this.streetError = '';
      this.cityError = ''; // Clear error messages when fields are disabled
    } else {
      this.validateStreet();
      this.validateCity();
    }
  }

  // Method to handle street input and validate
  onStreetInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.street = inputElement?.value || '';
    this.validateStreet();
  }

  // Method to handle city input and validate
  onCityInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.city = inputElement?.value || '';
    this.validateCity();

    if (this.city.trim() !== '') {
      this.fetchCitySuggestions(this.city);
    } else {
      this.cityOptions = [];
    }
  }

  fetchCitySuggestions(input: string) {
    // const url = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/api/place/autocomplete?input=${input}`;
    const url = `http://localhost:3000/api/place/autocomplete?input=${input}`;

    this.http.get<any>(url).subscribe(response => {
      this.cityOptions = response.predictions.map((prediction: any) => {
        const terms = prediction.terms;
        let city = '';
        let stateAbbreviation = '';
        let stateFullName = '';

        if (terms.length >= 2) {
          city = terms[0].value; // City is the first term
          stateAbbreviation = terms[1].value; // State abbreviation is the second term
          stateFullName = this.stateMap[stateAbbreviation] || ''; // Get full state name
        }

        return { city, state: stateFullName };
      });
    });
  }

  onCitySelected(selectedCity: string) {
    const selectedOption = this.cityOptions.find(option => option.city === selectedCity);
    if (selectedOption) {
      this.city = selectedOption.city;
      this.state = selectedOption.state; // Populate the state field with the full state name
    }
  }
  

  onStateChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.state = selectElement?.value || '';
  }
  

  onStreetBlur() {
    this.validateStreet();
  }

  onCityBlur() {
    this.validateCity();
  }

  // Validate the street input
  validateStreet() {
    if (this.street.trim() === '') {
      this.streetError = 'Please enter a valid street';
    } else {
      this.streetError = '';
    }
  }

  // Validate the city input
  validateCity() {
    if (this.city.trim() === '') {
      this.cityError = 'Please enter a valid city';
    } else {
      this.cityError = '';
    }
  }

  activateButton(button: string) {
    this.activeButton = button;
  }

  isSearchButtonEnabled(): boolean {
    return (
      (!this.currentLocationChecked &&
      this.street.trim() !== '' &&
      this.city.trim() !== '' &&
      this.state !== '') || this.currentLocationChecked
    );
  }

  search() {
    // Check if current location is checked
    this.showDetails = false; // Hide the details pane
    this.activeButton = 'results'; // Switch to results view
    this.showErrorAlert = false; // Hide the error alert
    this.isLoading = true;
    if (this.currentLocationChecked) {
      // Fetch location based on IP from ipinfo.io
      const ipInfoUrl = `https://ipinfo.io/json?token=f57139cd172789`;

      fetch(ipInfoUrl)
        .then(response => response.json())
        .then(data => {
          if (data.loc) {
            const [lat, lng] = data.loc.split(',');
            this.lat = Number(lat);
            this.lng = Number(lng);
            this.formattedAddress = `${data.city}, ${data.region}`;

            this.resultCity = data.city;
            this.resultState = data.region;
            console.log('Formatted Address:', this.formattedAddress);
  
            // Now, use the lat and lng to fetch the weather information from Tomorrow.io
            // const weatherUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/get_weather?lat=${lat}&lng=${lng}`;
            const weatherUrl = `http://localhost:3000/get_weather?lat=${lat}&lng=${lng}`;
            
            this.http.get<any>(weatherUrl).subscribe(
              weatherResponse => {
                // Handle and display the weather information
                console.log('Weather Information:', weatherResponse);
  
                // Store the weather information in a property
                this.weatherData = weatherResponse;
                this.isLoading = false;
                this.transformWeatherData(); // Transform the weather data for display
              },
              weatherError => {
                console.error('Error fetching weather information:', weatherError);
                this.showErrorAlert = true;
                this.isLoading = false;
                console.log('showerror', this.showErrorAlert);
              }
            );
          } else {
            console.error('Location not found in IP data');
            this.showErrorAlert = true;
            this.isLoading = false;
          }
        })
        .catch(error => {
          console.error('Error fetching IP location data:', error);
          this.showErrorAlert = true;
          this.isLoading = false;
        });
    } else {
      // Fetch location based on address
      // const locationUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/get_location?street=${encodeURIComponent(this.street)}&city=${encodeURIComponent(this.city)}&state=${encodeURIComponent(this.state)}`;
      const locationUrl = `http://localhost:3000/get_location?street=${encodeURIComponent(this.street)}&city=${encodeURIComponent(this.city)}&state=${encodeURIComponent(this.state)}`;

      // First, fetch the location (latitude and longitude)
      this.http.get<any>(locationUrl).subscribe(
        locationResponse => {
          console.log('Location Information:', locationResponse);
          const lat = locationResponse.latitude;
          const lng = locationResponse.longitude;
          this.lat = typeof lat === 'string' ? Number(lat) : lat;
          this.lng = typeof lng === 'string' ? Number(lng) : lng;
          this.formattedAddress = locationResponse.formatted_address;
          console.log('Formatted Address:', this.formattedAddress);
  
          // Now, use the lat and lng to fetch the weather information from Tomorrow.io
          // const weatherUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/get_weather?lat=${lat}&lng=${lng}`;
          const weatherUrl = `http://localhost:3000/get_weather?lat=${lat}&lng=${lng}`;

          this.http.get<any>(weatherUrl).subscribe(
            weatherResponse => {
              // Handle and display the weather information
              console.log('Weather Information:', weatherResponse);
              this.resultCity = this.city;
              this.resultState = this.state;
              // Store the weather information in a property
              this.weatherData = weatherResponse;
              this.isLoading = false;
              this.transformWeatherData(); // Transform the weather data for display
            },
            weatherError => {
              console.error('Error fetching weather information:', weatherError);
              this.showErrorAlert = true;
              this.isLoading = false;
            }
          );
        },
        locationError => {
          console.error('Error fetching location information:', locationError);
          this.showErrorAlert = true;
          this.isLoading = false;
        }
      );
    }
  }

  clear() {
    this.street = '';
    this.city = '';
    this.state = '';
    this.currentLocationChecked = false;
    this.streetError = '';
    this.cityError = '';
    this.cityOptions = [];
    this.formattedAddress = '';
    this.weatherData = null;
    this.transformedWeatherData = [];
    this.resultCity = '';
    this.resultState = '';
    this.lng = 0;
    this.lat = 0;
    this.selectedDateData = null;
    this.showDetails = false;
    this.showErrorAlert = false;
    this.isLoading = false;
    if (this.formCheckElement) {
      // Uncheck the checkbox by directly setting the 'checked' property
      const checkbox = this.formCheckElement.nativeElement.querySelector('#current-location');
      if (checkbox) {
        checkbox.checked = false; // Uncheck the checkbox
      }
    }
    this.selectedIndex = null;
    
    console.log('Form cleared');
  }

  transformWeatherData() {
    if (this.weatherData && this.weatherData['1d']) {
      this.transformedWeatherData = this.weatherData['1d'].map((day: any, index: number) => {
        const date = new Date(day.startTime);
        // Format each part of the date separately
        const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNum = date.toLocaleDateString('en-US', { day: '2-digit' });
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.toLocaleDateString('en-US', { year: 'numeric' });

        // Combine parts with a comma between weekday and date
        const formattedDate = `${weekday}, ${dayNum} ${month} ${year}`;
  
        const weatherCode = day.values.weatherCode;
        const weatherInfo = this.weatherCodeMapping[weatherCode] || { description: "Unknown", icon: "default-icon.png" };
  
        return {
          formattedDate,
          description: weatherInfo.description,
          icon: `/Images/WeatherSymbols/${weatherInfo.icon}`,
          tempHigh: day.values.temperatureMax,
          tempLow: day.values.temperatureMin,
          windSpeed: day.values.windSpeed
        };
      });
    }
  }

  onDateSelected(index: number): void {
    this.selectedIndex = index;
    this.selectedDateData = this.weatherData['1d'][this.selectedIndex];
    this.showDetails = true;
    this.cdr.detectChanges();
  }

  onClickDetails(event: Event): void {
    event.preventDefault();
    if (this.selectedIndex == null) {
      this.onDateSelected(0); // Default to the first day's details
    }
    this.showDetails = true; // Show the details pane
  }

  goBackToList(): void {
    this.showDetails = false; // Hide the details pane
  }

  addFavorite() {
    // const favoriteUrl = 'http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/api/favorites';
    const favoriteUrl = 'http://localhost:3000/api/favorites';

    const city = this.resultCity;
    const state = this.resultState;
    const lat = this.lat;
    const lng = this.lng;
    const newFavorite = { city, state, lat, lng };
    // Make a POST request to save the favorite to the backend
      this.http.post<any>(favoriteUrl, newFavorite).subscribe(
        response => {
          console.log('Favorite added successfully:', response);

          // After successfully adding, fetch the updated list of favorites
          this.fetchFavorites();
        },
        error => {
          console.error('Error adding favorite:', error);
          this.showErrorAlert = true;
        }
      );
  }

  fetchFavorites() {
    // const favoritesUrl = 'http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/api/get_favorites';
    const favoritesUrl = 'http://localhost:3000/api/get_favorites';

    // Make a GET request to retrieve the favorites from the backend
    this.http.get<any[]>(favoritesUrl).subscribe(
      data => {
        // Assign the fetched data to the favorites property
        this.favorites = data;
        console.log('Favorites fetched successfully:', this.favorites);
      },
      error => {
        console.error('Error fetching favorites:', error);
      }
    );
  }

  isCityFavorited(city: string, lat: number, lng: number): boolean {
    return this.favorites.some(favorite => 
      favorite.city === city && favorite.lat === lat && favorite.lng === lng
    );
  }

  // Method to toggle favorite status
  toggleFavorite(city: string, state: string, lat: number, lng: number) {
    const favorite = this.favorites.find(fav => 
      fav.city === city && fav.lat === lat && fav.lng === lng
    );

    if (favorite) {
      // If city with matching lat and lng is already favorited, remove it
      this.removeFavorite(favorite._id);
    } else {
      // If city is not favorited, add it
      this.addFavorite();
    }
  }

  removeFavorite(id: string) {
    // const deleteUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/api/favorites/${id}`; // Use localhost URL
    const deleteUrl = `http://localhost:3000/api/favorites/${id}`; 

    this.http.delete(deleteUrl).subscribe(
      response => {
        console.log('City deleted successfully:', response);
        // Remove the city from the local array after successful deletion
        this.favorites = this.favorites.filter(fav => fav._id !== id);
      },
      error => {
        console.error('Error deleting city:', error);
      }
    );
  }

  onWeatherDataFetched({ lat, lng, city, state }: { lat: number; lng: number; city: string; state: string }) {
    this.lat = lat;
    this.lng = lng;
    // const weatherUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/get_weather?lat=${lat}&lng=${lng}`;
    const weatherUrl = `http://localhost:3000/get_weather?lat=${lat}&lng=${lng}`;
    this.showErrorAlert = false;
    this.isLoading = true;
    this.showDetails = false; // Hide the details pane
    this.http.get<any>(weatherUrl).subscribe(
      weatherResponse => {
        // Handle and display the weather information
        console.log('Weather Information:', weatherResponse);
        this.resultCity = city;
        this.resultState = state;
        // Store the weather information in a property
        this.weatherData = weatherResponse;
        this.isLoading = false;
        this.transformWeatherData(); // Transform the weather data for display
      },
      weatherError => {
        console.error('Error fetching weather information:', weatherError);
        this.showErrorAlert = true;
        this.isLoading = false;
      }
    );
  }

  onSetActiveButton(buttonName: string) {
    this.activeButton = buttonName;
  }

}
