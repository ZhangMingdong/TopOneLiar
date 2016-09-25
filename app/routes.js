
var GameRecord = require('./models/GameRecord');


//Assistant = require('./RoutesAssistant');

module.exports = function(app) {


	// get the game list
	app.get('/api/gamelist', function(req, res) {
		GameRecord.find(function(err, records) {

		//	records.forEach(function(d){
		//		console.log(d);
		//	})
			if (err)
				console.log(err);
			else {
				records.sort(function(a,b){
					if(a.date< b.date) return -1;
					else if(a.date> b.date) return 1;
					else if (a.game< b.game) return -1;
					else if (a.game > b.game) return 1;
					else return 0;
				});
				var games=[];
				var lastSeq;
				records.forEach(function(d){
					if(d.game!=lastSeq){
						games.push({
							date: d.date
							,seq: d.game
							,label: d.date.toLocaleDateString()+"---"+ d.game
						});
						lastSeq= d.game;
					}
				});
			//	games.forEach(function(d){
			//		console.log(d);
			//	})
				res.json(games);
			}
		});
	});

	// get the death information
	app.get('/api/death', function(req, res) {
		GameRecord.find(function(err, records) {
			if (err)
				console.log(err);
			else {
				// collect the killed information
				// killed of the player
				var kill={};
				var exile={};
				var skill={};
				var survive={};
				var win={};
				var wolves={};
				var lucky={};
				// all the record of the player
				var all={}
				var listKill=[];
				var listExile=[];
				var listSkill=[];
				var listSurvive=[];
				var listWin=[];
				var listWolves=[];
				var listLucky=[];


				records.forEach(function(d){
					// win
					if(d.win&& d.win==1){
						if(win[d.name]) win[d.name]++;
						else win[d.name]=1;
					}
					// all
					if(all[d.name]) all[d.name]++;
					else all[d.name]=1;
					// kill
					var killed=0
					var dyings= d.dying.split(";");
					dyings.forEach(function(dying){
						if(dying=="K"){
							if(kill[d.name]) kill[d.name]++;
							else kill[d.name]=1;
							killed=1;
						}
					})
					// other death
					if(killed==0){
						if(d.dying=="E"){
							if(exile[d.name]) exile[d.name]++;
							else exile[d.name]=1;
						}
						else if(d.dying){
							if(skill[d.name]) skill[d.name]++;
							else skill[d.name]=1;
						}
						else{
							if(survive[d.name]) survive[d.name]++;
							else survive[d.name]=1;

						}
					}
					// wolves
					if(d.role=="W"|| d.role=="WW")
						if(wolves[d.name]) wolves[d.name]++;
						else wolves[d.name]=1;
					if(d.lucky){
						var luckyNum= d.lucky.split(";").length;
						if(lucky[d.name]) lucky[d.name]+=luckyNum;
						else lucky[d.name]=luckyNum;
					}
					// lucky
				});
				// write the information to array;
				for(var player in kill){
					if(all[player]>1)
						listKill.push({name:player,count:kill[player]/all[player]});
				}
				listKill.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in exile){
					if(all[player]>1)
						listExile.push({name:player,count:exile[player]/all[player]});
				}
				listExile.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in skill){
					if(all[player]>1)
						listSkill.push({name:player,count:skill[player]/all[player]});
				}
				listSkill.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in survive){
					if(all[player]>1)
						listSurvive.push({name:player,count:survive[player]/all[player]});
				}
				listSurvive.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in win){
					if(all[player]>1)
						listWin.push({name:player,count:win[player]/all[player]});
				}
				listWin.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in wolves){
					if(all[player]>1)
						listWolves.push({name:player,count:wolves[player]/all[player]});
				}
				listWolves.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				for(var player in lucky){
					if(all[player]>1)
						listLucky.push({name:player,count:lucky[player]/all[player]});
				}
				listLucky.sort(function(a,b){
					if(a.count> b.count) return 1;
					else if(a.count< b.count) return -1;
					else return 0;
				})
				res.json({
					kill:listKill,
					exile:listExile,
					skill:listSkill,
					survive:listSurvive,
					win:listWin,
					wolves:listWolves,
					lucky:listLucky
				});
			}
		});
	});


	// get injury information
	app.get('/api/injury', function(req, res) {
		GameRecord.find(function(err, records) {
			if (err)
				console.log(err);
			var injury=[];
			records.sort(function(a,b){
				if(a.date< b.date) return -1;
				else if(a.date> b.date) return 1;
				else if (a.game< b.game) return -1;
				else if (a.game > b.game) return 1;
				else return 0;
			});
			var currentGame=records[0].game;
			var hunter="";
			var witch="";
			var wolves=[];
			var killed=[];
			var hunted="";
			var poisoned="";
			records.forEach(function(d){
				if(d.game!=currentGame){
					// record injury and start a new game
					if(hunter!=""&&hunted!="") injury.push({from:hunter,to:hunted});
					if(witch!=""&&poisoned!="") injury.push({from:witch,to:poisoned});
					wolves.forEach(function(w){
						killed.forEach(function(k){
							injury.push({from:w,to:k});
						})
					})

					currentGame= d.game;
					hunter="";
					witch="";
					wolves=[];
					killed=[];
					hunted="";
					poisoned="";
				}
				// record data of this game
				if(d.dying=="P") poisoned= d.name;
				else if(d.dying=="H") poisoned = d.name;
				else if(d.dying=="K") killed.push(d.name);
				if(d.role=="H") hunter= d.name;
				else if(d.role=="Witch") witch= d.name;
				else if(d.role=="W") wolves.push(d.name);
			});
			// formate the injury data
			var matrix=[];
			var players=[];
			var indexByName={};
			var index=0;
			// build the player list and the index map
			injury.forEach(function(d){
				if(indexByName[d.from]==undefined){
					players.push(d.from);
					indexByName[d.from]=index++;
				}
				if(indexByName[d.to]==undefined){
					players.push(d.to);
					indexByName[d.to]=index++;
				}
			});
			// build the matrix;
			// init the matrix
			for (var j = -1; ++j < index;){
				var row = matrix[j] = [];
				for (var i = -1; ++i < index;) row[i] = 0;
			}
			injury.forEach(function(d){
				matrix[indexByName[d.from]][indexByName[d.to]]++;
			});
		//	console.log(players);
		//	console.log(matrix);
			res.json({matrix:matrix
				,indexByName:indexByName
				,players:players})
		});
	});

	// get the game list
	app.post('/api/gamelist', function(req, res) {
		var season=req.body.season;
	//	console.log(season);
		GameRecord.find({season:season},function(err, records) {

			//	records.forEach(function(d){
			//		console.log(d);
			//	})
			if (err)
				console.log(err);
			else {
				records.sort(function(a,b){
					if(a.date< b.date) return -1;
					else if(a.date> b.date) return 1;
					else if (a.game< b.game) return -1;
					else if (a.game > b.game) return 1;
					else return 0;
				});
				var games=[];
				var lastSeq;
				records.forEach(function(d){
					if(d.game!=lastSeq){
						games.push({
							date: d.date
							,seq: d.game
							,label: d.date.toLocaleDateString()+"---"+ d.game
						});
						lastSeq= d.game;
					}
				});
				//	games.forEach(function(d){
				//		console.log(d);
				//	})
				res.json(games);
			}
		});
	});

	// get the death information of a selected season
	app.post('/api/death_old', function(req, res) {
		var season=req.body.season;
	//	console.log(season);
		GameRecord.find({season:season},function(err, records) {
			if (err)
				console.log(err);
			else {
				// collect the killed information
				// killed of the player
				var kill={};
				var exile={};
				var skill={};
				var survive={};
				var win={};
				var wolves={};
				var lucky={};
				// all the record of the player
				var all={}
				var listKill=[];
				var listExile=[];
				var listSkill=[];
				var listSurvive=[];
				var listWin=[];
				var listWolves=[];
				var listLucky=[];


				records.forEach(function(d){
					// win
					if(d.win&& d.win==1){
						if(win[d.name]) win[d.name]++;
						else win[d.name]=1;
					}
					// all
					if(all[d.name]) all[d.name]++;
					else all[d.name]=1;
					// kill
					var killed=0
					var dyings= d.dying.split(";");
					dyings.forEach(function(dying){
						if(dying=="K"){
							if(kill[d.name]) kill[d.name]++;
							else kill[d.name]=1;
							killed=1;
						}
					})
					// other death
					if(killed==0){
						if(d.dying=="E"){
							if(exile[d.name]) exile[d.name]++;
							else exile[d.name]=1;
						}
						else if(d.dying){
							if(skill[d.name]) skill[d.name]++;
							else skill[d.name]=1;
						}
						else{
							if(survive[d.name]) survive[d.name]++;
							else survive[d.name]=1;

						}
					}
					// wolves
					if(d.role=="W"|| d.role=="WW")
						if(wolves[d.name]) wolves[d.name]++;
						else wolves[d.name]=1;
					if(d.lucky){
						var luckyNum= d.lucky.split(";").length;
						if(lucky[d.name]) lucky[d.name]+=luckyNum;
						else lucky[d.name]=luckyNum;
					}
					// lucky
				});
				// write the information to array;
				for(var player in kill){
					if(all[player]>1)
						listKill.push({name:player,count:kill[player],all:all[player]});
				}
				listKill.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in exile){
					if(all[player]>1)
						listExile.push({name:player,count:exile[player],all:all[player]});
				}
				listExile.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in skill){
					if(all[player]>1)
						listSkill.push({name:player,count:skill[player],all:all[player]});
				}
				listSkill.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in survive){
					if(all[player]>1)
						listSurvive.push({name:player,count:survive[player],all:all[player]});
				}
				listSurvive.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in win){
					if(all[player]>1)
						listWin.push({name:player,count:win[player],all:all[player]});
				}
				listWin.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in wolves){
					if(all[player]>1)
						listWolves.push({name:player,count:wolves[player],all:all[player]});
				}
				listWolves.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				for(var player in lucky){
					if(all[player]>1)
						listLucky.push({name:player,count:lucky[player],all:all[player]});
				}
				listLucky.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
			//	console.log(listKill);
				res.json({
					kill:listKill,
					exile:listExile,
					skill:listSkill,
					survive:listSurvive,
					win:listWin,
					wolves:listWolves,
					lucky:listLucky
				});
			}
		});
	});

	// try to rewrite the deat api
	app.post('/api/death', function(req, res) {
		var season=req.body.season;
		//	console.log(season);
		GameRecord.find({season:season},function(err, records) {
			if (err)
				console.log(err);
			else {
				// all the record of the player
				var all={}
				var listAll=[]
				var listKill=[];
				var listExile=[];
				var listSkill=[];
				var listSurvive=[];
				var listWin=[];
				var listWolves=[];
				var listLucky=[];


				records.forEach(function(d){
					// all: check if this player exist
					if(all[d.name]) all[d.name].count++;
					else all[d.name]={
						name: d.name
						,count:1
						,kill:0
						,exile:0
						,skill:0
						,survive:0
						,win:0
						,wolves:0
						,lucky:0
					}

					// win
					if(d.win&& d.win==1) all[d.name].win++;
					// kill
					var killed=0
					var dyings= d.dying.split(";");
					dyings.forEach(function(dying){
						if(dying=="K"){
							all[d.name].kill++;
							killed=1;
						}
					})
					// other death
					if(killed==0){
						if(d.dying=="E"){
							all[d.name].exile++;
						}
						else if(d.dying){
							all[d.name].skill++;
						}
						else{
							all[d.name].survive++;
						}
					}
					// wolves
					if(d.role=="W"|| d.role=="WW")
						all[d.name].wolves++;

					if(d.lucky){
						var luckyNum= d.lucky.split(";").length;
						all[d.name].lucky+=luckyNum;
					}
					// lucky
				});
				// write the information to array;
				var threshold=4;
				for(var player in all){
					// the list of all ignore the threshold
					listAll.push(all[player]);
					if(all[player].count>threshold){
						if(all[player].kill>1)
							listKill.push({name:player,count:all[player].kill,all:all[player].count});
						if(all[player].exile>1)
							listExile.push({name:player,count:all[player].exile,all:all[player].count});
						if(all[player].skill>1)
							listSkill.push({name:player,count:all[player].skill,all:all[player].count});
						if(all[player].survive>1)
							listSurvive.push({name:player,count:all[player].survive,all:all[player].count});
						if(all[player].win>1)
							listWin.push({name:player,count:all[player].win,all:all[player].count});
						if(all[player].wolves>1)
							listWolves.push({name:player,count:all[player].wolves,all:all[player].count});
						if(all[player].lucky>1)
							listLucky.push({name:player,count:all[player].lucky,all:all[player].count});
					}
				}

				listKill.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listExile.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listSkill.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listSurvive.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listWin.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listWolves.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				listLucky.sort(function(a,b){
					var scaleA= a.count/ a.all;
					var scaleB= b.count/ b.all;
					if(scaleA> scaleB) return 1;
					else if(scaleA< scaleB) return -1;
					else return 0;
				})
				//	console.log(listKill);
				res.json({
					all:listAll,
					kill:listKill,
					exile:listExile,
					skill:listSkill,
					survive:listSurvive,
					win:listWin,
					wolves:listWolves,
					lucky:listLucky
				});
			}
		});
	});

	// get injury information
	app.post('/api/injury', function(req, res) {
		var season=req.body.season;
	//	console.log("injury post"+season);
		GameRecord.find({season:season},function(err, records) {
			if (err)
				console.log(err);
			// initialize the injury array;
			if(!records || records.length==0)
			{
				res.json({matrix:[]
					,indexByName:[]
					,players:[]})
			}
			else{

				var injury=[];
				records.sort(function(a,b){
					if(a.date< b.date) return -1;
					else if(a.date> b.date) return 1;
					else if (a.game< b.game) return -1;
					else if (a.game > b.game) return 1;
					else return 0;
				});
				// start from the first game
				var currentGame=records[0].game;
				var hunter="";
				var witch="";
				var wolves=[];
				var killed=[];
				var hunted="";
				var poisoned="";
				records.forEach(function(d){
					//	console.log(d);
					if(d.game!=currentGame){
						// record injury and start a new game
						if(hunter!=""&&hunted!=""){
						//	console.log(hunter+" hunt "+hunted);
							injury.push({from:hunter,to:hunted});
						}
						if(witch!=""&&poisoned!="") {
						//	console.log(witch+" poison "+poisoned);
							injury.push({from:witch,to:poisoned});
						}
						wolves.forEach(function(w){
							killed.forEach(function(k){
								injury.push({from:w,to:k});
							})
						})

						currentGame= d.game;
						hunter="";
						witch="";
						wolves=[];
						killed=[];
						hunted="";
						poisoned="";
						//	console.log(injury);
					}
					// record data of this game
					if(d.dying=="P") poisoned= d.name;
					else if(d.dying=="H") hunted = d.name;
					else if(d.dying=="K") killed.push(d.name);
					if(d.role=="H") hunter= d.name;
					else if(d.role=="Witch") witch= d.name;
					else if(d.role=="W"||d.role=="WW") wolves.push(d.name);
				});
				// record injury and start a new game
				if(hunter!=""&&hunted!=""){
				//	console.log(hunter+" hunt "+hunted);
					injury.push({from:hunter,to:hunted});
				}
				if(witch!=""&&poisoned!="") {
				//	console.log(witch+" poison "+poisoned);
					injury.push({from:witch,to:poisoned});
				}
				wolves.forEach(function(w){
					killed.forEach(function(k){
						injury.push({from:w,to:k});
					})
				})
				//	console.log(injury);
				// formate the injury data
				var matrix=[];
				var players=[];
				var indexByName={};
				var index=0;
				// build the player list and the index map
				injury.forEach(function(d){
					if(indexByName[d.from]==undefined){
						players.push(d.from);
						indexByName[d.from]=index++;
					}
					if(indexByName[d.to]==undefined){
						players.push(d.to);
						indexByName[d.to]=index++;
					}
				});
				// build the matrix;
				// init the matrix
				for (var j = -1; ++j < index;){
					var row = matrix[j] = [];
					for (var i = -1; ++i < index;) row[i] = 0;
				}
				injury.forEach(function(d){
					matrix[indexByName[d.from]][indexByName[d.to]]++;
				});
			//	console.log(players);
			//	console.log(matrix);
				//	console.log(players);
				//	console.log(matrix);
				res.json({matrix:matrix
					,indexByName:indexByName
					,players:players})
			}
		});
	});


	// write game record data into database;
	app.post('/api/gameRecord', function(req, res) {
	//	req.body.forEach(function(d){
	//		console.log(d);
	//	})
		GameRecord.create(req.body, function(err, gameRecords) {
			if (err)
				res.send(err);
			else{
				// if this line not put in the else, there's an error while running, and I don't know why
				// 2016/08/09
				res.json("Succeed");
			}
		});

	});

	// get the data of one game by date and sequence
	app.post('/api/oneGame',function(req, res){
		var date=req.body.date;
		var seq=req.body.seq;
		//console.log("oneGame:"+date+","+seq);
		//	console.log(targetTpc);
		GameRecord.find({date:date,game:seq},function (err, games) {
			if (err)
				res.send(err);
		//	console.log(games);
			res.json(games);
		});
	});

	// get the player data
	app.post('/api/playerData',function(req, res){
		console.log("playerData");
		var playerName=req.body.name;
		var season=req.body.season;

		GameRecord.find({name:playerName,season:season},function (err, games) {
			if (err)
				res.send(err);
			var deathDays=[];
			var lastDate;
			var lastAlteredDate;
		//	console.log(games.length);
			games.forEach(function(d){
		//		console.log(d.date);
				var deathDay= d.deathday?d.deathday:12;
				var date= d.date;
				if(lastDate && date.getDate()==lastDate.getDate()){
					date.setHours(lastAlteredDate.getHours()+1);
				}
				lastDate= d.date;
				lastAlteredDate=date;
				deathDays.push({date: d.date,deathDay:deathDay});
			})
			res.json(deathDays);
		});
	});


	// get the player bar data
	app.post('/api/playerBarData',function(req, res){
		console.log("playerData");
		var playerName=req.body.name;
		var season=req.body.season;

		GameRecord.find({name:playerName,season:season},function (err, games) {
			if (err)
				res.send(err);
			// role,win/lose,death/live
			var WWD=0;
			var WWL=0;
			var WLD=0;
			var WLL=0;
			var VWD=0;
			var VWL=0;
			var VLD=0;
			var VLL=0;

			var WD=0;
			var WL=0;
			var VD=0;
			var VL=0;
			games.forEach(function(d){
				if(d.role=="W"){
					if(d.dying){
						WD++;
						if(d.win) WWD++;
						else WLD++;
					}
					else{
						WL++;
						if(d.win) WWL++;
						else WLL++;
					}
				}
				else{
					if(d.dying){
						VD++;
						if(d.win) VWD++;
						else VLD++;
					}
					else{
						VL++;
						if(d.win) VWL++;
						else VLL++;
					}
				}
			});
			console.log(WWD);
			console.log(WWL);
			console.log(WLD);
			console.log(WLL);
			console.log(VWD);
			console.log(VWL);
			console.log(VLD);
			console.log(VLL);
			console.log(WD);
			console.log(WL);
			console.log(VD);
			console.log(VL);
			var result=[
				{
					name:"狼人生存胜率",
					count:WWL,
					all:WL
				}
				,
				{
					name:"狼人生存败率",
					count:WL-WWL,
					all:WL
				}
				,
				{
					name:"狼人死亡胜率",
					count:WWD,
					all:WD
				}
				,
				{
					name:"狼人死亡败率",
					count:WD-WWD,
					all:WD
				}
				,
				{
					name:"好人生存胜率",
					count:VWL,
					all:VL
				}
				,
				{
					name:"好人生存败率",
					count:VL-VWL,
					all:VL
				}
				,
				{
					name:"好人死亡胜率",
					count:VWD,
					all:VD
				}
				,
				{
					name:"好人死亡败率",
					count:VD-VWD,
					all:VD
				}
			];
			res.json(result);
		});
	});


	app.get('/loadingData', function (req, res) {
		res.sendfile('./public/LoadingData.html'); // load the single view file (angular will handle the page changes on the front-end)
	});



	// application -------------------------------------------------------------
	app.get('*', function (req, res) {
	    console.log("-----get* from "+req.host+" at "+Date());

		res.sendfile('./public/Main.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

};





































