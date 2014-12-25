var atm = angular.module('atm', ['ngAnimate', 'ui.router']).value('$anchorScroll', angular.noop);

atm.controller('ctrl',[
'$scope',
'photos',
function($scope, photos){

  $scope.photos = photos.photos;
  debugger;

  $scope.addPhoto = function(){
    photos.create({
      title: $scope.title,
      description: $scope.description,
    });
    $scope.photos.push({title: $scope.title, description: $scope.description, upvotes: 0});
    $scope.title = '';
    $scope.description = '';
  };

  $scope.incrementUpvotes = function(photo){
    photos.upvote(photo);
  }
}]);

atm.factory('photos',['$http','$location', function($http,$location){
  var o = {
    photos: []
  };

  o.getAll = function(){
    return $http.get('/').success(function(data){
      angular.copy(data,o.photos);
    });
  };

  o.create = function(photo){
    return $http.post('/create', photo).success(function(data){
      o.photos.push(data);
      $location.url('/get/' + data.uniq_token);
    });
  }
  o.get = function(uniq){
    return $http.get('/get/' + uniq).then(function(res){
      return res.data;
    });
  }
  o.upvote = function(photo){
    return $http.get('/get/' + photo.uniq_token + '/upvote')
      .success(function(data){
        photo.upvotes += 1;
      });
  }

  return o;
}]);

atm.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
      $stateProvider
        .state('home',{
          url: '/home',
          views: {
            "jumbotron": { templateUrl: '/home.html' },
            "info": { templateUrl: '/info.html' }
          },
          controller: 'ctrl',
          resolve: {
            photoPromise: ['photos',function(photos){
              return photos.getAll();
            }]
          }
        })
        .state('photo', {
          url: '/get/{uniq_token}',
          templateUrl: '/photo.html',
          controller: 'PhotosController'
        })
        .state('photos', {
          url: '/all', 
          templateUrl: '/photos.html',
          controller: 'ctrl',
          resolve: { 
            getPromise: ['photos', function(photos){
              return photos.getAll();
            }]
          }
        })
        .state('upload', {
          url: '/upload',
          templateUrl: '/upload.html',
          controller: 'ctrl'
        });
  $urlRouterProvider.otherwise('home');
}]);


atm.controller('PhotosController', ['$scope','$filter', '$stateParams','photos', function($scope,$filter,$stateParams,photos){

  $scope.photo = $filter('filter')(photos.photos, function(d) { return d.uniq_token === $stateParams.uniq_token })[0];

}]);

atm.directive('slider', function ($timeout) {
  return {
    restrict: 'AE',
  replace: true,
  scope:{
    images: '='
  },
    link: function (scope, elem, attrs) {
  
    scope.currentIndex=0;

    scope.next=function(){
      scope.currentIndex<scope.images.length-1?scope.currentIndex++:scope.currentIndex=0;
    };
    
    scope.prev=function(){
      scope.currentIndex>0?scope.currentIndex--:scope.currentIndex=scope.images.length-1;
    };
    
    scope.$watch('currentIndex',function(){
      scope.images.forEach(function(image){
        image.visible=false;
      });
      scope.images[scope.currentIndex].visible=true;
    });
    
    /* Start: For Automatic slideshow*/
    
    var timer;
    
    var sliderFunc=function(){
      timer=$timeout(function(){
        scope.next();
        timer=$timeout(sliderFunc,500);
      },3000);
    };
    
    sliderFunc();
    
    scope.$on('$destroy',function(){
      $timeout.cancel(timer);
    });
    
    /* End : For Automatic slideshow*/
    
    },
  templateUrl:'templateUrl.html'
  }
});

atm.controller('SliderController', function($scope){
  $scope.images = [
    { src: 'image1.jpg', title: 'Pic 1', url: "http://samiulhuq.com" },
    { src: 'image2.jpg', title: 'Pic 2', url: "http://samiulhuq.com" },
    { src: 'image3.jpg', title: 'Pic 3', url: "http://samiulhuq.com" },
    { src: 'image4.jpg', title: 'Pic 4', url: "http://samiulhuq.com" },
    { src: 'image5.jpg', title: 'Pic 5', url: "http://samiulhuq.com" },
  ];
});
