var	domain = {x: 720, y: 600},
	margin = {top: 60, left: 150, bottom: 20, right: 150},
	SVGwidth = 720,
	SVGheight = SVGwidth * 0.75,
	width =  SVGwidth - margin.left - margin.right,
	height = SVGheight - margin.top - margin.bottom,
	scale = width/domain.x;

var svg = d3.select('div#graph')
				.append('svg')
				.attr('width', SVGwidth)
				.attr('height', SVGheight);

var x = d3.scalePoint().range([margin.left, margin.left + width]),
	y = {};

var line = d3.line(),
	axis = d3.axisLeft(),
	axis1 = d3.axisLeft(),
	axis2 = d3.axisRight(),
	countries, paths, circlesExpense, circlesOutcome;

var healthData,
	dimExpesne = "Per-capita spending on health care ($)", 
	dimOutcome = "Life expectancy at birth (years)";

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

d3.csv('data/healthcare-spending.csv', function(data){	
	healthData = data;
	initialize(data, "Per-capita spending on health care ($)", "Life expectancy at birth (years)")
});

var sortOrder = {
	"Life expectancy at birth (years)" : false,
	"Infant mortality per 1000 live births" : true,
	"Maternal mortality per 100,000 live births" : true,
	"Probability of dying prematurely from noncommunicative disease (%)" : true,
	"Drug-related deaths per million population (ages 15-64)" : true,
	"Suicides per 100000 population" : true,
	"Obesity as % of population ages 15 and over" : true,
	"Prevalence of diabetes in population ages 20 to 79 (%)" : true
}

function initialize(data, dim1, dim2){
	dimExpense = dim1, dimOutcome = dim2;

	reverse = sortOrder[dim2];

	x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		return (d == dim1 || d == dim2) && (y[d] = d3.scaleLinear()
			.domain(d3.extent(data, function(p) { return +p[d]; }))
			.range([height + margin.top, margin.top]));
	}));

	var rankExp = data.map(function(p){ return parseFloat(p[dim1]); }).sort(function(a, b) { return d3.descending(a, b)})
	var rankOut = data.map(function(p){ return parseFloat(p[dim2]); }).sort(function(a, b) { return d3.descending(a, b)});

	// Add a group element for each dimension.
	var g = svg.selectAll(".dimension")
		.data(dimensions)
		.enter().append("g")
		.attr("class", function(d, i){
			return "dimension dim" + i;
		})
		.attr("transform", function(d) { return "translate(" + x(d) + ")"; });

	g.append("g")
		.attr("class", "axis")
		.each(function(d) {
			if (d == dim1){
				d3.select(this).call(axis1.scale(y[d]).tickSize(0).tickValues([]));
			} else {
				d3.select(this).call(axis2.scale(y[d]).tickSize(0).tickValues([]));
			}
		});

	countries = svg.append("g")
		.attr("class", "foreground")
		.selectAll("path")
		.data(data)
		.enter()
		.append("g")
		.attr("class", function(d){ 
			return "country-g "+d.CD+" exp-"+(rankExp.indexOf(parseFloat(d[dim1]))+1)+" out-"+(rankOut.indexOf(parseFloat(d[dim2]))+1);
		})
		.style("opacity", 0.2);

	paths = countries.append("path")
		.attr("d", path)
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);

	circlesExpense = countries.append("circle")
		.attr("r", "6")
		.attr("cx", function(d){ return x(dim1); })
		.attr("cy", function(d){ return y[dim1](d[dim1]); })
		.attr("fill", "#fff")
		.attr("fill-opacity", 0.5)
		.attr("stroke", "#444")
		.attr("stroke-width", "2px")
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);

	circlesOutcome = countries.append("circle")
		.attr("r", "6")
		.attr("cx", function(d){ return x(dim2); })
		.attr("cy", function(d){ return y[dim2](d[dim2]); })
		.attr("fill", "#fff")
		.attr("fill-opacity", 0.5)
		.attr("stroke", "#444")
		.attr("stroke-width", "2px")
		.on("mouseover", handleMouseOver)
		.on("mouseout", handleMouseOut);

	labelsExpense = countries.append("g")
		.attr("class", function(d) { return "data-label-group dim0 " + d.CD })
		.attr("transform", function(d) { return "translate(" + (x(dim1) - 16) + "," + y[dim1](d[dim1]) + ")" })		
		.attr("text-anchor", "end");

	labelsExpenseRank = labelsExpense.append("text")
		.attr("dx", 0)
		.attr("dy", -8)
		//.attr('filter', 'url(#solid)')
		.text(function(d){
			return "#" + (rankExp.indexOf(parseFloat(d[dim1])) + 1);
		})

	labelsExpense.append("text")
		.attr("dx", 0)
		.attr("dy", 4)
		//.attr('filter', 'url(#solid)')
		.text(function(d){
			return d.Country;
		})

	labelsExpenseValue = labelsExpense.append("text")
		.attr("dx", 0)
		.attr("dy", 20)
		//.attr('filter', 'url(#solid)')
		.text(function(d){ return "$" + d3.format(",")(d[dim1]); })
		.style("font-weight", 700);

	labelsOutcome = countries.append("g")
		.attr("class", function(d) { return "data-label-group dim1 " + d.CD })
		.attr("transform", function(d) { return "translate(" + (x(dim2) + 16) + "," + y[dim2](d[dim2]) + ")" })	
		.attr("text-anchor", "start");

	labelsOutcomeRank = labelsOutcome.append("text")
		.attr("dx", 0)
		.attr("dy", -8)
		.text(function(d){
			return "#" + (rankOut.indexOf(parseFloat(d[dim2])) + 1);
		})

	labelsOutcome.append("text")
		.attr("dx", 0)
		.attr("dy", 4)
		.text(function(d){
			return d.Country;
		})

	labelsOutcomeValue = labelsOutcome.append("text")
		.attr("dx", 0)
		.attr("dy", 20)
		.text(function(d){ return d[dim2]; })
		.style("font-weight", 700);

	d3.selectAll(".data-label-group").style("opacity", 0);
	CountryExp1 = d3.select("g.exp-1").attr("class").split(' ')[1];
	CountryOut1 = d3.select("g.out-1").attr("class").split(' ')[1];
	d3.selectAll("g." + CountryExp1 + ", g." + CountryOut1).style("opacity", 1);
}

