var r = 40,
SVGwidthInt = 960,
SVGheightInt = 660,
present = 2017,
startYear = 1958,
axisTransDur = 750,
transDur = 1000,
currData = [],
carbonDataInt,
bisectData = d3.bisector(function(d) { return -d.year; }).left;


var svg2 = d3.select('.container-interact #graph-int').html('')
				.append('svg')
				.attr('class', 'co2-interactive')
				.attr('width', SVGwidthInt)
				.attr('height', SVGheightInt);

var gs2 = d3.graphScroll()
	.container(d3.select('.container-interact'))
	.graph(d3.selectAll('.container-interact #graph-int'))
	.eventId('uniqueId2')
	.sections(d3.selectAll('.container-interact #sections > div'))
	.on('active', function(i){ })

d3.csv('data/co2_mm_800k_yrs.csv', function(data){
	carbonDataInt = data;
});

/* 
////////////////////////////////////////////////////////////
****************** Brush and Zoom Section ******************
////////////////////////////////////////////////////////////
*/

var marginInt = {top: 20, right: 60, bottom: (20 + SVGwidthInt*2/16), left: 10},
	marginInt2 = {top: (20 + SVGwidthInt*9/16), right: 40, bottom: 30, left: 10},
	widthInt = SVGwidthInt - marginInt.left - marginInt.right,
	heightInt = SVGheightInt - marginInt.top - marginInt.bottom,
	heightInt2 = SVGheightInt - marginInt2.top - marginInt2.bottom;

var xScale = d3.scaleLinear().rangeRound([0, widthInt]),
	yScale = d3.scaleLinear().range([heightInt, 0]),
	x2Scale = d3.scaleLinear().rangeRound([0, widthInt]),
	y2Scale = d3.scaleLinear().range([heightInt2, 0]);

// var zoom = d3.zoom()
//     .scaleExtent([1, Infinity])
//     .translateExtent([[0, 0], [width, height]])
//     .extent([[0, 0], [width, height]]);
//     .on("zoom", zoomed);

var lineInt = d3.line()
		.defined(function(d) {
			return d.interpolated; 
		})
		.x(function(d) {
			return xScale(+d.year); 
		})
		.y(function(d) {
			return yScale(+d.interpolated); 
		});

var line2Int = d3.line()
		.defined(function(d) {
			return d.interpolated; 
		})
		.x(function(d) {
			return x2Scale(+d.year); 
		})
		.y(function(d) { 
			return y2Scale(+d.interpolated); 
		});

var trendLineInt = d3.line()
	.defined(function(d) {
		return d.trend; 
	})
    .x(function(d) {
    	return xScale(+d.year); 
    })
    .y(function(d) { 
    	return yScale(+d.trend); 
    });

function initInteract(data, year) {
	svg2.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", widthInt)
		.attr("height", heightInt);

	main = svg2.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + marginInt.left + "," + marginInt.top + ")");

	context = svg2.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + marginInt2.left + "," + marginInt2.top + ")");

	context.append('rect')
		.attr('class', 'end-left')
		.attr('x', marginInt2.left)
		.attr('y', 0)
		.attr('width', 8)
		.attr('height', heightInt2)
		.attr('fill', '#4A90E2')
		.attr('rx', 4);

	context.append('rect')
			.attr('class', 'end-right')
			.attr('x', (width + marginInt2.left))
			.attr('y', 0)
			.attr('width', 8)
			.attr('height', heightInt2)
			.attr('fill', '#4A90E2')
			.attr('rx', 4);

	brushInt = d3.brushX()
			.extent([[0, 0], [widthInt, heightInt2]])
			.on("brush end", brushedInt);

	currData = []
	data.forEach(function(d) {
		if (+d.year > -year){
			currData.push(d);
		}
	});

	dmin = 100;

	xScale.domain(d3.extent(currData, function(d){
		curr_year = Math.floor(d.year)
		if (curr_year < dmin){
			dmin = curr_year;
		}
		return +d.year
	}));
	yScale.domain(d3.extent(currData, function(d) { return Math.round(d.interpolated / 10) * 10; }));
	x2Scale.domain(xScale.domain());
	y2Scale.domain(yScale.domain());

	numTicks = axisTicks(dmin);

	xAxisInt = d3.axisBottom(xScale)
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

	xAxis2Int = d3.axisBottom(x2Scale)
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

	yAxisInt = d3.axisRight(yScale)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? "\xa0" + +d
						: +d + " ppm";
				});

	main.append("path")
		.datum(data)
		.attr("class", "int-line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", lineInt);

	main.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightInt + ")")
		.call(xAxisInt);

	main.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate("+ (widthInt) +",  0)")
		.call(yAxisInt);

	context.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", line2Int);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightInt2 + ")")
		.call(xAxis2Int);

	context.append("g")
		.attr("class", "brush")
		.call(brushInt)
		.call(brushInt.move, xScale.range());

	hover = svg2.append("g")
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

	svg2.append("rect")
		.attr("class", "overlay")
		.attr("width", widthInt)
		.attr("height", heightInt)
		.on("mouseover", function() { hover.style("display", null); })
		.on("mouseout", function() { hover.style("display", "none"); })
		.on('mousemove', mousemoveInt);

	function mousemoveInt() {
		hoverCount += 1;

		var x0 = xScale.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		hover.attr("transform", "translate(" + (marginInt.left + xScale(+d.year)) + "," + (marginInt.top + yScale(+d.interpolated)) + ")");
		hover.select("text").text(d.interpolated);
	}
};

