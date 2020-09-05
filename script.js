

var userInputCity;
var userInputState;
var removedSpacesCity;
var removedSpacesState;

var previousSearches = [];


$("#searchButton").on("click", function(){
    userInputCity = $("#city").val();
    userInputState = $("#state").val();
    event.preventDefault();
    clearOldSearch();
    searchCity();
    init();
})

$("#recent-searches").click(function(event){
    event.preventDefault();
    var element = event.target
    if (element.matches("li") === true){
        userInputCity = element.getAttribute("city");
        userInputState = element.getAttribute("state");
    }
    clearOldSearch();
    searchCity();
    init();
})


function clearOldSearch() {
    $(".days").html("");
    $(".current-day").html(""); 
    $(".currentSymbol").html("");
    $(".currentTemp").html("");
    $(".recent-searches").html("");
}

function searchCity() {
    removedSpacesCity = userInputCity.split(" ").join("");
    removedSpacesState =  userInputState.split(" ").join("");

    previousSearches.unshift({city: userInputCity, state: userInputState});
    
    writeCurrentDate();
    storeSearches();
}


function renderPreviousSearches() {
    $("#recent-searches").html("");

    var recentSearchesContainer = $("#recent-searches")

    if (previousSearches.length < 6 ) {
        for (var i = 0; i < previousSearches.length; i++) {
            var previousSearch = previousSearches[i];
            var prevSearchDisp = $("<li>");
            prevSearchDisp.addClass("previous-searches")
            prevSearchDisp.attr("city", previousSearch.city);
            prevSearchDisp.attr("state", previousSearch.state);
            prevSearchDisp.text(previousSearch.city + ", " + previousSearch.state);
            recentSearchesContainer.append(prevSearchDisp);
        }
    } else {
        for (var i = 0; i < 5; i++) {
            var previousSearch = previousSearches[i];
            var prevSearchDisp = $("<li>");
            prevSearchDisp.addClass("previous-searches")
            prevSearchDisp.attr("city", previousSearch.city);
            prevSearchDisp.attr("state", previousSearch.state);
            prevSearchDisp.text(previousSearch.city + ", " + previousSearch.state);
            recentSearchesContainer.append(prevSearchDisp);
        }
    }
    
}

function init() {
  
  var storedSearches = JSON.parse(localStorage.getItem("prevsearch"));

  if (storedSearches !== null) {
    previousSearches = storedSearches;
    userInputCity = previousSearches[0].city;
    userInputState = previousSearches[0].state;
  }
  generateOWURL();
  renderPreviousSearches();
}

function storeSearches() {
  localStorage.setItem("prevsearch", JSON.stringify(previousSearches));
}


function writeCurrentDate() {
    $("#currentDate").html("");
    var currentDateStr = moment().format('dddd, MMMM Do');
    $("#currentDate").append(currentDateStr, "  ---  ", userInputCity);
}

