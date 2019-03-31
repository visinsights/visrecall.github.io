var r = 40,
SVGwidth = 960,
SVGheight = 660,
present = 2017,
startYear = 1958,
axisTransDur = 750,
transDur = 1000,
bisectData = d3.bisector(function(d) { return -d.year; }).left;

var carbonData;

d3.csv('data/co2_mm_800k.csv', function(data){
	carbonData = data;
	drawData(carbonData, 60);
});

var hoverCount = 0,
	brushCount = -2,
	clickCount = 0;

/* 
////////////////////////////////////////////////////////////
****************** Brush and Zoom Section ******************
////////////////////////////////////////////////////////////
*/

var svg = d3.select('div#graph')
				.append('svg')
				.attr('class', 'co2-levels')
				.attr('width', SVGwidth)
				.attr('height', SVGheight);

var margin = {top: 20, right: 60, bottom: (20 + SVGwidth*2/16), left: 10},
	margin2 = {top: (20 + SVGwidth*9/16), right: 40, bottom: 30, left: 10},
	width = SVGwidth - margin.left - margin.right,
	height = SVGheight - margin.top - margin.bottom,
	height2 = SVGheight - margin2.top - margin2.bottom;

//var parseDate = d3.timeParse("%b %Y");

var x = d3.scaleLinear().range([0, width]),
	y = d3.scaleLinear().range([height, 0]),
	x2 = d3.scaleLinear().range([0, width]),
	y2 = d3.scaleLinear().range([height2, 0]);

// var zoom = d3.zoom()
// 	.scaleExtent([1, Infinity])
// 	.translateExtent([[0, 0], [width, height]])
// 	.extent([[0, 0], [width, height]])
// 	.on("zoom", zoomed);

var line = d3.line()
		.defined(function(d) {
			return d.interpolated; 
		})
		.x(function(d) {
			return x(+d.year); 
		})
		.y(function(d) {
			return y(+d.interpolated); 
		});

var line2 = d3.line()
		.defined(function(d) {
			return d.interpolated; 
		})
		.x(function(d) {
			return x2(+d.year); 
		})
		.y(function(d) { 
			return y2(+d.interpolated); 
		});

var trendLine = d3.line()
	.defined(function(d) {
		return d.trend; 
	})
	.x(function(d) {
		return x(+d.year); 
	})
	.y(function(d) { 
		return y(+d.trend); 
	});

svg.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", width)
	.attr("height", height);

var focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

context.append('rect')
		.attr('class', 'end-left')
		.attr('x', margin2.left)
		.attr('y', 0)
		.attr('width', 8)
		.attr('height', height2)
		.attr('fill', '#4A90E2')
		.attr('rx', 4);

context.append('rect')
		.attr('class', 'end-right')
		.attr('x', (width + margin2.left))
		.attr('y', 0)
		.attr('width', 8)
		.attr('height', height2)
		.attr('fill', '#4A90E2')
		.attr('rx', 4);

var brush = d3.brushX()
			.extent([[0, 0], [width, height2]])
			.on("brush end", brushed);

function drawData(data, year) {
	currData = []
	data.forEach(function(d) {
		if (+d.year >  -year){
			currData.push(d);
		}
	});
	dmin = 100;

	x.domain(d3.extent(currData, function(d){
		curr_year = Math.floor(d.year)
		if (curr_year < dmin){
			dmin = curr_year;
		}
		return +d.year
	}));
	y.domain(d3.extent(currData, function(d) { return Math.round(d.interpolated / 10) * 10; }));
	x2.domain(x.domain());
	y2.domain(y.domain());

	numTicks = axisTicks(dmin)

	xAxis = d3.axisBottom(x)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < -100){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k yrs ago"
					}
					else {
						return (2017+d)
					}
				});

	xAxis2 = d3.axisBottom(x2)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < -100){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k yrs ago"
					}
					else {
						return (2017+d)
					}
				});

	yAxis = d3.axisRight(y)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? "\xa0" + +d
						: +d + " ppm";
				});

	focus.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", line);

	focus.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	focus.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate("+ (width) +",  0)")
		.call(yAxis);

	context.append("path")
		.datum(currData)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", line2);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis2);

	context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, x.range());

	hover = svg.append("g")
		.attr("class", "hover")
		.style("display", "none");

	hover.append("circle")
		.attr("class", "hover-circle")
		.attr("r", 4.5)
		.attr("stroke", "#ED7301");

	hover.append("rect")
		.attr("width", 64)
		.attr("height", 24)
		.attr("fill", "#f0f0f0")
		.attr("transform", "translate(8, -12)")
		.attr("style", "opacity: 0.7");

	hover.append("text")
		.attr("class", "hover-label")
		.attr("x", 16)
		.attr("dy", ".35em");

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() { hover.style("display", null); })
		.on("mouseout", function() { hover.style("display", "none"); })
		.on('mousemove', mousemove);

	function mousemove() {
		hoverCount += 1;

		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		hover.attr("transform", "translate(" + (margin.left + x(+d.year)) + "," + (margin.top + y(+d.interpolated)) + ")");
		hover.select("text").text(d.interpolated);
	}
};

