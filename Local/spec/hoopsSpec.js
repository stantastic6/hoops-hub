describe('MainController', function() {

 var scope, controller;

 beforeEach(function() {
   module('hoopsHub');
 });
 
 describe('MainController', function() {
   beforeEach(inject(function($rootScope, $controller){
     scope = $rootScope.$new();
     controller = $controller('MainController', {
       '$scope': scope
     });
   }));
   
   it('gets the games of the current day', function() {
     //scope.getGames();
     //console.log(scope.games);
     expect(scope.games.length).toBeGreaterThan(0);
   });
   
 });
 
});