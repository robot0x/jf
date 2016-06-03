'use strict';

/**
 * @ngdoc overview
 * @name jfApp
 * @description
 * # jfApp
 *
 * Main module of the application.
 */
var ifApp = angular.module('jfApp', [
    // 'ngAnimate',
    // 'ngCookies',
    // 'ngResource',
    'ngRoute',
    // 'ngSanitize',
    'ui.router',
    // 'ui.bootstrap',
    'datePicker',
    'jfAppFilters'
  ]);

ifApp.config(function($stateProvider, $urlRouterProvider) {
  // $urlRouterProvider.otherwise("/user");
  $urlRouterProvider.when('/mall','/mall/gift').otherwise("/user");
  $stateProvider
    .state('user', {
      url: "/user",
      templateUrl: "views/user.html"
    })
    .state('mall', {
      url: "/mall",
      templateUrl: "views/mall.html"
    })
    .state('mall.gift', {
      url: "/gift",
      templateUrl: "views/mall.gift.html"
    })
    .state('mall.coupon', {
      url: "/coupon",
      templateUrl: "views/mall.coupon.html"
    })
    .state('statistics', {
      url: "/statistics",
      templateUrl: "views/statistics.html"
    })
    // .state('state2.list', {
    //   url: "/list",
    //   templateUrl: "partials/state2.list.html",
    //   controller: function($scope) {
    //     $scope.things = ["A", "Set", "Of", "Things"];
    //   }
    // });
});



 // ifApp.config(function ($routeProvider) {
    // $routeProvider
    //   .when('/', {
    //     templateUrl: 'views/user.html'
    //     // ,controller: 'searchArticleCtrl'
    //   })
 //      .when('/user', {
 //        templateUrl: 'views/user.html'
 //        // ,controller: 'searchArticleCtrl'
 //      })
 //      .when('/mall', {
 //        templateUrl: 'views/mall.html'
 //        // ,controller: 'searchSKUCtrl'
 //      })
 //      .when('/statistics', {
 //        templateUrl: 'views/statistics.html'
 //        // ,controller: 'searchSKUCtrl'
 //      }).otherwise({
 //        redirectTo: '/'
 //      });
 //  });
