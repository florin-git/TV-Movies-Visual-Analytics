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
  .attr("height", height + margin.top + margin.bottom + 50)
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

  var radiusRating = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.rating);
      })
    )
    .range([3.5, 10]);

  var myColor = d3
    .scaleOrdinal()
    .domain(["mattina", "pomeriggio", "sera", "notte"])
    .range(d3.schemeSet2); //funzione che mette i colori alla legenda

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

  // The scale you use for bubble size. Il raggio del pallino della legenda
  var size = d3
    .scaleSqrt()
    .domain([1, 100]) // What's in the data
    .range([2, 100]); // Size in pixel

  //variabili che servono per la legenda bubble size
  var valuesToShow = [4.5];
  var valuesToShow2 = [5.5];
  var valuesToShow3 = [3.5];
  var valuesToShow4 = [2.5];
  var valuesToShow5 = [1.5];

  var xCircle = 230;
  var xLabel = 380;
  var yCircle = 330;

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
      return radiusRating(d.rating);
    })
    .style("fill", function (d) {
      return myColor(d.daytime);
    })
    .style("opacity", "0.7")
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .on("mouseover", function (d) {
      tooltip.html(
        d.title +
          "<br> Rating: " +
          d.rating +
          "<br>" +
          d.genres +
          "duration <br>" +
          d.duration +
          "channel <br>" +
          d.channel
      );
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
  const yBottomLegend = 315
  svg
    .append("circle")
    .attr("cx", 60)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[0]);
  svg
    .append("circle")
    .attr("cx", 240)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[1]);
  svg
    .append("circle")
    .attr("cx", 440)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[2]);
  svg
    .append("circle")
    .attr("cx", 590)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", d3.schemeSet2[3]);
  svg
    .append("text")
    .attr("x", 70)
    .attr("y", yBottomLegend)
    .text("morning")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 250)
    .attr("y", yBottomLegend)
    .text("afternoon")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 450)
    .attr("y", yBottomLegend)
    .text("evening")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", 600)
    .attr("y", yBottomLegend)
    .text("night")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  //per la legenda del raggio del cerchio
  //secondo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 538)
    .attr("cy", function (d) {
      return yCircle - size(d) - 200;
    })
    .attr("r", function (d) {
      return size(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr("x", xCircle + 532)
    .attr("y", function (d) {
      return yCircle - 190;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //titolo legenda bubble size
  svg
    .append("text")
    .attr("x", xCircle + 525)
    .attr("y", yCircle - 290)
    .text("Rating:")
    .style("font-size", 10)
    .attr("fill", "#fff");

  //primo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow2)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 538)
    .attr("cy", function (d) {
      return yCircle - 260;
    })
    .attr("r", function (d) {
      //d sarebbe il valore preso da "valuesToShow2"
      return size(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow2)
    .enter()
    .append("text")
    .attr("x", xCircle + 532)
    .attr("y", function (d) {
      return yCircle - 230;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //terzo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow3)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 538)
    .attr("cy", function (d) {
      return yCircle - size(d) - 160;
    })
    .attr("r", function (d) {
      return size(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow3)
    .enter()
    .append("text")
    .attr("x", xCircle + 532)
    .attr("y", function (d) {
      return yCircle - 150;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //quarto cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow4)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 538)
    .attr("cy", function (d) {
      return yCircle - size(d) - 130;
    })
    .attr("r", function (d) {
      return size(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow4)
    .enter()
    .append("text")
    .attr("x", xCircle + 532)
    .attr("y", function (d) {
      return yCircle - 121;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //quinto cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow5)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 538)
    .attr("cy", function (d) {
      return yCircle - size(d) - 110;
    })
    .attr("r", function (d) {
      return size(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow5)
    .enter()
    .append("text")
    .attr("x", xCircle + 532)
    .attr("y", function (d) {
      return yCircle - 100;
    })
    .text(function (d) {
      return d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");
});
