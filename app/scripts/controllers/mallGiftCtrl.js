var jfApp = angular.module('jfApp');

jfApp.directive('scrollWith', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      
      var scroller = $(elem);
      var top = scroller.offset().top;
      var left = scroller.offset().left;
      var width = scroller.outerWidth();
      $(".left").css("min-height",scroller.height() + 50);
      
      $(window).on('scroll',function(){
        if($(this).scrollTop() >= top){
          scroller.css({
            position:"fixed",
            left:left,
            top:0,
            width:width,
            overflow:"auto",
            paddingBottom:350
          })
        }else{
          scroller.css({
            position:"static"
            ,overflow:"hidden"
          })
        }
      })
    }
  }
});

jfApp.controller('mallGiftCtrl',function($scope,$http,$q,$rootScope,$filter){
    var headers = {"Content-Type": "application/json"};
    var prefix = "http://api.diaox2.com:3000/jf/";
    var mall = prefix + "mall";
    var addone = prefix + "addone";
    var modone = prefix + "modone";
    var checkgoods = prefix + "checkgoods";
    var checkuser = prefix + "checkuser";
    // var pattern = "YYYY-MM-DD HH:mm:ss";
    var pattern = "yyyy-MM-dd HH:mm:ss"
    var dateFormater = $filter('date');
    var params = {
            url: mall,
            method: "POST",
            timeout: 20000,
            catch: true,
            headers: headers,
            // data:"{}"
            data:'{"all":""}'
        };
    function local_multi(result,id,isMulti){
      var failArray = [];
      var successArray = [];
      console.log("上传本地图成功：",result);
      if(result.state === "SUCCESS"){
        var fileArray = result.data;
        if(fileArray.length){
          fileArray.forEach(function(file){
            if(file.state === "SUCCESS"){
              successArray.push({
                url:file.url
              })
            }else{
              failArray.push(file.name);
            }
          })
        }
      }else{
         hideLoading("文件上传失败，请重试");
      }
      if(failArray.length){
        hideLoading("文件：\n"+failArray.join('\n')+"上传失败，请重试");
      }
      if(successArray.length){
        var giftData = $scope.giftData;
        if(giftData){
          var pics = giftData[id];
          if(isMulti){
            if(pics != null && pics.length>0){
              $scope.giftData[id] = pics.concat(successArray);
            }else{
              $scope.giftData[id] = successArray;
            }
          }else{
            $scope.giftData[id] = successArray[0].url;
          }
        }else{
          $scope.giftData = {}
          if(isMulti){
            $scope.giftData[id] = successArray;
          }else{
             $scope.giftData[id] = successArray[0].url;
          }
        }
        if(!failArray.length){
           hideLoading("全部上传成功");
           // 上传成功之后清空fil
        }
      }
      $("#"+id).val("");
    }

    $scope.giftData = {status:0,last_valid_time:dateFormater(new Date(),pattern)};

    var eventHandler = {
    viewGiftHistory:function(gift){

      if(!gift){
        tip("无法查看不存在的礼物");
        return;
      }

      var gid = gift.gid;
      var code = $.getP().code.value;


      // 首先拿到记录（UID）
      // 然后根据记录拿到昵称
      // 然后更新VM

      function getHistoryByGid(gid){
             var params = {
                  url:checkgoods,
                  headers:headers,
                  method: "POST",
                  timeout: 20000,
                  catch: true,
                  data:JSON.stringify({gid:gid,code:code})
                  // ,success:function(result){
                  //   console.log(result);
                  //   var state = result.state;
                  //   console.log(deferred);
                  //   if(state!=="SUCCESS"){
                  //     deferred.reject(result);
                  //   }else{
                  //     deferred.resolve(result);
                  //   }
                  // },
                  // error:function(e){
                  //   deferred.reject(e);
                  // }
                  };
             return $http(params);
      }

      function getUserInfo(result){
        var sales = result.data.data.sales;
        console.log(sales);
        var promises = [];
        var params = {
             url:checkuser,
             method: "POST",
             timeout: 20000,
             catch: true
             // ,success:function(result){
             //   console.log(result);
             // },
             // error:function(e){
             //  console.log(checkuser+"接口失败！");
             //  console.log(e);
             // }
           };

        sales.forEach(function(sale){
          params.data = JSON.stringify({uid:sale.uid,code:code})
          promises.push($http(params).then(function(result){
            console.log(result);
            var user = result.data.data.user;
            console.log(user);
            user.auth_info = JSON.parse(user.auth_info);
            sale.nickname = user.auth_info[user.auth_info.platform].nick_name
          }));
        })

        return $q.all(promises).then(function(){
          return sales;
        })

      }

      function updateView(sales){

        if(!sales.length){
          tip("还没有记录",1000);
          return;
        }

        var gifts = $scope.gifts;
        for(var i = 0,l = gifts.length;i<l;i++){
          var cGift = gifts[i];
          if(cGift.gid == gift.gid){
            cGift.sales = sales;
            return;
          }
        }

      }

      getHistoryByGid(gid,code)
         .then(getUserInfo)
         .then(updateView)
         .catch(function(e){
          console.log(e);
         })
      
    },
    upload:function(event,id,isMulti){

         console.log(event);
         console.log(id);
         console.log(isMulti);

          var fileup = $("#"+id);
          console.log(fileup);
          var file = fileup.val();
          console.log(file);
          // 已经有被选择的文件了
          if(file && file.trim()){
            // 开启遮罩
             showLoading();
             /* 
              把直接写在controller下的promise写在“上传”按钮的回调里，
              这样每次点击按钮，都会创建一个新的promise对象。如果不这样做的话，
              在controller执行时，promise只会new一次，然后上传成功之后，
              只能resolve一次 
             */
             window.angular_defer = $q.defer();
             angular_defer.promise
             .then(function(value){
                local_multi(value,id,isMulti);
             },function(value){
                hideLoading('文件上传失败，请重试');
             })
             .catch(function(e){
                hideLoading('文件上传失败，请重试');
             })
          }else{
            // 阻止提交
            event.preventDefault();
          }
          // showLoading();
        },
        view:function(gift){
           $scope.giftData = JSON.parse(JSON.stringify(gift));
           $rootScope.rootGiftData = JSON.parse(JSON.stringify(gift));
        },
        save:function(giftData){
            var p = $.getP();
            var person = p.person;
            var code = p.code;
            var rperson = /^[a-zA-z0-9]{2,9}$/g;
            if(!person.value || !rperson.test(person.value)){
                 tip('请填写修改人，格式为英文名或拼音缩写，不能超过8位，否则无法保存。')
                 person.focus();
                 return;
           }

           if(!code.value){
                 tip('请填写密码');
                 code.focus();
                 return;
           }
            if(!giftData){
              tip("还没有填写任何信息哦");
              return;
            }
            var rootGiftData = $rootScope.rootGiftData;
            // 标题
            var title = (giftData.title || "").trim();
            // 兑换所需积分
            var price = +(giftData.price || 0);
            // 礼品库存数量
            var quantity = +(giftData.quantity || 0);
            // 库存总量
            var stocknum = +(giftData.stocknum || 0);
            // 有效期选择
            var last_valid_time = giftData.last_valid_time;
            if(typeof last_valid_time === "object"){
              last_valid_time = last_valid_time.format("YYYY-MM-DD HH:mm:ss");
            }
            // 礼品描述
            var intro = (giftData.intro || "").trim();
            // 注意事项
            var desc = (giftData.desc || "").trim();
            // 人均可兑换数量
            var limited = +(giftData.limited || 0);
            // 兑换流程
            var usage = (giftData.usage || "").trim();
            // url链接
            var target = (giftData.target || "").trim();
            // 修改原因
            var reason = (giftData.reason || "").trim();

            var ec = giftData.ec || "调调";

            if(!title || title.length > 20){
              tip("礼物名称/标题必须填写，且在20字以内");
              return;
            }

            if(!intro || intro.length > 150){
              tip("礼品描述必须填写，且在150字以内");
              return;
            }

            if(!usage){
              tip("兑换流程必须填写");
              return;
            }

            // if(!desc){
            //   tip("注意事项必须填写");
            //   return;
            // }
            
            if(!reason){
              tip("修改原因必须填写");
              return;
            }

            if(isNaN(price) || price <= 0){
              tip("兑换所需积分只能填写正整数");
              return;
            }

            if(isNaN(quantity) || quantity < 0){
              tip("礼品库存数量只能填写正整数");
              return;
            }

            if(isNaN(stocknum) || stocknum < 0){
              tip("库存总量只能填写正整数");
              return;
            }

            if(isNaN(limited) || limited <= 0){
              tip("人均可兑换数量只能填写正整数");
              return;
            }

            // 图片验证
            var pics = giftData.pics;

            if(!pics){
              pics = [];
            }else{
              try{
                pics.map(function(pic){
                  delete pic["$$hashKey"];
                  delete pic["object"];
                  return pic;
                })
              }catch(e){
                console.log(e);
              }
           }

            var thumb = giftData.thumb;

            if(!thumb){
              tip('缩略图不能为空');
              return;
            }

            var cover = giftData.cover;

            if(!cover){
              tip('cover图不能为空');
              return;
            }




            var gid = giftData.gid;

            giftData.person = person.value;
            
            giftData.code = code.value;

            // 如果是新增就需要赋值
            giftData.type = 0;
            giftData.ec = ec;
            // giftData.reason = reason;

            console.log(giftData);

            var params = {
              url: modone,
              method: "POST",
              timeout: 20000,
              catch: true,
              headers: headers
          };

            // 如果gid为空，调用addone接口
            if(gid){

              /**
               * 首先拿到根作用域下的 rootGiftData
               * 然后for in rootGiftData，一次比较那个属性发生了变化
               * 把发生变化的属性记录起来，一会儿统一发ajax
               */

               var rootGiftData = $rootScope.rootGiftData;

               var status = giftData.status;

               console.log(rootGiftData);

               var modifyAttrCollections = {};

               for(var attr in rootGiftData){
                 // 不比较gid/type/href/ec。因为这4者不可能被修改。去掉angular的标识的影响。
                 if(attr === "gid" || attr === "type" || attr === "href" || attr === "ec" || attr === "$$hashKey" || attr === "object"){
                   continue;
                 }

                 switch(attr){

                   case "cover":
                     if(rootGiftData[attr] !== cover){
                        modifyAttrCollections[attr] = cover;
                     }
                    break;

                   case "desc":
                     if(rootGiftData[attr] !== desc){
                        modifyAttrCollections[attr] = desc;
                     }
                   break;

                   case "intro":
                    if(rootGiftData[attr] !== intro){
                        modifyAttrCollections[attr] = intro;
                     }
                   break;

                   case "last_valid_time":
                    if(rootGiftData[attr] !== last_valid_time){
                        modifyAttrCollections[attr] = last_valid_time;
                     }
                   break;
                   case "limited":
                     if(rootGiftData[attr] !== limited){
                        modifyAttrCollections[attr] = limited;
                     }
                   break;

                   case "pics":
                     // 不好判断。更新吧。
                     var temPics = rootGiftData[attr] || [];
                     if( temPics.length !== pics.length ){
                        modifyAttrCollections[attr] = pics;
                     }else{
                        try{
                            // 保证tmpPics下所有的pic都在pics中存在
                          temPics.every(function(tmpPic){
                            return pics.some(function(pic){
                               return pic.url === tmpPic.url;                            
                            })
                          })
                        }catch(e){
                          console.log(e);
                        }
                     }
                   break;

                   case "price":
                     if(rootGiftData[attr] !== price){
                        modifyAttrCollections[attr] = price;
                     }
                   break;

                   case "quantity":
                     if(rootGiftData[attr] !== quantity){
                        modifyAttrCollections[attr] = quantity;
                     }
                   break;

                   case "status":
                     if(rootGiftData[attr] !== status){
                        modifyAttrCollections[attr] = status;
                     }
                   break;

                   case "stocknum":
                     if(rootGiftData[attr] !== stocknum){
                        modifyAttrCollections[attr] = stocknum;
                     }
                   break;

                   case "target":
                     if(rootGiftData[attr] !== target){
                        modifyAttrCollections[attr] = target;
                     }
                   break;

                   case "title":
                     if(rootGiftData[attr] !== title){
                        modifyAttrCollections[attr] = title;
                     }
                   break;

                   case "usage":
                     if(rootGiftData[attr] !== usage){
                        modifyAttrCollections[attr] = usage;
                     }
                   break;

                 }

               }

               console.log(modifyAttrCollections);

               if($.isEmptyObject(modifyAttrCollections)){

                 tip("你没有改啥啊");
                 return;

               }else{

                showLoading();

                var data = {
                      gid:gid,
                      code:code.value,
                      person:person.value,
                      reason:reason
                 };
              
                 var promises = [];
                 for(var attr in modifyAttrCollections){

                   data.field = attr;

                   data.value = modifyAttrCollections[attr];

                   params.data = JSON.stringify(data);

                    var promise = $http(params).then(function(result){
                       var upperData = result.data;
                       console.log(result);
                       if(upperData.state === "SUCCESS"){
                        console.log("修改商品"+attr+"属性成功");
                       }else{
                           console.log("修改商品"+attr+"属性失败");
                           console.log(upperData.message);
                      }
                   }).catch(function(e){
                       console.log("修改商品"+attr+"属性失败");
                      console.log(e);
                   })

                   promises.push(promise);

                 }
                    // 保证所有都保存成功。移除loading
                    $q.all(promises).then(function(){
                         hideLoading('修改成功');
                          var gifts = $scope.gifts;
                          var i = 0;
                          var l = gifts.length;
                          var index = -1;
                          for(;i<l;i++){
                            var gift = gifts[i];
                            if(gift.gid == gid){
                                index = i;
                                break;
                            }
                         }
                         if(index !== -1){
                            $scope.gifts[index] = $scope.giftData;
                         }
                    },function(){
                      hideLoading('修改失败');
                    });
               }
            }else{
               params.data = JSON.stringify(giftData);
               params.url = addone;
               // params.data = JSON.stringify(giftData);
               showLoading();
               $http(params).then(function(result){
                 var upperData = result.data;
                 console.log(result);
                 if(upperData.state === "SUCCESS"){
                    var data = upperData.data;
                    console.log(data);
                    hideLoading("新增商品成功");
                    $scope.gifts.unshift(giftData);
                 }else{
                     hideLoading("新增商品失败");
                     console.log(upperData.message);
                }

               }).catch(function(e){
                  hideLoading("新增商品失败");
                  console.log('新增商品失败');
                  console.log(e);
               })
            }
        },
        abandon:function(){
            // 清空图片
            $("table tr td img").attr("src",null);
            // 默认是下架的
            $scope.giftData = {
              status:0,
              last_valid_time:dateFormater(new Date(),pattern)
            };
        }
    };

    $scope.eventHandler = eventHandler;
    if(code.value){
      $http(params).then(function(result){
      var upperData = result.data;
      console.log(result);

      if(upperData.state === "SUCCESS"){
        var data = upperData.data;
        
        // 先过滤出所有商品，在给每个添加href属性，然后按照过期时间，从上倒下排列
        $scope.gifts = data.filter(function(each){
                        return each.type == 0;
                      }).map(function(each){
                        // each.href = "http://z.diaox2.com/view/app/?m=jfitem&gid="+each.gid;
                        each.href = "http://c.diaox2.com/view/app/?m=jfitem&gid="+each.gid;
                        // pic字段是一个
                        each.pics = JSON.parse(each.pics);
                        return each;
                      }).sort(function(e1,e2){
                        return e1.last_valid_time > e2.last_valid_time ? 1 : (e1.last_valid_time < e2.last_valid_time ? -1 : 0);
                      });
        console.log($scope.gifts);
      }else{
         tip("获取所有商品失败");
         console.log(upperData.message);
      }
    }).catch(function(e) {
        console.log('获取所有商品失败');
        console.log(e);
    })
    }else{
      tip('请输入密码');
    }
    
});