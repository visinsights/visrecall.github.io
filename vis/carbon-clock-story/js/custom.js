var	SVGwidth = 1140,
	SVGheight = Math.round((SVGwidth*9/16) / 10) * 10,
	margin = {top: 10, right: 60, bottom: 30, left: 30},
	width = SVGwidth - margin.left - margin.right,
	height = SVGheight - margin.top - margin.bottom;

var r = 40,
	present = 2017,
	startYear = 1958,
	axisTransDur = 750,
	transDur = 1000,
	bisectData = d3.bisector(function(d) { return -d.year; }).left;

var carbonData; //, carbonData12k, carbonData800k, carbonData10 = [], carbonData10down = []; 

var x = d3.scaleLinear().range([margin.left, width]),
	y = d3.scaleLinear().range([height, margin.top]);

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

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

var svg = d3.select('div#graph')
				.append('svg')
				.attr('class', 'co2-levels')
				.attr('width', SVGwidth)
				.attr('height', SVGheight);

function steppers(){
	num = d3.select("#sections").selectAll("div").size();
	for (i = 0; i < num; i++){
		d3.select("div.steps")
			// .append("a")
			// .attr("href", "#story-"+i)
			.append("div")
			.attr("class", "step-circle")
			.attr("id", "section-"+i);
	}
}

steppers()

var gs = d3.graphScroll()
			.container(d3.select('#container'))
			.graph(d3.selectAll('#graph'))
			.eventId('uniqueId1')
			.sections(d3.selectAll('#sections > div'))
			.on('active', function(i){
				d3.selectAll(".step-circle").classed("section-active", false);
				d3.select("#section-"+i).classed("section-active", true);
				update(i);
			})

d3.csv('data/co2_mm_800k.csv', function(data){
	carbonData = data;
	drawData(carbonData, 60);
});

function drawData(data, year){
	svg.selectAll("*").remove();

	currData = []
	data.forEach(function(d) {
		if (+d.year > (67.88 - year)){
			currData.push(d);
		}
	});

	x.domain(d3.extent(currData, function(d){ return +d.year }));
	y.domain(d3.extent(currData, function(d){return Math.round(d.interpolated / 10) * 10; }));

	xAxis = d3.axisBottom(x)
				.tickSize(0)
				.tickFormat(function(d, i) {
					return (1950+d)
				});

	yAxis = d3.axisRight(y)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? "\xa0" + +d
						: +d + " ppm";
				});

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.attr("class", "x axis")
		.select(".domain")
		.remove();

	svg.append("g")
		.attr("transform", "translate("+ width +",  0)")
		.call(yAxis)
		.attr("class", "y axis")
		.select(".domain")
		.remove()
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("CO2 levels (in ppm)");

	svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.style("stroke", "#4a4a4a")
		.attr("d", line);
	
	focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("circle")
		.attr("class", "hover-circle")
		.attr("r", 4.5)
		.attr("stroke", "#ED7301");

	focus.append("rect")
		.attr("width", 64)
		.attr("height", 24)
		.attr("fill", "#f0f0f0")
		.attr("transform", "translate(8, -12)")
		.attr("style", "opacity: 0.7");

	focus.append("text")
		.attr("class", "hover-label")
		.attr("x", 16)
		.attr("dy", ".35em");
}

function updateScales(data, period){
	currData = []
	data.forEach(function(d) {
		if (+d.year > (67.88 - period)){
			currData.push(d);
		}
	});

	x.domain(d3.extent(currData, function(d){
		return +d.year
	}));

	numTicks = axisTicks(period);
	y.domain(d3.extent(currData, function(d){return Math.round(d.interpolated / 10) * 10; }));
}

function updateData(data, year){
	var parseDate = d3.timeParse("%Y-%m"),
		formatDate = d3.timeFormat("%b %Y");

	currData = []
	data.forEach(function(d) {
		if (+d.year > (67.88 - year)){
			currData.push(d);
		}
	});

	dmin = Math.min.apply(Math, currData.map(function(o){return o.year;}))

	xAxis = d3.axisBottom(x)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < 0){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k years ago"
					} else if (year == 6){
						yr = Math.floor(d + 1950);
						month = Math.floor((d % Math.floor(d))*12);
						return formatDate(parseDate(yr+"-0"+(month+1)));
					}
					else {
						return (1950+d)
					}
				});

	yAxis = d3.axisRight(y)
				.tickSize(0)
				.tickFormat(function(d) {
					return this.parentNode.nextSibling
						? "\xa0" + +d
						: +d + " ppm";
				});

	svg.transition().select(".x.axis") // change the x axis
		.duration(axisTransDur)
		.call(xAxis)
		.select(".domain")
		.remove();
	svg.transition().select(".y.axis") // change the y axis
		.duration(transDur)
		.call(yAxis)
		.select(".domain")
		.remove();
	svg.transition().select(".line")   // change the line
		.duration(1000)
		.attr("d", line(data));

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() { focus.style("display", null); })
		.on("mouseout", function() { focus.style("display", "none"); })
		.on('mousemove', mousemove);

	function mousemove() {
		hoverCount += 1;
		
		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		focus.attr("transform", "translate(" + x(d.year) + "," + y(d.interpolated) + ")");
		focus.select("text").text(d.interpolated);
	}
}

