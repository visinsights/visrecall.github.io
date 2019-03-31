var r = 40,
width = 762,
height = 560,
margin = {top: 10, right: 80, bottom: 100, left: 10},
maxDeaths = 33599,
yMax = 150;

var gunData;

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

var canvas = d3.select("div.svgContainer")
        .append('canvas')
        .attr('class', 'gun_deaths')
        .attr('width', width)
        .attr('height', height);

var context = canvas.node().getContext('2d');

var customBase = document.createElement('custom');
var dataContainer = d3.select(customBase);

var x = d3.scaleLinear()
				.domain([0, Math.ceil(maxDeaths/yMax)])
				.range([margin.left, width - margin.right]),
	y = d3.scaleLinear()
				.domain([yMax, 0])
				.range([height - margin.bottom, margin.top]),
	color = d3.scaleOrdinal()
				.domain(["Suicide", "Homicide", "Accidental", "Undetermined"])
				.range(["rgba(245, 65, 31, 1)", "rgba(93, 215, 188, 1)", "rgba(97, 126, 237, 1)", "rgba(97, 126, 237, 1)"]);
	colorLight = d3.scaleOrdinal()
				.domain(["Suicide", "Homicide", "Accidental", "Undetermined"])
				.range(["rgba(229, 83, 55, 0.3)", "rgba(37, 136, 116, 0.3)", "rgba(97, 126, 237, 0.3)", "rgba(97, 126, 237, 0.3)"]);

d3.csv('data/all_deaths_2014.csv', function(data){
	gunData = data;
	createData(gunData);
});

function createData(data){
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
		.attr("r", 1)
		.attr('fill', 'rgba(151, 151, 151, 1)');

	drawCanvas()
}

function drawCanvas(){
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

function loadData(gender = '', age = '', race = '', intent = ''){
	filters = intent+gender+age+race;
	annotate = false

	dataContainer.selectAll('custom')
		.attr('fill', 'rgba(151, 151, 151, 1)');

	hCount = dataContainer.selectAll('.Homicide')._groups[0].length;
	sCount = dataContainer.selectAll('.Suicide')._groups[0].length;

	count = "Number of deaths: 33599"
	if (filters != ""){
		dataContainer.selectAll('custom')
				.attr('fill', 'rgba(151, 151, 151, 0.5)');

		if (intent != ""){
			dataContainer.selectAll(intent)
					.attr('fill', function(d){	return colorLight(d.intent) });
		} else {
			dataContainer.selectAll('custom')
					.attr('fill', function(d){	return colorLight(d.intent) });	
			annotate = true
		}

		selected = dataContainer.selectAll(filters)
						.attr('fill', function(d){	return color(d.intent) });

		count = "Number of deaths: "+selected['_groups'][0].length;
	}
	d3.select('p.death-desc').text(count);

	drawCanvas();

	if (annotate){
		annotateSection(null, 2, 0, "Homicides");
		annotateSection(hCount, 2, 0, "Suicides");
		annotateSection((hCount + sCount), 2, 0, "Undetermined", "Accidents or");
	}
}

function annotateSection(count, yAdjust = 0, xAdjust = 0, text2, text1 = ""){
	lineheight = 16;
	y0 = 470;

	if (count == null){
		xPos = margin.left + 4;
	} else{
		xPos = x(Math.ceil(count/yMax)) + 2;	
	}
	yPos1 = 620 - yAdjust*40 - lineheight;
	yPos2 = 620 - yAdjust*40;
	context.beginPath();
	context.moveTo(xPos, y0);
	context.lineTo(xPos, yPos2);
	context.stroke();

	var textWidth = Math.max(context.measureText(text1).width, context.measureText(text2).width);

	context.font = "14px Avenir Next";
	context.fillStyle = "rgba(0, 0, 0, 1)"
	context.fillText(text1, xPos + 4 + xAdjust * (textWidth + 8), yPos1);
	context.fillText(text2, xPos + 4 + xAdjust * (textWidth + 8), yPos2);
}


