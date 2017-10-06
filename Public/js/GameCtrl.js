var mainApp = angular.module("myApp", ['ngRoute']);

mainApp.controller('GameCtrl', function ($scope, $http,$window) {
    angular.element($window).on('resize', function () { $scope.$apply() });

    // player data of the selected game
    $scope.playerData={
        dataList:[]
    }

    // the statistic data of the game
    $scope.gameData={
        all:[],         // all the information
        score:[],
        kill:[],
        exile:[],
        skill:[],
        survive:[],
        win:[],
        mode:"score"
    }

    // data for the global bar chart
    $scope.barChartData={
        Data:[]
    }
    $scope.barChartData.onClick=function(player){
        // data for line chart
        $http.post('/api/playerData',{name:player,season:$scope.selectedSeason})
            .success(function (deathDays) {

                var newDeathDays=[];
                deathDays.forEach(function(d){
                    console.log("try to parse");
                    console.log(d.date);
                    var parsedDate=iso.parse(d.date)
                    console.log(parsedDate);
                    console.log(typeof(parsedDate));
                    newDeathDays.push({
                        date: parsedDate
                        ,deathDay:d.deathDay
                    })
                })
                $scope.playerData.dataList=newDeathDays
            })
            .error(function (err) {
                console.log('Error: ' + err);
            });

        // data for bar chart
        $http.post('/api/playerBarData',{name:player,season:$scope.selectedSeason,mode:$scope.gameData.mode})
            .success(function (data) {
                $scope.playerBar.Data=data;
            })
            .error(function (err) {
                console.log('Error: ' + err);
            });

    }

    // data for the selected player bar chart
    $scope.playerBar={
        Data:[]
    }
    $scope.playerBar.onClick=function(player){
    }

    // listen to the mode selection
    $scope.$watch('gameData.mode', function() {
        console.log( $scope.gameData.mode);
        console.log($scope.gameData.score);
        if($scope.gameData.mode=="score") $scope.barChartData.Data=$scope.gameData.score;
        else if($scope.gameData.mode=="kill") $scope.barChartData.Data=$scope.gameData.kill;
        else if($scope.gameData.mode=="exile") $scope.barChartData.Data=$scope.gameData.exile;
        else if($scope.gameData.mode=="skill") $scope.barChartData.Data=$scope.gameData.skill;
        else if($scope.gameData.mode=="survive") $scope.barChartData.Data=$scope.gameData.survive;
        else if($scope.gameData.mode=="win") $scope.barChartData.Data=$scope.gameData.win;
        else if($scope.gameData.mode=="wolves") $scope.barChartData.Data=$scope.gameData.wolves;
        else if($scope.gameData.mode=="lucky") $scope.barChartData.Data=$scope.gameData.lucky;
        else if($scope.gameData.mode=="foolish") $scope.barChartData.Data=$scope.gameData.foolish;
    });

    // two injury matrices
    $scope.injury={

    }
    $scope.injured={

    }
    // detail of selected game
    $scope.gameDetail={
        playerList:[],
        badge:[
        ],
        lovers:[],
        lucky:[]
    }
    // game selection
    $scope.selectedGame={

    }
    /*
    var parseDate = d3.time.format("%d-%b-%y").parse;

    d3.csv("../data/data.csv", function(error, data) {
        if (error) throw error;
        var newData=[];
        data.forEach(function(d) {
            newData.push({date:parseDate(d.date), close:+d.close});
        });
        $scope.playerData.dataList=newData;

        $scope.$apply();
    });
    */


    var iso = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ");
    /*
    $http.post('/api/playerData',{name:"王晓丹",season:2})
        .success(function (deathDays) {


        //    var format = d3.time.format("%Y-%m-%d");
        //    console.log(format.parse("2011-01-01"));
            console.log(iso.parse("2016-08-04T16:00:00.000Z"));


            var newDeathDays=[];
            deathDays.forEach(function(d){
                console.log("try to parse");
                console.log(d.date);
                var parsedDate=iso.parse(d.date)
                console.log(parsedDate);
                console.log(typeof(parsedDate));
                newDeathDays.push({
                    date: parsedDate
                    ,deathDay:d.deathDay
                })
            })
            $scope.playerData.dataList=newDeathDays
        })
        .error(function (err) {
            console.log('Error: ' + err);
        });
*/

    // season selection
    $scope.seasonList=[1];
    // selected Season
    $scope.selectedSeason=1;
    // gameData: the calculations of players

    $scope.$watch('selectedSeason', function() {
        $http.post('/api/death',{season:$scope.selectedSeason})
            .success(function (deathData) {
                console.log("get death info:" + deathData.score);
                $scope.gameData.all=deathData.all;
                $scope.gameData.score=deathData.score;
                $scope.gameData.kill=deathData.kill;
                $scope.gameData.exile=deathData.exile;
                $scope.gameData.skill=deathData.skill;
                $scope.gameData.survive=deathData.survive;
                $scope.gameData.win=deathData.win;
                $scope.gameData.wolves=deathData.wolves;
                $scope.gameData.lucky=deathData.lucky;
                $scope.gameData.foolish=deathData.foolish;
                $scope.gameData.mode="score";
                $scope.barChartData.Data=deathData.score;
            })
            .error(function (err) {
                console.log('Error: ' + err);
            });
        $http.post('/api/injury',{season:$scope.selectedSeason})
            .success(function (injury) {
                var matrix=injury.matrix;

                var nameByIndex = new d3.map();
                injury.players.forEach(function(t,i){
                    nameByIndex.set(i, t);
                });
                var players=injury.players;
                $scope.injury={
                    matrix:matrix,
                    nameByIndex:nameByIndex,
                    players:players
                }
                // the injured matrix
                var matrixT=[];
                var length=matrix.length;
                for (var j = -1; ++j < length;){
                    matrixT[j] = [];
                }
                for(var i=-1;++i<length;){
                    for(var j=-1;++j<length;){
                        matrixT[i][j]=matrix[j][i];
                    }
                }
                $scope.injured={
                    matrix:matrixT,
                    nameByIndex:nameByIndex,
                    players:players
                }
            })
            .error(function (err) {
                console.log('Error: ' + err);
            });


        $http.post('/api/gamelist',{season:$scope.selectedSeason})
            .success(function (gamelist) {
                //    gamelist.forEach(function(d){
                //        console.log(d);
                //    })
                $scope.gamelist=gamelist;
            })
            .error(function (err) {
                console.log('Error: ' + err);
            });
    });

    $scope.$watch('selectedGame', function(){
    //    console.log("onSelectGame");
        // 0.Reset the data of the node
        $http.post('/api/oneGame', {date:$scope.selectedGame.date,seq:$scope.selectedGame.seq})
            .success(function(players){
            //    players.forEach(function(d){
            //        console.log(d);
            //    })
                var gameDetail=[];
                var lucky=[];
                var enchantedPlayers=[];
                var badge=[];
                var playersWithBadge=[];

                // check how hunter died
                var hunter=players.filter(function(d){return d.role=="H"});
                var hDying="";
                if(hunter.length>0){
                    hDying=hunter[0].dying;
                }
                // check for lover death
                var lovers=players.filter(function(d){return d.lover==1&& d.dying!="L"});
                var lDying="";
                if(lovers.length>0){
                    lDying=lovers[0].dying;
                }
                // formate data
                players.forEach(function(d,i){
                //    console.log(d);
                    if(d.badge) playersWithBadge.push(d);

                    var deathTime= d.deathday;
                    if(deathTime){
                        if(d.dying=="H"){
                            if(hDying=="L"){
                                if(lDying=="K"|| lDying=="P") deathTime="N"+deathTime;
                                else deathTime="D"+deathTime;
                            }
                            else if(hDying=="K"|| hDying=="P") deathTime="N"+deathTime;
                            else deathTime="D"+deathTime;
                        }
                        else if(d.dying=="L"){
                            if(lDying=="H"){
                                if(hDying=="K"|| hDying=="P") deathTime="N"+deathTime;
                                else deathTime="D"+deathTime;
                            }
                            else if(lDying=="K"|| lDying=="P") deathTime="N"+deathTime;
                            else deathTime="D"+deathTime;
                        }
                        else if(d.dying=="K"|| d.dying=="P") deathTime="N"+deathTime;
                        else deathTime="D"+deathTime;
                    }
                    else deathTime="S";
                    gameDetail.push({name: d.name
                        ,role: d.role
                        ,dying: d.dying
                        ,day: deathTime
                        ,win:d.win
                    });

                    // lovers
                    if(d.lover==1) enchantedPlayers.push({seq:i,name: d.name,day:deathTime});
                    // lucky
                    if(d.lucky){
                        console.log(d.lucky);
                        var luckyOfOnePlayer = d.lucky.split(",");
                        luckyOfOnePlayer.forEach(function(dd){
                            lucky.push({name: d.name
                                ,day: "N"+parseInt(dd.substr(2,1))});
                        })

                    }
                });
                // record the badge
                playersWithBadge.sort(function(a,b){
                    if(!a.deathday&& b.deathday) return 1;
                    else if(a.deathday&& !b.deathday) return -1;
                    else if (!a.deathday&&!b.deathday) return 0;
                    else if(a.deathday< b.deathday) return -1;
                    else if(a.deathday> b.deathday) return 1;
                    else return 0;
                })
                var lastBadgeDay="N1";

                playersWithBadge.forEach(function(d){
                //    console.log(d.name);
                //    console.log(d.deathday);
                //    console.log(d.badge);
                    var badgeDay= d.badge.split(",");
                    badgeDay=badgeDay[badgeDay.length-1];
                    if(!d.dying) badgeDay="S";
                    else if(d.dying=="K"|| d.dying=="P") badgeDay="N"+d.deathday;
                    else badgeDay="D"+d.deathday;
                    badge.push({
                        player: d.name,from:lastBadgeDay,to:badgeDay
                    })
                    lastBadgeDay=badgeDay;
                });
            //    badge.forEach(function(d){
            //        console.log(d);
            //    })
                $scope.gameDetail.badge=badge;
                // record the lover
                var lovers=[];
                if(enchantedPlayers.length==2){
                    if(enchantedPlayers[0].seq<enchantedPlayers[1].seq)
                        lovers.push({
                            lover1:enchantedPlayers[0],
                            lover2:enchantedPlayers[1]
                        })
                    else
                        lovers.push({
                            lover1:enchantedPlayers[1],
                            lover2:enchantedPlayers[0]
                        })
                }
            //    console.log(lovers);
                $scope.gameDetail.lovers=lovers;
                $scope.gameDetail.playerList=gameDetail;
                $scope.gameDetail.lucky=lucky;
                lucky.forEach(function(d){console.log(d)});
            })
            .error(function(err) {
                console.log('Error: ' + err);
            });
    });


});

