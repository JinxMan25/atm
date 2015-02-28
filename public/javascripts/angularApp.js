var atm = angular.module('atm', ['ngAnimate', 'ui.router']).value('$anchorScroll', angular.noop);

atm.controller('ctrl',[
'$http',
'$scope',
'photos',
'$timeout',
'$q',
'$rootScope',
function($http,$scope, photos, $timeout, $q, $rootScope){


  $scope.$watch('file',function(){
    if (!$scope.file.type.match(/image/)){
      $scope.isNotImage = true;
      $("#submit").prop("disabled", true);
    } else {
      $scope.isNotImage = false;
      $("#submit").prop("disabled", false);
    }
  });


  $scope.changeScope = function(){
    if ($scope.useAddress){
      $scope.useAddress = false;
      $("#zipcode").click();
      $scope.results = [];
      $scope.address = '';
    } else {
      $scope.useAddress = true;
      $("#address").click();
      $scope.results = [];
      $scope.address = '';
    }
  }

  $scope.$watch('address', function(){
    if (!($scope.useAddress) && ($scope.address.match(/[a-z]/))){
      $scope.notZipcode = true;
    } else {
      $scope.notZipcode = false;
    }
    if ($scope.address.length > 0){
      $scope.usingZipcode = true;
    } else if ($scope.address.length == 0) {
      $scope.usingZipcode = false;
    }
    if (($scope.address.length > 3) && ($scope.useAddress)){
      $scope.getLocation();
    }
    if(($scope.address.length == 5) && (!$scope.useAddress)){
      $scope.getLocation();
    }
  });
  

  $scope.$watch('photos', function(){
    if (!($scope.photos.length > 0) && ($rootScope.loading == false)){
      $scope.empty = true;
    } else {
      $scope.empty = false;
    }
  })


  $rootScope.$watch('loading', function(){
    if ((($scope.photos.length == 0)) && ($rootScope.loading == false)){
        $scope.empty = true;
    } else {
      $scope.empty = false;
    }
  });
  
  $scope.getLocation = function(){
    $scope.results = [];
    $rootScope.loadingZipcode = true;

    return $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+$scope.address)
      .success(function(data){
        console.log(data.results);
        if (data.results.length > 1){
          for (i=0; i < 6; i++){
            var obj = {};
            obj['address'] = data.results[i].formatted_address
            obj['latitude'] = data.results[i].geometry.location.lat;
            obj['longitude'] = data.results[i].geometry.location.lng;
            $scope.results.push(obj); 
            $rootScope.loadingZipcode = false;
          }
        } else if (((data.results.length == 1)) && ($scope.useAddress == false)) {
          photos.coordinates.longitude = data.results[0].geometry.location.lng;
          photos.coordinates.latitude = data.results[0].geometry.location.lat;
          console.log(photos.coordinates);
          photos.getAll();
          $rootScope.loadingZipcode = false;
          $('#exampleModal').modal('hide');
        }
      });
  };

  $scope.pickLocation = function(result){
    photos.coordinates.longitude = result.longitude;
    photos.coordinates.latitude = result.latitude;
    $('#exampleModal').modal('hide');
    photos.getAll();
  };

  $scope.photos = photos.photos;

  $scope.addPhoto = function(){
    console.log(photos.coordinates);
  if (Object.keys(photos.coordinates).length == 0){
    console.log("in the modal");
    alert('Your position could not be calculated. If you can please fill out extra details about your location');
    $("#exampleModal").modal('show');
    return;
  }
    photos.create({
      title: $scope.title,
      description: $scope.description,
      file: $scope.file,
      longitude: photos.coordinates.longitude,
      latitude: photos.coordinates.latitude
    });

    $scope.title = '';
    $scope.description = '';
  };

  $scope.incrementUpvotes = function(photo){
    photos.upvote(photo);
  }

  $scope.incrementDownvotes = function(photo){
    photos.downvote(photo);
  }
}]);

atm.factory('formDataObject', function(){
  return function(data){
    var fd = new FormData();
    angular.forEach(data, function(key,value){
      fd.append(key,value);
    });
    return fd;
  };
});

