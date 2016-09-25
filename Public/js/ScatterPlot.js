/*
 grid rule:
 1.subgraph of the svg. tried to posite it under the svgBG, but that seems more difficult
 2.using xScale to set its x coordinate
 3.using -margin.top as its y coordinate, and bgH as its height
 */
mainApp.directive('scatterPlot', function () {
    function link(scope, el, attr) {
        el = el[0];
        var w, h;
        var svg = d3.select(el).append('svg');
        var xAxisG = svg.append('g').attr('class', 'x-axis');
        var yAxisG = svg.append('g').attr('class', 'y-axis');
        var points = svg.append('g').attr('class', 'points').selectAll('g.point');
        var x = d3.scale.linear();
        var y = d3.scale.linear();
        var xAxis = d3.svg.axis().scale(x).orient('bottom')
        var yAxis = d3.svg.axis().scale(y).orient('left');
        var m = 50;

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>姓名:</strong> <span style='color:red'>" + d.name + "</span>"
                    +"<br><strong>胜率:</strong> <span style='color:red'>" + d.win+"/"+ d.count + "</span>"
                    +"<br><strong>存活率:</strong> <span style='color:red'>" + d.survive+"/"+ d.count + "</span>";
            })


        svg.call(tip);

        scope.$watch(function () {
            w = el.clientWidth;
            h = el.clientHeight;
            return w + h;
        }, resize);

        function resize() {
            svg.attr({ width: w, height: h });
            x.range([m, w - m]);
            y.range([h - m, m]);
            xAxis.tickSize(-h + 2 * m);
            yAxis.tickSize(-w + 2 * m);
            xAxisG.attr('transform', 'translate(' + [0, y.range()[0] + 0.5] + ')');
            yAxisG.attr('transform', 'translate(' + [x.range()[0], 0] + ')');
            update();
        }

        scope.$watch('data', update);

        function update() {
            if (!scope.data) { return };
            var data = scope.data;
            x.domain([0, 1]);
            y.domain([0, 1]);
            points = points.data([]);
            points.exit().remove();
            points = points.data(data);


            var point = points.enter().append('g').attr('class', 'point');
            point.append('circle')
                .attr('r', function(d){
                    return Math.sqrt(d.count)*3;//d.count;//Math.sqrt(d.count);
                })
                .style("opacity", 0.5)
                .on('mouseover', function (d) {
                    scope.$apply(function () {

                        scope.selectedPoint = d;
                    });
                });

            // update the position of all the points
            points.attr('transform', function (d) {
                return 'translate(' + [x(d.win/ d.count), y(d.survive/ d.count)] + ')';
            })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)

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
