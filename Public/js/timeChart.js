mainApp.directive('timeChart', function () {
    //console.log("myTree Initializing");
    function link(scope, el, attr) {
        timeChart=function(){
            el = el[0];
            var xTreeScale=d3.time.scale();
            var yTreeScale=d3.scale.linear();
            var axisTick=[];
            var svgTreeW;
            var svgTreeH;
            var svgTreeBGW;
            var svgTreeBGH
            var tree = { cx: 300
                , cy: 30
                , w: 40
                , h: 70
                , nodes: []
                , references: []
                , from:{}
                , to:{} };
            var xMin,xMax;                  // the min and max of the year, inited in reposite
            var margin = {top: 20, right: 40, bottom: 50, left: 30};
            var orient='bottom';

            // append a svg to show the tree
            var svgTreeBG=d3.select(el).append("svg");
            var svgTree=svgTreeBG.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            //    var svg = d3.select(el).append("svg").attr("width", svgW).attr("height", svgH);

            // svg-lines
            svgTree.append('g').attr('id', 'g_lines');

            // svg-circles
            svgTree.append('g').attr('id', 'g_circles');

            // svg-text
            svgTree.append('g').attr('id', 'g_infoArticle');

            // axis
            var xTreeAxis=svgTree.append('g').attr('id','g_axis');

            // ==========Operations==========
            // get all the edges of the tree

            tree.reposite = function () {
                //console.log("=====reposit");
                // 0.Reset data
            //    var data = scope.data;

                // 1.Calculate x domain
                xMin=d3.min(tree.nodes,function(d){return d.day;});
                xMax=d3.max(tree.nodes,function(d){return d.day;});
                // 2.Calculate y domain
                var statistic =[];
                for(var i=xMin;i<=xMax;i++) statistic.push(0);
                // 2.1.calculate y for each nodes
                tree.nodes.forEach(function (d) {
                    d.y=statistic[d.day-xMin]++;
                });
                var yMin=d3.min(tree.nodes,function(d){return d.y;});
                var yMax=d3.max(tree.nodes,function(d){return d.y;})
                // 2.2.put them to the middle
                tree.nodes.forEach(function (d) {
                    d.y+=(yMax+1-statistic[d.day-xMin])/2;
                });

                // 2.reset scale and axis
                if(xMin==xMax) xMin--;
                if(yMin==yMax) yMax++;
                var tickScope=xMax-xMin;
                axisTick=[];
                for(var i=xMin;i<xMax;i+=10){
                    axisTick.push(i);
                }
                //console.log("==redraw.y.domain=="+yMin+","+yMax);
                xTreeScale.domain([new Date(xMin),new Date(xMax)]);
                xTreeScale.domain([formatDate(xMin) , formatDate(xMax)]);
                yTreeScale.domain([yMax,yMin]);
            }

            function formatDate(day){
                var date= new Date(2015, 0, 1);
                date.setDate(date.getDate()+day-1);
                return date;
            }
            // watch the size of the window
            scope.$watch(function () {
            //    console.log("watching===============svgTreeBG")
                svgTreeBGW = el.clientWidth;
                svgTreeBGH = el.clientHeight;
            //    if(svgTreeBGW<800) svgTreeBGW=800;
            //    if(svgTreeBGH<400) svgTreeBGH=400;
                return svgTreeBGW + svgTreeBGH;
            }, resize);

            // response the size-change
            function resize() {
            //    console.log("====================rezize time-chart=====================")
            //    console.log(svgTreeW);
            //    console.log(svgTreeH);
                svgTreeBG.attr({ width: svgTreeBGW, height: svgTreeBGH });
                svgTreeW=svgTreeBGW-margin.left-margin.right;
                svgTreeH=svgTreeBGH-margin.top-margin.bottom;

                //    axisHeight = svgH - margin;
                xTreeScale.range([0,svgTreeW]);
                // *2 is for the axis
                yTreeScale.range([0,svgTreeH]);
                //console.log("SVGH:"+svgTreeH);
                redraw();
            }

            function renderAxis(scale, orient){
                var axis = d3.svg.axis() // <-D
                    .scale(scale) // <-E
                    .orient(orient) // <-F
                    .ticks(d3.time.months)
                    .tickSize(16, 0)
                    .tickFormat(d3.time.format("%B"));

                xTreeAxis
                    .attr("transform", "translate(0," + (svgTreeH+10) + ")")
                    .call(axis); // <-I
            }

            function radiusMap(boxoffice){
                return Math.sqrt(boxoffice/100);
            }

            // redraw the svg
            function redraw() {
             //   console.log("=====redraw time-chart=====");
                if (!scope.data) { return };

                tree.nodes = scope.data.getMovieDays();
                if(tree.nodes==undefined || tree.nodes.length==0) return;
                tree.reposite();

                // redraw nodes
                var circles = d3.select("#g_circles").selectAll('circle').data(tree.nodes);
            //    console.log(tree.nodes);

                // for new circles
                circles.enter().append('circle')

                //    .attr('fill',function(d){return scope.data.getColor(d)})
                //    .attr('stroke',function(d){return scope.data.getStateColor(d)})
                //    .classed('dist1',function(d){
                //        return d.distance==1;
                //    })
                //    .classed('dist2',function(d){
                //        return d.distance==2;
                //    })
                //    .classed('focused',function(d){
                //        return d.focused;
                //    })
                    .attr('r', function(d){
                        return radiusMap(d.boxoffice);
                        return 2;
                        return 8;
                        return Math.sqrt((d.citeCount+1)*16);
                    })
                    .attr('cx', function (d) {
                        return xTreeScale(new formatDate(d.day));
                    })
                    .attr('cy', function (d) {
                        return yTreeScale(d.y);
                    })
                    .on('click', function (d) {
                        if(scope.data.operationMode==2){
                            var r = confirm("Would you like to remove article: '"+ d.name+"'!");
                            if (r == true) { scope.$apply(function () {
                                // remove this one
                                //console.log("=====remove nodes");
                                scope.data.removeArticle(d.id,function(){
                                    scope.data.selectedNode={};
                                    redraw();
                                });
                            });
                            } else {
                                console.log("remove canceled");
                            }

                        }
                        else if(scope.data.operationMode==4){
                            scope.data.onNavigation(d,1);
                        }
                        else if(scope.data.operationMode==5){
                            scope.data.onNavigation(d,2);
                        }
                        else{
                            d.focused=!d.focused;
                            updateReferenceRefer();
                        }

                        redraw();
                    })
                    .on('mousedown', function (d) {
                        scope.$apply(function () {
                            if(scope.data.operationMode==1) {
                                tree.from = d;

                                redraw();
                                //console.log(d);
                            }
                        });
                    })
                    .on('mouseup', function (d) {
                        scope.$apply(function () {
                            //console.log(d);
                            if(scope.data.operationMode==1){
                                tree.to = d;
                                scope.data.createReference(tree.from,tree.to,redraw);
                            }
                        });
                    })
                    //        .on('mouseenter', function (d) {
                    //            scope.$apply(function () {
                    //            });
                    //        })
                    .on('mouseover', function (d) {
                        scope.$apply(function () {
                            scope.selectedPoint = d;
                        });

                    })
                    .on('mouseleave', function (d) {
                        //console.log("mouse leave");
                    //    scope.data.onUnSelectedNode();
                    //    redraw();
                    });
                // for update
                circles
                //    .attr('fill',function(d){return scope.data.getColor(d)})
                //    .attr('stroke',function(d){return scope.data.getStateColor(d)})
                //    .classed('dist1',function(d){
                //        return d.distance==1;
                //    })
                //    .classed('dist2',function(d){
                //        return d.distance==2;
                //    })
                //    .classed('focused',function(d){
                //        return d.focused;
                //    })
                    .transition()
                    .attr('r', function(d){
                        return radiusMap(d.boxoffice);
                        return 2;
                        return 8;
                        return Math.sqrt((d.citeCount+1)*16);
                    })
                    .attr('cx', function (d) {
                        return xTreeScale(new formatDate(d.day));
                    })
                    .attr('cy', function (d) {
                        return yTreeScale(d.y);
                    });
                // without this, the page won't update when an node is deleted
                circles.exit()
                    .remove();
                renderAxis(xTreeScale , orient);
            }

            // watch the change of the data
            scope.$watch('data', redraw);
            scope.$watch('data.selected', redraw);
            scope.$watch(function(){
                return scope.data.getMovieDays();
            }, redraw);
        }
        timeChart();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=', selectedPoint: '=' }
    };
});
