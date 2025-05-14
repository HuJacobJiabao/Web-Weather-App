import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  standalone: true,
  selector: 'app-weather-details',
  imports: [GoogleMapsModule],
  templateUrl: './weather-details.component.html',
  styleUrls: ['./weather-details.component.css']
})
export class WeatherDetailsComponent implements OnInit, OnChanges {
  @Input() selectedDateData: any; // Data for the selected date
  @Input() resultCity!: string;
  @Input() resultState!: string;
  @Input() selectedIndex!: number; // Index of the selected date
  @Input() lat!: number;
  @Input() lng!: number;
  @Output() backToList = new EventEmitter<void>(); // Event to signal the parent to go back


  formattedDate: string = '';
  status: string = '';
  weatherDetails: any = {};
  

  // Mapping for weather codes to descriptions
  weatherCodeMapping: { [key: string]: { description: string } } = {
    "4201": { description: "Heavy Rain" },
    "4001": { description: "Rain" },
    "4200": { description: "Light Rain" },
    "6201": { description: "Heavy Freezing Rain" },
    "6001": { description: "Freezing Rain" },
    "6200": { description: "Light Freezing Rain" },
    "6000": { description: "Freezing Drizzle" },
    "4000": { description: "Drizzle" },
    "7101": { description: "Heavy Ice Pellets" },
    "7000": { description: "Ice Pellets" },
    "7102": { description: "Light Ice Pellets" },
    "5101": { description: "Heavy Snow" },
    "5000": { description: "Snow" },
    "5100": { description: "Light Snow" },
    "5001": { description: "Flurries" },
    "8000": { description: "Thunderstorm" },
    "2100": { description: "Light Fog" },
    "2000": { description: "Fog" },
    "1001": { description: "Cloudy" },
    "1102": { description: "Mostly Cloudy" },
    "1101": { description: "Partly Cloudy" },
    "1100": { description: "Mostly Clear" },
    "1000": { description: "Clear, Sunny" }
  };

  ngOnInit(): void {
    if (this.selectedDateData) {
      // Extract the selected day's data using the provided index
      const selectedDay = this.selectedDateData;
      this.formattedDate = this.formatDate(selectedDay.startTime);
      this.status = this.getWeatherDescription(selectedDay.values.weatherCode);

      // Populate the weather details object with necessary values
      this.weatherDetails = {
        maxTemperature: selectedDay.values.temperatureMax,
        minTemperature: selectedDay.values.temperatureMin,
        apparentTemperature: selectedDay.values.temperatureApparent,
        sunRiseTime: this.formatTime(selectedDay.values.sunriseTime),
        sunSetTime: this.formatTime(selectedDay.values.sunsetTime),
        humidity: selectedDay.values.humidity,
        windSpeed: selectedDay.values.windSpeed,
        visibility: selectedDay.values.visibility,
        cloudCover: selectedDay.values.cloudCover
      };

    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDateData']) {
      // Handle the update and refresh any relevant data
      this.updateWeatherDetails();
    }
  }

  updateWeatherDetails() {
    if (this.selectedDateData) {
      // Extract the selected day's data using the provided index
      const selectedDay = this.selectedDateData;
      this.formattedDate = this.formatDate(selectedDay.startTime);
      this.status = this.getWeatherDescription(selectedDay.values.weatherCode);

      // Populate the weather details object with necessary values
      this.weatherDetails = {
        maxTemperature: selectedDay.values.temperatureMax,
        minTemperature: selectedDay.values.temperatureMin,
        apparentTemperature: selectedDay.values.temperatureApparent,
        sunRiseTime: this.formatTime(selectedDay.values.sunriseTime),
        sunSetTime: this.formatTime(selectedDay.values.sunsetTime),
        humidity: selectedDay.values.humidity,
        windSpeed: selectedDay.values.windSpeed,
        visibility: selectedDay.values.visibility,
        cloudCover: selectedDay.values.cloudCover
      }
    }

  }

  goBack() {
    this.backToList.emit();
  }
  

  formatDate(startTime: string): string {
    const date = new Date(startTime);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    };
  
    // Generate the formatted date string
    let formattedDate = date.toLocaleDateString('en-US', options);
  
    // Add a period after the month abbreviation
    formattedDate = formattedDate.replace(/(\b[A-Z][a-z]{2}\b)/, '$1.');
  
    return formattedDate;
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Round to the nearest hour
    if (minutes >= 30) {
      hours += 1;
    }
  
    // Format to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  
    return `${formattedHours} ${ampm}`;
  }

  getWeatherDescription(weatherCode: string): string {
    return this.weatherCodeMapping[weatherCode]?.description || "Unknown Weather";
  }

  tweetWeather() {
    // Use the weather details for the tweet content
    const temperature = this.weatherDetails.maxTemperature;
    const weatherDescription = this.status;
    const tweetText = `The temperature in ${this.resultCity}, ${this.resultState} on ${this.formattedDate} is ${temperature}°F and the conditions are ${weatherDescription} #CSCI571WeatherForecast`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
  }
}
