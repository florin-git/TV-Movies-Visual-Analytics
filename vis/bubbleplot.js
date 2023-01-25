import { startChord } from "./chord.js";
var DATASET_PATH = "./dataset/df_main_info.csv";
var brushed_ids = new Array();

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var margin = { top: 20, right: 0, bottom: 0, left: 30 };
var width = 850 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;
var breaks = [1, 3, 6, 8];
var breaks_radius = [3.5, 5, 7, 8]; //i nuovi valori da considerare per i raggi in rapporto alla legenda
var radius_len = [4.5, 8.32, 11.48, 14.2, 16.64]; //raggio dei cerchi della legenda bubble size che e' uguale a quella dello stacked_bubble
var rad = new Array(192);

var x, y;

var filteredData;

function startBubble(selected_info) {
  d3.csv(DATASET_PATH, function (data) {
    // At the beginning you do not display anything
    if (selected_info == null) {
      createBubble([]);
      return;
    }

    if (selected_info.name == "stacked") {
      /**
       * When the user clicks on a buble on the Stacked,
       * in the Bubble plot we will have all the points belonging to
       * the network channel of the clicked channel.
       */
      var chosenData = data.filter(function (d) {
        // If in Mediaset
        if (
          mediaset.includes(selected_info.channel) &
          mediaset.includes(d.channel)
        )
          return d;

        // If in Sky
        if (sky.includes(selected_info.channel) & sky.includes(d.channel))
          return d;

        // If in Other
        if (other.includes(selected_info.channel) & other.includes(d.channel))
          return d;
      });
      filteredData = chosenData;

      // When the Bubble plot is changing,
      // we are re-creating the Chord
      var selected_ids = [];
      filteredData.forEach(function (d) {
        selected_ids.push(d.id);
      });
      startChord(selected_ids);
    }
    if (selected_info.name == "chord") {
      if (selected_info.deselected) {
        // If already filterd from the Stacked
        if (filteredData != null) chosenData = filteredData;
        // If you start filtering from Chord
        else chosenData = data;
        createBubble(chosenData);
        return;
      }
      //GIa filtrato dallo stacked
      if (filteredData != null) {
        var chosenData = filteredData.filter(function (d) {
          if (selected_info.legend) {
            return d.genres.includes(selected_info.gen1);
          }
          // Only one genre
          if (selected_info.gen1 == selected_info.gen2) {
            return d.genres == selected_info.gen1;
          }
          // Multiple genres
          else {
            return (
              d.genres.includes(selected_info.gen1) &
              d.genres.includes(selected_info.gen2)
            );
          }
        });
      }
      //Non filtrato
      else {
        var chosenData = data.filter(function (d) {
          //From legend
          if (selected_info.legend) {
            return d.genres.includes(selected_info.gen1);
          }
          // Only one genre
          if (selected_info.gen1 == selected_info.gen2) {
            return d.genres == selected_info.gen1;
          }
          // Multiple genres
          else {
            return (
              d.genres.includes(selected_info.gen1) &
              d.genres.includes(selected_info.gen2)
            );
          }
        });
      }
    }

    if (selected_info.name == "mds") {
      if (selected_info.legend_month == true) {
        console.log("from month");
        var chosenData = data.filter(function (d) {
          return (
            (selected_info.channel == d.channel) &
            (selected_info.month == d.month)
          );
        });
      } else if (selected_info.legend_others) {
        console.log("from others");
        var chosenData = data.filter(function (d) {
          return (
            (selected_info.channel == d.channel) &
            (selected_info.month != d.month)
          );
        });
      } else if (selected_info.from_network) {
        console.log("from network");
        console.log(selected_info.network);
        var chosenData = data.filter(function (d) {
          return selected_info.network.includes(d.channel);
        });
      } else {
        var chosenData = data.filter(function (d) {
          return selected_info.selectedIds.includes(d.id);
        });
      }
    }

    createBubble(chosenData);
    createLegend();
  });
}

startBubble();

