var margin={ top: 5, right: 2, bottom:23, left: 55}
var width = 650 - margin.left - margin.right
var height = 410 - margin.top - margin.bottom

// append the svg object to the body of the page
var svg = d3
  .select("#area_4")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("./dataset/channel_month_count_sharing.csv", function (data) {
  // console.log(
  

  var x = d3
    .scaleBand()
    .domain([
      "Cielo",
      "Italia 1",
      "Iris",
      "Rete 4",
      "Cine34",
      "Sky Cinema Drama",
      "Sky Cinema Due",
      "Sky Cinema Suspense",
      "Sky Cinema Comedy",
      "Sky Cinema Action",
    ])
    .range([0, 500]);

  var xAxis = d3.axisBottom(x);

  // Draw the axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-10)")
    .style("text-anchor", "middle")
    .style("font-size", 10)
    .style("fill", "#00000");

  // Add Y axis
  var y = d3
    .scaleBand()
    .domain([
      "gennaio",
      "febbraio",
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto",
      "settembre",
      "ottobre",
      "novembre",
    ])
    .range([height, 0]);

  var yAxis = d3.axisLeft().scale(y).ticks(11);

  svg.append("g").call(yAxis);

  var radiusNumberMovies = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.number_movies);
      })
    )
    .range([1, 17]);

  var colorScale = d3
    .scaleSequential()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.sharing);
      })
    )
    .interpolator(d3.interpolatePuRd);



    //tooltip


    var tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip2")
      .style("background-color", "rgb(0, 0, 0)")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("font-size", "20px")
      .style("color", "white")
      .text("a simple tooltip");


    //

  //Append a defs (for definition) element to your SVG
  var defs = svg.append("defs");

  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs
    .append("linearGradient")
    .attr("id", "linear-gradient");

  //Vertical gradient
  linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  // Add color
  linearGradient
    .selectAll("stop")
    .data(colorScale.domain())
    .enter()
    .append("stop")
    .attr("offset", function (d, i) {
      // console.log((i / d3.max(colorScale.domain())) * 100);
      return (i / d3.max(colorScale.domain())) * 100;
    })
    .attr("stop-color", colorScale.interpolator());

  // Draw the rectangle and fill with gradient
  svg
    .append("rect")
    // .attr("x", 580)
    .attr("x", width - 0.10 * width)
    .attr("y", 25)
    .attr("width", 20)
    .attr("height", 145)
    .style("fill", "url(#linear-gradient)");

  svg
    .append("text")
    .attr("class", "legendTitle")
    .attr("x", width - 0.215 * width)
    .attr("y", 8)
    .text("Sharing Percentage");

  var legendScale = d3
    .scaleLinear()
    // .domain(colorScale.domain())
    .domain([0, 5])
    .range([0, 145]);

  var legendAxis = d3.axisLeft().scale(legendScale).ticks(5);
  svg
    .append("g")
    .attr("transform", "translate("+ (width - 0.11 * width) + "," + 25 + ")")
    .call(legendAxis);

  // svg
  //   .append("g")
  //   .attr("transform", "translate(560," + 20 + ")")
  //   .call(legendAxis);

  // Add dots
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d.channel) + 28;
    })
    .attr("cy", function (d) {
      return y(d.month) + 20.5;
    })
    .attr("r", function (d) {
      return radiusNumberMovies(d.number_movies);
    })
    .style("fill", function (d) {
      return colorScale(d.sharing);
    })
    .style("opacity", "0.7")
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .on("mouseover",function(d){
      d3.select(this)
      .style("stroke", "black")
      .style("stroke-width",1.5)
      .style("opacity", 2)
      this["style"]["r"] = radiusNumberMovies(d.number_movies)*2;
      tooltip.html("Number of movies :" + d.number_movies + "<br>Sharing: " +  d.sharing);
          return tooltip.style("visibility", "visible");
        })
    .on("mousemove", function(d) {
      //this["style"]["r"] = radiusNumberMovies(d.number_movies);
      return tooltip.style("top",
          (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");

    })
    .on("mouseout", function(d) {
      d3.select(this).style("stroke-width",0.8)

      this["style"]["r"] = radiusNumberMovies(d.number_movies);
                return tooltip.style("visibility", "hidden");

    })
    .on("click", function(d) {
      //Gestione bubbleplot
      updateBubble_plot(d);
      //Gestione mds
      updateMDS(d);

      ///...

    }) 
    

    });



function updateBubble_plot(d){
  var circles = d3.select("#area_2").selectAll(".bubble").style("display","block");
  circles.filter(function(f) {
    return f.month != d.month | f.channel != d.channel
  }).style("display","none");
  var legend_month = d3.select("#area_2").selectAll(".text_legend_month")
  .text(function(f) { 
    return "Month : "+ d.month
  }).style("font-size", "15px").attr("alignment-baseline","middle");

  var legend_channel = d3.select("#area_2").selectAll(".text_legend_channel")
  .text(function(f) { 
    return "Channel : "+ d.channel
  }).style("font-size", "15px").attr("alignment-baseline","middle")

        }


function updateMDS(d){
  var mds_circles = d3.select("#area_6").selectAll(".bubble").style("display","block");
  mds_circles.filter(function(f) {
    return f.month != d.month | f.channel != d.channel
  }).style("display","none");





}