function updateData(data, year, id){
	clickCount += 1;
	
	$("button").removeClass('selected');
	$("#"+id).addClass('selected');

	var parseDate = d3.timeParse("%Y-%m"),
		formatDate = d3.timeFormat("%b %Y");

	currData = []
	data.forEach(function(d) {
		if (+d.year > -year){
			currData.push(d);
		}
	});

	dmin = 100

	x.domain(d3.extent(currData, function(d){
		curr_year = Math.floor(d.year)
		if (curr_year < dmin){
			dmin = curr_year;
		}
		return +d.year;
	}));
	y.domain(d3.extent(currData, function(d) { return Math.round(d.interpolated / 10) * 10; }));
	x2.domain(x.domain());
	y2.domain(y.domain());

	numTicks = axisTicks(dmin)

	xAxis = d3.axisBottom(x)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < -100){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k years ago"
					} else if (dmin >= -10){
						d = d + 2017.88
						yr = Math.floor(d);
						month = Math.floor((d % Math.floor(d))*12);
						return formatDate(parseDate(yr+"-"+(month)));
					}
					else {
						return (2017+d)
					}
				});

	xAxis2 = d3.axisBottom(x2)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < -100){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k years ago"
					} else if (dmin >= -10){
						d = d + 2017.88
						yr = Math.floor(d);
						month = Math.floor((d % Math.floor(d))*12);
						return formatDate(parseDate(yr+"-"+(month)));
					}
					else {
						return (2017+d)
					}
				});

	yAxis = d3.axisRight(y)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? +d
						: +d + " ppm";
				});

	context.selectAll("*").remove();
	context.append('rect')
		.attr('class', 'end-left')
		.attr('x', margin2.left)
		.attr('y', 0)
		.attr('width', 8)
		.attr('height', height2)
		.attr('fill', '#4A90E2')
		.attr('rx', 4);

	context.append('rect')
			.attr('class', 'end-right')
			.attr('x', (width + margin2.left))
			.attr('y', 0)
			.attr('width', 8)
			.attr('height', height2)
			.attr('fill', '#4A90E2')
			.attr('rx', 4);

	context.append("path")
		.datum(currData)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", line2);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis2);

	setTimeout(function(){
		context.append("g")
			.attr("class", "brush")
			.call(brush)
			.call(brush.move, x.range());
	}, 100)
	

	focus.transition().select(".line")   // change the line
		.duration(1000)
		.attr("d", line(data));
	focus.transition().select(".axis--x") // change the x axis
		.duration(axisTransDur)
		.call(xAxis)
		.select(".domain")
		.remove();
	focus.transition().select(".axis--y") // change the y axis
		.duration(transDur)
		.call(yAxis)
		.select(".domain")
		.remove();

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() { hover.style("display", null); })
		.on("mouseout", function() { hover.style("display", "none"); })
		.on('mousemove', mousemove);

	function mousemove() {
		hoverCount += 1;
		
		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		hover.attr("transform", "translate(" + (margin.left + x(+d.year)) + "," + (margin.top + y(+d.interpolated)) + ")");
		hover.select("text").text(d.interpolated);
	}

	d3.select('.overall-trend').remove();
	d3.select('.annotation-group').remove();
}

function axisTicks(d){
	if (d > -100){
		return 12;
	} else if (d > -10){
		return 15;
	} else {
		return 5;
	}
}

function brushed() {
	var now = moment([]);
	brushCount += 1;

	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	var s = d3.event.selection || x2.range();
	x.domain(s.map(x2.invert, x2));
	focus.select(".line").attr("d", line);
	focus.select(".axis--x").call(xAxis);

	context.select('.end-left').attr('x', (s[0] - 4));
	context.select('.end-right').attr('x', (s[1] - 4));
	// svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
	// 	.scale(width / (s[1] - s[0]))
	// 	.translate(-s[0], 0));
	var prev = moment([]);
}

// function zoomed() {
// 	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
// 	var t = d3.event.transform;
// 	x.domain(t.rescaleX(x2).domain());
// 	focus.select(".area").attr("d", line);
// 	focus.select(".axis--x").call(xAxis);
// 	context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
// }

function meanLine(mean){
	svg.append("line")
		.attr("class", "mean-line")
		.attr("x1", 0)
		.attr("y1", y(mean))
		.attr("x2", width)
		.attr("y2", y(mean))
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("style", "stroke: #ED7301");
}

function drawTrend(data, year){
	currData = []
	data.forEach(function(d, i){
		if (d.trend){
			currData.push(d)
		}
		if ((+data[0].year - +d.year) < year){
			idx = Math.floor(i/2)
		}
	})
	//idx = Math.floor(currData.length/2);
	d = currData[idx]
	const annotations = [{
		note: {
			label: "trend line"
		},
		connector: {
			end: "arrow",
			type: "curve",
			points: [[80, 14],[108, 52]]
		},
		x: x(currData[idx].year),
		y: y(currData[idx].trend),
		dy: 80,
		dx: 120,
		color: "#ED7301"
	}
	]

	focus.append("path")
		.datum(currData)
		.attr("class", "line overall-trend")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 3)
		.style("stroke", "#ED7301")
		.attr("d", trendLine)
		.style("opacity", 0.5);

	addAnnotations(annotations);
}

function addAnnotations(annotation){
	const makeAnnotations = d3.annotation()
		.textWrap(108)
		.type(d3.annotationLabel)
		.annotations(annotation);

	focus.append("g")
		.attr("class", "annotation-group")
		.call(makeAnnotations);
}