"use strict";

var jfApp = angular.module('jfApp');

jfApp.controller('statisticsCtrl', function($scope, $http,$filter) {
    // showstat
    var headers = {"Content-Type": "application/json"};
    var prefix = "http://api.diaox2.com:3000/jf/";
    var showstat = prefix + "showstat";
    var dateFormater = $filter('date');
    var pattern = "yyyyMMdd";
    var now = new Date();
    var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // alert($.getP().code.value);
    // 这样确实能给view上的datePicker赋值
    var datebox = $scope.datebox = {start:yesterday,end:yesterday}
    getDataAndPaddingView(dateFormater(datebox.start,pattern),dateFormater(datebox.end,pattern));
    $scope.eventHandler = {
        refresh:function(){
              $scope.statisticsList = null;
              var datebox = $scope.datebox;
              var start = dateFormater(datebox.start,pattern);
              var end = dateFormater(datebox.end,pattern);
              var _d = "_d";
              if(typeof start === "object" && _d in start){
                start = dateFormater(start[_d],pattern);
              }
              if(typeof end === "object" && _d in end){
                end = dateFormater(end[_d],pattern);
              }
              getDataAndPaddingView(start,end);
              // 存入会话缓存
              window.sessionStorage.setItem('code',$('#code').val());
              // code.disabled = true;
        }
    }
    
    $scope.endDateChange = $scope.startDateChange = function(){
         $scope.eventHandler.refresh();
    }
    
    function getDataAndPaddingView(start,end){
        var code =  $('#code').val() || window.sessionStorage.getItem('code');
        if(!code){
            tip('请填写密码。然后点击"刷新"按钮');
            $('#code').trigger('focus');
            return;
        }

        $http({
            url: showstat,
            method: "POST",
            timeout: 20000,
            catch: true,
            headers: headers,
            data: JSON.stringify({
                "start": start,
                "end": end,
                "code":code
            })
        }).then(function(result) {
            console.log(result);
            var upperData = result.data;
            if(upperData.state === "SUCCESS"){
                $scope.statisticsList = upperData.data;
                $scope.date = "2016-05-20 ~ 2016-05-25";
            }else{
                var message = upperData.message;
                if(message.indexOf("密码")){
                    tip('密码错了哦。请重新输入密码，并点击"刷新"按钮');
                    var code = document.getElementById('code');
                    code.disabled = false;
                    code.focus();
                }else{
                    tip('获取统计数据失败，请重试');
                }
                console.log("获取统计数据失败",upperData.message);
            }
        }).catch(function(e) {
            console.log('获取统计数据失败');
            console.log(e);
        })
    }



});