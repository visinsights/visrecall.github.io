var r = 40,
width = 692,
height = 640,
margin = {top: 10, right: 10, bottom: 180, left: 10},
maxDeaths = 33599,
yMax = 150,
initOne = false,
initAll = false;

var gunData;
// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

var canvas = d3.select('div#graph')
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
	//createData(gunData);
});

function initOneDeath(){
	context.clearRect(0, 0, width, height);

	const point = {
			id: 0,
			cx: 16,
			cy: 16,
			r: 6
		}

	context.beginPath();
	context.fillStyle = "rgba(74, 74, 74, 1)";
	context.arc(point.cx, point.cy, point.r, 0, 2 * Math.PI, true);
	context.fill();
	context.closePath();

	textX = 96, textY = 22;

	context.beginPath();
	context.moveTo(32, 16);
	context.lineTo(80, 16);
	context.stroke();

	context.font = "16px Avenir Next";
	context.fillStyle = "#000"
	context.fillText("1 Gun Death", textX, textY);

	initOne = true;
}

function initAnimate(){
	const duration = 250;
	const ease = d3.easeLinear;

	timer = d3.timer((elapsed) => {
		const t = Math.min(1, ease(elapsed/duration));
		if (t === 1) {
			timer.stop();
		}

		context.clearRect(0, 0, width, height);
		
		point = {
			id: 0,
			cx: Math.floor(16-t*4.5),
			cy: Math.floor(16-t*4.5),
			r: Math.floor(6-t*4.5)
		}

		context.beginPath();
		context.fillStyle = "rgba(74, 74, 74, 1)";
		context.arc(point.cx, point.cy, point.r, 0, 2 * Math.PI, true);
		context.fill();
		context.closePath();
	})
}

function animateAllDeaths(numPoints, duration) {
	const points = d3.range(numPoints).map(index => ({
		id: index,
		cx: x(Math.ceil((index+1)/yMax)),
		cy: y(index%yMax),
		r: 1
	}));

	const ease = d3.easeCubic;

	context.clearRect(0, 0, width, height);

	prev = 0

	timer = d3.timer((elapsed) => {
		const t = Math.min(1, ease(elapsed/duration));
		if (t === 1) {
			timer.stop();
		}
		idx = Math.floor(t*numPoints)
		for (let j=prev; j<idx; j++){
			const point = points[j];
			context.beginPath();
			context.fillStyle = "rgba(74, 74, 74, 1)";
			context.arc(point.cx, point.cy, point.r, 0, 2 * Math.PI, true);
			context.fill();
			context.closePath();
		}
		prev = idx;
	})
	initAll = true;
};

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
		.attr('fill', 'rgba(74, 74, 74, 1)');

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

