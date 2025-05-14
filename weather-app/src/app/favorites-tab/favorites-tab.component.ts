import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-favorites-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites-tab.component.html',
  styleUrl: './favorites-tab.component.css'
})
export class FavoritesTabComponent{
  @Input() favorites: { _id: string; city: string; state: string, lat: number, lng: number }[] = []; // Array of favorite cities with IDs
  @Output() weatherDataFetched = new EventEmitter<{ lat: number; lng: number; city: string; state: string }>(); // To notify parent component to change to results view
  @Output() setActiveButton = new EventEmitter<string>(); // To set the active button


  constructor(private http: HttpClient) {}

  // Method to remove a favorite city from the database
  removeFavorite(index: number) {
    const favorite = this.favorites[index];
    const deleteUrl = `http://nodejsapp-env.eba-7znmmig9.us-east-1.elasticbeanstalk.com/api/favorites/${favorite._id}`; // Use localhost URL

    this.http.delete(deleteUrl).subscribe(
      response => {
        console.log('City deleted successfully:', response);
        // Remove the city from the local array after successful deletion
        this.favorites.splice(index, 1);
      },
      error => {
        console.error('Error deleting city:', error);
      }
    );
  }

  fetchWeatherData(lat: number, lng: number, city: string, state: string) {
    this.setActiveButton.emit('results');
    this.weatherDataFetched.emit({ lat, lng, city, state });
  }
}