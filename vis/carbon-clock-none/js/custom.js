var	SVGwidth = d3.select("div.container")["_groups"][0][0].scrollWidth,
	SVGheight = Math.round((SVGwidth*9/16)) * 4,
	margin = {top: 20, right: 60, bottom: 80, left: 30},
	width = SVGwidth - margin.left - margin.right,
	height = SVGheight/4 - margin.top - margin.bottom*0.8;

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;


var r = 40,
	present = 2017,
	startYear = 1958,
	axisTransDur = 750,
	transDur = 1000,
	bisectData = d3.bisector(function(d) { return -d.year; }).left;

var carbonData, carbonData12k, carbonData800k, carbonData10 = [], carbonData10down = []; 

var svg = d3.select('div#graph')
				.append('svg')
				.attr('class', 'co2-levels')
				.attr('width', SVGwidth)
				.attr('height', SVGheight)
				.style('background-color', '#fafafa'); 

var g1 = svg.append("g").attr("class", "graph-800k").attr("transform", "translate(0,0)"),
	g2 = svg.append("g").attr("class", "graph-12k").attr("transform", "translate(0,"+(margin.top+height+margin.bottom)+")"),
	g3 = svg.append("g").attr("class", "graph-60").attr("transform", "translate(0,"+((margin.top+height+margin.bottom)*2)+")"),
	g4 = svg.append("g").attr("class", "graph-10").attr("transform", "translate(0,"+((margin.top+height+margin.bottom)*3)+")");

const annotations = [{
		note: {
			title: "Atmospheric Carbon Levels over the past 800,000 years"
		},
		connector: {
			end: "arrow"
		},
		x: margin.left,
		y: margin.top,
		dx: 0,
		dy: 0,
		color: "#D14837"
	},{
		note: {
			title: "Atmospheric Carbon Levels over the past 12,000 years"
		},
		connector: {
			end: "arrow"
		},
		x: margin.left,
		y: margin.top+height+margin.bottom,
		dx: 0,
		dy: margin.top,
		color: "#D14837"
	},{
		note: {
			title: "Atmospheric Carbon Levels over the past 60 years"
		},
		connector: {
			end: "arrow"
		},
		x: margin.left,
		y: (margin.top+height+margin.bottom)*2,
		dx: 0,
		dy: margin.top,
		color: "#D14837"
	},{
		note: {
			title: "Atmospheric Carbon Levels over the past 10 years"
		},
		connector: {
			end: "arrow"
		},
		x: margin.left,
		y: (margin.top+height+margin.bottom)*3,
		dx: 0,
		dy: margin.top,
		color: "#D14837"
	}
	]


const type = d3.annotationCustomType(
	d3.annotationLabel, 
	{"className":"custom",
	"note":{"align":"left"}})

const makeAnnotations = d3.annotation()
	.textWrap(width)
	.disable(["connector"])
	.type(type)
	.annotations(annotations);

svg.append("g")
	.attr("class", "annotation-group")
	.call(makeAnnotations);

d3.csv('data/co2_800k_yrs.csv', function(data){
	carbonData800k = data;
	var x3 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){ return +d.year }))
				.range([margin.left, width]),
		y3 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){return Math.round(d.interpolated / 10) * 10; }))
				.range([height, margin.top]);
	drawData(carbonData800k, g1, x3, y3, -12000, 8);
});

d3.csv('data/co2_12k_yrs.csv', function(data){
	carbonData12k = data;
	var x2 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){ return +d.year }))
				.range([margin.left, width]),
		y2 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){return Math.round(d.interpolated / 10) * 10; }))
				.range([height, margin.top]);

	drawData(data, g2, x2, y2, -60, 8);
});

d3.csv('data/co2_mm_years.csv', function(data){
	data.forEach(function(d) {
		d.year = +d.year;
		d.interpolated = +d.interpolated;
		d.trend = +d.trend;
	});
	var x1 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){ return +d.year }))
				.range([margin.left, width]),
		y1 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){return Math.round(d.interpolated / 10) * 10; }))
				.range([height, margin.top]);

	drawData(data, g3, x1, y1, -10);
	drawTrend(data, g3, x1, y1);
});

