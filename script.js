// OpenWeatherMap API key
const apiKey = '52d05b7e27e9bc32067327bf0f6532dc';

// Function to fetch weather data from OpenWeatherMap API
function fetchWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched weather data:', data);

      // Process and simplify the weather data
      const weatherData = data.list.map(item => ({
        date: item.dt_txt,
        temperature: Math.round(item.main.temp - 273.15), // Convert Kelvin to Celsius
        humidity: item.main.humidity,
        weather: item.weather[0].main
      }));

      console.log('Processed weather data:', weatherData);

      // Update the city weather display
      document.getElementById('city-weather').textContent = `Weather data for ${city}`;

      // Create visualizations
      createBarChart(weatherData);
      createHeatmap(weatherData);
      createLineChart(weatherData);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', () => {
  const cityInput = document.getElementById('city-input');
  const city = cityInput.value.trim();

  if (city !== '') {
    fetchWeatherData(city);
    cityInput.value = ''; // Clear the input field after search
  }
});

// Function to create a bar chart for temperature data
function createBarChart(weatherData) {
  // Set up chart dimensions and margins
  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = document.querySelector('.chart-container').clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#chart')
    .html('') // Clear previous chart
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Set up scales
  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(weatherData, d => new Date(d.date)));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(weatherData, d => d.temperature)]);

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%m-%d %H:%M')).ticks(d3.timeHour.every(6)))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)')
    .style('font-size', '12px');

  // Add year label for the first date
  svg.append('text')
    .attr('class', 'year-label')
    .attr('x', x(new Date(weatherData[0].date)))
    .attr('y', height + margin.bottom - 40)
    .attr('text-anchor', 'start')
    .text(d3.timeFormat('%Y')(new Date(weatherData[0].date)));

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y));

  // Create bars
  svg.selectAll('.bar')
    .data(weatherData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(new Date(d.date)))
    .attr('width', width / weatherData.length)
    .attr('y', d => y(d.temperature))
    .attr('height', d => height - y(d.temperature));

  // Add x-axis label
  svg.append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 20)
    .text('Date');

  // Add y-axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${-margin.left + 20}, ${height / 2}) rotate(-90)`)
    .text('Temperature (°C)');

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .text('Temperature Bar Chart');
}

// Function to create a heatmap for humidity data
function createHeatmap(weatherData) {
  console.log('Heatmap Data:', weatherData);
  
  // Set up heatmap dimensions and margins
  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = document.querySelector('.heatmap-container').clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#heatmap')
    .html('') // Clear previous heatmap
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Set up scales
  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(weatherData, d => new Date(d.date)));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(weatherData, d => d.humidity)]);

  // Set up color scale
  const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
    .domain([d3.min(weatherData, d => d.humidity), d3.max(weatherData, d => d.humidity)]);

  // Create heatmap cells
  svg.selectAll('.cell')
    .data(weatherData)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('x', d => x(new Date(d.date)))
    .attr('width', width / weatherData.length)
    .attr('y', d => y(d.humidity))
    .attr('height', d => height - y(d.humidity))
    .attr('fill', d => colorScale(d.humidity));

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%m-%d %H:%M')).ticks(d3.timeHour.every(6)))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)')
    .style('font-size', '12px');

  // Add year label for the first date
  svg.append('text')
    .attr('class', 'year-label')
    .attr('x', x(new Date(weatherData[0].date)))
    .attr('y', height + margin.bottom - 40)
    .attr('text-anchor', 'start')
    .text(d3.timeFormat('%Y')(new Date(weatherData[0].date)));

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 20)
    .text('Date');

  // Add y-axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${-margin.left + 20}, ${height / 2}) rotate(-90)`)
    .text('Humidity (%)');

  // Add heatmap title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .text('Humidity Heatmap');
}

// Function to create a line chart for temperature data
function createLineChart(weatherData) {
  console.log('Line Chart Data:', weatherData);
  
  // Set up line chart dimensions and margins
  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = document.querySelector('.line-chart-container').clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select('#line-chart')
    .html('') // Clear previous line chart
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Set up scales
  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(weatherData, d => new Date(d.date)));

  const y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(weatherData, d => d.temperature)]);

  // Create line generator
  const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.temperature));

  // Add the line path
  svg.append('path')
    .datum(weatherData)
    .attr('class', 'line')
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.5)
    .attr('d', line);

  // Add x-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%m-%d %H:%M')).ticks(d3.timeHour.every(6)))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)')
    .style('font-size', '12px');

  // Add year label for the first date
  svg.append('text')
    .attr('class', 'year-label')
    .attr('x', x(new Date(weatherData[0].date)))
    .attr('y', height + margin.bottom - 40)
    .attr('text-anchor', 'start')
    .text(d3.timeFormat('%Y')(new Date(weatherData[0].date)));

  // Add y-axis
  svg.append('g')
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append('text')
    .attr('class', 'x-label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 20)
    .text('Date');

  // Add y-axis label
  svg.append('text')
    .attr('class', 'y-label')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${-margin.left + 20}, ${height / 2}) rotate(-90)`)
    .text('Temperature (°C)');

  // Add chart title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', -margin.top / 2)
    .text('Temperature Line Chart');
}
