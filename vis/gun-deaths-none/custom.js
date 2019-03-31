var r = 40,
width = 802,
height = 640,
margin = {top: 10, right: 120, bottom: 180, left: 10},
spacer = 13,
maxDeaths = 33599,
yMax = 150;

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

var canvasIntent = d3.select('div.graph-1')
				.append('canvas')
				.attr('class', 'gun_deaths')
				.attr('width', width)
				.attr('height', height);

var canvasGender = d3.select('div.graph-2')
				.append('canvas')
				.attr('class', 'gun_deaths')
				.attr('width', width)
				.attr('height', height);

var canvasAge = d3.select('div.graph-3')
				.append('canvas')
				.attr('class', 'gun_deaths')
				.attr('width', width)
				.attr('height', height);

var canvasRace = d3.select('div.graph-4')
				.append('canvas')
				.attr('class', 'gun_deaths')
				.attr('width', width)
				.attr('height', height);

var x = d3.scaleLinear()
				.domain([0, Math.ceil(maxDeaths/yMax)])
				.range([margin.left, width - margin.right])
	y = d3.scaleLinear()
				.domain([yMax, 0])
				.range([height - margin.bottom, margin.top]),
	color = d3.scaleOrdinal()
				.domain(["Suicide", "Homicide", "Police", "Accidental", "Undetermined"])
				.range(["rgba(245, 65, 31, 1)", "rgba(93, 215, 188, 1)", "rgba(93, 215, 188, 1)", "rgba(97, 126, 237, 1)", "rgba(97, 126, 237, 1)"]);

d3.csv('data/all_deaths_2014.csv', function(data){
	var homicideData = [], suicideData = [];

	data.forEach(function(d){
		if (d.intent == "Homicide"){
			homicideData.push(d);
		} else if (d.intent == "Suicide"){
			suicideData.push(d);
		}
	});

	ageSortedData = sortDeaths(homicideData, suicideData, "age");
	raceSortedData = sortDeaths(homicideData, suicideData, "race");

	initIntent(data, canvasIntent);
	initGender(data, canvasGender);
 	initAge(ageSortedData, canvasAge);
 	initRace(raceSortedData, canvasRace);
});


function sortDeaths(data1, data2, key){
	data1.sort(function(a, b){ return d3.ascending(a[key], b[key]) });
	data2.sort(function(a, b){ return d3.ascending(a[key], b[key]) });
	return data1.concat(data2);
}

function drawCanvas(canvas, context, dataContainer){
	context.fillStyle = "#fff";
	context.rect(0,0,canvas.attr("width"),canvas.attr("height"));
	context.fill();

	var elements = dataContainer.selectAll("custom");
	elements.each(function(d) {
		var node = d3.select(this);

		context.beginPath();
		context.fillStyle = node.attr("fill");
		context.arc(node.attr("cx"), node.attr("cy"), node.attr("r"), 0,  2 * Math.PI, true);
		context.fill();
		context.closePath();
	});
}

function initIntent(data, canvas){
	context = canvas.node().getContext('2d');

	customBase = document.createElement('custom');
	dataContainer = d3.select(customBase);

	dataBinding = dataContainer.selectAll("custom")
								.data(data);

	dataBinding.enter()
		.append("custom")
		.attr("class", function(d, i) {
			if (d['police'] == 1){
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race']+" police";
			}
			else {
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race'];
			}
			return class_name;
		})
		.attr("cx", function(d, i) { 
			return x(Math.ceil((i+1)/yMax));
		})
		.attr("cy", function(d, i) { return y(i%yMax); })
		.attr("r", 1)
		.attr('fill', function(d){ return color(d.intent)});

	hCount = dataContainer.selectAll('.Homicide')._groups[0].length;
	sCount = dataContainer.selectAll('.Suicide')._groups[0].length;

	dataContainer.selectAll('.Suicide')
				.attr("cx", function(d, i) {
					return x(Math.ceil(hCount/yMax)) + x(Math.ceil((i+1)/yMax));
				})
				.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Accidental, .Undetermined')
				.attr("cx", function(d, i) {
					return x(Math.ceil((hCount + sCount)/yMax)) + x(1) + x(Math.ceil((i+1)/yMax));
				})
				.attr("cy", function(d, i) { return y(i%yMax); });

	drawCanvas(canvas, context, dataContainer);

	annotateSection(canvas, context, dataContainer, null, 1, 2, 0, 0, "Homicides");
	annotateSection(canvas, context, dataContainer, hCount, 1, 2, 0, 1, "Suicides");
	annotateSection(canvas, context, dataContainer, (hCount + sCount), 1, 2, 0, 2, "Undetermined", "Accidents or");
}

