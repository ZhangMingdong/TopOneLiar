mainApp.directive('lineChart', function () {
    function link(scope, el, attr) {
        function lineChart(){
            var svgWidth=600;
            var svgHeight=400;
            // Set the dimensions of the canvas / graph
            var margin = {top: 30, right: 20, bottom: 30, left: 50}


            var x = d3.time.scale();
            var y = d3.scale.linear();
            var valueline = d3.svg.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.deathDay); });

            // Adds the svg canvas
            var svgBG=d3.select(el[0]).append("svg");
            var svg = svgBG
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
            // Define the axes
            var xAxis = d3.svg.axis().orient("bottom").ticks(5);

            var yAxis = d3.svg.axis().orient("left").ticks(5);

            // Add the line chart
            var svgLines =  svg.append("path")
                .attr("class", "line");

            // Add the X Axis
            var svgX=svg.append("g")
                .attr("class", "x axis")

            // Add the Y Axis
            var svgY = svg.append("g")
                .attr("class", "y axis")

            scope.$watch(function () {
                //    console.log("watching===============svgStreamBG")
                svgWidth = el[0].clientWidth;
                svgHeight = el[0].clientHeight;
                return svgWidth + svgHeight;
            }, resize);
            // response the size-change
            function resize() {
                console.log("====================resize=================");

                redraw();
            }

            function redraw(){
                //    console.log("==================redraw");
                var data=scope.data.dataList;
                if(data.length==0) return;
                data.forEach(function(d){
                    console.log(d);
                })
                var width = svgWidth - margin.left - margin.right;
                var height = svgHeight - margin.top - margin.bottom;
                // reset svg size
                svgBG
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                svg
                    .attr("width", width)
                    .attr("height", height)



                // Set the ranges
                x.range([0, width]);
                y.range([height, 0]);
                // fixed domain
                /*
                // Scale the range of the data
                var oldDomain=x.domain();
                var newDomain=d3.extent(data, function(d) { return d.date; });
                if(oldDomain[0].getDate()==oldDomain[1].getDate()){
                    x.domain(newDomain);
                }
                else{
                    var minD=oldDomain[0]>newDomain[0]? newDomain[0]:oldDomain[0];
                    var maxD=oldDomain[1]<newDomain[1]? newDomain[1]:oldDomain[1];
                    x.domain([minD,maxD]);

                }
                */

                // dynamic domain
                // Scale the range of the data
                x.domain(d3.extent(data, function(d) { return d.date; }));

                y.domain([0, d3.max(data, function(d) { return d.deathDay; })]);

                // Define the axes
                xAxis.scale(x);

                yAxis.scale(y);
                // Define the line

                // Select the section we want to apply our changes to
                var svgT = d3.select(el[0]).transition();

                // Make the changes
                svgT.select(".line")   // change the line
                    .duration(750)
                    .attr("d", valueline(data));
                svgT.select(".x.axis") // change the x axis
                    .duration(750)
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);
                svgT.select(".y.axis") // change the y axis
                    .duration(750)
                    .call(yAxis);
            }
            redraw();
            scope.$watch('data.dataList', redraw);
            scope.$watch('data', redraw);
        }
        lineChart();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});