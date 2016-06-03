'use strict';

/**
 * @ngdoc function
 * @name jfApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jfApp
 */
var jfApp = angular.module('jfApp');

jfApp.controller('mainCtrl', function ($scope) {
    // $scope.eventHandler = {
    // refreshCDN:function(event){
    //         var toRefreshCDN = $scope.toRefreshCDN;
    //         if(toRefreshCDN){
    //             var sid = toRefreshCDN.sid;
    //             if( sid ){
    //               // $scope.operaArea.toRefreshCDN.toRefreshCDN = "http://c.diaox2.com/view/app/?m=sku&sid="+sid;
    //               document.getElementById('cdn').value = "http://c.diaox2.com/view/app/?m=sku&id="+sid;
    //             }else{
    //                event.preventDefault();
    //                tip('没有选择要刷新的SKU')
    //             }
    //         }else{
    //            tip('没有选择要刷新的SKU')
    //            event.preventDefault();
    //         }
    //     }
    // }
});