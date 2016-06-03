var jfApp = angular.module('jfApp');

jfApp.directive('scrollWith', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      var scroller = $(elem);
      var top = scroller.offset().top;
      var left = scroller.offset().left;
      var width = scroller.outerWidth();
      scroller.height($("html").height() - parseInt(scroller.css("paddingTop")));
      $(window).on('scroll',function(){
        var scrollTop = $(this).scrollTop();
        if(scrollTop >= top){
          scroller.css({
            position:"fixed",
            left:left,
            top:0,
            width:width,
            overflow:"auto"
          })
        }else{
          scroller.css({
            position:"static",
            overflow:"hidden"
          })
        }
      })
    }
  }
});

jfApp.controller('mallCouponCtrl',function($scope,$http,$q,$rootScope,$filter){
    var headers      = {"Content-Type": "application/json"};
    var prefix       = "http://api.diaox2.com:3000/jf/";
    var mall         = prefix + "mall";
    var addone       = prefix + "addone";
    var modone       = prefix + "modone";
    var checkgoods   = prefix + "checkgoods";
    var pattern      = "yyyy-MM-dd HH:mm:ss"
    var dateFormater = $filter('date');
    var params       = {
                          url: mall,
                          method: "POST",
                          timeout: 20000,
                          catch: true,
                          headers: headers,
                          // data:"{}"
                          data:'{"all":""}'
                      };
     function local_multi(result,id,isMulti){
      var failArray    = [];
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
        var couponData = $scope.couponData;
        if(couponData){
          var pics = couponData[id];
          if(isMulti){
            if(pics != null && pics.length>0){
              $scope.couponData[id] = pics.concat(successArray);
            }else{
              $scope.couponData[id] = successArray;
            }
          }else{
            $scope.couponData[id] = successArray[0].url;
          }
        }else{
          $scope.couponData = {}
          if(isMulti){
            $scope.couponData[id] = successArray;
          }else{
             $scope.couponData[id] = successArray[0].url;
          }
        }
        if(!failArray.length){
           hideLoading("全部上传成功");
           // 上传成功之后清空fil
        }
      }
      $("#"+id).val("");
    }
    $scope.couponData = {status:0,last_valid_time:dateFormater(new Date(),pattern)};
    var eventHandler = {
        save:function(couponData){

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
            if(!couponData){
              tip("还没有填写任何信息哦");
              return;
            }
            var rootCouponData = $rootScope.rootCouponData;
            // 标题
            var title = (couponData.title || "").trim();
            // 兑换所需积分
            var price = +(couponData.price || 0);
            // 优惠券库存数量
            var quantity = +(couponData.quantity || 0);
            // 库存总量
            var stocknum = +(couponData.stocknum || 0);
            // 有效期选择
            var last_valid_time = couponData.last_valid_time;
            if(typeof last_valid_time === "object"){
              couponData.last_valid_time = couponData.last_valid_time.format("YYYY-MM-DD HH:mm:ss");
              console.log('typeof last_valid_time === "object" start');
              console.log(couponData.last_valid_time);
              console.log('typeof last_valid_time === "object" end');
            }else{
              console.log('else typeof last_valid_time === "object" start');
              console.log(last_valid_time);
              console.log('else typeof last_valid_time === "object" end');
            }
            console.log('out typeof last_valid_time === "object"');
            console.log(last_valid_time);
            // 优惠券描述
            var intro = (couponData.intro || "").trim();
            // 注意事项
            var desc = (couponData.desc || "").trim();
            // 人均可兑换数量
            var limited = +(couponData.limited || 0);
            // 兑换流程
            var usage = (couponData.usage || "").trim();
            // url链接
            var target = (couponData.target || "").trim();
            // 修改原因
            var reason = (couponData.reason || "").trim();
            // 优惠码
            var coupons = couponData.coupons;

            if(!coupons){
              tip("优惠码必须填写");
              return;
            }

            /**
             * [if bug]
             * @param  {[type]} !(coupons instanceof    Array) [description]
             * @return {[type]}           [description]
             * @bug 需要首先判定coupons是否是Array，
             *      如果不是，再使用replace
             *      如果是，说明已经转换过了，但是还没有保存
             */
            if(!(coupons instanceof Array)){

              var couponArray = [];

              var rword = /[^\n\r, ，]+/g;// 以换行、空格、中文逗号、英文逗号分割，使用replace进行foreach

              coupons.replace(rword,function(each){
                couponArray.push(each);
              });

              couponData.coupons = couponArray;

            }
            
            console.log(coupons);

            var ec = (couponData.ec || "").trim();

            if(!title || title.length > 20){
              tip("标题必须填写，且在20字以内");
              return;
            }

            if(!intro || intro.length > 150){
              tip("优惠券描述必须填写，且在150字以内");
              return;
            }

            if(!usage){
              tip("兑换流程必须填写");
              return;
            }

            if(!ec){
              tip("电商名称必须填写");
              return;
            }

            if(!desc){
              tip("网站介绍必须填写");
              return;
            }
            if(!reason){
              tip("修改原因必须填写");
              return;
            }

            if(isNaN(price) || price <= 0){
              tip("兑换所需积分只能填写正整数");
              return;
            }

            if(isNaN(quantity) || quantity <= 0){
              tip("优惠券库存数量只能填写正整数");
              return;
            }

            if(isNaN(stocknum) || stocknum <= 0){
              tip("库存总量只能填写正整数");
              return;
            }

            if(isNaN(limited) || limited <= 0){
              tip("人均可兑换数量只能填写正整数");
              return;
            }
            // 图片验证
            var pics = couponData.pics;

            if(!pics){
              pics = [];
            }else{
              pics.map(function(pic){
                delete pic["$$hashKey"];
                delete pic["object"];
                return pic;
              })
            }

            var thumb = couponData.thumb;

            if(!thumb){
              tip('缩略图不能为空');
              return;
            }

            var cover = couponData.cover;

            if(!cover){
              tip('cover图不能为空');
              return;
            }




            var gid = couponData.gid;

            couponData.person = person.value;
            
            couponData.code = code.value;

            // 如果是新增就需要赋值
            couponData.type = 1;

            console.log(couponData);

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
               * 首先拿到根作用域下的 rootCouponData
               * 然后for in rootCouponData，一次比较那个属性发生了变化
               * 把发生变化的属性记录起来，一会儿统一发ajax
               */

               var rootCouponData = $rootScope.rootCouponData;

               var status = couponData.status;

               console.log(rootCouponData);

               var modifyAttrCollections = {};

               for(var attr in rootCouponData){
                 // 不比较gid/type/href。因为这3者不可能被修改。去掉angular的标识的影响。
                 if(attr === "gid" || attr === "type" || attr === "href" || attr === "$$hashKey" || attr === "object"){
                   continue;
                 }

                 switch(attr){

                   case "cover":
                     if(rootCouponData[attr] !== cover){
                        modifyAttrCollections[attr] = cover;
                     }
                    break;

                   case "desc":
                     if(rootCouponData[attr] !== desc){
                        modifyAttrCollections[attr] = desc;
                     }
                   break;

                   case "intro":
                    if(rootCouponData[attr] !== intro){
                        modifyAttrCollections[attr] = intro;
                     }
                   break;

                   case "last_valid_time":
                    if(rootCouponData[attr] !== last_valid_time){
                        modifyAttrCollections[attr] = last_valid_time;
                     }
                   break;
                   case "limited":
                     if(rootCouponData[attr] !== limited){
                        modifyAttrCollections[attr] = limited;
                     }
                   break;

                   case "pics":
                     // 不好判断。更新吧。
                     var temPics = rootCouponData[attr] || [];
                     if( temPics.length !== pics.length ){
                        modifyAttrCollections[attr] = pics;
                     }else{
                        // 保证tmpPics下所有的pic都在pics中存在
                        temPics.every(function(tmpPic){
                          return pics.some(function(pic){
                             return pic.url === tmpPic.url;                            
                          })
                        })
                     }
                   break;

                   case "price":
                     if(rootCouponData[attr] !== price){
                        modifyAttrCollections[attr] = price;
                     }
                   break;

                   case "quantity":
                     if(rootCouponData[attr] !== quantity){
                        modifyAttrCollections[attr] = quantity;
                     }
                   break;

                   case "status":
                     if(rootCouponData[attr] !== status){
                        modifyAttrCollections[attr] = status;
                     }
                   break;

                   case "stocknum":
                     if(rootCouponData[attr] !== stocknum){
                        modifyAttrCollections[attr] = stocknum;
                     }
                   break;

                   case "target":
                     if(rootCouponData[attr] !== target){
                        modifyAttrCollections[attr] = target;
                     }
                   break;

                   case "title":
                     if(rootCouponData[attr] !== title){
                        modifyAttrCollections[attr] = title;
                     }
                   break;

                   case "usage":
                     if(rootCouponData[attr] !== usage){
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
                        console.log("修改优惠券"+attr+"属性成功");
                       }else{
                           console.log("修改优惠券"+attr+"属性失败");
                           throw "修改优惠券"+attr+"属性失败";
                           console.log(upperData.message);
                      }
                   }).catch(function(e){
                       console.log("修改优惠券"+attr+"属性失败");
                       console.log(e);
                   })

                   promises.push(promise);

                 }
                    // 保证所有都保存成功。移除loading
                    $q.all(promises).then(function(){
                         hideLoading('修改成功');
                          var coupons = $scope.coupons;
                          var i = 0;
                          var l = coupons.length;
                          var index = -1;
                          for(;i<l;i++){
                            var coupon = coupons[i];
                            if(coupon.gid == gid){
                                index = i;
                                break;
                            }
                         }
                         if(index !== -1){
                            $scope.coupons[index] = $scope.couponData;
                         }
                    },function(){
                      hideLoading('修改失败');
                    });
               }
            }else{
               params.data = JSON.stringify(couponData);
               params.url = addone;
               // params.data = JSON.stringify(couponData);
               showLoading();
               $http(params).then(function(result){
                 var upperData = result.data;
                 console.log(result);
                 if(upperData.state === "SUCCESS"){
                    var data = upperData.data;
                    hideLoading("新增优惠券成功");
                    $scope.coupons.unshift(couponData);
                 }else{
                     hideLoading("新增优惠券失败");
                     console.log(upperData.message);
                }

               }).catch(function(e){
                  hideLoading("新增优惠券失败");
                  console.log('新增优惠券失败');
                  console.log(e);
               })
            }
        
        },
        upload:function(event,id,isMulti){

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
        view:function(coupon){
           $scope.couponData = JSON.parse(JSON.stringify(coupon));
           $rootScope.rootCouponData = JSON.parse(JSON.stringify(coupon));
        },
        
        abandon:function(){
             // 清空图片
            $("table tr td img").attr("src",null);
            $scope.couponData = {
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
          $scope.coupons = data.filter(function(each){
                          return each.type == 1;
                        }).map(function(each){
                          // each.href = "http://z.diaox2.com/view/app/?m=jfitem&gid="+each.gid;
                          each.href = "http://c.diaox2.com/view/app/?m=jfitem&gid="+each.gid;
                          // pic字段是一个
                          each.pics = JSON.parse(each.pics);
                          return each;
                        }).sort(function(e1,e2){
                          return e1.last_valid_time > e2.last_valid_time ? 1 : (e1.last_valid_time < e2.last_valid_time ? -1 : 0);
                        });
         console.log($scope.coupons);

         $scope.coupons.forEach(function(coupon){
            var gid = coupon.gid;
            coupon.coupons = [];
            var params = {
              url: checkgoods,
              method: "POST",
              timeout: 20000,
              catch: true,
              headers: headers,
              // data:"{}"
              data:JSON.stringify({
                gid:gid,
                code:code.value,
                person:person.value
              })
          };
          $http(params).then(function(result){
            console.log(result);
            var upperData = result.data;
            if(upperData.state === "SUCCESS"){
              var data = upperData.data;
              var sales = data.sales;
              sales.forEach(function(sale){
                coupon.coupons.push(sale.value);
              })
            }else{
              console.log('获取优惠券明细失败。gid:' +gid );
            }

          }).catch(function(e){
            console.log('获取优惠券明细失败。gid:' +gid );
          })
         }) 
        }else{
           tip("获取所有优惠券失败。gid:" +gid);
           console.log(upperData.message);
        }
      }).catch(function(e) {
          console.log('获取所有优惠券失败。gid:' +gid);
          console.log(e);
      })
    }else{
      tip('请输入密码');
    }

});