d3.csv('data/co2_mm_recent.csv', function(data){
	for (i in data){
		carbonData10.push({year: data[i].year, interpolated: data[i].interpolated, trend: data[i].trend, fluctuation: data[i].fluctuation})
		if (data[i].fluctuation == 1){
			carbonData10down.push({year: null, interpolated: null, trend: null, fluctuation: null})
		}
		if (data[i].fluctuation == -1){
			carbonData10down.push({year: data[i].year, interpolated: data[i].interpolated, trend: data[i].trend, fluctuation: data[i].fluctuation})
		}
	}
	var x4 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){ return +d.year }))
				.range([margin.left, width]),
		y4 = d3.scaleLinear()
				.domain(d3.extent(data, function(d){return Math.round(d.interpolated / 10) * 10; }))
				.range([height, margin.top]);
	drawData(data, g4, x4, y4, 0, 12);
	drawTrend(data, g4, x4, y4);
});

counter = 0

function drawData(data, svg, x, y, nxt_window = 0, numTicks = 12){
	svg.selectAll("*").remove();

	var formatComma = d3.format(",");

	rect = svg.append("rect")
			.attr("x", x(x.domain()[1] + nxt_window))
			.attr("y", 0)
			.attr("width", (x(x.domain()[1]) - x(x.domain()[1] + nxt_window)))
			.attr("height", height)
			.attr("fill", "rgb(237, 115, 1)")
			.style("opacity", 0.1);

	const annotationTimeFrame = [{
		note: {
			label: "last "+formatComma(Math.abs(nxt_window))+" years"
		},
		connector: {
			end: "arrow"
		},
		x: x(x.domain()[1] + nxt_window),
		y: (margin.top+height+margin.bottom)*counter + y(400),
		dx: -40,
		dy: 0,
		color: "#D14837"
	}]

	if (nxt_window != 0){
		drawTimeFrame(annotationTimeFrame);
	}

	dmin = Math.min.apply(Math,data.map(function(o){return o.year;}))

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

	xAxis = d3.axisBottom(x)
				.ticks(numTicks)
				.tickSize(0)
				.tickFormat(function(d, i) {
					if (dmin < 0){
						if (d == 0){
							return "present"
						}
						return Math.abs(d/1000) + "k years ago"
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
	
	var focus = svg.append("g")
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

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() { focus.style("display", null); })
		.on("mouseout", function() { focus.style("display", "none"); })
		.on('mousemove', mousemove);

	function mousemove() {
		var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectData(data, -x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;
		focus.attr("transform", "translate(" + x(d.year) + "," + y(d.interpolated) + ")");
		focus.select("text").text(d.interpolated);
	}

	counter += 1
}

function axisTicks(d){
	if (d > 0){
		return 12;
	} else {
		return 8;
	}
}

function drawFluctuate(data1, data2){
	xAxis = d3.axisBottom(x)
				.tickSize(0)
				.tickFormat(function(d, i) {
					return (1950+d)
				});

	yAxis = d3.axisRight(y)
				.tickSize(0);

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
		.attr("d", line(data1));

	setTimeout(function(){ 
		svg.append("path")
			.datum(data2)
			.attr("class", "line down-trend")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.style("stroke", "#ED7301")
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

function drawTrend(data, svg, x, y){
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


	svg.append("path")
			.datum(data)
			.attr("class", "line overall-trend")
			.attr("fill", "none")
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("stroke-width", 1.5)
			.style("stroke", "#ED7301")
			.attr("d", trendLine);
}

function drawTimeFrame(annotation){
	const type = d3.annotationCustomType(
					d3.annotationLabel, 
					{"className":"custom",
					"note":{"align":"right"}}
				)

	const makeAnnotations = d3.annotation()
		.textWrap(108)
		.type(type)
		.annotations(annotation);

	svg.append("g")
		.attr("class", "annotation-group")
		.call(makeAnnotations);
}




