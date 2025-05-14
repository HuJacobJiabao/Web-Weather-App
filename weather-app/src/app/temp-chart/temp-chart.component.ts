import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
HighchartsMore(Highcharts);

@Component({
  selector: 'app-temp-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temp-chart.component.html',
  styleUrls: ['./temp-chart.component.css']
})
export class TempChartComponent implements OnInit {
  @Input() weatherData: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.weatherData) {
      const chartData = this.prepareTemperatureDataForChart(this.weatherData['1d']);
      this.drawAreaRangeChart(chartData);
    }
  }

  // Function to prepare the temperature data for Highcharts
  prepareTemperatureDataForChart(weatherData: any): any[] {
    return weatherData.map((day: any) => {
      const date = new Date(day.startTime).getTime(); // Convert date to milliseconds
      const minTemp = day.values.temperatureMin;
      const maxTemp = day.values.temperatureMax;
      return [date, minTemp, maxTemp]; // Format required by Highcharts
    });
  }

  // Function to draw the Highcharts area range chart
  drawAreaRangeChart(arearangeData: any) {
    Highcharts.chart(this.el.nativeElement.querySelector('#arearange-container') as HTMLElement, {
      chart: {
        type: 'arearange',
        zoomType: 'x'
      },
      title: {
        text: 'Temperature Range (Min, Max)'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e %b' // Display only day and month
        },
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: null
        }
      },
      tooltip: {
        backgroundColor: '#fff', // Set tooltip background color
        crosshairs: true,
        shared: true,
        valueSuffix: '°F',
        xDateFormat: '%A, %b %e' // Display only date without exact time
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: true
      },
      series: [{
        type: 'arearange', // Ensure you specify the series type
        name: 'Temperature Range',
        data: arearangeData,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#FFA500'],
            [1, 'rgb(173, 216, 230)']
          ]
        },
        fillOpacity: 0.7,
        marker: {
          enabled: true,
          fillColor: 'rgb(38,165,254)',
          lineWidth: 2,
          lineColor: 'rgb(38,165,254)'
        },
        lineColor: 'rgb(250, 155, 11)',
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 2,
            halo: {
              size: 14,
              attributes: {
                fill: 'rgba(38,165,254, 0.8)',
              }
            }
          }
        }
      }]
    } as Highcharts.Options); // Make sure to cast the options object to Highcharts.Options
  }
}