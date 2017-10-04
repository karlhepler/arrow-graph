(function (d3, Math, undefined) {

    var data = [
        { label: 'charity', color: 'rgb(62, 165, 218)' },
        { label: 'income planning', color: 'rgb(137, 194, 82)' },
        { label: 'asset management', color: 'rgb(68, 176, 84)' },
        { label: 'tax diversification', color: 'rgb(34, 139, 75)' },
        { label: 'risk management', color: 'rgb(24, 99, 59)' },
        { label: 'credit management', color: 'rgb(55, 175, 115)' },
        { label: 'legacy planning', color: 'rgb(41, 162, 150)' }
    ];

    var diameter = 500;
    var arrow = 0.1;
    var margin = 5;
    var radius = {
        inner: diameter / 4 - margin / 2,
        midway: diameter / 4 + diameter / 8,
        outer: diameter / 2 + margin/2,
    };

    // The SVG container
    var svg = d3.select('.chart')
        .append('svg')
            .attr('width', diameter)
            .attr('height', diameter)
            .append('g')
                .attr('transform', 'translate(' + (radius.outer-margin/2) + ',' + (radius.outer-margin/2) + ')');

    // The sections of the doughnut
    var sections = function (datum, index, paths) {
        var angle = 2 * Math.PI / paths.length;
        var nextIndex = index + 1;

        // Calculate & save the centroid
        datum.centroid = centroid(
            angle*index, angle*nextIndex,
            radius.inner, radius.outer 
        );

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
    }

    var g = svg.selectAll('path')
        .data(data)
        .enter()
            .append('g');

    g.append('path')
        .attr('fill', function (datum) { return datum.color; })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', margin)
        .attr('d', sections);

    g.append('text')
        .attr('fill', '#ffffff')
        .attr('font-size', '10px')
        .attr('font-family', 'sans-serif')
        .attr('transform', function (datum) {
            let x = datum.centroid[0];
            let y = datum.centroid[1];
            let mid = datum.label.length / 2;
            datum.centroid[0] = x - mid*7;
            return 'translate(' + datum.centroid + ')';
        })
        .text(function (datum) { return datum.label.toUpperCase(); })

    function centroid(startAngle, endAngle, innerRadius, outerRadius) {
        var r = (innerRadius + outerRadius) / 2,
            a = (startAngle + endAngle) / 2;
        return [Math.cos(a) * r, Math.sin(a) * r];
    }

})(window.d3, window.Math);
