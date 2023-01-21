var DATASET_PATH = "./dataset/df_mds.csv";

// var margin_top = 5,
//   margin_right = 2,
//   margin_bottom = 1,
//   margin_left = 2;
// var margin_top = 0,
//   margin_right = 0,
//   margin_bottom = 0,
//   margin_left = 0;

// var width = 450;
// var height = 350;

var margin = { top: 0, right: 0, bottom: 0, left: 5 };
var width = 470 - margin.left - margin.right;
var height = 355 - margin.top - margin.bottom;

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];

d3.csv(DATASET_PATH, function (data) {
  //tooltip and zoom
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip1")
    .style("background-color", "#636363")
    .style("color", "white")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("font-size", "20px")
    .text("");
  ///

  var svg = d3
    .select("#area_mds")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .classed("svg-content", true)
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");


  // x_range: [-38.7, 56.5]
  // y_range: [-56.2, 35.5]

  var x = d3.scaleLinear().domain([-42, 58]).range([0, width]);
  var y = d3.scaleLinear().domain([-58, 38]).range([height, 0]);


  // var xAxis = svg
  //   .append("g")
  //   .attr("class", "axis-x")
  //   .attr("transform", "translate(1," + height + ")")
  //   .call(d3.axisBottom(x).tickValues([]))
  //   .attr("font-size", "6px");

  // var yAxis = svg
  //   .append("g")
  //   .attr("class", "axis axis--y lightfill")
  //   .attr("transform", "translate(1," + 0 + ")")
  //   .call(d3.axisLeft(y).tickValues([]))
  //   .attr("font-size", "6px");

  // Add circles
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", function (d) {
      return x(d.mds_x);
    })
    .attr("cy", function (d) {
      return y(d.mds_y);
    })
    .attr("r", 2)
    .style("stroke", "black")
    .style("stroke-width", "0.2")
    .style("opacity", 0.8)
    .style("pointer-events", "all")
    .style("cursor", "pointer")
    .style("fill", function (d) {
      if (sky.includes(d.channel)) {
        return "#7fc97f";
      } else if (mediaset.includes(d.channel)) {
        return "#beaed4";
      } else {
        return "#fdc086";
      }
    })
    .on("mouseover", function (d) {
      tooltip.html(d.title);
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

  //legend

  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 80)
    .attr("r", 6)
    .style("fill", "#7fc97f");
  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 110)
    .attr("r", 6)
    .style("fill", "#beaed4");
  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 140)
    .attr("r", 6)
    .style("fill", "#fdc086");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 81)
    .text("Sky")
    .style('fill', '#fff')
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 111)
    .text("Mediaset")
    .style('fill', '#fff')
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 141)
    .text("Other")
    .style('fill', '#fff')
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
});
