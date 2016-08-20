/**
 * Created by Administrator on 2016/7/26.
 */

mainApp.directive('chord', function () {
    function link(scope, el, attr) {
        function chord(){

            var svgWidth=400;
            var svgHeight=400;
            var width=400;
            var height=400;

            var outerRadius = Math.min(width,height) / 2;
            var innerRadius = outerRadius*0.8;

            var fill = d3.scale.category20c();

            var chord = d3.layout.chord()
                .padding(.04)
                .sortSubgroups(d3.descending)
                .sortChords(d3.descending);



            var svgBG=d3.select(el[0]).append("svg")
                .attr("width", outerRadius * 2)
                .attr("height", outerRadius * 2)

            var svg = svgBG
                .append("g")
                .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

            var svgGroup = svg.selectAll(".group");
            var svgChord = svg.selectAll(".chord");

            scope.$watch(function () {
                svgWidth = el[0].clientWidth;
                svgHeight = el[0].clientHeight;
                return svgWidth + svgHeight;
            }, resize);
            // response the size-change
            function resize() {
                redraw();
            }

            function redraw(){
            //    console.log("===redraw chord===");
            //    console.log(scope.data);
                if(!scope.data.matrix||scope.data.matrix.length==0) return;

                width=svgWidth;
                height=svgHeight;
                outerRadius = Math.min(width,height) / 2;
                innerRadius = outerRadius*0.8;

                svgBG
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                svg
                    .attr("width", svgWidth)
                    .attr("height", svgHeight)
                    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

                var arc = d3.svg.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(innerRadius + 20);


                // 2.bind data
                chord.matrix(scope.data.matrix);

                svgGroup=svgGroup.data(chord.groups);

                var g = svgGroup
                    .enter().append("g")
                    .attr("class", "group");

                g.append("path")
                    .style("fill", function(d) { return fill(d.index); })
                    .style("stroke", function(d) { return fill(d.index); })
                    .attr("d", arc)
                    .on("mouseover", fade(.1))
                    .on("mouseout", fade(1));

                g.append("text")
                    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                    .attr("dy", ".35em")
                    .attr("transform", function(d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                            + "translate(" + (innerRadius + 26) + ")"
                            + (d.angle > Math.PI ? "rotate(180)" : "");
                    })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                    .text(function(d) { return scope.data.nameByIndex.get(d.index); });

                svgGroup.selectAll("path")
                    .style("fill", function(d) { return fill(d.index); })
                    .style("stroke", function(d) { return fill(d.index); })
                    .attr("d", arc)
                    .on("mouseover", fade(.1))
                    .on("mouseout", fade(1));

                svgGroup.selectAll("text")
                    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
                    .attr("dy", ".35em")
                    .attr("transform", function(d) {
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                            + "translate(" + (innerRadius + 26) + ")"
                            + (d.angle > Math.PI ? "rotate(180)" : "");
                    })
                    .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                    .text(function(d) { return scope.data.nameByIndex.get(d.index); });
                svgGroup.exit().remove();


                svgChord=svgChord
                    .data(chord.chords);
                svgChord
                    .enter().append("path")
                    .attr("class", "chord")
                    .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
                    .style("fill", function(d) { return fill(d.source.index); })
                    .attr("d", d3.svg.chord().radius(innerRadius));

                svgChord
                    .style("stroke", function(d) { return d3.rgb(fill(d.source.index)).darker(); })
                    .style("fill", function(d) { return fill(d.source.index); })
                    .attr("d", d3.svg.chord().radius(innerRadius));

                svgChord.exit().remove();


            }
            //     d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
            redraw();

            scope.$watch('data.selected', function(){
            //    console.log("selected changed");
                return;
                var index=scope.data.selected.index;
                var state=scope.data.selected.state;
                var opacity=state==0?0.1:1.0;
                if(index<0) return;
                svg.selectAll(".chord")
                    .filter(function(d) {
                        return d.source.index != index && d.target.index != index;
                    })
                    .transition()
                    .style("opacity", opacity);

            });
            scope.$watch('data.matrix', redraw);
            scope.$watch('data', redraw);


            function fade(opacity) {
                return function(g, i) {
                    //    console.log(g);
                    svg.selectAll(".chord")
                        .filter(function(d) {
                            i= g.index;
                            return d.source.index != i && d.target.index != i;
                        })
                        .transition()
                        .style("opacity", opacity);
                };
            }
        }
        chord();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});