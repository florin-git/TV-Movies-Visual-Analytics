// // set the dimensions and margins of the graph
// var margin = {top: 10, right: 20, bottom: 80, left: 50},
//     width =  700
//     height = 520 - margin.top - margin.bottom;

var margin = { top: 5, right: 10, bottom: 42, left: 30 },
  width = 690 - margin.left - margin.right,
  height = 330 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#")
  .append("svg")
  .attr("width", "100%")
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("./dataset/df_final_with_additional_info.csv", function (data) {
  // Add X axis
  var x = d3
    .scaleBand()
    .domain([
      "Cielo",
      "Italia 1",
      "Iris",
      "Rete 4",
      "Cine34",
      "Sky Drama",
      "Sky Due",
      "Sky Comedy",
      "Sky Action",
    ])
    .range([0, 500]);

  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-15)")
    .style("text-anchor", "end")
    .style("font-size", 10)
    .style("fill", "#00000");

  // Add Y axis
  var y = d3.scaleLinear().domain([0, 260]).range([height, 0]);

  svg.append("g").call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3
    .scaleOrdinal()
    .domain(["duration_mean", "duration_with_advertising_mean"])
    .range(["#bebada", "#8dd3c7"]);

  var stackedData = d3
    .stack()
    .keys(["duration_mean", "duration_with_advertising_mean"])(data);

  svg
    .append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function (d) {
      return d;
    })
    .enter()
    .append("rect")
    .filter(function (d) {
      return (
        d.data.month == "aprile" &&
        (d.data.channel == "Cielo" ||
          d.data.channel == "Italia 1" ||
          d.data.channel == "Iris" ||
          d.data.channel == "Rete 4" ||
          d.data.channel == "Cine34" ||
          d.data.channel == "Sky Drama" ||
          d.data.channel == "Sky Due" ||
          d.data.channel == "Sky Comedy" ||
          d.data.channel == "Sky Action")
      );
    })
    .attr("x", function (d) {
      return x(d.data.channel) + 10;
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", 30);

  //Month selected
  svg
    .data(data)
    .append("text")
    .attr("x", 510)
    .attr("y", 30)
    .text(function (d) {
      return "Month : " + d.month;
    })
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  // Handmade legend
  svg
    .append("circle")
    .attr("cx", 500)
    .attr("cy", 130)
    .attr("r", 6)
    .style("fill", "#bebada");
  svg
    .append("circle")
    .attr("cx", 500)
    .attr("cy", 160)
    .attr("r", 6)
    .style("fill", "#8dd3c7");
  svg
    .append("text")
    .attr("x", 510)
    .attr("y", 130)
    .text("Mean duration ")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 510)
    .attr("y", 160)
    .text("Mean duration")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 510)
    .attr("y", 180)
    .text("with adv")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
});
