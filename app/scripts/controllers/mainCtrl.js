'use strict';

/**
 * @ngdoc function
 * @name jfApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jfApp
 */
var jfApp = angular.module('jfApp');

jfApp.controller('mainCtrl', function ($scope, $rootScope, $location, $timeout) {
    $rootScope.language = "zh_CN";
    $scope.isActive = function(route) {
        var path = $location.path()
        if (route === "/user" && path === "/") {
          return true;
        }
        return route === path;
    }
});