function createBubble(chosenData) {
  // Reset Bubble plot
  d3.select("#svg_bubble").remove();
  d3.select("#div_bubble_brushing").remove();

  var data = chosenData;

  // append the svg object to the body of the page
  var svg = d3
    .select("#area_bubble")
    .append("svg")
    .attr("id", "svg_bubble")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (data.length == 0) {
    y = d3.scaleLinear().domain([40, 200]).range([height, 0]);
  } else {
    y = d3
      .scaleLinear()
      .domain([
        d3.min(data, function (d) {
          return Math.max(d.duration);
        }) - 10,
        d3.max(data, function (d) {
          return Math.max(d.duration);
        }) + 10,
      ])
      .range([height, 0]);
  }

  x = d3
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
    .attr("x", 705)
    .attr("y", 287)
    .text("Days")
    .attr("font-size", "15px")
    .attr("fill", "#fff");

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
    .attr("x", -25)
    .attr("y", -6)
    .text("Duration")
    .attr("font-size", "15px")
    .attr("fill", "#fff");

  // .attr("transform", "translate(50, 50)");
  // .style("position", "absolute")
  // .style("top", "10px")
  // .style("left", "20px");

  // svg
  //   .append("text")
  //   .attr("x", -25) // set x position of text
  //   .attr("y", -6) // set y position of text
  //   .text("Duration") // set the text content
  //   .attr("font-size", "15px") // set font size
  //   .attr("fill", "#fff"); // set text color

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
    .range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"]); //colori presi da Color Brewer

  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip2")
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

  // Add circles
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("id", function (d) {
      return d.id;
    })
    .attr("cx", function (d) {
      return x(d.day_number) + 0;
    })
    .attr("cy", function (d) {
      return y(d.duration);
    })
    .attr("r", function (d, id_c) {
      var value = d.rating;
      if (value < breaks_radius[0]) {
        rad[id_c] = radius_len[0];
        console.log(value, radius_len[0]);
        return radius_len[0];
      }
      for (var i = 1; i < breaks_radius.length + 1; i++) {
        if (value >= breaks_radius[i - 1] && value < breaks_radius[i]) {
          rad[id_c] = radius_len[i];
          console.log(value, radius_len[i]);
          return radius_len[i];
        }
      }
      if (value > breaks_radius[breaks_radius.length - 1]) {
        rad[id_c] = radius_len[radius_len.length];
        console.log(value, radius_len[radius_len.length - 1]);
        return radius_len[radius_len.length - 1];
      }
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
          "<br>" +
          d.genres +
          "<br>Rating: " +
          d.rating +
          "<br>Channel: " +
          d.channel +
          "<br>Month: " +
          d.month
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

  // svg
  //   .append("div")
  //   .append("input")
  //   .attr("id", "bubble_checkbox")
  //   .attr("brushing")
  //   // .attr("x", width - 0.18 * width)
  //   .attr("x", 50)
  //   .attr("y", 30)
  //   .attr("type", "checkbox");

  // var brush = svg.call(
  //   d3
  //     .brush() // Add the brush feature using the d3.brush function
  //     .extent([
  //       [0, 0],
  //       [width, height],
  //     ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  //     .on("start", startBrushing)
  //     .on("brush", updateChart)
  // );

  var div = d3
    .select("#area_bubble")
    .append("div")
    .attr("id", "div_bubble_brushing");

  var label = div
    .append("label")
    .text("Activate Brushing")
    .style("color", "#fff")
    .style("position", "absolute")
    .style("left", "600px")
    .style("top", "0");

  label
    .append("input")
    .attr("type", "checkbox")
    .attr("id", "bubble_brushing")
    .attr("checked", false)
    .style("position", "absolute")
    .style("left", "120px")
    .style("top", "0px");

  document.getElementById("bubble_brushing").checked = false;
  activateBrushing();
}

function activateBrushing() {
  var checkbox = document.getElementById("bubble_brushing");

  checkbox.onclick = (event) => {
    if (checkbox.checked) {
      // Add brushing
      var brush = d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height],
        ]) // Initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("start", startBrushing)
        .on("brush", updateChart);

      d3.select("#svg_bubble").append("g").attr("class", "brush").call(brush);
    }
    // Remove brushing
    else {
      // Reset Opacity
      d3.selectAll(".bubble").style("opacity", 0.7);
      d3.select("#svg_bubble")
        .select(".brush")
        .on("start", null)
        .on("brush", null);
      d3.select("#svg_bubble").select(".brush").remove();
    }
  };
}