function axisTicks(d){
	if (d == 60){
		return 10;
	} else if (d == 6){
		return 15;
	} else {
		return 5;
	}
}

function drawFluctuate(data, year){
	currData = [], carbonData10up = [], carbonData10down = [];
	data.forEach(function(d, i){
		if (d.trend){
			currData.push(d)
		}
		if ((+data[0].year - +d.year) < year){
			idx = Math.floor(i/2)
		}
	})

	for (i in currData){
		carbonData10up.push({
			year: currData[i].year, 
			interpolated: currData[i].interpolated, 
			trend: currData[i].trend, 
			fluctuation: currData[i].fluctuation
		})
		if (data[i].fluctuation == 1){
			carbonData10down.push({year: null, interpolated: null, trend: null, fluctuation: null})
		}
		if (data[i].fluctuation == -1){
			carbonData10down.push({
				year: currData[i].year, 
				interpolated: currData[i].interpolated, 
				trend: currData[i].trend, 
				fluctuation: currData[i].fluctuation
			})
		}
	}

	// xAxis = d3.axisBottom(x)
	// 			.tickSize(0)
	// 			.tickFormat(function(d, i) {
	// 				return (1950+d)
	// 			});

	// yAxis = d3.axisRight(y)
	// 			.tickSize(0)
	// 			.tickFormat(function(d) {
	// 				return this.parentNode.nextSibling
	// 					? "\xa0" + +d
	// 					: +d + " ppm";
	// 			});

	svg.transition().select(".x.axis") // change the x axis
		.duration(axisTransDur)
		.call(xAxis)
		.select(".domain")
		.remove();

	svg.transition().select(".y.axis") // change the y axis
		.duration(axisTransDur)
		.call(yAxis)
		.select(".domain")
		.remove();

	svg.transition().select(".line")   // change the line
		.duration(transDur)
		.attr("d", line(carbonData10up));

	setTimeout(function(){ 
		svg.append("path")
			.datum(carbonData10down)
			.attr("class", "line down-trend")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.style("stroke", "#F5CB5C")
			.attr("d", line);
	}, 900);
}

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

	setTimeout(function(){ 
		svg.append("path")
			.datum(currData)
			.attr("class", "line overall-trend")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 3)
			.style("stroke", "#ED7301")
			.attr("d", trendLine)
			.style("opacity", 0.5);

		addAnnotations(annotations)
	}, 900);
}

function addAnnotations(annotation){
	const makeAnnotations = d3.annotation()
		.textWrap(108)
		.type(d3.annotationLabel)
		.annotations(annotation);

	svg.append("g")
		.attr("class", "annotation-group")
		.call(makeAnnotations);
}

var steps = [
	function step0() {
		updateScales(carbonData, 60);
		updateData(carbonData, 60);
	},
	function step1() {
		updateScales(carbonData, 60);
		updateData(carbonData, 60);
	},
	function step2() {
		idx = 834;
		updateScales(carbonData, 60);
		updateData(carbonData, 60);
		var annotation1 = [{
			note: {
				label: "316 ppm"
			},
			connector: {
				end: "arrow",
				type: "curve",
				points: [[20, -52],[108, -64]]
			},
			x: x(carbonData[idx].year),
			y: y(carbonData[idx].interpolated),
			dy: -80,
			dx: 120,
			color: "#ED7301"
		}
		]
		addAnnotations(annotation1);
	},
	function step3() {
		updateScales(carbonData, 800000);
		updateData(carbonData, 800000);
		meanLine(280);
	},
	function step4() {
		updateScales(carbonData, 12000);
		updateData(carbonData, 12000);
		meanLine(285);
		var annotation2 = [{
			note: {
				label: "currently over 400 ppm"
			},
			connector: {
				end: "arrow",
			},
			x: x(carbonData[0].year),
			y: y(400),
			dy: 0,
			dx: -120,
			color: "#F5CB5C"
		}
		]
		addAnnotations(annotation2);
	},
	function step5() {
		updateScales(carbonData, 60);
		updateData(carbonData, 60);
		drawTrend(carbonData, 60);
	},
	function step6() {
		updateScales(carbonData, 6);
		updateData(carbonData, 6);
		drawTrend(carbonData, 6);
		drawFluctuate(carbonData, 6);
	},
	function step7() {
		updateScales(carbonData, 60);
		updateData(carbonData, 60);
		drawTrend(carbonData, 60);
	}
]

function update(step) {
	svg.selectAll(".down-trend").remove();
	svg.selectAll(".overall-trend").remove();
	svg.selectAll(".mean-line").remove();
	d3.selectAll('.annotation-group').remove();

	steps[step].call();
}