function steppers(){
	num = d3.select("#sections").selectAll("div.story-text").size();
	for (i = 0; i < num; i++){
		d3.select("div.steps").append("div")
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

function annotateSection(classes, alpha, yAdjust = 0, xAdjust = 0, text2, text1 = ""){
	lineheight = 16
	y0 = 470
	xPos = x(dataContainer.selectAll(classes)['_groups'][0].length/yMax) + 2,
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

var steps = [
	function step0() {
		if (!initOne){
			initOneDeath()
		} else {
			createData(gunData);

			selected = dataContainer.selectAll('custom')
						.attr('fill', 'rgba(74, 74, 74, 1)');

			count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>";
			d3.select('p.death-desc').html(count);

			drawCanvas();
		}
	},
	function step1() {
		if (!initAll){
			initAnimate();

			setTimeout(function(){
				const numPoints = 33599;
				const duration = 1000;
				animateAllDeaths(numPoints, duration);
			}, 300);
		} else {
			createData(gunData);

			selected = dataContainer.selectAll('custom')
						.attr('fill', 'rgba(74, 74, 74, 1)');

			count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
			d3.select('p.death-desc').html(count);

			drawCanvas();
		}
	},
	function step3() {
		createData(gunData);

		dataContainer.selectAll('custom')
				.attr('fill', 'rgba(74, 74, 74, 0.2)');

		selected = dataContainer.selectAll('.Suicide')
						.attr('fill', color('Suicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide, .Police", 1, 0, 0, "Suicides");
	},
	function step4() {
		dataContainer.selectAll('.Suicide')
				.attr('fill', 'rgba(229, 83, 55, 0.4)');

		selected = dataContainer.selectAll('.Suicide.Male')
				.attr('fill', color('Suicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)
		drawCanvas();

		annotateSection(".Homicide, .Police", 1, 0, 0, "Suicides");
		annotateSection(".Homicide, .Police, .Suicide.Female", 1, 1, 0, "Male Suicides");
	},
	function step5() {
		dataContainer.selectAll('.Suicide')
				.attr('fill', 'rgba(229, 83, 55, 0.4)');

		dataContainer.selectAll('.Suicide.Male')
				.attr('fill', 'rgba(229, 83, 55, 0.7)');

		selected = dataContainer.selectAll('.Suicide.Male._35to64, .Suicide.Male._65older')
						.attr('fill', color('Suicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide, .Police", 1, 0, 0, "Suicides");
		annotateSection(".Homicide, .Police, .Suicide.Female", 1, 1, 0, "Male Suicides");
		annotateSection(".Homicide, .Police, .Suicide.Female, .Suicide.Male._Under15, .Suicide.Male._15to34", 1, 2, 0, "Male Suicides", "35 and above");
	},
	function step6() {
		selected = dataContainer.selectAll('.Homicide')
							.attr('fill', color('Homicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide", 1, 0, -1, "Homicides");
	},
	function step7() {
		dataContainer.selectAll('.Homicide')
					.attr('fill', "rgba(93, 215, 188, 0.4)");

		selected = dataContainer.selectAll('.Homicide.Male._15to34, .Homicide.Male._Under15')
							.attr('fill', color('Homicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide", 1, 0, -1, "Homicides");
		annotateSection(".Homicide.Female, .Homicide.Male._Under15, .Homicide.Male._15to34", 1, 1, -1, "Homicides", "Young Male");
	},
	function step8() {          
		dataContainer.selectAll('.Homicide')
				.attr('fill', "rgba(93, 215, 188, 0.4)");

		dataContainer.selectAll('.Homicide.Male._15to34, .Homicide.Male._Under15')
				.attr('fill', "rgba(93, 215, 188, 0.7)");

		selected = dataContainer.selectAll('.Homicide.Male._Under15.Black, .Homicide.Male._15to34.Black')
				.attr('fill', color('Homicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide", 1, 0, -1, "Homicides");
		annotateSection(".Homicide.Female, .Homicide.Male._Under15, .Homicide.Male._15to34", 1, 1, -1, "Homicides", "Young Male");
		annotateSection(".Homicide.Female, .Homicide.Male._Under15.Black, .Homicide.Male._15to34.Black", 1, 2, -1, "Male Homicides", "Young Black");
	},
	function step9() {
		dataContainer.selectAll('.Homicide')
				.attr('fill', "rgba(93, 215, 188, 0.4)");

		selected = dataContainer.selectAll('.Homicide.Female')
				.attr('fill', color('Homicide'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();

		annotateSection(".Homicide", 1, 0, -1, "Homicides");
		annotateSection(".Homicide.Female", 1, 1, 0, "Female Homicides");
	},
	function step10() {
		selected = dataContainer.selectAll('.Accidental, .Undetermined')
				.attr('fill', color('Accidental'));

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();
		annotateSection(".Homicide, .Police, .Suicide", 1, 2, -1, "Undetermined", "Accidents or");
	},
	function step11() {
		dataContainer.selectAll('custom')
				.attr('fill', 'rgba(74, 74, 74, 0.2)');

		selected = dataContainer.selectAll('.police')
				.attr('fill', "rgba(93, 215, 188, 1)");

		count = "Number of deaths: <b>"+selected['_groups'][0].length+"</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();                
	},
	function step12() {
		dataContainer.selectAll('.Suicide')
				.attr('fill', color('Suicide'));

		dataContainer.selectAll('.Homicide, .Police')
				.attr('fill', color('Homicide'));

		dataContainer.selectAll('.Accidental, .Undetermined')
				.attr('fill', color('Accidental'));

		count = "Number of deaths: <b>33599</b>"
		d3.select('p.death-desc').html(count)

		drawCanvas();                
	}
]

function update(step) {
	dataContainer.selectAll('custom')
		.attr('fill', 'rgba(74, 74, 74, 0.2)');

	steps[step].call();
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

	// if (annotate){
	// 	annotateSection(null, 2, 0, "Homicides");
	// 	annotateSection(hCount, 2, 0, "Suicides");
	// 	annotateSection((hCount + sCount), 2, 0, "Undetermined", "Accidents or");
	// }
}


