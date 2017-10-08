var Graph;

(function (d3, sin, cos, TAU, SQRT2, undefined) {
    'use strict';

        //----- SETTINGS -----------------------------------// 
    var DIAMETER = 500,
        INNER_RATIO = 0.5,
        GRAPH_PADDING = 30,
        ARC_PADDING = 3,
        ARROW_ANGLE = 0.1,
        SECTION_LOAD_DELAY_MS = 100,
        FONT_SIZE_RATIO = 0.02,
        MAX_CHARS_PER_LINE = 10,

        //----- CALCULATIONS -------------------------------// 
        FONT_SIZE = DIAMETER * FONT_SIZE_RATIO,
        OUTER_RADIUS = DIAMETER / 2 - GRAPH_PADDING,
        OUTER_PAD_ANGLE = ARC_PADDING / OUTER_RADIUS,
        INNER_RADIUS = OUTER_RADIUS - OUTER_RADIUS * INNER_RATIO,
        INNER_PAD_ANGLE = ARC_PADDING / INNER_RADIUS,
        MIDDLE_RADIUS = OUTER_RADIUS / 2 + INNER_RADIUS / 2,
        MIDDLE_PAD_ANGLE = ARC_PADDING / MIDDLE_RADIUS;

    //----- GRAPH CONSTRUCTOR --------------------------// 
    Graph = function Graph(DATA) {
        var ARC_ANGLE = TAU / DATA.length;

        /**
         * USE D3.JS TO BUILD THE GRAPH
         */

        //----- CREATE SVG CONTAINER WITH INNER GROUP ------// 
        var svg = d3.select('.chart')
            .append('svg')
                .attr('width', DIAMETER)
                .attr('height', DIAMETER)
                .append('g')
                    .attr('transform', getChartTranslation);

        //----- CREATE A GROUP FOR EACH DATUM --------------// 
        var dataGroup = svg.selectAll('path')
            .data(DATA).enter()
            .append('g')
                .attr('class', 'section hidden')
                .on('mouseenter', onSectionMouseEnter)
                .on('click', onSectionClick);

        //----- LOADING ANIMATION FOR EACH SECTION ---------// 
        dataGroup.transition()
            .delay(getSectionLoadDelay)
            .attr('class', 'section animated bounceIn');

        //----- CREATE THE PATH & INSERT THE SECTIONS ------// 
        dataGroup.append('path')
            .attr('fill', getSectionFillColor)
        	.attr('d', getSectionPath);

        //----- CREATE TEXT AROUND CENTROID ----------------// 
        var text = dataGroup.append('text')
            .attr('font-size', FONT_SIZE)
            .attr('transform', getTextTranslation);

        //----- WORD WRAPPING ------------------------------// 
        text.selectAll('tspan')
            .data(getTextLines).enter()
            .append('tspan')
                .attr('x', 0)
                .attr('y', getAdjustedTextTop)
                .text(getLine);

        /**
         * HELPER FUNCTIONS USED TO CREATE THE GRAPH
         */

        //----- CALCULATE THE CHART'S TRANSLATION ----------// 
        function getChartTranslation() {
            var translation = [
                OUTER_RADIUS + GRAPH_PADDING,
                OUTER_RADIUS + GRAPH_PADDING,
            ];
            return 'translate(' + translation + ')';
        }

        //----- ON SECTION MOUSE ENTER ---------------------// 
        function onSectionMouseEnter() {
            this.classList.remove('bounceIn');
            this.classList.remove('pulse');
            setTimeout(function () { this.classList.add('pulse'); }.bind(this))
            setTimeout(function () { this.classList.remove('pulse'); }.bind(this), 1000);
        }

        //----- ON SECTION CLICK  --------------------------// 
        function onSectionClick(datum) {
            this.classList.remove('jello');
            setTimeout(function () { this.classList.add('jello'); }.bind(this));
            setTimeout(function () { this.classList.remove('jello'); }.bind(this), 1000);
            console.log(datum);
        }

        //----- GET SECTION LOAD DELAY ---------------------// 
        function getSectionLoadDelay(datum, index) {
            return index * SECTION_LOAD_DELAY_MS;
        }

        //----- GET SECTION FILL COLOR ---------------------// 
        function getSectionFillColor(datum) {
            return datum.color;
        }

        //----- GET THE SECTION ----------------------------// 
        function getSectionPath(datum, index) {
            var angle = ARC_ANGLE * index,
                delta = ARC_ANGLE * (index + 1);

            // Calculate the text centroid
            var centroidAngle = ARROW_ANGLE + (angle + delta) / 2;
            datum.centroid = [
                MIDDLE_RADIUS * cos(centroidAngle),
                MIDDLE_RADIUS * sin(centroidAngle),
            ];

            // Create the new path
            var path = d3.path();

            // Start
            path.moveTo(
                OUTER_RADIUS * cos(angle + OUTER_PAD_ANGLE),
                OUTER_RADIUS * sin(angle + OUTER_PAD_ANGLE)
           );

            // Curve outer radius
            path.arc(0, 0, OUTER_RADIUS, angle + OUTER_PAD_ANGLE, delta - OUTER_PAD_ANGLE);

            // Midway angle
            path.lineTo(
                MIDDLE_RADIUS * cos(delta + ARROW_ANGLE - MIDDLE_PAD_ANGLE),
                MIDDLE_RADIUS * sin(delta + ARROW_ANGLE - MIDDLE_PAD_ANGLE)
           );

            // Curve inner radius
            path.arc(0, 0, INNER_RADIUS, delta - INNER_PAD_ANGLE, angle + INNER_PAD_ANGLE, true);

            // Midway angle
            path.lineTo(
                MIDDLE_RADIUS * cos(angle + ARROW_ANGLE + MIDDLE_PAD_ANGLE),
                MIDDLE_RADIUS * sin(angle + ARROW_ANGLE + MIDDLE_PAD_ANGLE)
            );

            // Close the path
            path.closePath();

            // Return the path
            return path;
        }

        //----- GET TEXT TRANSLATION -----------------------// 
        function getTextTranslation(datum) {
            return 'translate(' + datum.centroid + ')';
        }

        //----- GET TEXT LINES FOR WORD WRAPPING -----------// 
        function getTextLines(datum) {
            var words = datum.label.split(' ');
            var lines = [words[0]];
            var linenum = 0;

            for (var i = 1, len = words.length; i < len; i++) {
                var test = lines[linenum] + ' ' + words[i];
                if (test.length <= MAX_CHARS_PER_LINE) {
                    lines[linenum] = test;
                } else {
                    lines[linenum] = lines[linenum].trim();
                    lines.push(words[i]);
                    linenum++;
                }
            }

            return lines;
        }

        //----- GET THE ADJUSTED TEXT TOP ------------------// 
        function getAdjustedTextTop(line, index, lines) {
            return (2 * SQRT2 * DIAMETER * index - lines.length - 1) / 100
        }

        //----- GET THE CURRENT LINE -----------------------// 
        function getLine(line) {
            return line;
        }
    };

})(window.d3, window.Math.sin, window.Math.cos, 2*Math.PI, Math.SQRT2);
