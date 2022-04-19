const margin = {t: 0, r:0, b: 0, l: 0};
const size = {w:  window.innerWidth, h:  window.innerHeight};
const svg = d3.select('svg');

svg

    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
        // .attr('width', size.w)
    // .attr('height', size.h);

const containerG = svg.append('g').classed('container', true);

d3.json('data/data.json')
.then(function(data) {
    console.log(data);





        // let simulation = d3.forceSimulation(data.nodes)
        // .force('center', d3.forceCenter(size.w/2, size.h/2))
        // .force('charge', d3.forceManyBody().strength(-34))
        // .force('link', d3.forceLink(data.links).id(d=> d.id));
    
    
        //simulation with extra repelling forces then REPLACE with:

    let scaleLinear = d3.scaleLinear()
        .domain(d3.extent(data.links, d => d.value))
        .range([1,2]);

    let simulation = d3.forceSimulation(data.nodes)
        .force('center', d3.forceCenter(size.w/2, size.h/2))
        .force('charge', d3.forceManyBody().strength(-194))
        .force('link', d3.forceLink(data.links).id(d=> d.id).strength(d => scaleLinear (d.value)));
    
    //characters are categorical variable, so ordinal scale
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    let scaleOpacity = d3.scaleLinear()
        .domain(d3.extent(data.links, d => d.value))
        .range([0.2,1]);

    let lines = containerG.selectAll('lines')
        .data(data.links)
        .join('line')
        .attr('stroke-width', 2)
        .style('stroke', 'white' )
        .attr('opacity', d=> scaleOpacity(d.value))
        .attr('x1', d=> Math.random()* size.w)
        .attr('y1', d=> Math.random()* size.h)
        .attr('x2', d=> Math.random()* size.w)
        .attr('y2', d=> Math.random()* size.h)

    let nodes = containerG.selectAll('circle')
        .data(data.nodes)
        .join('circle')
        .attr('r', 7)
        .attr('cx', d => Math.random()* size.w)
        .attr('cy', d=> Math.random()* size.h)
        .style('fill', d => colorScale(d.group) )
        .call(drag(simulation))

//tick is rate of calling the simulation, almost like frames per seconds until settling equilibirum
    simulation.on('tick', function(){
        console.log('tick');

        nodes.attr('cx', d => d.x)
            .attr('cy', d => d.y);

        lines.attr('x1', d => d.source.x)
        lines.attr('y1', d => d.source.y)
        lines.attr('x2', d => d.target.x)
        lines.attr('y2', d => d.target.y)
    })


        /* ADD A TOOLTIP */
        var tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

        nodes.on("mouseover", function (e, d) {
            // var cx = d.x;
            // var cy = d.y;

            let x = e.offsetX;
            let y = e.offsetY;
            console.log(d)
    
            tooltip.style("visibility", "visible")
                .style("left", x + "px")
                .style("top", y + "px")
                .text(d.id);
    
        }).on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        });

    /* 
    MAKE A LEGEND
    */
    // create a group for our legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("width", 200)
        .attr("height", 400)
        .attr("transform", `translate(50,50)`);

    // add a legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text("Character group")
        .attr("opacity", "0.5")
        .attr("fill", "white");

    // for each color in our domain, add a dot and label
    colorScale.domain().forEach((d, i) => {
        legend.append("circle")
            .attr("cx", 10)
            .attr("cy", ((i + 1) * 20) - 5)
            .attr("r", 5)
            .attr("fill", colorScale(d));

        legend.append("text")
            .attr("x", 20)
            .attr("y", (i + 1) * 20)
            .text(d)
            .attr("opacity", "0.5")
            .attr("fill", "white");
    })

});


function drag(simulation) {
    let dragStarted = function (){
                // console.log(event)
        if(!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    };

    let dragged = function(event){
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    let dragEnded = function(event){
        if(!event.active) simulation.alphaTarget(0)
        event.subject.fx = null;
        event.subject.fy = null;
;

    };
    return d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded);

}

