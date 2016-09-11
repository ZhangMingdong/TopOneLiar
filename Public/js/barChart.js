







mainApp.directive('barChart', function () {
    function link(scope, el, attr) {
        function barChart(){
            var svgWidth=400;
            var svgHeight=400;
            var margin = {top: 20, right: 20, bottom: 70, left: 40};
            var svgBG = d3.select(el[0]).append("svg");
            svg=svgBG
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            var xAxisSVG =svg.append("g")
                .attr("class", "x axis");
            var yAxisSVG = svg.append("g")
                .attr("class", "y axis");


            var bars = svg.selectAll("bar");

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Frequency:</strong> <span style='color:red'>" + d.count+"/"+ d.all + "</span>";
                })


            svg.call(tip);


            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgWidth = el[0].clientWidth;
                svgHeight = el[0].clientHeight;
            //    if(svgWidth<600) svgWidth=600;
            //    if(svgHeight<400) svgHeight=400;

                return svgWidth + svgHeight;
            }, resize);
            // response the size-change
            function resize() {
            //    console.log("====================resize barChart=================");
            //    console.log(svgWidth);
            //    console.log(svgHeight);
                redraw();
            }

            // get the display field
            function getField(d){
                return d.count/ d.all;
            }

            function redraw(){
            //    console.log("redraw bar chart");
                var data=scope.data;
            //    console.log(scope.data.mode);
                if(data.mode=="kill") data=data.kill;
                else if(data.mode=="exile") data=data.exile;
                else if(data.mode=="skill") data=data.skill;
                else if(data.mode=="survive") data=data.survive;
                else if(data.mode=="win") data=data.win;
                else if(data.mode=="wolves") data=data.wolves;
                else if(data.mode=="lucky") data=data.lucky;
            //    console.log(data);
            //    data.forEach(function(d){
            //        console.log(d);
            //    });
                var width = svgWidth - margin.left - margin.right;
                var height = svgHeight - margin.top - margin.bottom;

                svgBG
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)

                svg
                    .attr("width", width)
                    .attr("height", height)


                var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

                var y = d3.scale.linear().range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(10);


                x.domain(data.map(function(d) { return d.name; }));
                y.domain([0, d3.max(data, function(d) { return getField(d); })]);

                xAxisSVG
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)

                yAxisSVG
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Value ($)");
                bars=bars.data(data);
                bars
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.name); })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(getField(d)); })
                    .attr("height", function(d) { return height - y(getField(d)); })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .on('click',function(d){
                        scope.data.selectPlayer(d.name);
                    })




                bars
                    .attr("x", function(d) { return x(d.name); })
                    .attr("width", x.rangeBand())
                    .attr("y", function(d) { return y(getField(d)); })
                    .attr("height", function(d) { return height - y(getField(d)); })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
                    .on('click',function(d){
                        scope.data.selectPlayer(d.name);
                    })
                bars.exit()
                    .remove();


            }
            redraw();

            scope.$watch('data', redraw);
            scope.$watch('data.mode', redraw);
            scope.$watch('data.kill', redraw);
            scope.$watch('data.exile', redraw);
            scope.$watch('data.survive', redraw);
            scope.$watch('data.skill', redraw);
            scope.$watch('data.win', redraw);
            scope.$watch('data.wolves', redraw);
            scope.$watch('data.lucky', redraw);

        }
        barChart();



    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});