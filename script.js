

var userInputCity;
var userInputState;
var removedSpacesCity;
var removedSpacesState;

var previousSearches = [];



$("#searchButton").on("click", function(){
    event.preventDefault();
    searchCity()
    clearOldSearch()
})

function clearOldSearch() {
    $(".days").html("");
    $(".current-day").html(""); 
}



function searchCity() {
    userInputCity = $("#city").val();
    userInputState = $("#state").val();
    removedSpacesCity = userInputCity.split(" ").join("");
    removedSpacesState =  userInputState.split(" ").join("");
        
    previousSearches.unshift({city: userInputCity, state: userInputState});
    
    renderPreviousSearches();
    writeCurrentDate();
    init();
    storeSearches();
}




function renderPreviousSearches() {
    $("#recent-searches").html("");

    var recentSearchesContainer = $("#recent-searches")


    for (var i = 0; i < previousSearches.length; i++) {
        var previousSearch = previousSearches[i];
        var li = document.createElement("li");
        li.textContent = previousSearch.city + ", " + previousSearch.state;
        recentSearchesContainer.append(li);
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
    $("#currentDate").append(currentDateStr, " --- ", userInputCity);
}

function generateOWURL() {
    var openWURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + removedSpacesCity + "," + removedSpacesState + "&appid=a45736dce96af4ff411de1c549396bc3"

    console.log(openWURL)
    
    $.ajax({
        url: openWURL,
        method: "GET"
    }).then(function(response) {
        
        var fiveDayArr = $(".days");

        for (var i=0; i<5; i++ ){
            
            var weatherIndex = 8*i+4;

            var setDate = moment(new Date()).add(i+1, "days").format('dddd, MMMM Do')
            var fiveDayDate = document.createElement("h5");
            fiveDayDate.textContent = setDate;
            fiveDayArr[i].append(fiveDayDate);
            var iconcode = response.list[weatherIndex].weather[0].icon

            var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";

            var iconHome = document.createElement("img");

            iconHome.src = iconurl

            fiveDayArr[i].append(iconHome);
        
            
            var currentCityTemp = response.list[weatherIndex].main.temp;
            var currentCityTempF = (((currentCityTemp-273.15)*1.8)+32).toFixed(0);
            var currentTempStr = "Temp: " + currentCityTempF +"°F";
            var fiveDayHumidity = response.list[weatherIndex].main.humidity;
            var fiveDayHumidityStr = "Humidity: " + fiveDayHumidity + "%"
            
            var fiveDayTemp = document.createElement("p"); 
            fiveDayTemp.textContent = currentTempStr;
            var humidity = document.createElement("p");
            humidity.textContent = fiveDayHumidityStr;

            fiveDayArr[i].append(fiveDayTemp, humidity)

            

        };  

        var cityLat = response.city.coord.lat;
        var cityLong = response.city.coord.lon;

        var oneCallURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLong + "&appid=a45736dce96af4ff411de1c549396bc3"

        $.ajax({
            url: oneCallURL,
            method: "GET"
        }).then(function(response){
            var currentIconCode = response.current.weather[0].icon
            var currentIconUrl = "http://openweathermap.org/img/w/" + currentIconCode + ".png";
            var currentIconHome = document.createElement("img");

            currentIconHome.src = currentIconUrl


            var tempCurrent = response.current.temp
            var tempCurrentF = (((tempCurrent-273.15)*1.8)+32).toFixed(0);
            var tempCurrentStr = "Current Temperature: "+ tempCurrentF+"°F"
            var tempCurrentDisp = document.createElement("p");
            tempCurrentDisp.textContent = tempCurrentStr;

            var humidityCurrent = response.current.humidity;
            var humidityCurrentStr = "Current Humidity: "+ humidityCurrent + "%"
            var humidityCurrentDisp = document.createElement("p");
            humidityCurrentDisp.textContent = humidityCurrentStr;

            var currentUV = response.current.uvi;
            var currentUVStr = "Current UV Index: "+ currentUV 
            var currentUVDisp = document.createElement("p");
            currentUVDisp.textContent = currentUVStr;
            if (currentUV < 3) {
                $(currentUVDisp).css("backgroundColor", "green");
            } else if (3 <= currentUV < 6){
                $(currentUVDisp).css("backgroundColor", "yellow");
            } else if (6 <= currentUV < 8){
                $(currentUVDisp).css("backgroundColor", "orange");
            } else if (8 <= currentUV < 10){
                $(currentUVDisp).css("backgroundColor", "red");
            } else if (10 <= currentUV){
                $(currentUVDisp).css("backgroundColor", "purple");
            }

            var currentWindSpeed = response.current.wind_speed
            var currentWindSpeedStr = "Current Wind Speed: " + currentWindSpeed;
            var currentWindSpeedDisp = document.createElement("p");
            currentWindSpeedDisp.textContent = currentWindSpeedStr



            $(".current-day").append(currentIconHome, tempCurrentDisp, humidityCurrentDisp, currentUVDisp, currentWindSpeedDisp);

        })    
    })
}