function initGender(data, canvas){
	var context = canvas.node().getContext('2d');

	var customBase = document.createElement('custom');
	var dataContainer = d3.select(customBase);

	var dataBinding = dataContainer.selectAll("custom")
								.data(data);

	dataBinding.enter()
		.append("custom")
		.attr("class", function(d, i) {
			if (d['police'] == 1){
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race']+" police";
			}
			else {
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race'];
			}
			return class_name;
		})
		.attr("cx", function(d, i) { 
			return x(Math.ceil((i+1)/yMax));
		})
		.attr("cy", function(d, i) { return y(i%yMax); })
		.attr("r", 1);

	hCountFemale = dataContainer.selectAll('.Homicide.Female')._groups[0].length;
	hCount = dataContainer.selectAll('.Homicide')._groups[0].length;

	sCountFemale = dataContainer.selectAll('.Suicide.Female')._groups[0].length;
	sCount = dataContainer.selectAll('.Suicide')._groups[0].length;

	dataContainer.selectAll('.Homicide')
			.attr('fill', 'rgba(182, 234, 223, 1)');

	dataContainer.selectAll('.Homicide.Male')
				.attr("fill", "rgba(93, 215, 188, 1)")
				.attr("cx", function(d, i) {
					return x(Math.ceil(hCountFemale/yMax)) + x(Math.ceil((i+1)/yMax));
				})
				.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Suicide')
				.attr("cx", function(d, i) {
					return x(Math.ceil(hCount/yMax)) + x(1) + x(Math.ceil((i+1)/yMax));
				})
				.attr('fill', 'rgba(255, 153, 133, 1)')
				.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Suicide.Male')
				.attr("fill", "rgba(245, 65, 31, 1)")
				.attr("cx", function(d, i) {
					return x(Math.ceil((hCount+sCountFemale)/yMax)) + 2*x(1) + x(Math.ceil((i+1)/yMax));
				})
				.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Accidental, .Undetermined')
				.attr("cx", function(d, i) {
					return x(Math.ceil((hCount+sCount)/yMax)) + 3*x(1) + x(Math.ceil((i+1)/yMax));
				})
				.attr("cy", function(d, i) { return y(i%yMax); })
				.attr('fill', 'rgba(137, 122, 174, 0)');

	drawCanvas(canvas, context, dataContainer);

	annotateSection(canvas, context, dataContainer, null, 1, 0, 0, 1, "Homicides", "Female");
	annotateSection(canvas, context, dataContainer, hCountFemale, 1, 2, 0, 1, "Homicides", "Male");
	annotateSection(canvas, context, dataContainer, hCount, 1, 0, 0, 2, "Suicides", "Female");
	annotateSection(canvas, context, dataContainer, (hCount + sCountFemale), 1, 2, 0, 3, "Suicides", "Male");
}