function updateInteract(data, year, id){
	clickCount += 1;
	
	$("button").removeClass('selected');
	$("#"+id).addClass('selected');

	var parseDate = d3.timeParse("%Y-%m"),
		formatDate = d3.timeFormat("%b %Y");

	main.selectAll(".down-trend").remove();

	dmin = 100

	currData = []
	data.forEach(function(d) {
		if (+d.year > -year){
			currData.push(d);
		}
	});

	xScale.domain(d3.extent(currData, function(d){
		curr_year = Math.floor(d.year)
		if (curr_year < dmin){
			dmin = curr_year;
		}
		return +d.year;
	}));
	yScale.domain(d3.extent(currData, function(d) { return Math.round(d.interpolated / 10) * 10; }));
	x2Scale.domain(xScale.domain());
	y2Scale.domain(yScale.domain());

	numTicks = axisTicks(dmin);

	xAxisInt = d3.axisBottom(xScale)
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

	xAxis2Int = d3.axisBottom(x2Scale)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < -100){
						if (d == 0){
							return "present"
						} else if (Math.abs(d/1000) > 1){
							return Math.abs(d/1000) + "k yrs ago"
						} else if (Math.abs(d/1000) < 1) {
							return Math.abs(d) + " yrs ago"
						}						
					}
					else {
						return (2017+d)
					}
				});

	yAxisInt = d3.axisRight(yScale)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? "\xa0" + +d
						: +d + " ppm";
				});

	main.transition().select(".int-line")
		.duration(1000)
		.attr("d", lineInt(data));

	main.transition().select(".axis--x")
		.duration(axisTransDur)
		.call(xAxisInt)
		.select(".domain")
		.remove();

	main.transition().select(".axis--y")
		.duration(transDur)
		.call(yAxisInt)
		.select(".domain")
		.remove();

	context.selectAll("*").remove();
	context.append('rect')
		.attr('class', 'end-left')
		.attr('x', marginInt2.left)
		.attr('y', 0)
		.attr('width', 8)
		.attr('height', heightInt2)
		.attr('fill', '#4A90E2')
		.attr('rx', 4);

	context.append('rect')
			.attr('class', 'end-right')
			.attr('x', (width + marginInt2.left))
			.attr('y', 0)
			.attr('width', 8)
			.attr('height', heightInt2)
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
		.attr("d", line2Int);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightInt2 + ")")
		.call(xAxis2Int);

	setTimeout(function(){
		context.append("g")
			.attr("class", "brush")
			.call(brushInt)
			.call(brushInt.move, xScale.range());
	}, 100);

	svg2.append("rect")
		.attr("class", "overlay")
		.attr("width", widthInt)
		.attr("height", heightInt)
		.on("mouseover", function() { hover.style("display", null); })
		.on("mouseout", function() { hover.style("display", "none"); })
		.on('mousemove', mousemoveInt);

	function mousemoveInt() {
		hoverCount += 1;

		var x0 = xScale.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		hover.attr("transform", "translate(" + (marginInt.left + xScale(+d.year)) + "," + (marginInt.top + yScale(+d.interpolated)) + ")");
		hover.select("text").text(d.interpolated);
	}
	//drawTrendInteract(data);
}

function brushedInt() {
	brushCount += 1;

	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
	var s = d3.event.selection || x2Scale.range();
	xScale.domain(s.map(x2Scale.invert, x2Scale));
	main.select(".int-line").attr("d", lineInt);
	main.select(".axis--x").call(xAxisInt);

	context.select('.end-left').attr('x', (s[0] - 4));
	context.select('.end-right').attr('x', (s[1] - 4));
}

function meanLineInteract(mean){
	svg2.append("line")
		.attr("class", "mean-line")
		.attr("x1", 0)
		.attr("y1", yScale(mean))
		.attr("x2", widthInt)
		.attr("y2", yScale(mean))
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("style", "stroke: #ED7301");
}

function drawTrendInteract(data){
	svg2.append("path")
		.datum(data)
		.attr("class", "line overall-trend")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#ED7301")
		.attr("d", trendLineInt);
}