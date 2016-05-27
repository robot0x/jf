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
    // 'ui.router',
    // 'ui.bootstrap',
    'datePicker'
  ]);
  
 ifApp.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/user.html'
        // ,controller: 'searchArticleCtrl'
      })
      .when('/user', {
        templateUrl: 'views/user.html'
        // ,controller: 'searchArticleCtrl'
      })
      .when('/mall', {
        templateUrl: 'views/mall.html'
        // ,controller: 'searchSKUCtrl'
      })
      .when('/statistics', {
        templateUrl: 'views/statistics.html'
        // ,controller: 'searchSKUCtrl'
      }).otherwise({
        redirectTo: '/'
      });
  });

  // ifApp.config(function ($routeProvider) {
  //   $routeProvider
  //     .when('/', {
  //       templateUrl: 'views/main.html',
  //       controller: 'MainCtrl',
  //       controllerAs: 'main'
  //     })
  //     .when('/about', {
  //       templateUrl: 'views/about.html',
  //       controller: 'AboutCtrl',
  //       controllerAs: 'about'
  //     })
  //     .otherwise({
  //       redirectTo: '/'
  //     });
  // });

