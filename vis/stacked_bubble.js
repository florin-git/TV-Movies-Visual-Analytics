import { startMDS } from "./mds.js";
import { startBubble } from "./bubbleplot.js";

var DATASET_PATH = "./dataset/channel_month_count_sharing.csv";

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var margin = { top: 5, right: 0, bottom: 25, left: 55 };
var width = 660 - margin.left - margin.right;
var height = 340 - margin.top - margin.bottom;

var clicked = new Array(120).fill(false);
var rad = new Array(120);

// append the svg object to the body of the page
var svg = d3
  .select("#area_stacked")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var keys = ["1", "2", "3", "4", "5"];
var colors = ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"];
var breaks = [0.5, 1, 1.5, 3];


//Read the data
d3.csv(DATASET_PATH, function (data) {
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
      "Sky Suspense",
      "Sky Comedy",
      "Sky Action",
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
    .style("fill", "#fff");

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

  svg.append("g").call(yAxis).selectAll("text").style("fill", "#fff");
  svg.selectAll("line").style("stroke", "#fff");
  svg.selectAll("path").style("stroke", "#fff");

  var radiusNumberMovies = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.number_movies);
      })
    )
    .range([1, 17]);

  /*var colorScale = d3
    .scaleSequential()
    .domain(
      d3.extent(data, function (d) {
        return Math.max(d.sharing);
      })
    )
    .interpolator(d3.interpolatePuRd);*/

  var colorScale = d3.scaleOrdinal().domain(keys).range(colors); //colorare i pallini del grafico

  //per legenda del grafico: quadratini
  var size = 10;
  svg
    .selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 510)
    .attr("y", function (d, i) {
      return 10 + i * (size + 5);
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .attr("fill", function (d) {
      return colorScale(d);
    });

  //scritte per i quadratini della legenda
  svg
    .selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 510 + size * 1.2)
    .attr("y", function (d, i) {
      return 14+ i * (size + 5) + size / 2;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("fill","white")
    .text(function (d,i) {
      if(i < colors.length - 1){
        return "up to " + breaks[i] + "%";
      } else {
        return "over " + breaks[i - 1] + "%";
      }
    })
    .attr("text-anchor", "left")
  
  //tooltip
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

  // Add dots
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", function (d) {
      var bubble_id = "bubble_" + d.id;
      rad[d.id] = radiusNumberMovies(d.number_movies);
      return bubble_id;
    })
    .attr("cx", function (d) {
      return x(d.channel) + 25.4;
    })
    .attr("cy", function (d) {
      return y(d.month) + 20.5;
    })
    .attr("r", function (d) {
      return radiusNumberMovies(d.number_movies);
    })
    .attr("fill", function (d,i) {
      var value=d.sharing;
      if (value < breaks[0]) {
        return colors[0];
      }
      for (i = 0; i < breaks.length + 1; i++) {
        if (value >= breaks[i] && value < breaks[i + 1]) {
          return colors[i];
        }
      }
      if (value > breaks.length - 1) {
        return colors[breaks.length];
      }
     
    })
    .style("opacity", "0.7")
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .on("mouseover", function (d) {
      d3.select(this)
        .style("stroke", "#fff")
        .style("stroke-width", 1.5)
        .style("opacity", 2);
      this["style"]["r"] = radiusNumberMovies(d.number_movies) * 2;
      tooltip.html(
        "Number of movies :" + d.number_movies + "<br>Sharing: " + d.sharing +"%"
      );
      tooltip.style("visibility", "visible");
      for (var k = 0; k < clicked.length; k++) {
        if (clicked[k] == true) {
          return;
        }
      }
      this["style"]["r"] = radiusNumberMovies(d.number_movies) * 2;
      d3.select(this).style("stroke", "black").style("stroke-width", 1.5).style("opacity", 2)
      return;
    })
    .on("mousemove", function (d) {
      //this["style"]["r"] = radiusNumberMovies(d.number_movies);
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function (d, id_c) {
      if (!clicked[id_c]) {
        d3.select(this).style("stroke-width", 0.8);
        this["style"]["r"] = radiusNumberMovies(d.number_movies);
      }
      return tooltip.style("visibility", "hidden");
    })
    .on("click", function (d, id_c) {
      if (!clicked[id_c]) {
        for (var k = 0; k < clicked.length; k++) {
          if (clicked[k] == true) {
            svg.select("#bubble_" + k).style("r", rad[k]);
            clicked[k] = false;
          }
        }
        //Gestione bubbleplot
        updateBubble(d);
        //Gestione mds
        updateMDS(d);
        //Gestione calendar
        updateCalendar(d.channel);
        //Has been clicked?
        clicked[id_c] = true;
        this["style"]["r"] = radiusNumberMovies(d.number_movies) * 2;
      } else {
        for (var k = 0; k < clicked.length; k++) {
          clicked[k] = false;
        }
        d3.select("#area_bubble")
          .selectAll(".bubble")
          .style("display", "block");
        d3.select("#area_mds").selectAll(".bubble").style("display", "block");
        d3.select(this).style("stroke-width", 0.8);
        this["style"]["r"] = radiusNumberMovies(d.number_movies);
      }
    });
});

function updateBubble(d) {
  var selected_info = {
    name: "stacked",
    channel: d.channel,
  };
  startBubble(selected_info);
}

function updateMDS(d) {
  var selected_info = {
    name: "stacked",
    channel: d.channel,
    month: d.month,
  };

  startMDS(selected_info);
}

// function removeCircles(elementsToRemove) {
//   elementsToRemove.selectAll(".remove").remove();
// }

// The calendar is updated by changing the value (the channel) of the selector
function updateCalendar(channel) {
  // Spaces in selectors are automatically converted to "_" in JS.
  // Thus, I will replace spaces with "_"

  document.getElementById("channel_selector").value = channel.replaceAll(
    " ",
    "_"
  );
  var changeEvent = new Event("change");
  document.getElementById("channel_selector").dispatchEvent(changeEvent);

  var network;
  if (mediaset.includes(channel)) network = "Mediaset";
  else if (sky.includes(channel)) network = "Sky";
  else network = "Other";

  network.replaceAll(" ", "_");

  document.getElementById("network_selector").value = network;
  var changeEvent = new Event("change");
  document.getElementById("network_selector").dispatchEvent(changeEvent);
}
