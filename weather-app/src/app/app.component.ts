import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherFormComponent } from './weather-form/weather-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

}