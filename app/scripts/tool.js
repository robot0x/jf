   'use strict';
   $(function(){
    new ToTop(document.getElementById("totop"),".bottombar");
    // 访问本地存储，取出 modifiedBy 字段
    var localStorage = window.localStorage;
    var person = localStorage.getItem('person');
    if(person){
      var personInput = document.getElementById('person');
      personInput.value = person;
      personInput.disabled = true;
    }

    var localStorage = window.sessionStorage;
    var code = localStorage.getItem('code');
    if(code){
      var codeInput = document.getElementById('code');
      codeInput.value = code;
      // codeInput.disabled = true;
    }

    $.getP = function(){
           return {
             person:document.getElementById('person'),
             code:document.getElementById('code')
           }
    }
 });

  function showLoading(){
    $('.loading-container').show();
  }


  function tip(title,ms){
    title = title || "成功";
    ms = ms || 2000;
    // 首先查询页面是否已经存在tip元素
    // 如果已经存在了该元素，直接返回，否则，创建该元素
    var tipDOM = document.querySelector('.tip');
    if(!tipDOM){
      tipDOM = document.createElement('div');
      tipDOM.className = "tip";
      tipDOM.innerHTML = title;
      document.querySelector('.wrapper').appendChild(tipDOM);
      setTimeout(function(){
        document.querySelector('.wrapper').removeChild(tipDOM);
      },ms)
    }
  }

  function hideLoading(title,ms){
    var loadingContainer = $('.loading-container');
    loadingContainer.hide();
    if(title){
      tip(title,ms);
    }
  }

  // 回到顶部组件
var ToTop = function(obj,parentSelector) {
    this.doc = document;
    this.obj = this.doc.createElement("div");
    // this.bodyNode = this.doc.body;
    var parentEle = document.querySelector(parentSelector);
    this.hasBottomBar = parentSelector && parentEle;
    if(this.hasBottomBar){
        this.parentEle = parentEle;
        this.cssText = "height:61px;" +
            "width:61px;" +
            "border-radius:8px;" +
            "display:none;" +
            "transition:background-position .28s;" +
            "background:url(images/bottombar.png) 0 -142px;";
    }else{
        this.parentEle = this.doc.body;
        this.cssText = "position:fixed;" +
            "bottom:0;" +
            "right:0;" +
            "height:61px;" +
            "width:61px;" +
            "border-radius:8px;" +
            "display:none;" +
            "transition:background-position .28s;" +
            "cursor:pointer;" +
            "background:url(images/bottombar.png) 0 -142px;" +
            "text-align:center;";
    }
    this.init();
    this.bindEvent();
}
ToTop.prototype = {
    // 初始化与渲染dom
    init: function() {
        var obj = this.obj;
        obj.style.cssText = this.cssText;
        this.parentEle.appendChild(obj);
    },
    // 绑定事件。包括window的scroll事件，及totop的点击事件
    bindEvent: function() {
        var doc = this.doc,
            $obj = $(this.obj);
        $(window).on('scroll',function(){
            var flagHeight = doc.documentElement.clientHeight,
                scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            if (scrollTop >= flagHeight) {
                if(this.hasBottomBar){
                    $obj.slideUp();
                }else{
                    $obj.fadeIn();
                }
            } else {
                if(this.hasBottomBar){
                    $obj.slideDown();
                }else{
                    $obj.fadeOut();
                }
            }
        })
        $obj.hover(function() {
            $obj.css("background-position", "0 -212px");
        }, function() {
            $obj.css("background-position", "0 -142px");
        }).on("click", function() {
            $('html,body').animate({
                scrollTop: 0
            });
        })
    }
}