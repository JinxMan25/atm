var atm = angular.module('atm', ['ngAnimate']);

atm.controller('ctrl', [
'$scope',
function($scope){
  $scope.photos = [
{ title: "hi", upvotes: 12 },
{ title: "sami", upvotes: 1 },
{ title: "hiss", upvotes: 2 },
{ title: "hi", upvotes: 3 },
{ title: "hi", upvotes: 4 },
];

  $scope.addPhoto = function(){
    $scope.photos.push({title: $scope.title, upvotes: 0});
    $scope.title = '';
  };

  $scope.incrementUpvotes = function(post){
    post.upvotes += 1;
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

atm.controller('SliderController', function($scope){
  $scope.images = [
    { src: 'image1.jpg', title: 'Pic 1', url: "http://samiulhuq.com" },
    { src: 'image2.jpg', title: 'Pic 2', url: "http://samiulhuq.com" },
    { src: 'image3.jpg', title: 'Pic 3', url: "http://samiulhuq.com" },
    { src: 'image4.jpg', title: 'Pic 4', url: "http://samiulhuq.com" },
    { src: 'image5.jpg', title: 'Pic 5', url: "http://samiulhuq.com" },
  ];
});
