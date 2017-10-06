(function (d3, Math, location, undefined) {

    var data = [
        { label: 'charity', color: 'rgb(62, 165, 218)', href: 'https://google.com' },
        { label: 'income planning', color: 'rgb(137, 194, 82)', href: 'https://facebook.com' },
        { label: 'asset management', color: 'rgb(68, 176, 84)', href: 'http://karlhepler.com' },
        { label: 'tax diversification', color: 'rgb(34, 139, 75)', href: 'http://integrity.financial' },
        { label: 'risk management', color: 'rgb(24, 99, 59)', href: 'https://apple.com' },
        { label: 'credit management', color: 'rgb(55, 175, 115)', href: 'https://reddit.com' },
        { label: 'legacy planning', color: 'rgb(41, 162, 150)', href: 'http://foodwishes.blogspot.com' }
    ];

    //----- SETTINGS -----------------------------------// 
    var diameter = 500;
    var arrow = 0.1;
    var margin = 5;
    var radius = {
        inner: diameter / 4 - margin / 2,
        midway: diameter / 4 + diameter / 8,
        outer: diameter / 2 + margin/2,
    };

    //----- CREATE THE SVG CONTAINER -------------------// 
    var svg = d3.select('.chart')
        .append('svg')
            .attr('width', diameter)
            .attr('height', diameter)
            .append('g')
                .attr('transform', 'translate(' + (radius.outer-margin/2) + ',' + (radius.outer-margin/2) + ')');

    //----- CREATE A G FOR EACH DATUM ------------------// 
    var g = svg.selectAll('path')
        .data(data)
        .enter()
            .append('g')
            .attr('cursor', 'pointer')
            .on('click', function (datum) {
                location.href = datum.href;
            });

    //----- CREATE THE PATH & THROW IN THE SECTIONS ----// 
    var path = g.append('path')
        .attr('fill', function (datum) { return datum.color; })
        .attr('stroke', '#ffffff')
        .attr('stroke-width', margin)
        .transition()
        .delay(function (datum, index) { return index * 50; })
        .attr('d', section);

    //----- CREATE TEXT AROUND CENTROID ----------------// 
    var text = g.append('text')
        .attr('fill', '#ffffff')
        .attr('font-size', function () { return diameter * 0.02; })
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('transform', function (datum) {
            return 'translate(' + datum.centroid + ')';
        });

    //----- MANUAL WORD WRAPPING WITH TSPAN ------------// 
    var tspan = text.selectAll('tspan')
        .data(function (datum) {
            var MAXIMUM_CHARS_PER_LINE = 10;
            var words = datum.label.split(' ');
            var lines = [words[0]];
            var linenum = 0;

            for (var i = 1, len = words.length; i < len; i++) {
                var test = lines[linenum] + ' ' + words[i];
                if (test.length <= MAXIMUM_CHARS_PER_LINE) {
                    lines[linenum] = test;
                } else {
                    lines[linenum] = lines[linenum].trim();
                    lines.push(words[i]);
                    linenum++;
                }
            }

            return lines;
        })
        .enter()
        .append('tspan')
            .attr('x', 0)
            // With every new line, the entire thing needs to be moved up some
            .attr('y', function (line, index, lines) {
                return ((diameter * 0.028) * index) - ((diameter * 0.028 / 2) * (lines.length - 1));
            })
            .text(function (line) {
                return line.toUpperCase();
            });

     //----- CREATE A SECTION ---------------------------// 
     function section(datum, index, paths) {
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

    //----- CALCULATE CENTROID -------------------------// 
    function centroid(startAngle, endAngle, innerRadius, outerRadius) {
        var r = (innerRadius + outerRadius) / 2,
            a = (startAngle + endAngle) / 2 + 0.05; // Not sure why I had to do 0.05, but it worked
        return [Math.cos(a) * r, Math.sin(a) * r];
    }

})(window.d3, window.Math, window.location);
