var domain = {x: 240, y: 240},
	margin = {left: 10, top: 10, right: 10, bottom: 10}

var width = 220,
	height = 220;

// Measuring Interaction Events
var hoverCount = 0,
	clickCount = 0;

seed = [100, 10, 230, 110, 50, 30]

var x = d3.scaleLinear()
				.domain([0, domain.x])
				.range([margin.left, width - margin.right]),
	y = d3.scaleLinear()
				.domain([0, domain.y])
				.range([margin.top, height - margin.bottom]),
	scaleFactor = width/domain.x;

const POPULATION_SIZE = 100;

function distance(a, b) {
    return Math.sqrt(((b.x - a.x) ** 2 + (b.y - a.y) ** 2));
}

function calcuateSpread(nodes, rZero = 15) {
	let spreadCounter = 0;
	for (let i = 0; i < rZero; i++) {
		const element = nodes[i];
		if (element.status !== "immune") {
			spreadCounter++
		}
	}

	const spreadTotal = +rZero + (rZero * spreadCounter);
	//if the infection spreads past the population size, return it instead
	//to avoid errors
	if (spreadTotal > POPULATION_SIZE) {
		return POPULATION_SIZE;
	} else {
		return spreadTotal;
	}
}

//handle animation logic
function handleLoadComplete(percent, pop, i, idx, rZero = 15) {
	graphClass = ".graph._"+percent;

	var svg = d3.select(graphClass);

	var status = "Protected"

	//repeat the animation 10 times
	const movingDot = svg.append("circle")
						.datum([{
							x: "5",
							y: "5"
						}])
						.attr("id", "movingDot")
						.attr("fill", "#b51800")
						.attr("r", 4)
						.attr("cx", d3.randomUniform(250))
						.attr("cy", -100);

	//interaction begins here
	//randomly pick a node, need to round to a integer

	//Set seed
	Math.seedrandom(seed[idx] + (i+1));
	randUniform = Math.random()*POPULATION_SIZE
	
	const targetSelection = Math.floor(randUniform);
	const targettedNode = d3.select("#node_"+percent+"_"+ targetSelection);
	
	//need to extract the datum in the selection
	const targettedNodeDatum = targettedNode.datum();
	//move the pointer towards the population

	movingDot.transition() 
			.ease(d3.easeQuadOut)
			.duration(500)
			.attr("cx", x(targettedNodeDatum.x))
			.attr("cy", y(targettedNodeDatum.y));

	movingDot.transition()
			.ease(d3.easeQuad)
			.delay(750)
			.duration(500)
			.attr("cx", d3.randomUniform(250))
			.attr("cy", "350");

	if (targettedNodeDatum.status != "immune") {
		//if the node isn't immune, calculate how to spread the infection
		var AllNodesSelection = svg.selectAll(".node_"+percent);

		//sorting the nodes by their distance from the selected one (ascending)
		var sortedNodes = AllNodesSelection.sort(function (a, b) {
			return d3.ascending(distance(targettedNodeDatum, a), distance(targettedNodeDatum, b));
		}).data();

		const spreadDistance = calcuateSpread(sortedNodes);

		//if spread distance exceeds the size of the population, the interations for the animation
		//such just run on the population size, rather than the spread
		let infectionCounter = 0;
		let furthestNode = targettedNodeDatum; //initially set the deepest infection equal to the current section

		for (let i = 0; i < spreadDistance; i++) {
			const element = sortedNodes[i];
			const infectCheck = d3.select("#node_"+percent+"_"+element.id).classed("checked");
			const currentNode = d3.select("#node_"+percent+"_"+element.id);
			currentNode.transition()
				.delay(500+25*i) //distance between transitions
					.attr("fill", function (d) {
					//if the node is immune, don't change colors
					if (d.status == "immune") {
						return "#94b1ca";
					} else {
					//add to the infect counter if it's a new infection
					if (!infectCheck) {
						//update infections
						//record this infection to the data store
						status = "Not Protected"
						infectionCounter++;
						furthestNode = currentNode.datum();
					}
						return "#b51800";
					}
				})
			.attr("stroke", function (d, i) {
				if (d.status == "immune") {
					return "#94b1ca";
				} else {
					return "#b51800";
				}
			})
			//adds a checked class to the element to prevent double incrementing
			const selected = d3.select("#node_"+percent+"_"+element.id).classed("checked", true);
		}
		pop.infected += infectionCounter;
		pop.susceptible -= infectionCounter;
	}
	console.log(pop, percent);
	initPopBar(pop, percent);
	return pop.infected
}

var nodes = []
var pop = []
var simulation = []

