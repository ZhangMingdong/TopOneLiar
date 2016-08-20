mainApp.directive('myForce', function () {
    function link(scope, el, attr) {
        var forceLayout=function(){
        //    console.log("forceLayout");
            var svgW=2000;
            var svgH=900;

            var margin = {top: 50, right: 50, bottom: 50, left: 50};
            var svgBG = d3.select(el[0]).append("svg:svg")
                .attr("width", svgW).attr("height", svgH);

            var svg=svgBG.append("g");

            var force = d3.layout.force().size([svgW, svgH])
                .nodes(scope.data.nodes)
                .links(scope.data.links)
                .gravity(3).linkDistance(50).charge(-3000).linkStrength(function(x) {
                    return x.weight * 10
                });
            var force2 = d3.layout.force()
                .nodes(scope.data.labelAnchors)
                .links(scope.data.labelAnchorLinks)
                .gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([svgW,svgH]);
            force.start();
            force2.start();

            var node = svg.selectAll(".node");
            var link = svg.selectAll(".link");
            node.call(force.drag);


            var anchorLink = svg.selectAll("line.anchorLink");
            var anchorNode = svg.selectAll("g.anchorNode");


            var updateLink = function() {
                this.attr("x1", function(d) {
                    return d.source.x;
                })
                    .attr("y1", function(d) {
                    return d.source.y;
                })
                    .attr("x2", function(d) {
                    return d.target.x;
                })
                    .attr("y2", function(d) {
                    return d.target.y;
                });
            }
            var updateNode = function() {
                this.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            }
            force.on("tick", function() {

                force2.start();

                node.call(updateNode);

                anchorNode.each(function(d, i) {
                    if(i % 2 == 0) {
                        d.x = d.node.x;
                        d.y = d.node.y;
                    } else {
                        var b = this.childNodes[1].getBBox();

                        var diffX = d.x - d.node.x;
                        var diffY = d.y - d.node.y;

                        var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                        var shiftX = b.width * (diffX - dist) / (dist * 2);
                        shiftX = Math.max(-b.width, Math.min(0, shiftX));
                        var shiftY = 5;
                        this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                    }
                });


                anchorNode.call(updateNode);

                link.call(updateLink);
                anchorLink.call(updateLink);

            });


            // watch the size of the window
            scope.$watch(function () {
                //    console.log("watching===============svgTreeBG")
                svgW = el[0].clientWidth;
                svgH = el[0].clientHeight;
                if(svgW<800) svgW=800;
                if(svgH<400) svgH=400;
                return svgW + svgH;
            }, resize);

            // response the size-change
            function resize() {
                console.log("====================rezize force=====================")
                //    console.log(svgTreeW);
                //    console.log(svgTreeH);
                svgBG.attr({ width: svgW, height: svgH });
            //    svg.attr({ width: 400, height: 400 });

                //console.log("SVGH:"+svgTreeH);
                redraw();
            }

            var redraw=function(){
                console.log("redraw force");
                console.log(svgW);
                console.log(svgH);
                link = link.data(scope.data.links);
                link.enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");
                link.exit().remove();

                node = node.data(scope.data.nodes);
                node.enter().append("svg:circle").attr("class", "node").attr("r", 5)
                    .style("fill", function(d){
                        if(d.type==0) return "#555";
                        else return "red"
                    })
                    .style("stroke", "#FFF").style("stroke-width", 3);
                node.exit().remove();


                anchorLink = anchorLink.data(scope.data.labelAnchorLinks);
                anchorNode = anchorNode.data(scope.data.labelAnchors);
                anchorNode.enter().call(function(d){
            //        console.log("force enter");
            //        console.log(d);
                    var anchorG=d.append("svg:g").attr("class", "anchorNode");
                    anchorG.append("svg:circle").attr("class", "anchorNodeCircle").attr("r", 0).style("fill", "#FFF");
                    anchorG.append("svg:text").attr("class", "anchorNodeLabel").text(function(d, i) {
                    //    console.log(d.node.label);
                        return i % 2 == 0 ? "" : d.node.label
                    }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);
                });
            //    console.log("force update");
            //    console.log(anchorLink);
            //    scope.data.labelAnchors.forEach(function(d){console.log(d.node.label);});
                d3.selectAll("text.anchorNodeLabel").data(scope.data.labelAnchors).text(function(d, i) {
            ///        console.log(d.node.label);
                    return i % 2 == 0 ? "" : d.node.label
                })
                    .style("fill", function(d){
                        if(d.node.type==0) return "#555";
                        else return "red"
                    })


                anchorNode.exit().remove();

                node.call(force.drag);

                force
                    .nodes(scope.data.nodes)
                    .links(scope.data.links);
                force2
                    .nodes(scope.data.labelAnchors)
                    .links(scope.data.labelAnchorLinks);

                force.start();
                force2.start();
            }
            redraw();

            //    scope.$watch('data.nodes', redraw);
            scope.$watch('data', redraw);
            scope.$watch('data.nodes', redraw);
            scope.$watch('data.labelAnchors', redraw);
            scope.$watch('data.labelAnchorLinks', redraw);
            scope.$watch('data.links', redraw);
        }
        forceLayout();
    }
    return {
        link: link,
        restrict: 'E',
        scope: { data: '=' }
    };
});