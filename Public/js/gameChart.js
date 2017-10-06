/*
    chart to show one game
 */
mainApp.directive('gameChart', function () {
    function link(scope, el, attr) {
        el = el[0];
        var w, h;
        var svg = d3.select(el).append('svg');
        var xAxisG = svg.append('g').attr('class', 'x-axis');
        var yAxisG = svg.append('g').attr('class', 'y-axis');
        var lifeline = svg.selectAll("lifeline");
        var badge = svg.selectAll("badge");
        var lovers = svg.selectAll("lovers");
        var points = svg.selectAll('point');
        var results = svg.selectAll('result');
        var lucky = svg.selectAll('lucky');
        var xScale = d3.scale.ordinal();
        var yScale = d3.scale.ordinal();
        var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
        var yAxis = d3.svg.axis().scale(yScale).orient('left');
        var m = 50;



        scope.$watch(function () {
            w = el.clientWidth;
            h = el.clientHeight;
            return w + h;
        }, resize);

        function resize() {
            svg.attr({ width: w, height: h });
            xScale.range([m, w - m]);
            yScale.range([h - m, m]);
            xAxis.tickSize(-h + 2 * m);
            yAxis.tickSize(-w + 2 * m);
            xAxisG.attr('transform', 'translate(' + [0, yScale.range()[0] + 0.5] + ')');
            yAxisG.attr('transform', 'translate(' + [xScale.range()[0], 0] + ')');
            update();
        }

        scope.$watch('data', update);
        scope.$watch('data.playerList', update);

        function update() {
            if (scope.data.playerList.length==0)  return ;
            var data = scope.data.playerList;
        //    data.forEach(function(d){
        //        console.log(d);
        //    });
            var yDomain=[""];
            data.forEach(function(d){
                yDomain.push(d.name);
            });
            yDomain.push("");

            var layers=data.length+1;

            var yRange=[];
            var yStep=(h-2*m)/layers;
            var y=h-m;
            for(var i=0;i<=layers;i++){
                yRange.push(y);
                y-=yStep;
            }
            yScale.range(yRange);

            var days=17;
            var xRange=[];
            var xStep=(w-2*m)/days;
            var x=m;
            for(var i=0;i<=days;i++){
                xRange.push(x);
                x+=xStep;
            }
            xScale.range(xRange);
            var x_extent = d3.extent(data, function (d, i) { return d.day; });
            //    console.log(x_extent);
            //    console.log(yDomain);
            //    data.forEach(function(d){
            //       console.log(d.name,yScale(d.name));
            //    });

            xScale.domain(["0"
                ,"N1"
                ,"D1"
                ,"N2"
                ,"D2"
                ,"N3"
                ,"D3"
                ,"N4"
                ,"D4"
                ,"N5"
                ,"D5"
                ,"N6"
                ,"D6"
                ,"N7"
                ,"D7"
                ,"N8"
                ,"D8"
                ,"S"
            ]);
            var y_max = d3.max(data, function (d) { return d.value });
            yScale.domain(yDomain);


            // bar
            lifeline=lifeline.data(data);
            lifeline
                .enter().append("rect")
                .attr("class", "lifeline")
                .attr("x", xScale(0))
                .attr("width", function(d){return xScale(d.day)-xScale(0)})
                .attr("y", function(d) { return yScale(d.name)-2 })
                .attr("height", 4)
                .attr("fill",function(d){
                    if(d.role=="W"|| d.role=="WW") return "red";
                    else if (d.role=="V") return "yellow";
                    else if (d.role=="Witch") return "orange";
                    else if(d.role=="H") return "blue";
                    else return "black";
                })
                .attr("opacity",0.6);
            lifeline
                .attr("x",  xScale(0))
                .attr("width", function(d){return xScale(d.day)-xScale(0)})
                .attr("y", function(d) { return yScale(d.name)-2 })
                .attr("height", 4)
                .attr("fill",function(d){
                    if(d.role=="W"|| d.role=="WW") return "red";
                    else if (d.role=="V") return "yellow";
                    else if (d.role=="Witch") return "green";
                    else if(d.role=="H") return "blue";
                    else if(d.role=="S") return "orange";
                    else if(d.role=="I") return "purple";
                    else if(d.role=="G") return "olive";
                    else if(d.role=="N") return "maroon";
                    else if(d.role=="F") return "lightblue";
                    else return "black";
                })
                .attr("opacity",0.6);
            lifeline.exit()
                .remove();


            badge=badge.data(scope.data.badge);
            badge
                .enter().append("rect")
                .attr("class", "badge")
                .attr("x", function(d){ return xScale(d.from)})
                .attr("width", function(d){
                    return xScale(d.to)-xScale(d.from)}
                )
                .attr("y", function(d) {
                    return yScale(d.player)-3
                })
                .attr("height", 6)
                .attr("fill","grey")
                .attr("opacity",0.5);
            badge
                .attr("x", function(d){ return xScale(d.from)})
                .attr("width", function(d){
                    return xScale(d.to)-xScale(d.from)}
                )
                .attr("y", function(d) {
                    return yScale(d.player)-5
                })
                .attr("height", 10)
                .attr("fill","grey")
                .attr("opacity",0.5);
            badge.exit()
                .remove();

            // lovers
            //scope.data.lovers.forEach(function(d){console.log(d);});
        //    console.log(scope.data.lovers);

            lovers=lovers.data(scope.data.lovers);
            lovers
                .enter().append("rect")
                .attr("class", "lovers")
                .attr("x", function(d){ return xScale(d.lover1.day)-5})
                .attr("width", 10)
                .attr("y", function(d) {
                    return yScale(d.lover2.name)
                })
                .attr("height", function(d){
                    return yScale(d.lover1.name)-yScale(d.lover2.name)})
                .attr("fill","grey")
                .attr("opacity",0.5);
            lovers
                .attr("x", function(d){ return xScale(d.lover1.day)-5})
                .attr("width", 10)
                .attr("y", function(d) {
                    return yScale(d.lover2.name)
                })
                .attr("height", function(d){
                    return yScale(d.lover1.name)-yScale(d.lover2.name)})
                .attr("fill","grey")
                .attr("opacity",0.5);


            lovers.exit()
                .remove();

            // points
        //    data.forEach(function(d){
        //        console.log(d);
        //    })
            points = points.data(data);
            points.exit().remove();
            points.enter().append('circle').attr('r', 5)
                .attr('class', 'point')
                .attr("fill",function(d){
                    if(d.dying=="K") return "red";
                    else if(d.dying=="P") return "green";
                    else if(d.dying=="H") return "blue";
                    else if(d.dying=="E") return "yellow";
                    else if(d.dying=="Ex") return "orange";
                    else return "gray";
                })
                .attr('transform', function (d, i) {
                    return 'translate(' + [xScale(d.day), yScale(d.name)] + ')';
                })
                .on('mouseover', function (d) {
                    scope.$apply(function () {
                        scope.selectedPoint = d;
                    });
                });
            points
                .attr("fill",function(d){
                    if(d.dying=="K") return "red";
                    else if(d.dying=="P") return "green";
                    else if(d.dying=="H") return "blue";
                    else if(d.dying=="E") return "yellow";
                    else if(d.dying=="Ex") return "orange";
                    else return "gray";
                })
                .attr('transform', function (d, i) {
                    return 'translate(' + [xScale(d.day), yScale(d.name)] + ')';
                })
                .on('mouseover', function (d) {
                    scope.$apply(function () {
                        scope.selectedPoint = d;
                    });
                });

            // lucky
            console.log(scope.data.lucky);
            lucky = lucky.data(scope.data.lucky);
            lucky.enter()
                .append('circle')
                .attr('r', 5)
                .attr('class', 'lucky')
                .attr("fill","red")
                .attr('transform', function (d) {
                    return 'translate(' + [xScale(xScale), yScale(d.name)] + ')';
                });
            lucky
                .attr('transform', function (d) {
                    return 'translate(' + [xScale(d.day), yScale(d.name)] + ')';
                });
            lucky.exit().remove();


            // win or lose
            results = results.data(data);
            results.exit().remove();
            results.enter().append('circle').attr('r', 6)
                .attr('class', 'point')
                .attr("fill-opacity",0)
                .attr("stroke-opacity",function(d){
                    if(d.win==1) return 1;
                    else return 0;
                })
                .attr("stroke",function(d){
                    if(d.win==1) return "gold";
                    else return "gray";
                })
                .attr('transform', function (d, i) {
                    return 'translate(' + [xScale("S"), yScale(d.name)] + ')';
                })
            results
                .attr("fill-opacity",0)
                .attr("stroke",function(d){
                    if(d.win==1) return "gold";
                    else return "gray";
                })
                .attr("stroke-opacity",function(d){
                    if(d.win==1) return 1;
                    else return 0;
                })
                .attr('transform', function (d, i) {
                    return 'translate(' + [xScale("S"), yScale(d.name)] + ')';
                })

            xAxisG.call(xAxis);
            yAxisG.call(yAxis);
        };
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=', selectedPoint: '=' }
    };
});