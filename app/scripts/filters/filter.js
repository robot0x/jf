var jfAppFilters = angular.module('jfAppFilters',[]);

jfAppFilters.filter('couponsFilter',function(){
    return function(item){
       if(item instanceof Array){
        return item.length;
       }else if(typeof item === "string"){
         return item.split(/\s|,| |，/).length;
       }
    }
});