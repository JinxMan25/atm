var atm = angular.module('atm', []);

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
}]);

atm.directive('slider', function($timeout){
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      images: '='
    },
    link: function(scope, elem, attrs){},
    templateUrl: '/home/sami/atm/views/template.html'
  };
});

atm.controller('SliderController', function($scope){
  $scope.images = [
    { src: 'image1.png', title: 'Pic 1' },
    { src: 'image2.png', title: 'Pic 2' },
    { src: 'image3.png', title: 'Pic 3' },
    { src: 'image4.png', title: 'Pic 4' },
    { src: 'image5.png', title: 'Pic 5' },
  ];
});
