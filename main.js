(function (d3, Math, undefined) {

    var data = [
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
        { title: 'Foo' },
    ];

    var diameter = 500;
    var arrow = 0.1;
    var margin = 5;
    var radius = {
        inner: diameter / 4 - margin/2,
        midway: diameter / 4 + diameter / 8,
        outer: diameter / 2 + margin/2,
    };

    // The SVG container
    var svg = d3.select('.chart')
        .append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .append('g')
        .attr('transform', 'translate(' + (radius.outer-margin/2) + ',' + (radius.outer-margin/2) + ')')
        .attr('fill', 'black')
        .attr('stroke', 'white')
        .attr('stroke-width', margin);

    svg.selectAll('path')
        .data(data)
        .enter()
            .append('path')
            .attr('d', function (datum, index, paths) {
                var angle = 2 * Math.PI / paths.length;
                var nextIndex = index + 1;

                var path = d3.path();

                // Start
                path.moveTo(
                    radius.outer * Math.cos(angle*index),
                    radius.outer * Math.sin(angle*index)
                );

                // Curve outer radius
                path.arc(0, 0, radius.outer, angle*index, angle*nextIndex);

                // Half arrow line to midway radius
                path.lineTo(
                    radius.midway * Math.cos(angle*nextIndex+arrow),
                    radius.midway * Math.sin(angle*nextIndex+arrow)
                );

                // Curve inner radius
                path.arc(0, 0, radius.inner, angle*nextIndex, angle*index, true);

                // Half arrow line to outer radius
                path.lineTo(
                    radius.midway * Math.cos(angle*index+arrow),
                    radius.midway * Math.sin(angle*index+arrow)
                );

                // Close the path
                path.closePath();

                return path;
            });

    // The line SVG path we draw
    // var lineGraph = svgContainer.append('path')
        // .attr('d', lineFunction(6))
        // .attr('stroke', 'blue')
        // .attr('stroke-width', 2)
        // .attr('fill', 'none');

    // var data = [
        // { fruit: 'Apple', count: 10 },
        // { fruit: 'Strawberry', count: 20 },
        // { fruit: 'Banana', count: 15 },
        // { fruit: 'Blueberry', count: 20 },
        // { fruit: 'Kiwi', count: 30 },
        // { fruit: 'Plum', count: 5 },
    // ];

    // // Setup the margin & circle radius
    // var padding = 10;
    // var width = 500;
    // var height = 500;
    // var radius = width / 2;

    // // Define svg
    // var svg = d3.select('.chart')
        // .append('svg')
        // .attr('width', width)
        // .attr('height', height)
        // .append('g')
        // .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

    // // var color = d3.scaleOrdinal()
        // // .range(['#bbdefb', '#98caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2']);

    // // Generate the arc
    // var arc = d3.arc()
        // .outerRadius(radius - padding)
        // .innerRadius((radius - padding) - 50)
        // .padAngle(0.025);

    // // // Label arc
    // // var labelArc = d3.arc()
        // // .outerRadius(radius - padding - 100)
        // // .innerRadius((radius - padding) - 200);

    // // Generate the pie
    // // var pie = d3.pie()
        // // .sort(null)
        // // .value(data.length);

    // // Append g elements (arc)
    // var g = svg.selectAll('.arc')
        // .data(data))
        // .enter()
            // .append('g')
            // .attr('class', 'arc');

    // // Append the path of the arc
    // g.append('path')
        // .attr('d', arc)
        // .style('fill', 'red');
        // // .transition()
        // // .ease(d3.easeLinear)
        // // .duration(1000)
        // // .attrTween('d', pieTween);

    // var centroid = function (d) {
        // return [(d.startAngle + d.endAngle) / 2, 0];
    // };

    // // Append the text (label)
    // // g.append('text')
        // // .attr('transform', function (d) { console.log(d, arc.centroid(d), centroid(d)); return 'translate(' + centroid(d) + ')'; })
        // // .text('+');

    // // g.append('text')
        // // .attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
        // // .text('+');

    // // function pieTween(b) {
        // // b.innerRadius = 0;
        // // var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
        // // return function (t) { return arc(i(t)); };
    // // }


})(window.d3, window.Math);
