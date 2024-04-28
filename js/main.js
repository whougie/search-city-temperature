let searchCityHistory = JSON.parse(localStorage.getItem("searchCityHistory"));

/////////
// Execute Code Flow
/////////
generateSearchButtons();

///////
// Event Listeners Declarations
///////

// Listener for city search button
const searchButtonElement = $('.searchButton');
const searchCityValueElement = $('#searchCityValue');

// setup search button listener'
searchButtonElement.on('click', (event) => {
  event.preventDefault();
  
  displayCitySearch(searchCityValueElement.val());
  displayFiveDayForecast(searchCityValueElement.val()); 
  
  searchCityValueElement.val('');
} )


///
// Create listeners for the search history buttons 
///
const searchHistoryElement = $('.searchHistory');

searchHistoryElement.on('click', (event) => {
  
  if ($(event.target).data('city')) {
    displayCitySearch($(event.target).data('city'));
    displayFiveDayForecast($(event.target).data('city'));
  }
})



//////
// Function Declarations
//////

function displayCitySearch(city) {
  // setup fetch call to get just today's date
  // parse data from response and fill out the forecast on the html
  const singleDayForecastUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=04c3d6aa3973c03986c260e63f679d61`;
  
  const searchCityElement = $('.searchCity');
  const searchCityTempElement = $('.searchCityTemp');
  const searchCityWindElement = $('.searchCityWind');
  const searchCityHumidtyElement = $('.searchCityHumidty');
  
  fetch(singleDayForecastUrl)
  .then( (response) => {
    if ( response.status === 200) {
      return response.json();
    } else {
      throw new Error("No results for " + city);
    }
  })
  .then( (data) => {
    let weatherIcon = getWeatherIconUrl(data.weather[0].id);
    
    searchCityElement.text(`${data.name} - ` + dayjs().format('MM/DD/YYYY') + " ");
    // had to append since it seems like by setting the text for the element gets rid of the image tag 
    searchCityElement.append($(`<img src=${weatherIcon} alt="weather icon"/>`)) 
    searchCityTempElement.text(`Temp: ${data.main.temp} °F`) ;
    searchCityWindElement.text(`Wind: ${data.wind.speed} mph`);
    searchCityHumidtyElement.text(`Humidity: ${data.main.humidity} %`) ;
    
    generateSearchCityHistory(city);
    generateSearchButtons();
  }).catch(error => {
    searchCityElement.text("No results for " + city);
    searchCityTempElement.text(`Temp:`) ;
    searchCityWindElement.text(`Wind:`);
    searchCityHumidtyElement.text(`Humidity:`) ;
  })
}


function displayFiveDayForecast(city) {
  // setup fetch call to get 5-day forecast
  // parse data from response and fill out the forecast on the html
  
  const fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=04c3d6aa3973c03986c260e63f679d61`
  
  fetch(fiveDayForecastUrl)
  .then(response => {
    if ( response.status === 200) {
      return response.json();
    }else {
      throw new Error("No results for " + city);
    }
  })
  .then( data => {
    const entriesAt1500 = data.list.filter( (entry) => {
      if (entry.dt_txt.includes("15:00:00"))
      return true;
    })
    
    for (let i = 1; i < 6; i++) {
      const dayDateElement = $(`.day${i}Date`);
      const dayWeatherElement = $(`.day${i}WeatherIcon`);
      const dayTempElement = $(`.day${i}Temp`);
      const dayWindElement = $(`.day${i}Wind`);
      const dayHumidty = $(`.day${i}Humidty`);
      
      dayDateElement.text(dayjs().add(i-1, 'day').format('MM/DD/YYYY'));
      dayWeatherElement.attr("src", getWeatherIconUrl(entriesAt1500[i-1].weather[0].id));
      dayWeatherElement.removeAttr("hidden");
      dayTempElement.text(`Temp: ${entriesAt1500[i-1].main.temp} °F`);
      dayWindElement.text(`Wind: ${entriesAt1500[i-1].wind.speed} mph`);
      dayHumidty.text(`Humidty: ${entriesAt1500[i-1].main.humidity} %`);
    }
    
  }) 
  .catch(error => {
    // Do nothing and exit the function
    for (let i = 1; i < 6; i++) {
      const dayDateElement = $(`.day${i}Date`);
      const dayWeatherElement = $(`.day${i}WeatherIcon`);
      const dayTempElement = $(`.day${i}Temp`);
      const dayWindElement = $(`.day${i}Wind`);
      const dayHumidty = $(`.day${i}Humidty`);
      
      dayDateElement.text("");
      dayWeatherElement.attr("hidden","");
      dayTempElement.text("Temp: ");
      dayWindElement.text("Wind: ");
      dayHumidty.text("Humidty: ");
    }
  })
}


function getWeatherIconUrl(weatherId) {
  let weatherIcon = "";
  
  if (weatherId >= 200 && weatherId < 300)
  weatherIcon = './images/thunderstorm.png';
  else if (weatherId >= 300 && weatherId < 400)
  weatherIcon = "./images/drizzle.jpg";
  else if (weatherId >= 500 && weatherId < 600)
  weatherIcon = "./images/rain.jpg";
  else if (weatherId >= 600 && weatherId < 700)
  weatherIcon = "./images/snow.png";
  else if (weatherId >= 700 && weatherId < 800)
  weatherIcon = "./images/atmosphere.png";
  else if (weatherId === 800)
  weatherIcon = "./images/clear.png";
  else if (weatherId >= 801 && weatherId < 900)
  weatherIcon = "./images/clouds.png";
  
  return weatherIcon;
}


function generateSearchCityHistory(city) {
  // Store search history array with cities  
  if (searchCityHistory) {
    if (!searchCityHistory.includes(city)) {
      const upperFirstLetterForCity = city.charAt(0).toUpperCase() + city.substr(1);
      
      if (searchCityHistory.length < 6) {
        searchCityHistory.push(upperFirstLetterForCity); 
        localStorage.setItem("searchCityHistory", JSON.stringify(searchCityHistory));
      } else {
        searchCityHistory.shift();
        searchCityHistory.push(city);
      }
    }
  } else {
    searchCityHistory = [city]
    localStorage.setItem("searchCityHistory", JSON.stringify(searchCityHistory));
  }
  console.log(city);
  console.log(searchCityHistory);
}



// Generate search history buttons from pervious searches
function generateSearchButtons() {
  const searchHistoryElement = $('.searchHistory');
  
  searchHistoryElement.empty();
  
  searchCityHistory.forEach(city => {
    const cityButton = $(`<button class="cityHistoryButton col-11 mb-2 mt-2" data-city="${city}">${city}</button>`);
    searchHistoryElement.append(cityButton);
  });
}
