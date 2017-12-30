// this control used to loading data
var mainApp = angular.module("myApp", ['ngRoute']);
mainApp.controller('LoadingDataCtrl', function ($scope, $http,$window) {

    var files=[
        20171002
        ,
        20171003
        ,
        20171005
        ,
        20171006
    ];
    files.forEach(function(file){
        console.log("loading data")
        d3.csv("../data/"+file+".csv",function(gameReocrd) {
        //    gameReocrd.forEach(function(d){
        //        console.log(d);
        //    });



            console.log("=================================================")
            $http.post('/api/gameRecord',gameReocrd)
                .success(function (result) {
                    console.log(result);
                })
                .error(function (err) {
                    console.log('Error: ' + err);
                });
        });

    })

});

