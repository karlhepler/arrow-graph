var CircleGraph = (function (d3, sin, cos, TAU, SQRT2, random, clientWidth, clientHeight, undefined) {
    'use strict';

        //----- SETTINGS -----------------------------------// 
    var DIAMETER = (clientWidth > clientHeight ? clientHeight : clientWidth) - 100,
        INNER_RATIO = 0.5,
        GRAPH_PADDING = 50,
        ARC_PADDING = 3,
        ARROW_ANGLE = 0.1,
        SECTION_LOAD_DELAY_MS = 100,
        TITLE_FONT_SIZE = DIAMETER * 0.03,
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
    return function Graph(root) {
        var sections = root.getElementsByClassName('CircleModal__section');
        var ARC_ANGLE = TAU / sections.length;
        var graph = root.getElementsByClassName('CircleGraph')[0];
        var modal = root.getElementsByClassName('CircleModal')[0];
        root.getElementsByClassName('CircleGraph__title')[0].style.fontSize = TITLE_FONT_SIZE+'px';
        root.getElementsByClassName('CircleGraph__title')[0].style.maxWidth = (INNER_RADIUS*1.9)+'px';
        var COLORS = [
            'rgb(62, 165, 218)',
            'rgb(137, 194, 82)',
            'rgb(68, 176, 84)',
            'rgb(34, 139, 75)',
            'rgb(24, 99, 59)',
            'rgb(55, 175, 115)',
            'rgb(41, 162, 150)',
            'rgb(16, 115, 185)',
            'rgb(144, 146, 195)',
            'rgb(47, 53, 144)',
            'rgb(52, 61, 188)'
        ];

        // Listen for modal close button click
        root.getElementsByClassName('CircleModal__close-btn')[0]
            .addEventListener('click', onClickModalCloseBtn);

        // Define the API
        var api = {
            openCircleModal: openCircleModal,
            closeCircleModal: closeCircleModal
        };

        /**
         * USE D3.JS TO BUILD THE GRAPH
         */

        //----- CREATE SVG CONTAINER WITH INNER GROUP ------// 
        var svg = d3.select(graph)
            .append('svg')
                .attr('class', function () {
                    setTimeout(function () {
                        graph.classList.remove('CircleGraph--hidden');
                    }, 200);
                    return 'CircleGraph__svg';
                })
                .attr('width', DIAMETER)
                .attr('height', DIAMETER)
                .append('g')
                    .attr('transform', getChartTranslation);

        //----- CREATE A GROUP FOR EACH ELEM --------------// 
        var dataGroup = svg.selectAll('path')
            .data(sections).enter()
            .append('g')
                .attr('class', 'CircleSection CircleSection--hidden')
                .on('mouseenter', onMouseEnterSection)
                .on('mouseleave', onMouseLeaveSection)
                .on('click', onClickSection);

        //----- LOADING ANIMATION FOR EACH SECTION ---------// 
        dataGroup.transition()
            .delay(getSectionLoadDelay)
            .attr('class', 'CircleSection');

        //----- CREATE THE PATH & INSERT THE SECTIONS ------// 
        dataGroup.append('path')
            .attr('fill', getSectionFillColor)
        	.attr('d', getSectionPath);

        //----- CREATE TEXT AROUND CENTROID ----------------// 
        var text = dataGroup.append('text')
            .attr('class', 'CircleSection__label')
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
                OUTER_RADIUS + GRAPH_PADDING
            ];
            return 'translate(' + translation + ')';
        }

        //----- ON SECTION MOUSE ENTER ---------------------// 
        function onMouseEnterSection() {
            if (! this.classList.contains('CircleSection--selected')) {
                this.classList.add('CircleSection--hover');
            }
        }

        //----- ON SECTION MOUSE LEAVE ---------------------// 
        function onMouseLeaveSection() {
            this.classList.remove('CircleSection--hover');
        }

        //----- ON SECTION CLICK  --------------------------// 
        function onClickSection(elem) {
            // Remove hover class
            this.classList.remove('CircleSection--hover');

            // This section is already selected and we're clicking it again...
            if (this.classList.contains('CircleSection--selected')) {
                closeCircleModal();
            }

            // This section is not yet selected...
            else {
                if (! root.getElementsByClassName('CircleGraph')[0].classList.contains('CircleGraph---zoom')) {
                    openCircleModal(elem);
                }

                var circleSections = graph.getElementsByClassName('CircleSection');
                for (var i = 0, len = circleSections.length; i < len; i++) {
                    circleSections[i].classList.remove('CircleSection--selected');
                }

                this.classList.add('CircleSection--selected');
            }
        }

        //----- GET SECTION LOAD DELAY ---------------------// 
        function getSectionLoadDelay(elem, index) {
            return index * SECTION_LOAD_DELAY_MS;
        }

        //----- GET SECTION FILL COLOR ---------------------// 
        function getSectionFillColor(elem) {
            var colorIndex = ~~(random()*COLORS.length);
            var color = COLORS[colorIndex];
            COLORS.splice(colorIndex, 1);
            return color;
        }

        //----- GET THE SECTION ----------------------------// 
        function getSectionPath(elem, index) {
            var angle = ARC_ANGLE * index,
                delta = ARC_ANGLE * (index + 1);

            // Calculate the text centroid
            var startAngle = angle + ARROW_ANGLE - (2 * MIDDLE_PAD_ANGLE);
            var endAngle = delta + ARROW_ANGLE - (2 * MIDDLE_PAD_ANGLE);
            var centroidAngle = (startAngle + endAngle) / 2;
            elem.centroid = [
                MIDDLE_RADIUS * cos(centroidAngle),
                MIDDLE_RADIUS * sin(centroidAngle)
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
        function getTextTranslation(elem) {
            return 'translate(' + elem.centroid + ')';
        }

        //----- GET TEXT LINES FOR WORD WRAPPING -----------// 
        function getTextLines(elem) {
            var words = elem.getElementsByClassName('CircleModal__title')[0].textContent.split(' ');
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

        //----- SHOW CONTENT -------------------------------// 
        function openCircleModal(elem) {
            graph.classList.add('CircleGraph--zoom');
            graph.style.width = DIAMETER + 'px';
            graph.style.height = DIAMETER + 'px';

            for (var i = 0, len = sections.length; i < len; i++) {
                sections[i].style.display = null;
            }
            elem.style.display = 'block';

            modal.classList.remove('CircleModal--hidden');
        }

        //----- HIDE CONTENT -------------------------------// 
        function closeCircleModal() {
            for (var i = 0, len = svg.node().children.length; i < len; i++) {
                svg.node().children[i].classList.remove('CircleSection--selected');
                sections[i].style.display = null;
            }
            graph.classList.remove('CircleGraph--zoom');
            graph.style.width = null;
            graph.style.height = null;
            modal.classList.add('CircleModal--hidden');
        }

        //----- ON CLICK MODAL CLOSE BUTTON ----------------// 
        function onClickModalCloseBtn(e) {
            closeCircleModal();
        }

        return api;
    };

})(d3, Math.sin, Math.cos, 2*Math.PI, Math.SQRT2, Math.random, document.documentElement.clientWidth, document.documentElement.clientHeight);

document.addEventListener('DOMContentLoaded', function (e) { 
    var circles = document.getElementsByClassName('Circle')
    for (var i = 0, len = circles.length; i < len; i++) {
        new CircleGraph(circles[i]);
    }
});