function initAge(data, canvas){
	var context = canvas.node().getContext('2d');

	var customBase = document.createElement('custom');
	var dataContainer = d3.select(customBase);

	var dataBinding = dataContainer.selectAll("custom")
								.data(data);

	dataBinding.enter()
		.append("custom")
		.attr("class", function(d, i) {
			class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race'];
			return class_name;
		})
		.attr("cx", function(d, i) { 
			return x(Math.ceil((i+1)/yMax));
		})
		.attr("cy", function(d, i) { return y(i%yMax); })
		.attr("r", 1);

	hCount = {
		All: dataContainer.selectAll('.Homicide')._groups[0].length,
		Under15: dataContainer.selectAll('.Homicide._15andUnder')._groups[0].length,
		_15to34: dataContainer.selectAll('.Homicide._15andUnder, .Homicide._15to34')._groups[0].length,
		_35to64: dataContainer.selectAll('.Homicide._15andUnder, .Homicide._15to34, .Homicide._35to64')._groups[0].length
	}

	sCount = {
		All: dataContainer.selectAll('.Homicide, .Suicide')._groups[0].length,
		Under15: dataContainer.selectAll('.Homicide, .Suicide._15andUnder')._groups[0].length,
		_15to34: dataContainer.selectAll('.Homicide, .Suicide._15andUnder, .Suicide._15to34')._groups[0].length,
		_35to64: dataContainer.selectAll('.Homicide, .Suicide._15andUnder, .Suicide._15to34, .Suicide._35to64')._groups[0].length
	}

	dataContainer.selectAll('.Homicide._15andUnder')
			.attr('fill', 'rgba(182, 234, 223, 1)');
	dataContainer.selectAll('.Homicide._15to34')
			.attr('fill', 'rgba(93, 215, 188, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(hCount.Under15/yMax)) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Homicide._35to64')
			.attr('fill', 'rgba(15, 174, 142, 1)')
			.attr("cx", function(d, i) {
				return x(Math.ceil(hCount._15to34)/yMax) + x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Homicide._65older')
			.attr('fill', 'rgba(78, 202, 130, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(hCount._35to64)/yMax) + 2*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Suicide')
				.attr("cx", function(d, i) {
					return x(Math.ceil(hCount.All)/yMax) + 3*x(1) + x(Math.ceil((i+1)/yMax));
				})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide._15andUnder')
			.attr('fill', 'rgba(255, 153, 133, 1)');
	dataContainer.selectAll('.Suicide._15to34')
			.attr('fill', 'rgba(255, 137, 137, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil((sCount.Under15)/yMax)) + 4*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide._35to64')
			.attr('fill', 'rgba(245, 65, 31, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil((sCount._15to34)/yMax)) + 5*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide._65older')
			.attr('fill', 'rgba(213, 83, 69, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil((sCount._35to64)/yMax)) + 6*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	drawCanvas(canvas, context, dataContainer);
	annotateSection(canvas, context, dataContainer, null, 1, 0, 0, 0, "Homicides", "Under 15");
	annotateSection(canvas, context, dataContainer, hCount.Under15, 1, 2, 0, 1, "Homicides", "15 to 34");
	annotateSection(canvas, context, dataContainer, hCount._15to34, 1, 0, 0, 2, "Homicides", "35 to 64");
	annotateSection(canvas, context, dataContainer, hCount._35to64, 1, 0, 0, 3, "Homicides", "65 and above");
	annotateSection(canvas, context, dataContainer, hCount.All, 1, 1, 0, 4, "Suicides", "Under 15");
	annotateSection(canvas, context, dataContainer, sCount.Under15, 1, 2, 0, 5, "Suicides", "15 to 34");
	annotateSection(canvas, context, dataContainer, sCount._15to34, 1, 0, 0, 6, "Suicides", "35 to 64");
	annotateSection(canvas, context, dataContainer, sCount._35to64, 1, 1, 0, 7, "Suicides", "65 and above");
}


function initRace(data, canvas){
	var context = canvas.node().getContext('2d');

	var customBase = document.createElement('custom');
	var dataContainer = d3.select(customBase);

	var dataBinding = dataContainer.selectAll("custom")
								.data(data);

	dataBinding.enter()
		.append("custom")
		.attr("class", function(d, i) {
			if (d['police'] == 1){
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race']+" police";
			}
			else {
				var class_name = d['intent']+" "+d['sex']+" _"+d['age']+" "+d['race'];
			}
			return class_name;
		})
		.attr("cx", function(d, i) { 
			return x(Math.ceil((i+1)/yMax));
		})
		.attr("cy", function(d, i) { return y(i%yMax); })
		.attr("r", 1);

	hCount = {
		All: dataContainer.selectAll('.Homicide')._groups[0].length,
		Black: dataContainer.selectAll('.Homicide.Black')._groups[0].length,
		Hispanic: dataContainer.selectAll('.Homicide.Black, .Homicide.Hispanic')._groups[0].length,
		Other: dataContainer.selectAll('.Homicide.Black, .Homicide.Hispanic, .Homicide.Other')._groups[0].length
	}

	sCount = {
		All: dataContainer.selectAll('.Homicide, .Suicide')._groups[0].length,
		Asian: dataContainer.selectAll('.Homicide, .Suicide.Asian')._groups[0].length,
		Black: dataContainer.selectAll('.Homicide, .Suicide.Asian, .Suicide.Black')._groups[0].length,
		Hispanic: dataContainer.selectAll('.Homicide, .Suicide.Asian, .Suicide.Black, .Suicide.Hispanic')._groups[0].length,
		Other: dataContainer.selectAll('.Homicide, .Suicide.Asian, .Suicide.Black, .Suicide.Hispanic, .Suicide.Other')._groups[0].length
	}

	dataContainer.selectAll('.Homicide.Black')
			.attr('fill', 'rgba(93, 215, 188, 1)')
			.attr("cx", function(d, i) {
				return x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Homicide.Hispanic')
			.attr('fill', 'rgba(15, 174, 142, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(hCount.Black/yMax)) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Homicide.Other')
			.attr('fill', 'rgba(182, 234, 223, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(hCount.Hispanic/yMax)) + x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Homicide.White')
			.attr('fill', 'rgba(78, 202, 130, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(hCount.Other/yMax)) + 2*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Suicide')
			.attr("cx", function(d, i) {
				return x(Math.ceil(hCount.All/yMax)) + 3*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	dataContainer.selectAll('.Suicide.Black')
			.attr('fill', 'rgba(213, 83, 69, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(sCount.Asian/yMax)) + 3*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide.Hispanic')
			.attr('fill', 'rgba(245, 65, 31, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(sCount.Black/yMax)) + 4*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide.Other')
			.attr('fill', 'rgba(255, 153, 133, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(sCount.Hispanic/yMax)) + 5*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });
	dataContainer.selectAll('.Suicide.White')
			.attr('fill', 'rgba(255, 137, 137, 1)')
			.attr("cx", function(d, i) { 
				return x(Math.ceil(sCount.Other/yMax)) + 6*x(1) + x(Math.ceil((i+1)/yMax));
			})
			.attr("cy", function(d, i) { return y(i%yMax); });

	drawCanvas(canvas, context, dataContainer);
	annotateSection(canvas, context, dataContainer, hCount.Asian, 1, 2, 0, 0, "Homicides", "Black");
	annotateSection(canvas, context, dataContainer, hCount.Black, 1, 0, 0, 1, "Homicides", "Hispanic");
	annotateSection(canvas, context, dataContainer, hCount.Other, 1, 2, 0, 3, "Homicides", "Whites");
	annotateSection(canvas, context, dataContainer, sCount.Asian, 1, 1, 0, 4, "Suicides", "Black");
	annotateSection(canvas, context, dataContainer, sCount.Black, 1, 2, 0, 5, "Suicides", "Hispanic");
	annotateSectionBreak(canvas, context, dataContainer, sCount.Other, 1, 0, 0, 7, "Suicides", "White");
}

function annotateSection(canvas, context, dataContainer, count, alpha, yAdjust = 0, xAdjust = 0, gaps, text2, text1 = ""){
	lineheight = 16;
	y0 = 470;
	if (count == null){
		xPos = margin.left + 4;
	} else{
		xPos = x(Math.ceil(count/yMax)) + 2 + spacer*gaps;	
	}
	yPos1 = 620 - yAdjust*40 - lineheight;
	yPos2 = 620 - yAdjust*40;

	context.beginPath();
	context.moveTo(xPos, y0);
	context.lineTo(xPos, yPos2);
	context.stroke();

	var textWidth = Math.max(context.measureText(text1).width, context.measureText(text2).width);

	context.font = "14px Avenir Next";
	context.fillStyle = "rgba(0, 0, 0," + alpha + ")"
	context.fillText(text1, xPos + 4 + xAdjust * (textWidth + 8), yPos1);
	context.fillText(text2, xPos + 4 + xAdjust * (textWidth + 8), yPos2);
}

function annotateSectionBreak(canvas, context, dataContainer, count, alpha, yAdjust = 0, xAdjust = 0, gaps, text2, text1 = ""){
	lineheight = 16;
	dx = 50, dy = 25;
	y0 = 470;
	if (count == null){
		xPos = margin.left + 4;
	} else{
		xPos = x(Math.ceil(count/yMax)) + 2 + spacer*gaps;	
	}
	yPos1 = 620 - yAdjust*40 - lineheight;
	yPos2 = 620 - yAdjust*40;

	context.beginPath();
	context.moveTo(xPos, y0);
	context.lineTo(xPos, y0 + dy)
	context.lineTo(xPos + dx, y0 + dy)
	context.lineTo(xPos + dx, yPos2);
	context.stroke();

	var textWidth = Math.max(context.measureText(text1).width, context.measureText(text2).width);

	context.font = "14px Avenir Next";
	context.fillStyle = "rgba(0, 0, 0," + alpha + ")"
	context.fillText(text1, xPos + 4 + xAdjust * (textWidth + 8) +dx, yPos1);
	context.fillText(text2, xPos + 4 + xAdjust * (textWidth + 8) +dx, yPos2);
}