function updateData(data, dim1, dim2, affix1_symbol = "", affix2_symbol = "", affix1_pre = true, affix2_pre = true){
	reverse = sortOrder[dim2];

	clickCount += 1;
	
	dimExpense = dim1, dimOutcome = dim2;
	x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		if (reverse) {
			return (d == dim1 || d == dim2) && (y[dim1] = d3.scaleLinear()
				.domain(d3.extent(data, function(p) { return +p[dim1]; }))
				.range([height + margin.top, margin.top])) && (y[dim2] = d3.scaleLinear()
				.domain(d3.extent(data, function(p) { return +p[dim2]; }))
				.range([margin.top, height + margin.top]));
		} else {
			return (d == dim1 || d == dim2) && (y[d] = d3.scaleLinear()
				.domain(d3.extent(data, function(p) { return +p[d]; }))
				.range([height + margin.top, margin.top]));
		}
	}));

	var rankExp = data.map(function(p){ return parseFloat(p[dim1]); }).sort(function(a, b) { return d3.descending(a, b)});
	var rankOut = data.map(function(p){ return parseFloat(p[dim2]); })
				.sort(function(a, b) { 
					if (reverse){ return d3.ascending(a, b);
					} else { return d3.descending(a, b); }
				});
	d3.select("g.foreground")
		.selectAll("g.country-g")
		.attr("class", function(d, i){
			return "country-g "+d.CD+" exp-"+(rankExp.indexOf(parseFloat(d[dim1]))+1)+" out-"+(rankOut.indexOf(parseFloat(d[dim2]))+1);
		})
		.style("opacity", 0.2);

	paths.each(function(d){ return d; })
		.transition()
		.duration(500)
		.attr("d", path);

	circlesExpense.transition()
		.duration(500)
		.attr("cy", function(d){
			if (d[dim1] != 'NA'){
				return y[dim1](d[dim1]);
			}
			else {
				return y[dim1](0);
			}
		});

	circlesOutcome.transition()
		.duration(500)
		.attr("cy", function(d){
			if (d[dim2] != 'NA'){
				return y[dim2](d[dim2]);
			}
			else {
				return y[dim2](0);
			}
		});

	labelsExpense.each(function(d){ return d; })
		.transition()
		.duration(500)
		.attr("transform", function(d) { return "translate(" + (x(dim1) - 16) + "," + y[dim1](d[dim1]) + ")" });

	labelsOutcome.each(function(d){ return d; })
		.transition()
		.duration(500)
		.attr("transform", function(d) { return "translate(" + (x(dim2) + 16) + "," + y[dim2](d[dim2]) + ")" });

	labelsExpenseRank.each(function(d){ return d; })
				.text(function(d){
					return "#" + (rankExp.indexOf(parseFloat(d[dim1])) + 1);
				})

	labelsExpenseValue.each(function(d){ return d; })
				.text(function(d){ 
			if (affix1_pre){
				return affix1_symbol + d3.format(",")(d[dim1]);
			} else {
				return d3.format(",")(d[dim1]) + affix1_symbol;
			}
		});		

	labelsOutcomeRank.each(function(d){ return d; })
				.text(function(d){
					return "#" + (rankOut.indexOf(parseFloat(d[dim2])) + 1);
				})

	labelsOutcomeValue.each(function(d){ return d; })
				.text(function(d){ return d[dim2]; })

	d3.selectAll(".data-label-group").style("opacity", 0);
	CountryExp1 = d3.select("g.exp-1").attr("class").split(' ')[1];
	CountryOut1 = d3.select("g.out-1").attr("class").split(' ')[1];
	d3.selectAll("g." + CountryExp1 + ", g." + CountryOut1).style("opacity", 1);
	d3.selectAll("g.USA").style("opacity", 1);

	d3.select(".label-exp").text(dim1);
	d3.select(".label-out").text(dim2);
}

// Returns the path for a given data point.
function path(d) {
	return line(dimensions.map(function(p) {return  [x(p), y[p](d[p])]; }));
}

function handleMouseOver(d, i){
	hoverCount += 1;
	country = d3.select(this.parentNode).attr("class").split(' ')[1];
	d3.selectAll("g.data-label-group." + country).style("opacity", 1);
	d3.select("g." + country).style("opacity", 1);
}

function handleMouseOut(d, i){
	country = d3.select(this.parentNode).attr("class").split(' ')[1];
	d3.selectAll("g.data-label-group." + country).style("opacity", 0);
	d3.select("g." + country).style("opacity", 0.3);
	d3.selectAll("g."+CountryExp1+", g."+CountryOut1).style("opacity", 1);
	d3.selectAll("g.USA").style("opacity", 1);
}