atm.factory('photos',['$rootScope','$http','$timeout', '$q','$location','formDataObject', function($rootScope,$http, $timeout, $q, $location, formDataObject){
  var o = {
    photos: [],
    photo: [],
    coordinates: {}
  };

  o.getAll = function(){
    if (!(o.photos.length > 0)){
      $rootScope.loading = true;
      $rootScope.$apply();
    } else {
      return;
    }
    return $http.get('/atm/get/?longitude='+o.coordinates.longitude+'&latitude='+o.coordinates.latitude).success(function(data){
      $timeout(function(){
      if (data.length == 0){
        $rootScope.loading = false;
        $rootScope.empty = true;
        $rootScope.$apply();
      } else {
        angular.copy(data,o.photos);
        $rootScope.loading = false;
        $rootScope.$apply();
      }
      },650);
    });
  };

  o.create = function(photo){
    var fd = new FormData();
    angular.forEach(photo, function(key, value){
      fd.append(value,key);
    });
    return $http.post('/create',fd, {
      transformRequest: angular.identity,
      headers: { 'Content-Type': undefined }
    }).success(function(data){
      o.photos.push(data);
      $location.url('/get/' + data.uniq_token);
    }).error(function(data){
        alert(data.message);
    });
  }

  o.get = function(uniq){
    return $http.get('/get/' + uniq).then(function(res){
      angular.copy(res.data,o.photo);
    });
  }

  o.upvote = function(photo){
    return $http.put('/get/' + photo.uniq_token + '/upvote')
      .success(function(data){
        photo.upvotes += 1;
      });
  }

  o.downvote = function(photo){
    return $http.put('/get/' + photo.uniq_token + '/downvote')
      .success(function(data){
        photo.downvotes += 1;
      });
  }

  o.getCoords = function(){
    var deferred = $q.defer();
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        o.coordinates = position.coords; 
      
        deferred.resolve(o.coordinates);
      },
      function(){
        if (Object.keys(o.coordinates).length == 0){
          $('#exampleModal').modal('show');
        }
      }
      );
    }
      return deferred.promise;
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
        })
        .state('photo', {
          url: '/get/{uniq_token}',
          templateUrl: '/photo.html',
          controller: 'PhotosController',
          resolve: {
            
            getPromise: ['$stateParams', 'photos', function($stateParams, photos){
              return photos.get($stateParams.uniq_token);
            }]
          }
        })
        .state('photos', {
          url: '/all', 
          templateUrl: '/photos.html',
          controller: 'ctrl',
          resolve: { 
            getPromise: ['photos', function(photos){
              photos.getCoords().then(function(data){
                return photos.getAll();
              });
            }]
          }
        })
        .state('upload', {
          url: '/upload',
          templateUrl: '/upload.html',
          controller: 'ctrl',
          promise: {
            getPromise: ['photos', function(photos){
              return photos.getCoords();
            }]
          }

        });
  $urlRouterProvider.otherwise('home');
}]);


atm.controller('PhotosController', ['$scope','$filter', '$stateParams','photos', function($scope,$filter,$stateParams,photos){

  if (photos.photos.length > 0){
    $scope.photo = $filter('filter')(photos.photos, function(d) { return d.uniq_token === $stateParams.uniq_token })[0];
  } else {
    $scope.photo = photos.photo[0];
  }

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

atm.service('fileUpload', ['$http', function($http){
  this.uploadFileToServer = function(file){
    var fd = new FormData();
    fd.append('file', file);
    $http.post('/create', fd, {
      transformRequest: angular.identity,
      headers: {'Content-Type': 'multipart/form-data'}
    }).success(function(){

    }).error(function(){

    });
  }
}]);

atm.directive('fileModel', ['$parse', function($parse){
return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

atm.controller('SliderController', function($scope){
  $scope.images = [
    { src: 'image1.jpg', title: 'Pic 1', url: "http://samiulhuq.com" },
    { src: 'image2.jpg', title: 'Pic 2', url: "http://samiulhuq.com" },
    { src: 'image3.jpg', title: 'Pic 3', url: "http://samiulhuq.com" },
    { src: 'image4.jpg', title: 'Pic 4', url: "http://samiulhuq.com" },
    { src: 'image5.jpg', title: 'Pic 5', url: "http://samiulhuq.com" },
  ];
});
