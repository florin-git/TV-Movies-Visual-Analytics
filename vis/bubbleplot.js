var DATASET_PATH = "./dataset/df_main_info.csv";

var margin = { top: 20, right: 0, bottom: 0, left: 30 };

var width = 850 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var div = d3.select("#area_bubble");



// append the svg object to the body of the page
var svg = d3
  .select("#area_bubble")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 30)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv(DATASET_PATH, function (data) {
  var y = d3
    .scaleLinear()
    .domain([
      40,
      d3.max(data, function (d) {
        return Math.max(d.duration);
      }),
    ])
    .range([height, 0]);

  // Add x axis
  var x = d3
    .scaleLinear()
    .domain([0, 31])
    .range([0, width - 120]);

  var x_axis = d3.axisBottom(x).scale(x).ticks(32);
  // Draw the axis
  svg
    .append("g")
    .attr("transform", "translate(0," + (height + 0) + ")")
    .style("text-anchor", "end")
    .style("font-size", 10)
    .style("fill", "#00000")
    .call(x_axis)
    .selectAll("text")
    .style("fill", "#fff");

  svg
    .append("text")
    .attr("x", 705) // set x position of text
    .attr("y", 305) // set y position of text
    .text("Days") // set the text content
    .attr("font-size", "15px") // set font size
    .attr("fill", "#fff"); // set text color

  var y_axis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "y-axis")
    .call(y_axis)
    .selectAll("text")
    .style("fill", "#fff");
  svg.selectAll("line").style("stroke", "#fff");
  svg.selectAll("path").style("stroke", "#fff");

  svg
    .append("text")
    .attr("x", -25) // set x position of text
    .attr("y", -6) // set y position of text
    .text("Duration") // set the text content
    .attr("font-size", "15px") // set font size
    .attr("fill", "#fff"); // set text color

  var radiusNumberMovies = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.rating);
      })
    )
    .range([1, 10]);

  var myColor = d3
    .scaleOrdinal()
    .domain(["mattina", "pomeriggio", "sera", "notte"])
    .range(d3.schemeSet2);

  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip2")
    .style("background-color", "rgb(0, 0, 0)")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("font-size", "20px")
    .style("color", "white")
    .text("a simple tooltip");

  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    // .filter(function(d) { return d.month == "gennaio" & d.channel == "Cine34" })
    .attr("cx", function (d) {
      return x(d.day_number) + 0;
    })
    .attr("cy", function (d) {
      return y(d.duration);
    })
    .attr("r", function (d) {
      return radiusNumberMovies(d.rating);
    })
    .style("fill", function (d) {
      return myColor(d.daytime);
    })
    .style("opacity", "0.7")
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .on("mouseover", function (d) {
      tooltip.html(d.title + "<br> Rating: " + d.rating + "<br>" + d.genres + "duration <br>" + d.duration) ;
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    });

  svg
    .data(data)
    .append("text")
    .attr("class", "text_legend_month")
    .attr("x", width - 0.18 * width)
    .attr("y", 30)
    .text(function (d) {
      return "Month: ";
    })
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  svg
    .data(data)
    .append("text")
    .attr("class", "text_legend_channel")
    .attr("x", width - 0.18 * width)
    .attr("y", 10)
    .text(function (d) {
      return "Channel: ";
    })
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  // Handmade legend
  svg
    .append("circle")
    .attr("cx", width - 0.09 * width)
    .attr("cy", 130)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[0]);
  svg
    .append("circle")
    .attr("cx", width - 0.09 * width)
    .attr("cy", 160)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[1]);
  svg
    .append("circle")
    .attr("cx", width - 0.09 * width)
    .attr("cy", 190)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[2]);
  svg
    .append("circle")
    .attr("cx", width - 0.09 * width)
    .attr("cy", 220)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[3]);
  svg
    .append("text")
    .attr("x", width - 0.08 * width)
    .attr("y", 130)
    .text("morning")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.08 * width)
    .attr("y", 160)
    .text("afternoon")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.08 * width)
    .attr("y", 190)
    .text("evening")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.08 * width)
    .attr("y", 220)
    .text("night")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
});