function initGraph(percentVacc, idx = 0, vaccEffect = 95){
	graphClass = ".graph._"+percentVacc;

	//reducing the percentages from the form into a decimals
	pop[idx] = initPopStats(POPULATION_SIZE, percentVacc*.01);
	
	nodes[idx] = initPopulationArray(POPULATION_SIZE, pop[idx]);

	initPopBar(pop[idx], percentVacc);

	simulation[idx] = d3.forceSimulation(nodes[idx])
			.force('charge', d3.forceManyBody().strength(0))
			.force("center", d3.forceCenter(width / 2, height / 2))
			.force("collision", d3.forceCollide().radius(function (d) {
				return d.radius * 1.4;
			}))
			.alphaMin(0.5)
			.on("tick", function () {
				var u = d3.select(graphClass)
					.selectAll("circle")
					.data(nodes[idx])

				u.enter()
					.append("circle")
					.attr("r", function (d) {
						return d.radius * scaleFactor;
					})
					.merge(u)
					.attr("cx", function (d) {
						return x(d.x);
					})
					.attr("cy", function (d) {
						return y(d.y);
					})
					.attr("fill", function (d, i) {
						switch (d.status) {
							case "immune":
								return "#94b1ca";
							break;
							case "unvaccinated":
								return "#ffce4b";
							break;
							case "vulnerable":
								return "#ffe9b0";
							default:
								return "#ffce4b";
						}
					})
					.attr("stroke", function (d, i) {
						switch (d.status) {
							case "immune":
								return "#94b1ca";
							break;
							case "unvaccinated":
								return "#ffce4b";
							break;
							case "vulnerable":
								return "#94b1ca";
							default:
								return "#ffce4b";
						}
					})
					.attr("stroke-width", 2)
					.attr("id", function (d, i) {
						return "node_"+percentVacc+"_" + i;
					})
					.attr("class", "node_"+percentVacc);

				u.exit().remove()
			});
}

function startAnimation(){
	p = [58, 69, 86, 90, 95, 99];
	d3.select('.sim-button').html('<i class="fa fa-repeat" aria-hidden="true"></i> &nbsp Reset');
	$(".sim-button").off('click').hide();

	for (j in p){
		animateDots(p, j);
	}
}

function animateDots(p, idx){
	var q = d3.queue();

	for (let i = 0; i < 5; i++) {
		let handleLoadCompleteFactory = function (callback) {
			setTimeout(function () {
				inf = handleLoadComplete(p[idx], pop[idx], i, idx);
				callback(null);
			}, (i+idx*5+1) * 1000);
		}
		q.defer(handleLoadCompleteFactory);
	}
	if (idx == 5){
		setTimeout(function(){
			$(".sim-button").on('click', resetGraph).show();
		}, 30000);
	}
}

function initPopStats(popSize, vaccPercentage){
	Math.seedrandom(10);
    const numberOfNoVac = Math.floor(popSize * (1 - vaccPercentage));
    const numberOfImmune = Math.floor((popSize - numberOfNoVac)) - Math.floor(Math.random()/0.4);
    const numberOfVulnerable = popSize - numberOfNoVac - numberOfImmune;

    var localPop = {
        susceptible: numberOfNoVac,
        vulnerable: numberOfVulnerable,
        vaccinated: numberOfImmune,
        infected: 0
    }
    return localPop;
}

function initPopulationArray(popSize, pop) {
	const RADIUS_SIZE = 6;

	const numberOfNoVac = pop.susceptible;
	const numberOfImmune = pop.vaccinated;
	const numberOfVulnerable = pop.vulnerable;

	//create array of non-vaccinated nodes
	const noVaccNodes = d3.range(numberOfNoVac).map(function (d) {
		return {
			status: "unvaccinated"
		};
	});
	//array of prefectly immune nodes
	const vaccImmuneNodes = d3.range(numberOfImmune).map(function (d) {
		return {
			status: "immune"
		}
	});
	//array of vaccinated but Vulnerable nodes
	const vaccVulnerableNodes = d3.range(numberOfVulnerable).map(function (d) {
		return {
			status: "vulnerable"
		}
	});
	//merge and shuffle the array
	const combinedPopArray = d3.shuffle(d3.merge([noVaccNodes, vaccImmuneNodes, vaccVulnerableNodes]));
	//add id numbers for the layout
	return combinedPopArray.map(function (d, i) {
		return {
			radius: RADIUS_SIZE,
			status: d.status,
			x: position[i].x,
			y: position[i].y,
			id: i
		};
	});
}

function initPopBar(pop, percentVacc){
	if ((pop.vaccinated + pop.infected) == 100){
		pop.susceptible = 0;
		pop.vulnerable = 0;
	}

	percent = "_"+percentVacc
	duration = pop.infected * 30 + 250

	if (pop.infected >= 1){
		d3.select(".infect-status."+percent).text("Not Protected").attr("style", "color: #b51800");
	} else {
		d3.select(".infect-status."+percent).attr("style", "color: #94b1ca");
	}

	d3.select(".bar."+percent+".susceptible")
		.transition()
		.duration(duration)
		.attr("style", "width: "+(pop.susceptible+pop.vulnerable)*2+"px");
	d3.select(".bar."+percent+".vaccinated")
		.transition()
		.duration(duration)
		.attr("style", "width: "+pop.vaccinated*2+"px");
	d3.select(".bar."+percent+".infected")
		.transition()
		.duration(duration)
		.attr("style", "width: "+pop.infected*2+"px");
}



