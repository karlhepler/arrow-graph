var Graph;

(function (d3, sin, cos, TAU, SQRT2, title, undefined) {
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
        LINE_SPACING = FONT_SIZE / 2,
        OUTER_RADIUS = DIAMETER / 2 - GRAPH_PADDING,
        OUTER_PAD_ANGLE = ARC_PADDING / OUTER_RADIUS,
        INNER_RADIUS = OUTER_RADIUS - OUTER_RADIUS * INNER_RATIO,
        INNER_PAD_ANGLE = ARC_PADDING / INNER_RADIUS,
        MIDDLE_RADIUS = OUTER_RADIUS / 2 + INNER_RADIUS / 2,
        MIDDLE_PAD_ANGLE = ARC_PADDING / MIDDLE_RADIUS;

    //----- GRAPH CONSTRUCTOR --------------------------// 
    Graph = function Graph(DATA) {
        var onSectionClickCallback;
        var ARC_ANGLE = TAU / DATA.length;

        var api = {
            onSectionClick: function onSectionClick(callback) {
                onSectionClickCallback = callback;
            }
        };

        /**
         * USE D3.JS TO BUILD THE GRAPH
         */

        //----- CREATE SVG CONTAINER WITH INNER GROUP ------// 
        var chart = d3.select('.chart-container')
            .append('svg')
                .attr('class', function () {
                    this.parentElement.getElementsByClassName('title')[0].classList.remove('hidden');
                    return 'chart';
                })
                .attr('width', DIAMETER)
                .attr('height', DIAMETER)
                .append('g')
                    .attr('transform', getChartTranslation);

        //----- CREATE A GROUP FOR EACH DATUM --------------// 
        var dataGroup = chart.selectAll('path')
            .data(DATA).enter()
            .append('g')
                .attr('class', 'section hidden')
                .on('mouseenter', onSectionMouseEnter)
                .on('mouseleave', onSectionMouseLeave)
                .on('click', onSectionClick);

        //----- LOADING ANIMATION FOR EACH SECTION ---------// 
        dataGroup.transition()
            .delay(getSectionLoadDelay)
            .attr('class', 'section animated pulse');

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
                .attr('y', getLineY)
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
            this.classList.remove('pulse');
            if (! this.classList.contains('selected')) {
                this.classList.add('hover');
            }
        }

        //----- ON SECTION MOUSE LEAVE ---------------------// 
        function onSectionMouseLeave() {
            this.classList.remove('hover');
        }

        //----- ON SECTION CLICK  --------------------------// 
        function onSectionClick(datum) {
            // Remove hover class
            this.classList.remove('hover');

            // This section is already selected and we're clicking it again...
            if (this.classList.contains('selected')) {
                this.classList.remove('selected');
                chart.node().parentElement.parentElement.classList.remove('small');
                chart.node().parentElement.parentElement.style.width = null;
                chart.node().parentElement.parentElement.style.height = null;
            }

            // This section is not yet selected...
            else {
                if (! chart.node().parentElement.parentElement.classList.contains('small')) {
                    chart.node().parentElement.parentElement.classList.add('small');
                    chart.node().parentElement.parentElement.style.width = DIAMETER + 'px';
                    chart.node().parentElement.parentElement.style.height = DIAMETER + 'px';
                }
                for (var i = 0, len = this.parentElement.children.length; i < len; i++) {
                    this.parentElement.children[i].classList.remove('selected');
                }
                this.classList.add('selected');
            }

            // Call the section click callback
            if (typeof api.onSectionClick === 'function') {
                onSectionClickCallback(datum);
            }
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
            var startAngle = angle + ARROW_ANGLE - (2 * MIDDLE_PAD_ANGLE);
            var endAngle = delta + ARROW_ANGLE - (2 * MIDDLE_PAD_ANGLE);
            var centroidAngle = (startAngle + endAngle) / 2;
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
        function getLineY(line, index, lines) {
            return FONT_SIZE * index
                - (lines.length * FONT_SIZE + (lines.length - 1) * LINE_SPACING) / 2
                + (LINE_SPACING * index);
        }

        //----- GET THE CURRENT LINE -----------------------// 
        function getLine(line) {
            return line;
        }

        return api;
    };

})(window.d3, window.Math.sin, window.Math.cos, 2*Math.PI, Math.SQRT2);
