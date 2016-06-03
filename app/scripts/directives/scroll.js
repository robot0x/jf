var jfApp = angular.module('jfApp');
// 懒加载指令
jfApp.directive('scrollWith', function() {
  return {
    restrict: 'AE',
    link: function(scope, elem) {
      var scroller = elem[0];
      $(window).bind('scroll',function(){
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var clientHeight = document.documentElement.clientHeight;
        var offsetTop = scroller.offsetTop;
        var offsetHeight = scroller.offsetHeight;
        // 计算 loadMore 调用所需要的条件
        if(((scrollTop + clientHeight) - offsetTop) >= offsetHeight ){
            scope.$apply('loadMore()');
        }
      })
    }
  }
})