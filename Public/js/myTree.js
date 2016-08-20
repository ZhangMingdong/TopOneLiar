mainApp.directive('myTree', function () {
    //console.log("myTree Initializing");
    function link(scope, el, attr) {
        myTree=function(){
            el = el[0];
            var xTreeScale=d3.scale.linear();
            var yTreeScale=d3.scale.linear();
            var axisTick=10;
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
            tree.getEdges = function () {
                //console.log("GetEdges: the number of nodes is: "+tree.nodes.length);
                var e = [];
                function getEdges(_) {
                    // 0.reset citeCount for each node
                    _.nodes.forEach(function(d){
                        d.citeCount=0;
                    });
                    // 1.iterate the references
                    _.references.forEach(function (d) {
                        // 1.1.get the end of the reference
                        var from= _.nodes.filter(function(obj) { return obj._id == d.from })[0];
                        var to= _.nodes.filter(function(obj) { return obj._id == d.to })[0];
                        if(from&&to)
                        {
                            // 1.2.push the edge
                        //    console.log("push edge:"+ d.from+":"+d.to);
                        //    console.log(from);
                        //    console.log(to);
                            e.push({
                                id: d.id
                                ,source: { y: xTreeScale(from.year)  ,x:yTreeScale(from.y),id:from.id }
                                ,target: { y: xTreeScale(to.year)    ,x:yTreeScale(to.y),id:to.id }
                                ,citing: d.citing
                                ,cited: d.cited
                                ,referred: d.referred
                                ,focused: d.focused
                                ,selected: d.selected
                                ,type: d.type
                            });
                            // 1.3.increase the cite count
                            to.citeCount++;
                        }
                    });
                }

                getEdges(tree);
                //console.log("getEdge: number of edges:"+ e.length);
                return e.sort(function(a,b){
                    if(a.focused) return 1;
                    if(a.selected) return 1;
                    if(a.referred) return 1;
                    if(a.citing) return 1;
                    if(a.cited) return 1;
                    return -1;
                });
            }
            tree.reposite = function () {
                //console.log("=====reposit");
                // 0.Reset data
            //    var data = scope.data;
                tree.nodes = scope.data.getArticles();

                // 1.Calculate x domain
                xMin=d3.min(tree.nodes,function(d){return d.year;});
                xMax=d3.max(tree.nodes,function(d){return d.year;});
                // 2.Calculate y domain
                var statistic =[];
                for(var i=xMin;i<=xMax;i++) statistic.push(0);
                // 2.1.calculate y for each nodes
                tree.nodes.forEach(function (d) {
                    d.y=statistic[d.year-xMin]++;
                });
                var yMin=d3.min(tree.nodes,function(d){return d.y;});
                var yMax=d3.max(tree.nodes,function(d){return d.y;})
                // 2.2.put them to the middle
                tree.nodes.forEach(function (d) {
                    d.y+=(yMax+1-statistic[d.year-xMin])/2;
                });

                // 2.reset scale and axis
                if(xMin==xMax) xMin--;
                if(yMin==yMax) yMax++;
                axisTick=xMax-xMin;
                //console.log("==redraw.y.domain=="+yMin+","+yMax);
                xTreeScale.domain([xMin,xMax]);
                yTreeScale.domain([yMax,yMin]);
            }

            // watch the size of the window
            scope.$watch(function () {
            //    console.log("watching===============svgTreeBG")
                svgTreeBGW = el.clientWidth;
                svgTreeBGH = el.clientHeight;
                if(svgTreeBGW<800) svgTreeBGW=800;
                if(svgTreeBGH<400) svgTreeBGH=400;
                return svgTreeBGW + svgTreeBGH;
            }, resize);

            // response the size-change
            function resize() {
            //    console.log("====================rezize Tree=====================")
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
                    .ticks(axisTick); // <-G

                xTreeAxis
                    .attr("transform", "translate(0," + (svgTreeH+10) + ")")
                    .call(axis); // <-I
            }

            // redraw the svg
            redraw = function () {
                console.log("=====redraw tree=====");
                if (!scope.data) { return };

                tree.reposite();

                //console.log(scope.data.selectedInfo);
                var infos=d3.select("#g_infoArticle").selectAll('text').data(scope.data.selectedInfo);
                infos.attr("x",5)
                    .attr("y",function(d,i){return 20+i*20;})
                    .text(function(d){return d;});
                infos.enter().append('text')
                    .attr("x",5)
                    .attr("y",function(d,i){return 20+i*20;})
                    .text(function(d){return d;});
                infos.exit().remove();

                tree.references = scope.data.getReferences();

            //    tree.references.forEach(function(d){
            //        console.log(d);
            //    })
                // redraw edges

                 var edges = d3.select("#g_lines").selectAll('.reference').data(tree.getEdges());
            //    tree.getEdges().forEach(function(d){
            //        console.log(d);
            //    })
                var diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

                edges
                //.transition()
                    .classed('reference',true)
                    .classed('citing', function(d){return d.citing;})
                    .classed('cited', function(d){return d.cited;})
                    .classed('focused',function(d){return d.focused;})
                    .classed('referred',function(d){return d.referred;})
                    .classed('selected',function(d){return d.selected;})
                    //    .classed('contrast',function(d){return d.type%2;})
                    //    .classed('rely',function(d){return Math.floor(d.type/2)%2;})
                    //    .classed('context',function(d){return Math.floor(d.type/4)%2;})
                    .attr("d", diagonal);

                edges.enter().append("path")
                    .classed('reference',true)
                    .classed('citing', function(d){return d.citing;})
                    .classed('cited', function(d){return d.cited;})
                    .classed('focused',function(d){return d.focused;})
                    .classed('referred',function(d){return d.referred;})
                    .classed('selected',function(d){return d.selected;})
                    //    .classed('contrast',function(d){return d.type%2;})
                    //    .classed('rely',function(d){return Math.floor(d.type/2)%2;})
                    //    .classed('context',function(d){return Math.floor(d.type/4)%2;})
                    //    .attr("stroke", "blue")
                    //    .attr("stroke-width", "2")
                    .on('click', function (d) {
                        if(scope.data.operationMode==3){
                            console.log(d.id);
                            console.log(d._id);

                            removeReference(d.id);
                            return;
                        }
                        //console.log("edge.click"+ d.id);
                        // 0.set all the edges unselected
                        //edges.classed('selected',false);
                        //// 1.set this edge selected
                        //d3.select(this).classed('selected',true);
                        // 2.update the selected style
                        scope.$apply(function () {
                            onSelectedReference(d);
                        });
                    })
                    .attr("d", diagonal);

                edges.exit().remove();

                // redraw nodes
                var circles = d3.select("#g_circles").selectAll('circle').data(tree.nodes);
                // for update
                circles
                    .attr('fill',function(d){return scope.data.getColor(d)})
                    .attr('stroke',function(d){return scope.data.getStateColor(d)})
                    .classed('dist1',function(d){
                        return d.distance==1;
                    })
                    .classed('dist2',function(d){
                        return d.distance==2;
                    })
                //    .classed('temp',function(d){
                //        return d.type&& d.type==1;
                //    })
                    .classed('focused',function(d){
                        return d.focused;
                    })
                    .transition()
                    .attr('r', function(d){
                        return 8;
                        return Math.sqrt((d.citeCount+1)*16);
                    })
                    .attr('cx', function (d) {
                        return xTreeScale(d.year);
                    })
                    .attr('cy', function (d) {
                        return yTreeScale(d.y);
                    });
                // without this, the page won't update when an node is deleted
                circles.exit()
                    .remove();
                // for new circles
                circles.enter().append('circle')
                    .attr('fill',function(d){return scope.data.getColor(d)})
                    .attr('stroke',function(d){return scope.data.getStateColor(d)})
                    .classed('dist1',function(d){
                        return d.distance==1;
                    })
                    .classed('dist2',function(d){
                        return d.distance==2;
                    })
                //    .classed('temp',function(d){
                //        return d.type&& d.type==1;
                //    })
                    .classed('focused',function(d){
                        return d.focused;
                    })
                    .attr('r', function(d){
                        return 8;
                        return Math.sqrt((d.citeCount+1)*16);
                    })
                    .attr('cx', function (d) {
                        return xTreeScale(d.year);
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
                            /*
                             if(d.focused){
                             d3.select(this).classed('focused',true);
                             onSelectedNode(d,true);
                             }
                             else{
                             d3.select(this).classed('focused',false);
                             onUnSelectedNode(true);
                             }
                             */
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
                            //scope.selectedPoint.info = d;
                            //    scope.selectedPoint.info = d;
                            //    parseText(d.abstract), d3.event.preventDefault();
                            onSelectedNode(d,false);
                        });

                    })
                    .on('mouseleave', function (d) {
                        //console.log("mouse leave");
                        scope.data.onUnSelectedNode();
                        redraw();
                    });
                renderAxis(xTreeScale , orient);


                //    $(function() {
                //        /** This code runs when everything has been loaded on the page */
                //        /* Inline sparklines take their values from the contents of the tag */
                //        $('.inlinesparkline').sparkline();
//
                //        /* Sparklines can also take their values from the first argument
                //         passed to the sparkline() function */
                //        var myvalues = [10,8,5,7,4,4,1];
                //        $('.dynamicsparkline').sparkline(myvalues);
//
                //        /* The second argument gives options such as chart type */
                //        $('.dynamicbar').sparkline(myvalues, {type: 'bar', barColor: 'green'} );
//
                //        /* Use 'html' instead of an array of values to pass options
                //         to a sparkline with data in the tag */
                //        $('.barChart').sparkline('html', {type: 'bar', barColor: 'red'});
                //    });


                if(scope.data.showReferenceType){
                    edges.classed('contrast',function(d){return d.type%2;})
                        .classed('rely',function(d){return Math.floor(d.type/2)%2;})
                        .classed('context',function(d){return Math.floor(d.type/4)%2;})
                }
                else{
                    edges.classed('contrast',false)
                        .classed('rely',false)
                        .classed('context',false)
                }
            }

            // watch the change of the data
            scope.$watch('data', redraw);
            scope.$watch(function(){
                return scope.data.getArticles();
            }, redraw);
            scope.$watch(function(){
                return scope.data.getReferences();
            }, redraw);

        //    scope.$watch('data.nodes', redraw);
        //    scope.$watch('data.allNodes', redraw);
        //    scope.$watch('data.references', redraw);

            //    scope.$watch('data.searchText', doSearch);
        }
        myTree();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=', selectedPoint: '=' }
    };
});