function generateOWURL() {

    var openWURL = "https://api.openweathermap.org/data/2.5/weather?q=" + removedSpacesCity + "," + removedSpacesState + "&appid=a45736dce96af4ff411de1c549396bc3&units=imperial"

    console.log(openWURL)
    
    $.ajax({
        url: openWURL,
        method: "GET"
    }).then(function(response) {

        console.log(response);

        var cityLat = response.coord.lat;
        var cityLong = response.coord.lon;

        var oneCallURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLong + "&appid=a45736dce96af4ff411de1c549396bc3&units=imperial"

        $.ajax({
            url: oneCallURL,
            method: "GET"
        }).then(function(response){
            console.log(response);

            var currentIconCode = response.current.weather[0].id;
            var currentIconI = $("<i>");
            var owfIcon = "owf owf-"  + currentIconCode + " owf-5x"
            currentIconI.addClass(owfIcon);
            var currentIconTitle = $("<p>").text("The weather is currently:")
            var currentWeatherDesc = response.current.weather[0].description
            var currentWeatherEl = $("<p>").text(currentWeatherDesc).addClass("description")
            $(".currentSymbol").append(currentIconTitle, currentIconI, currentWeatherEl);

            var currentCityTemp = response.current.temp;
            var currentCityTempF = (currentCityTemp).toFixed(0);
            var currentTempStr = currentCityTempF +"°F";
            var currentTempEl = $("<p>").text(currentTempStr);
            currentTempEl.addClass("tempBig");
            var currentTempTitle = $("<p>").text("The temperature is currently:");
           

            var dropdownButton = $("<button>").html('<i class="fas fa-chevron-down"></i><i class="fas fa-chevron-up hidden"></i>');
            dropdownButton.click(function(){
                $("#tempChart").slideToggle();
                $(".fas").toggle();
            });

            $(".currentTemp").append(currentTempTitle, currentTempEl, dropdownButton);

            var currentCityHigh = response.daily[0].temp.max;
            var currentCityHighF = (currentCityHigh).toFixed(0);
            var currentCityLow = response.daily[0].temp.min;
            var currentCityLowF = (currentCityLow).toFixed(0);
            var currentCityHighLowStr = "Temp Today:   " + currentCityHighF + "°F / " + currentCityLowF + "°F";
            var currentCityHighLowEl = $("<p>").text(currentCityHighLowStr);

            var humidityCurrent = response.current.humidity;
            var humidityCurrentStr = "Current Humidity:   "+ humidityCurrent + "%";
            var humidityCurrentDisp = $("<p>").text(humidityCurrentStr);

            var currentUV = response.current.uvi;
            var currentUVStr = "Current UV Index:   "+ currentUV + "  "
            var currentUVDisp = $("<p>").text(currentUVStr);
            if (currentUV < 3) {
                $(currentUVDisp).append("<p class = 'uv-desc'> - low </p>");
            } else if (3 <= currentUV && currentUV < 6){
                $(currentUVDisp).append("<p class = 'uv-desc'> - moderate </p>");
            } else if (6 <= currentUV && currentUV < 8){
                $(currentUVDisp).append("<p class = 'uv-desc'> - high </p>");
            } else if (8 <= currentUV && currentUV < 10){
                $(currentUVDisp).append("<p class = 'uv-desc'> - very high </p>");
            } else if (10 <= currentUV){
                $(currentUVDisp).append("<p class = 'uv-desc'> - extreme </p>");
            }

            var currentWindSpeed = response.current.wind_speed
            var currentWindSpeedStr = "Current Wind Speed:   " + currentWindSpeed + " mph";
            var currentWindSpeedDisp = $("<p>").text(currentWindSpeedStr);

            $(".current-day").append(currentCityHighLowEl, humidityCurrentDisp, currentWindSpeedDisp, currentUVDisp);
           
            // Building the drop down temp chart
            
            var hoursArr = [];

            var tempArr = [];
            
            for (var i = 0; i < 24; i++) {
                var hourTime = new Date(response.hourly[i].dt*1000).getHours();
                var hourTemp = response.hourly[i].temp;

                console.log(hourTime);
                var hourTimeFrmt;

                if (hourTime == 0) {
                    hourTimeFrmt = " 12am";
                 } else if ( hourTime > 0 && hourTime < 12) {
                    hourTimeFrmt = hourTime + " am";
                 } else if (hourTime == 12){
                    hourTimeFrmt = hourTime + " pm";
                 } else if (hourTime > 12) {
                    var displayHour = hourTime - 12
                    hourTimeFrmt = displayHour + " pm";
                }
                
                hoursArr.push(hourTimeFrmt);
                tempArr.push(hourTemp);
            }

            // Using Plotly

            var trace1 = {
                x: hoursArr,
                y: tempArr,
                mode: 'lines',
                line: {shape: 'spline'},
            };
            var data = [ trace1 ];
              
            var layout = {
                xaxis: {
                    showgrid: false,
                    tickmode: "array",
                    tickvals: [hoursArr[0], hoursArr[5], hoursArr[11], hoursArr[17], hoursArr[23]],
                },
                yaxis: {
                    title: '°F',
                    showgrid: false
                },
                font: {
                    family: 'EB Garamond, serif',
                },
                height: 300,
                colorway: ['#000000'],
            };
              
            Plotly.newPlot('tempChart', data, layout, {responsive: true, scrollZoom: true, displayModeBar: false});

            // Building out the 5 day forecast

            var fiveDayArr = $(".days");

            for (var i=0; i<5; i++ ){
                var setDate = moment(new Date()).add(i+1, "days").format('dddd, MMMM Do')
                var fiveDayDate = document.createElement("h5");
                fiveDayDate.textContent = setDate;
                fiveDayArr[i].append(fiveDayDate);

                var fiveDayIconCode = response.daily[i+1].weather[0].id;
                var fiveDayOwfIcon = "owf owf-"  + fiveDayIconCode + " owf-2x";
                var fiveDayIconI = $("<i>").addClass(fiveDayOwfIcon);

                var fiveDayHigh = response.daily[i+1].temp.max;
                var fiveDayLow = response.daily[i+1].temp.min;
                var fiveDayHighLowStr = "Temp:   " + fiveDayHigh.toFixed(0) + "°F / " + fiveDayLow.toFixed(0) + "°F";
                var fiveDayHighLowEl = $("<p>").text(fiveDayHighLowStr);

                var fiveDayHumid = response.daily[i+1].humidity;
                var fiveDayHumidStr = "Humidity:   " + fiveDayHumid + "%";
                var fiveDayHumidEl = $("<p>").text(fiveDayHumidStr);
                
                fiveDayArr[i].append(fiveDayIconI[0], fiveDayHighLowEl[0], fiveDayHumidEl[0]);                
            };  
        })    
    })
}