// this control used to loading data
var mainApp = angular.module("myApp", ['ngRoute']);
mainApp.controller('LoadingDataCtrl', function ($scope, $http,$window) {

    var files=[
        1,
        20160729,
        20160730,
        20160805,
        20160808,
        20160812,
        20160813,
        20160819
    ];
    files.forEach(function(file){
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