function startBrushing() {
  d3.event.sourceEvent.stopPropagation();
}

// Function that is triggered when brushing is performed
function updateChart() {
  var extent = d3.event.selection;

  // Reset ids
  brushed_ids = [];

  // Reset Opacity
  d3.selectAll(".bubble").style("opacity", 0.7);

  var movies = d3.select("#area_bubble").selectAll(".bubble");

  movies.classed("selected", function (d) {
    return isBrushed(extent, x(d.day_number), y(d.duration));
  });

  updateChord();
}

function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
    x1 = brush_coords[1][0],
    y0 = brush_coords[0][1],
    y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  // This return TRUE or FALSE depending on if the points is in the selected area
}

function updateChord() {
  d3.select("#area_bubble")
    .selectAll(".selected")
    .each(function () {
      var brush_id = d3.select(this).attr("id");
      if (!brushed_ids.includes(brush_id)) {
        brushed_ids.push(brush_id);
      } // Logs the id attribute.
    });

  // Change the opacity to both MDS and Bubble
  d3.selectAll(".bubble").each(function (d) {
    if (brushed_ids.includes(d.id)) {
      this["style"]["opacity"] = 1;
    }
  });

  if (brushed_ids.length != 0) startChord(brushed_ids);

  return;
}

function createLegend() {
  var svg = d3.select("#svg_bubble");

  /// Handmade legend
  const yBottomLegend = 335;
  svg
    .append("circle")
    .attr("cx", 60)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", "#66c2a5");
  svg
    .append("circle")
    .attr("cx", 240)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", "#fc8d62");
  svg
    .append("circle")
    .attr("cx", 440)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", "#8da0cb");
  svg
    .append("circle")
    .attr("cx", 590)
    .attr("cy", yBottomLegend)
    .attr("r", 6)
    .style("fill", "#e78ac3");
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

  //per la legenda del raggio del cerchio
  //secondo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 590)
    .attr("cy", function (d) {
      return yCircle - size(d) - 145;
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
    .attr("x", xCircle + 575)
    .attr("y", function (d) {
      return yCircle - 134;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");

  //titolo legenda bubble size
  svg
    .append("text")
    .attr("x", xCircle + 575)
    .attr("y", yCircle - 230)
    .text("Rating:")
    .style("font-size", 10)
    .attr("fill", "#fff");

  //primo cerchio
  svg
    .selectAll("legend")
    .data(valuesToShow2)
    .enter()
    .append("circle")
    .attr("cx", xCircle + 590)
    .attr("cy", function (d) {
      return yCircle - 206;
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
    .attr("x", xCircle + 575)
    .attr("y", function (d) {
      return yCircle - 180;
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
    .attr("cx", xCircle + 590)
    .attr("cy", function (d) {
      return yCircle - size(d) - 105;
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
    .attr("x", xCircle + 575)
    .attr("y", function (d) {
      return yCircle - 95;
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
    .attr("cx", xCircle + 590)
    .attr("cy", function (d) {
      return yCircle - size(d) - 75;
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
    .attr("x", xCircle + 575)
    .attr("y", function (d) {
      return yCircle - 65;
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
    .attr("cx", xCircle + 590)
    .attr("cy", function (d) {
      return yCircle - size(d) - 50;
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
    .attr("x", xCircle + 575)
    .attr("y", function (d) {
      return yCircle - 40;
    })
    .text(function (d) {
      return "up to" + "" + d;
    })
    .style("font-size", 10)
    .attr("fill", "#fff");
}

export { startBubble };
