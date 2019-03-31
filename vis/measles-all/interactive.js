//handle animation logic
function handleIntLoadComplete(percent, pop, rZero = 15) {
	graphClass = ".graph-int";

	var svg = d3.select(graphClass);
	var status = "Protected";

	movingDotDatum = {x: Math.floor(d3.randomUniform(500)()), y: -50};

	//interaction begins here
	//randomly pick a node, need to round to a integer
	

	const targetSelection = Math.floor(d3.randomUniform(POPULATION_SIZE)());
	const targettedNode = svg.select("#node-int_"+percent+"_"+ targetSelection);

	
	//need to extract the datum in the selection
	const targettedNodeDatum = targettedNode.datum();

	movingDotDist = distance(movingDotDatum, targettedNodeDatum);

	//repeat the animation 10 times
	const movingDot = svg.append("circle")
						.datum([{
							x: "5",
							y: "5"
						}])
						.attr("id", "movingDot")
						.attr("fill", "#b51800")
						.attr("r", 5)
						.attr("cx", movingDotDatum.x)
						.attr("cy", movingDotDatum.y);

	//move the pointer towards the population
	movingDot.transition()
			.ease(d3.easeQuadOut)
			.duration(500)
			.attr("cx", x(targettedNodeDatum.x))
			.attr("cy", y(targettedNodeDatum.y));

	movingDot.transition()
			.ease(d3.easeQuadOut)
			.delay(600)
			.duration(500)
			.attr("cx", d3.randomUniform(250))
			.attr("cy", 400);

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
			const infectCheck = d3.select("#node-int_"+percent+"_"+element.id).classed("checked");
			const currentNode = d3.select("#node-int_"+percent+"_"+element.id);
			currentNode.transition()
				.delay(25*(i+10) + 500) //distance between transitions
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
			const selected = d3.select("#node-int_"+percent+"_"+element.id).classed("checked", true);
		}
		pop.infected += infectionCounter;
		pop.susceptible -= infectionCounter;
	}
	initPopBar(pop, percent);
}

var nodes = []
var pop = []
var simulation = []

function drawIntGraph(percentVacc, idx = 0, vaccEffect = 95){
	graphClass = ".graph-int";

	//reducing the percentages from the form into a decimals
	pop[idx] = initPopStats(POPULATION_SIZE, percentVacc*.01);
	
	nodes[idx] = initPopulationArray(POPULATION_SIZE, pop[idx]);

	initIntPopBar(pop[idx], percentVacc);

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
						return d.radius;
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
								return "#ffce4b";
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
						return "node-int_"+percentVacc+"_" + i;
					})
					.attr("class", "node_"+percentVacc);

				u.exit().remove()
			});
}

function animateIntDots(p){
	var q = d3.queue();

	for (let i = 0; i < 5; i++) {
		let handleLoadCompleteFactory = function (callback) {
			setTimeout(function () {
				handleIntLoadComplete(p, pop);
				callback(null);
			}, (i) * 1000);
		}
		q.defer(handleLoadCompleteFactory);
	}
}

function initIntPopBar(pop, percentVacc){
	d3.select(".infect-status-int").text("Protected").attr("style", "color: #94b1ca");

	d3.select('.bar-int.infected')
		.attr("style", "width: "+(pop.infected)*2+"px");

	d3.select('.bar-int.susceptible')
		.attr("style", "width: "+(pop.susceptible)*2+"px");

	d3.select('.bar-int.vaccinated')
		.attr("style", "width: "+(pop.vaccinated)*2+"px");
}

function updateIntPopBar(pop, percentVacc){
	if ((pop.vaccinated + pop.infected) == 100){
		pop.susceptible = 0;
		pop.vulnerable = 0;
	}

	percent = "_"+percentVacc
	duration = pop.infected * 40 + 500

	if (pop.infected >= 1){
		d3.select(".infect-status-int").text("Not Protected").attr("style", "color: #b51800");
	} else {
		d3.select(".infect-status-int").attr("style", "color: #94b1ca");
	}

	d3.select(".bar-int.susceptible")
		.transition()
		.duration(duration)
		.attr("style", "width: "+(pop.susceptible+pop.vulnerable)*2+"px");
	d3.select(".bar-int.vaccinated")
		.transition()
		.duration(duration)
		.attr("style", "width: "+pop.vaccinated*2+"px");
	d3.select(".bar-int.infected")
		.transition()
		.duration(duration)
		.attr("style", "width: "+pop.infected*2+"px");
}



