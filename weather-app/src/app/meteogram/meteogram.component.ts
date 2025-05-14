import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import Windbarb from 'highcharts/modules/windbarb';
HighchartsMore(Highcharts);
Windbarb(Highcharts);


@Component({
  selector: 'app-meteogram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meteogram.component.html',
  styleUrl: './meteogram.component.css'
})
export class MeteogramComponent {
  @Input() weatherData: any;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.drawHourlyWeatherChart(this.weatherData['1h']);
  }

  drawHourlyWeatherChart(hourlyData: any[]): void {
    const humidityData: [number, number][] = [];
    const temperatureData: [number, number][] = [];
    const airPressureData: [number, number][] = [];
    const windSpeedData: [number, number][] = [];
    const windDirectionData: [number, number][] = [];

    hourlyData.forEach(entry => {
      const timestamp = new Date(entry.startTime).getTime();

      humidityData.push([timestamp, entry.values.humidity]);
      temperatureData.push([timestamp, entry.values.temperature]);
      airPressureData.push([timestamp, entry.values.pressureSeaLevel]);
      windSpeedData.push([timestamp, entry.values.windSpeed]);
      windDirectionData.push([timestamp, entry.values.windDirection]);
    });

    // Prepare wind barb data by filtering every 2 hours
    const windBarbData = windDirectionData.filter((_, index) => index % 2 === 0)
      .map((point, index) => [
        point[0], // Timestamp
        windSpeedData[index * 2][1], // Wind speed for the same timestamp
        point[1] // Wind direction
      ]);

    Highcharts.chart(this.el.nativeElement.querySelector('#hourly-weather-chart') as HTMLElement, {
      chart: {
        zoomType: 'xy',
        scrollablePlotArea: {
          minWidth: 800, // Minimum width of the plot area
          scrollPositionX: 0
        }
      },
      title: {
        text: 'Hourly Weather (For Next 5 Days)'
      },
      xAxis: [{
        type: 'datetime',
        tickInterval: 1 * 3600 * 1000, // 1-hour intervals
        labels: { enabled: false },
        gridLineWidth: 1
      }, {
        type: 'datetime',
        linkedTo: 0,
        opposite: true,
        tickInterval: 24 * 3600 * 1000, // 1 day
        labels: { format: '{value:%a %b %d}', align: 'center' },
      }, {
        type: 'datetime',
        linkedTo: 0,
        opposite: false,
        tickInterval: 6 * 3600 * 1000, // Every 6 hours
        labels: { format: '{value:%H}', align: 'center' },
      }],
      yAxis: [{
        labels: { format: '{value}°', style: { color: '#000' } },
        title: { text: null },
        gridLineWidth: 1,
        tickInterval: 5
      }, {
        title: {
          text: 'inHg',
          style: { color: 'orange' },
          rotation: 0,
          align: 'high',
          y: 20,
          x: -30
        },
        labels: {
          formatter: function () { return this.value === 29 ? '29' : ''; },
          style: { color: 'orange' }
        },
        opposite: true,
        tickPositions: [0, 29, 58], 
        min: 0, max: 58,
        gridLineWidth: 1,
        tickInterval: 5
      }],
      tooltip: {
        shared: true,
        formatter: function () {
          // Format the tooltip header with the date and time
          let tooltip = `<b>${Highcharts.dateFormat('%A, %b %e, %H:%M', Number(this.x))}</b>`;
        
          if (this.points) { // Check if points is defined
            this.points.forEach(point => {
                if (point.series.name !== 'Wind Direction') {
                    tooltip += `<br/><span style="color:${point.series.color}">\u25CF</span> ${point.series.name}: <b>${point.y}</b>`;
                    tooltip += (point.series.options as any).tooltipOptions?.valueSuffix || ''; // Using a type assertion
                }
            });
        }
        
          // Find the wind speed point that matches the current timestamp
          const windSpeedPoint = windSpeedData.find(point => point[0] === Number(this.x));
          if (windSpeedPoint) {
            const windSpeedValue = windSpeedPoint[1];
            let windDescription = '';
        
            // Determine the wind speed description
            if (windSpeedValue < 1) windDescription = '(Calm)';
            else if (windSpeedValue <= 3) windDescription = '(Light air)';
            else if (windSpeedValue <= 7) windDescription = '(Light breeze)';
            else if (windSpeedValue <= 12) windDescription = '(Gentle breeze)';
            else if (windSpeedValue <= 18) windDescription = '(Moderate breeze)';
            else if (windSpeedValue <= 24) windDescription = '(Fresh breeze)';
            else if (windSpeedValue <= 31) windDescription = '(Strong breeze)';
            else if (windSpeedValue <= 38) windDescription = '(Near gale)';
            else if (windSpeedValue <= 46) windDescription = '(Gale)';
            else if (windSpeedValue <= 54) windDescription = '(Strong gale)';
            else if (windSpeedValue <= 63) windDescription = '(Whole gale)';
            else if (windSpeedValue <= 75) windDescription = '(Storm force)';
            else windDescription = '(Hurricane force)';
        
            // Append wind speed details to the tooltip
            tooltip += `<br/><span style="color:#7cb5ec">\u25CF</span> Wind Speed: <b>${windSpeedValue}</b> mph ${windDescription}`;
          }
        
          return tooltip;
        }        
      },
      legend: { enabled: false },
      exporting: {
        enabled: true
      },
      series: [
        {
          name: 'Humidity',
          type: 'column',
          data: humidityData,
          pointRange: 3600 * 1000,
          pointPlacement: 'between',
          groupPadding: 0,
          pointPadding: 0,
          borderRadius: 3,
          color: 'rgb(123,198,254)',
          tooltip: { valueSuffix: ' %' },
          dataLabels: { enabled: true, format: '{point.y:.1f}' }
        },
        {
          name: 'Temperature',
          type: 'spline',
          data: temperatureData,
          color: 'red',
          marker: { symbol: 'circle', radius: 1 },
          tooltip: { valueSuffix: ' °F' }
        },
        {
          name: 'Air Pressure',
          type: 'spline',
          yAxis: 1,
          data: airPressureData,
          marker: { symbol: 'circle', radius: 1 },
          color: 'orange',
          tooltip: { valueSuffix: ' inHg' }
        },
        {
          name: 'Wind Direction',
          type: 'windbarb',
          xAxis: 2,
          data: windBarbData,
          yOffset: -10,
          vectorLength: 14,
          color: '#544fc5'
        }
      ]
    } as Highcharts.Options);
  }
}
