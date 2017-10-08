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
    var arrow = 0.2;
    var margin = 30;
    var radius = { outer: diameter / 2 - margin };
    radius.inner = radius.outer / 3 + margin;
    radius.midway = radius.outer / 2 + radius.inner / 2;
    var fontSize = diameter * 0.02;
    var padding = 3;
    var padAngle = {
        outer: padding / radius.outer,
        midway: padding / radius.midway,
        inner: padding / radius.inner,
    };
    var arrowAngle = 0.1;

    //----- CREATE THE SVG CONTAINER -------------------// 
    var svg = d3.select('.chart')
        .append('svg')
            .attr('width', diameter)
            .attr('height', diameter)
            .append('g')
                .attr('transform', 'translate(' + (radius.outer + margin) + ',' + (radius.outer + margin) + ')');

    //----- CREATE A G FOR EACH DATUM ------------------// 
    var g = svg.selectAll('path')
        .data(data)
        .enter()
            .append('g')
                .attr('class', 'section hidden')
                .on('mouseenter', function (datum) {
                    this.classList.remove('bounceIn');
                    this.classList.remove('pulse');
                    setTimeout(function () { this.classList.add('pulse'); }.bind(this))
                    setTimeout(function () { this.classList.remove('pulse'); }.bind(this), 1000);
                })
                .on('click', function (datum) {
                    this.classList.remove('jello');
                    setTimeout(function () { this.classList.add('jello'); }.bind(this));
                    setTimeout(function () { this.classList.remove('jello'); }.bind(this), 1000);
                    console.log(datum);
                });

    //----- CREATE THE PATH & THROW IN THE SECTIONS ----// 
    var path = g.append('path')
        .attr('fill', function (datum) { return datum.color; })
        .attr('d', section);

   //----- DO SOME ANIMATIONS -------------------------// 
    g.transition()
        .delay(function (datum, index) { return index * 100; })
        .attr('class', 'section animated bounceIn');

    //----- CREATE TEXT AROUND CENTROID ----------------// 
    var text = g.append('text')
        .attr('font-size', function () { return fontSize; })
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
                return (2 * Math.SQRT2 * diameter * index - (lines.length - 1)) / 100
            })
            .text(function (line) {
                return line.toUpperCase();
            });

     //----- CREATE A SECTION ---------------------------// 
     function section(datum, index, paths) {
         var angle = 2 * Math.PI / paths.length;
         var nextIndex = index + 1;

         // Calculate the text centroid
         datum.centroid = centroid(
             angle*index+arrowAngle+padAngle.midway, angle*nextIndex+arrowAngle-padAngle.midway,
             radius.midway
         );

         var path = d3.path();

         // Start
         path.moveTo(
             radius.outer * Math.cos(angle*index+padAngle.outer),
             radius.outer * Math.sin(angle*index+padAngle.outer)
        );

         // Curve outer radius
         path.arc(0, 0, radius.outer, angle*index+padAngle.outer, angle*nextIndex-padAngle.outer);

         // Midway angle
         path.lineTo(
             radius.midway * Math.cos(angle*nextIndex+arrowAngle-padAngle.midway),
             radius.midway * Math.sin(angle*nextIndex+arrowAngle-padAngle.midway)
        );

         // Curve inner radius
         path.arc(0, 0, radius.inner, angle*nextIndex-padAngle.inner, angle*index+padAngle.inner, true);

         // Midway angle
         path.lineTo(
             radius.midway * Math.cos(angle*index+arrowAngle+padAngle.midway),
             radius.midway * Math.sin(angle*index+arrowAngle+padAngle.midway)
         );

         // Close the path
         path.closePath();

         return path;
     }

    //----- CALCULATE CENTROID -------------------------// 
    function centroid(startAngle, endAngle, radius) {
        var r = radius,
            a = (startAngle + endAngle) / 2;
        return [Math.cos(a) * r, Math.sin(a) * r];
    }

})(window.d3, window.Math, window.location);
