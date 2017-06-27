"use strict";

var jfApp = angular.module('jfApp');

jfApp.controller('userCtrl',function($scope,$rootScope,$http,$q,$filter){
    // CODE Sohappy@1902
    var headers = {"Content-Type":"application/json"};
    var prefix = "//bj2.a.dx2rd.com:3000/jf/";
    var checkuser = prefix+"checkuser";
    var set_state = prefix+"set_state";
    var audituser = prefix+"audituser";
    var error = "失败，请重试";
    var dataFetch = {
        users:[]
    };

    var dateFormater = $filter('date');
    var pattern = "yyyyMMdd";
    var now = new Date();
    var datebox = $scope.datebox = {start:now,end:now};

    $scope.endDateChange = $scope.startDateChange = function(){
         var datebox = $scope.datebox;
         var pattern = "yyyyMMdd HH:mm:ss"
         var start = dateFormater(datebox.start,pattern);
         var end = dateFormater(datebox.end,pattern);
         var _d = "_d";
         if(typeof start === "object" && _d in start){
           start = dateFormater(start[_d],pattern);
         }
         if(typeof end === "object" && _d in end){
           end = dateFormater(end[_d],pattern);
         }
         // var start = datebox.start.format(pattern);
         // var end = datebox.end.format(pattern);
        $scope.eventHandler.search(start,end);
    }







    $scope.dataFetch = dataFetch;
    // userCtrl下的所有事件回调都挂在eventHandler下，方便统一管理
    var eventHandler = {
        modifyBlack:function(userData){
            // 未保存标识
            $('.basic-info .disnone').css("display","table-cell");
            $rootScope.modifyButNotSave = true;
        },
        modifyScore:function(userData){
            var score = document.getElementById("score");
            if(userData){
                score.disabled = false;
                score.focus();
                // 把原始value放入跟作用域中
                $rootScope.score = score.value;
                // 只有输入信息才显示修改原因
                score.oninput = function(){
                    $('.score-info .disnone').css("display","table-cell");
                    $rootScope.modifyButNotSave = true;
                }
            }
        },
        to:function(gid){
            window.open("http://z.diaox2.com/view/app/?m=jfitem&gid="+gid);
            // console.log(history);
        },
        paddingRight:function(user){
            // console.log(user);
            var  modifyButNotSave =  $rootScope.modifyButNotSave;
            if(typeof modifyButNotSave === "boolean"){
                if(modifyButNotSave){
                    var flag = window.confirm("你还未保存，确定放弃么？");
                    // 确定放弃
                    if(flag){
                        $rootScope.modifyButNotSave = false;
                    }else{
                        // 不放弃
                        return;
                    }
                }
            }
            // 深拷贝一个user对象，不然listView中的user和操作区中的userData指向的是同一个对象
            // 所以会导致左侧更给userData.score也会导致listView中的user.score的变化

            $scope.userData = JSON.parse(JSON.stringify(user));


            // 发现黑名单说明有时候会保存上次的值
            document.getElementById('blacked_reason').value = "";
            document.getElementById("score").disabled = true;
            $('.disnone').css("display","none");
            // 记住原始的是否是黑名单
            $rootScope.isBlacked = $scope.userData.blacked == 0 ? false : true ;

            // 供abandon方法调用
            $rootScope.userData = JSON.parse(JSON.stringify(user));

            var uid = $scope.userData.uid;
            var code = document.getElementById('code').value;
            var pattern = "yyyyMMdd"
            var start = dateFormater($scope.datebox.start,pattern);
            var end = dateFormater($scope.datebox.end,pattern);
            var _d = "_d";
            if(typeof start === "object" && _d in start){
               start = dateFormater(start[_d],pattern);
            }
            if(typeof end === "object" && _d in end){
              end = dateFormater(end[_d],pattern);
            }
            $http({
                url:audituser,
                method:"POST",
                timeout:20000,
                catch:true,
                headers:headers,
                data:JSON.stringify({
                    uid:uid,
                    start: start,
                    end: end,
                    code:code
                })
            }).then(function(result){
                 var firstData = result.data;
                 if(firstData.state !== "SUCCESS"){
                    var message = firstData.message;
                    var info = "获取用户\""+$scope.userData.auth_info[userData.auth_info.platform].nick_name+"\"失败，请重试。";
                    if(message){
                        info = "信息："+message;
                    }
                    tip(info);
                 }else{
                    firstData.data.map(function(item){
                        item.record = JSON.parse(item.record);
                        return item;
                    })
                    $scope.userData.scoreHistorys = firstData.data;
                 }
            }).catch(function(e){
                 tip("获取用户\"$scope.userData.nick_name\"失败，请重试");
                 console.log(e);
            })


        },
         abandon:function(userData){
            // alert("放弃");
            if(!userData){
                return;
            }
            var rud = $rootScope.userData;
            if(!rud){
                return;
            }
            $scope.userData = $rootScope.userData;
            $('.disnone').css("display","none");
            $rootScope.modifyButNotSave = false;
        },
        save:function(userData){

            if(!userData){
                tip('没有可供保存的数据');
                return;
            }

            if(typeof $rootScope.modifyButNotSave !== "boolean"){
                tip('还没有做任何修改');
                return;
            }

            var uid = userData.uid;
            var p = $.getP();
            var person = p.person;
            var code = p.code;
            var rperson = /^[a-zA-z0-9]{2,9}$/g;
            if(!person.value || !rperson.test(person.value)){
                 tip('请填写修改人，格式为英文名或拼音缩写，不能超过8位，否则无法保存。')
                 person.focus();
                 return;
           }else{
              // 存入本地缓存
              window.localStorage.setItem('person',person.value);
            //   person.disabled = true;
           }

           if(!code.value){
                 tip('请填写密码');
                 code.focus();
                 return;
           }else{
              // 存入会话缓存
              window.sessionStorage.setItem('code',code.value);
            //   code.disabled = true;
           }


           var reasonText = document.getElementById('reason');
           var reasonCell = reasonText.parentNode;
           // 如果reasonCell不是隐藏状态，说明管理员修改了积分，此时需要判断reason是否有值
           var reasonCellDisplay = $(reasonCell).css("display");

           var deffered = $q.defer();
           var promises = [];
           // 积分只能填写正整数 123 和 123. 都是合法的
           var rDigital = /^\d+$/;
           if( reasonCellDisplay !== "none"){
                var reason = reasonText.value.trim();
                if(reason){
                    // 取出原始值（修改之前的值）
                    var score = $rootScope.score;
                    // 取出当前值
                    var nScore = $scope.userData.score;
                    if(!rDigital.test(nScore)){
                        tip('积分格式填写有误，请填写正整数');
                        return;
                    }
                    // 计算出当前值和原始值的差。负数也算。
                    var value = nScore - score;

                    if(value == 0){
                        tip("你并没有修改积分");
                        return;
                    }

                    showLoading();
                    // return;
                    var promise = $http({
                        url:set_state,
                        method:"POST",
                        timeout:20000,
                        catch:true,
                        headers:headers,
                        data:JSON.stringify({
                            // 积分加减操作
                            "action": "manualop",
                            // 把当前值和原始值的差传入。加分 100，减分 -100
                            "value":value,
                            // 增减积分的原因，需要管理员进行说明
                            "reason":reason,
                            // 被增减积分的用户的uid
                            "uid":uid,
                            // 管理员
                            "person": person.value,
                            // 管理密码。TODO:MD5(code)
                            "code": code.value
                        })
                    }).then(function(result){
                        console.log(result);
                        var state = result.state
                        if(state !== 'SUCCESS') {
                          throw new Error(result.message)
                        }
                    }).catch(function(e){
                        console.log('修改积分失败',e.toString());
                    })
                    // 放入promises数组中
                    promises.push(promise);
                }else{
                    tip("请填写修改积分的原因");
                    return;
                }
           }



           var blacked_reasonText = document.getElementById('blacked_reason');
           var blacked_reasonCell = blacked_reasonText.parentNode;
           var blacked_reasonCellDisplay = $(blacked_reasonCell).css("display");
           var blacked_reason;
           if( blacked_reasonCellDisplay !== "none"){
                blacked_reason = blacked_reasonText.value.trim();
                // 不写原因，不让保存
                if(!blacked_reason){
                    tip("请填写加入/移出黑名单原因");
                    return;
                }
           }
           var oriIsBlacked = $rootScope.isBlacked;
           var isBlacked = $scope.userData.isBlacked;
           if(typeof isBlacked !== "boolean"){
             // 如果没有通过界面赋予isBlacked值，那么就根据blacked的值赋值
             isBlacked = document.getElementById('isBlacked').checked;
           }

           if(isBlacked){
            $scope.userData.blacked = 1;
           }else{
            $scope.userData.blacked = 0;
           }

           console.log(isBlacked);
           console.log(oriIsBlacked);
           var flag = true;
           // 原来在黑名单，现在不在黑名单。黑名单取消动作
           if(oriIsBlacked == true && isBlacked != true){
                console.log("从黑名单中删除");
                var promise = $http({
                    url:set_state,
                    method:"POST",
                    timeout:20000,
                    catch:true,
                    headers:headers,
                    data:JSON.stringify({
                        // 积分加减操作
                        "action": "unblock",
                        "uid":uid,
                        "reason":blacked_reason,
                        // 管理员
                        "person": person.value,
                        // 管理密码。TODO:MD5(code)
                        "code": code.value
                    })
                    }).then(function(result){
                        console.log(result);
                        var upperData = result.data;
                        if(upperData.state != "SUCCESS"){
                            tip("从黑名单中移除失败，请重试");
                            console.log(upperData.message);
                            flag = false;
                            // throw "从黑名单中移除失败："+upperData.message;
                        }else{
                          console.log("从黑名单中移除成功");
                        }
                    }).catch(function(e){
                        flag = false;
                        console.log('从黑名单中移除失败',e.toString());
                    })
                 promises.push(promise);
           }
           // 原来不再黑名单，现在在黑名单。添加黑名单动作
           if(oriIsBlacked == false && isBlacked != false){
                console.log("加入黑名单");
                var promise = $http({
                    url:set_state,
                    method:"POST",
                    timeout:20000,
                    catch:true,
                    headers:headers,
                    data:JSON.stringify({
                        // 积分加减操作
                        "action": "block",
                        "uid":uid,
                        "reason":blacked_reason,
                        // 管理员
                        "person": person.value,
                        // 管理密码。TODO:MD5(code)
                        "code": code.value
                    })
                    }).then(function(result){
                        console.log(result);
                        var upperData = result.data;
                        if(upperData.state != "SUCCESS"){
                            flag = false;
                            tip("加入黑名单失败，请重试");
                            console.log(upperData.message);
                            // throw "加入黑名单失败：" + upperData.message;
                        }else{
                          console.log("加入黑名单成功");
                        }
                    }).catch(function(e){
                        flag = false;
                        console.log('加入黑名单失败',e.toString());
                    })
                 promises.push(promise);
           }


            // 保证所有都保存成功。移除loading
            $q.all(promises).then(function(){
                 hideLoading('保存成功');

                 var userData = $scope.userData;
                 var mUid = userData.uid;
                 console.log(userData);
                 var users = $scope.dataFetch.users;
                 var i = 0;
                 var l = users.length;
                 var index = -1;
                 for(;i<l;i++){
                    var user = users[i];
                    if(user.uid == mUid){
                        index = i;
                        break;
                    }
                 }
                 if(index !== -1){
                    $scope.dataFetch.users[index] = $scope.userData;
                 }
                 console.log($scope.dataFetch.users);
                 users.forEach(function(user){
                    var uid = user.uid;
                 })

                 if(flag){
                    console.log('all SUCCESS');
                 }else{
                    console.log('not all SUCCESS');
                 }

                 console.log(userData);
                 flag = true;
            },function(){
                hideLoading("保存"+error);
            }).catch(function(e){
              console.log(e)
            })

           $rootScope.modifyButNotSave = false;
        },


        search:function(start,end){
             var queryStr = $scope.query;
             var rword = /[^, ，]+/g;// 以空格、中文逗号、英文逗号分割，使用replace进行foreach
             var keywords;
             // debug模式，不用每次都输入这三个数字了
             if(!queryStr){
                queryStr = "497 55 88 72801";
             }
             // TODO:查询是否输入了code，否则提示用户，且不准进行任何操作
             if(queryStr){
                queryStr = queryStr.trim();
                // 先清空左侧数据
                $scope.dataFetch.users.length = 0;
                // 497 55 李园宁和艾瑞斯的uid
                var deffered = $q.defer();
                var promises = [];
                showLoading();
                var code =  $('#code').val() || window.sessionStorage.getItem('code');
                if(!code){
                    hideLoading();
                    tip("请输入密码");
                    return;
                }
                queryStr.replace(rword,function(uid){

                    var params = {
                          'uid':uid
                          ,'code':code
                          // ,'code':"c8b89fee46428458ad670e0fda6e099b"
                       }

                    if( start && end){
                        params.start = start;
                        params.end = end;
                    }

                    var promise = $http({
                        url:checkuser,
                        method:"POST",
                        timeout:20000,
                        catch:true,
                        data:JSON.stringify(params),
                       headers:headers
                    }).then(function(result){
                        var upperData = result.data;
                        if(upperData.state === "SUCCESS"){

                         var data = upperData.data;
                         var history = data.history;
                         var user = data.user;
                         var auth_info = user.auth_info;

                         if(auth_info){
                             try{
                                 user.auth_info = JSON.parse(auth_info);
                             }catch(e){
                                user.auth_info = {};
                             }
                         }else{
                            user.auth_info = {};
                         }
                         // 把时间从大到小排列
                         history.sort(function(d,d2){
                            return d.stamp < d2.stamp ? 1 : (d.stamp > d2.stamp ? -1 : 0);
                         });

                         user.history = history;
                         $scope.dataFetch.users.push(user);
                        }else{
                            if(data.message){
                                tip(data.message);
                            }else{
                                tip("查询"+error);
                            }
                        }
                    }).catch(function(e){
                        console.log('checkuser接口查询失败')
                        tip("查询"+error);
                    });
                    promises.push(promise);
                })
                // 要查询的都返回成功
                $q.all(promises).then(function(){
                     hideLoading();
                },function(){
                    hideLoading("查询"+error);
                });

             }

        },
        knockEnterKey:function($event){
            var keycode = $event.keyCode;
            if(keycode === 13){
                this.search();
            }
        }
    }
    $scope.eventHandler = eventHandler;
});
