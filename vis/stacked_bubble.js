import { startMDS } from "./mds.js";
import { startBubble } from "./bubbleplot.js";
import { startChord } from "./chord.js";

var DATASET_PATH = "./dataset/channel_month_count_sharing.csv";

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var margin = { top: 5, right: 0, bottom: 25, left: 55 };
var width = 660 - margin.left - margin.right;
var height = 340 - margin.top - margin.bottom;

var clicked = new Array(110).fill(false);
var rad = new Array(110);
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
var breaks_radius = [10, 50, 100, 150];
var radius_len = [4.5, 8.32, 11.48, 14.2, 16.64];

//Read the data
d3.csv(DATASET_PATH, function (data) {
  console.log(
    d3.extent(data, function (d) {
      return Math.max(d.number_movies);
    })
  );
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
      return 14 + i * (size + 5) + size / 2;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("fill", "white")
    .text(function (d, i) {
      if (i < colors.length - 1) {
        return "up to " + breaks[i] + "%";
      } else {
        return "over " + breaks[i - 1] + "%";
      }
    })
    .attr("text-anchor", "left");

  var size_bubble = d3
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

  //per la legenda del raggio del cerchio
  //secondo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 310)
    .attr("cy", function (d) {
      return yCircle - size_bubble(d) - 150;
    })
    .attr("r", function (d) {
      return size_bubble(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr("x", xCircle + 296)
    .attr("y", function (d) {
      return yCircle - 140;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //titolo legenda bubble size
  svg
    .append("text")
    .attr("x", xCircle + 275)
    .attr("y", yCircle - 235)
    .text("Number of movies:")
    .style("font-size", 10)
    .attr("fill", "#fff");

  //primo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow2)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 310)
    .attr("cy", function (d) {
      return yCircle - 215;
    })
    .attr("r", function (d) {
      //d sarebbe il valore preso da "valuesToShow2"
      return size_bubble(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow2)
    .enter()
    .append("text")
    .attr("x", xCircle + 296)
    .attr("y", function (d) {
      return yCircle - 185;
    })
    .text(function (d) {
      return "over " + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //terzo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow3)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 310)
    .attr("cy", function (d) {
      return yCircle - size_bubble(d) - 110;
    })
    .attr("r", function (d) {
      return size_bubble(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow3)
    .enter()
    .append("text")
    .attr("x", xCircle + 296)
    .attr("y", function (d) {
      return yCircle - 100;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //quarto cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow4)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 310)
    .attr("cy", function (d) {
      return yCircle - size_bubble(d) - 75;
    })
    .attr("r", function (d) {
      return size_bubble(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow4)
    .enter()
    .append("text")
    .attr("x", xCircle + 296)
    .attr("y", function (d) {
      return yCircle - 60;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //quinto cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow5)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 310)
    .attr("cy", function (d) {
      return yCircle - size_bubble(d) - 45;
    })
    .attr("r", function (d) {
      return size_bubble(d);
    })
    .style("fill", "grey")
    .attr("stroke", "white");

  svg
    .selectAll("legend")
    .data(valuesToShow5)
    .enter()
    .append("text")
    .attr("x", xCircle + 296)
    .attr("y", function (d) {
      return yCircle - 30;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //tooltip
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip3")
    .style("background-color", "#636363")
    .style("color", "white")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("font-size", "20px")
    // .style("max-width", "130px")
    // .style("width", "130px")
    .style("overflow", "hidden")
    .text("");

  // Add dots
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("id", function (d) {
      var bubble_id = "bubble_" + d.id;
      return bubble_id;
    })
    .attr("cx", function (d) {
      return x(d.channel) + 25.4;
    })
    .attr("cy", function (d) {
      return y(d.month) + 20.5;
    })
    .attr("r", function (d, id_c) {
      var value = d.number_movies;
      if (value < breaks_radius[0]) {
        rad[id_c] = radius_len[0];
        return radius_len[0];
      }
      for (var i = 1; i < breaks_radius.length; i++) {
        if (value >= breaks_radius[i - 1] && value < breaks_radius[i]) {
          rad[id_c] = radius_len[i];
          return radius_len[i];
        }
      }
      if (value > breaks_radius[breaks_radius.length - 1]) {
        rad[id_c] = radius_len[radius_len.length];
        return radius_len[breaks_radius.length];
      }
    })
    .attr("fill", function (d, i) {
      var value = d.sharing;
      if (value < breaks[0]) {
        return colors[0];
      }
      for (i = 1; i < breaks.length + 1; i++) {
        if (value >= breaks[i - 1] && value < breaks[i]) {
          return colors[i];
        }
      }
      if (value > breaks[breaks.length - 1]) {
        return colors[breaks.length];
      }
    })
    .style("opacity", "0.7")
    .style("cursor", "pointer")
    .attr("stroke", "black")
    .on("mouseover", function (d) {
      this["style"]["stroke"] = "#fff";
      this["style"]["stroke-width"] = 1.5;
      this["style"]["opacity"] = 2;
      // this.style("stroke", "#fff");
      // this.style("stroke-width", 1.5);
      // this.style("opacity", 2);

      var radius = this["style"]["r"];
      this["style"]["r"] = parseInt(radius) * 1.2;
      console.log(radius);
      tooltip.html(
        "Number of movies: " +
          d.number_movies +
          "<br>Sharing: " +
          parseFloat(d.sharing).toFixed(3) +
          "%"
      );
      tooltip.style("visibility", "visible");
      for (var k = 0; k < clicked.length; k++) {
        if (clicked[k] == true) {
          return;
        }
      }
      return;
    })
    .on("mousemove", function (d) {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function (d, id_c) {
      if (!clicked[id_c]) {
        this["style"]["stroke"] = "none";
        this["style"]["stroke-width"] = 0.8;
        this["style"]["opacity"] = 0.7;

        this["style"]["r"] = rad[id_c];
      }
      return tooltip.style("visibility", "hidden");
    })
    .on("click", function (d, id_c) {
      if (!clicked[id_c]) {
        console;
        for (var k = 0; k < clicked.length; k++) {
          if (clicked[k] == true) {
            svg
              .select("#bubble_" + k)
              .style("r", rad[k])
              .style("stroke-width", 0.8);
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
        var radius = this["style"]["r"];
        this["style"]["r"] = parseInt(radius) * 1.3;
      } else {
        // Reset all clicks
        clicked.fill(false);
        this["style"]["stroke-width"] = 0.8;
        this["style"]["r"] = rad[id_c];

        // Reset all graphs
        startBubble();
        startChord();
        startMDS();
        updateCalendar("All_Channels");
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

// The calendar is updated by changing the value (the channel) of the selector
function updateCalendar(channel) {
  // Spaces in selectors are automatically converted to "_" in JS.
  // Thus, I will replace spaces with "_"

  if (
    mediaset.includes(channel) |
    sky.includes(channel) |
    other.includes(channel)
  ) {
    document.getElementById("channel_selector").value = channel.replaceAll(
      " ",
      "_"
    );
    var changeEvent = new Event("change");
    document.getElementById("channel_selector").dispatchEvent(changeEvent);
  }

  var network;
  if (mediaset.includes(channel)) network = "Mediaset";
  else if (sky.includes(channel)) network = "Sky";
  else if (other.includes(channel)) network = "Other";
  else network = "All_Channels";

  network.replaceAll(" ", "_");

  document.getElementById("network_selector").value = network;
  var changeEvent = new Event("change");
  document.getElementById("network_selector").dispatchEvent(changeEvent);
}
