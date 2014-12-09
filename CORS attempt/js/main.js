var app = angular.module('hoopsHub', ['ngRoute','ngResource']);

app.config(function($routeProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'partials/landing.html',
      controller: 'MainController'
    })
    .when('/boxscore/:gameID', {
      templateUrl: 'partials/boxscore.html',
      controller: 'BoxScoreController'
    })
    .when('/tickets/:gameID/:venue', {
      templateUrl: 'partials/tickets.html',
      controller: 'TicketsController'
    })
    .otherwise({
      redirecTo: '/'
    });
});

var apiKey = 'cn82hghaq6yn3nuwy26r8ywx';
var today = new Date();
var month = today.getMonth()+1;  //Months are 0-indexed
var fullDate = today.getFullYear() +'/' +month +'/' +today.getDate();


app.controller('MainController', function($scope, $http) {
  $scope.games = []; 
  $scope.events = [];
  $scope.boxScore;
  $scope.gameID;
  
  $scope.getGames = function() {
    var endpoint = 'http://api.sportsdatallc.org/nba-t3/games/'+fullDate+'/schedule.json?&api_key='+apiKey;
  
   // Get today's games for the sidebar
    var promise = $.ajax({
      url: 'proxy.php',
      type: 'get',
      dataType: 'json',
      data: {
        address: endpoint
      }
    });

    promise.success(function(data){
      $scope.games = data.games;
      console.log($scope.games);
    });
    
 };
 
 $scope.setBox = function(gameID){
   $scope.gameID = gameID;
     console.log($scope.gameID);
 } 
});

app.controller('BoxScoreController', function($scope, $routeParams) {
  
  var endpoint = 'http://api.sportsdatallc.org/nba-t3/games/'+$scope.gameID+'/summary.json?api_key='+apiKey;  

  var promise = $.ajax({
    url: 'proxy.php',
    type: 'get',
    dataType: 'json',
    data: {
      address: endpoint
    }
  });

  promise.success(function(data){
    $scope.boxScore = data;
    console.log($scope.boxScore);
  });  
  
  
});


app.controller('TicketsController', function($scope, $http, $routeParams, formatTime) {
  $scope.gameID = $routeParams.gameID;
  $scope.venue = $routeParams.venue;
  $scope.game;
  $scope.latlng;
  var url = 'http://api.seatgeek.com/2/events?taxonomies.name=basketball&sort=datetime_local.asc&q='+$scope.venue;
  
  $http.get(url)
  .success(function(data) {
    $scope.game = data.events[0];
    $scope.latlng = new google.maps.LatLng($scope.game.venue.location.lat, $scope.game.venue.location.lon);
    
    var time = new Date($scope.game.datetime_utc);
    var gameTime = formatTime.convertHours(time.getHours())+ ":"+
      formatTime.addZero(time.getMinutes())+ " "+
      formatTime.setTimeOfDay(time.getHours());

    var infoWindowContent = '<div style="width:200px; height:200px">'+ 
      '<h5 class="text-center">'+$scope.game.short_title+ '</h5>'+
      '<div class="text-center"> Tip-off: <span class="text-success"><strong>'+
       gameTime +'</strong></span></div><br>'+ 
      '<div class="text-center">'+$scope.game.venue.name+
      '<br>'+ $scope.game.venue.address+ 
      '<br>'+ $scope.game.venue.extended_address+ '</div>'+
      '<br>'+ '<div class="text-center">'+
      '<a target="_blank" href='+ 
      $scope.game.url+'>Purchase Tickets</a></div></div>';
    
    $scope.map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: $scope.latlng,
      zoom: 16
    });
    
    var marker = new google.maps.Marker({
      map: $scope.map,
      position: $scope.latlng,
      animation: google.maps.Animation.DROP,
      icon: "logos/basketball.png"
    });

    var infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      position: $scope.latlng,
      maxWidth: 1000,
      maxHeight: 1000
    });
    
    google.maps.event.addListener(marker, 'click', function(){
      infoWindow.open($scope.map);
    });
          
  })
  .error(function(data){
    console.log("Something has gone horribly wrong!"); 
  });
  
});

app.factory('formatTime', function(){
  function convertHours(hours){
    if (hours == 0){
      return 12;
    }else if (hours > 12){
      return hours-12;
    }
    
    return hours;
  }
  
  function setTimeOfDay(hours){
    if (hours >= 12){
      return "PM";
    }
    return "AM";
  }
  function addZero(minutes){
    if (minutes < 10){
      minutes = "0" + minutes;
    }
    return minutes;
  }
  return {
    convertHours: convertHours,
    setTimeOfDay: setTimeOfDay,
    addZero: addZero
  }
});