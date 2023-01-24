import { startCalendar } from "./calendar.js";
import { startBubble } from "./bubbleplot.js";
import { startChord } from "./chord.js";

var DATASET_PATH = "./dataset/df_mds.csv";
var brushed_ids = new Array();

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var colors = ["#f5f5f5", "#d8b365", "#5ab4ac"];
var textLegend = ["Mediaset", "Sky", "Other"];
var monthLegend = ["", ""];

var margin = { top: 0, right: 0, bottom: 0, left: 5 };
var width = 470 - margin.left - margin.right;
var height = 320 - margin.top - margin.bottom;

/* Axis
 x_range: [-38.7, 56.5]
 y_range: [-56.2, 35.5]
*/
var x = d3.scaleLinear().domain([-42, 58]).range([0, width]);
var y = d3.scaleLinear().domain([-58, 38]).range([height, 0]);
// Axis when zoom is applied
var newX = x;
var newY = y;

var filteredData;
var moviesFirstColor = [];
var moviesSecondColor = [];
var moviesThirdColor = [];

function startMDS(selected_info) {
  d3.csv(DATASET_PATH, function (data) {
    // If the array is empty, we are not filtering data
    if (selected_info == null) {
      createMDS(data);
      textLegend = ["Mediaset", "Sky", "Other"];
      monthLegend = ["", ""];
      createLegend();
      return;
    }

    /// Filtering data (selected_info NOT empty)

    // Filtering from Stacked
    if (selected_info.name == "stacked") {
      // Reset colors arrays
      moviesFirstColor = [];
      moviesSecondColor = [];
      moviesThirdColor = [];

      /**
       * When the user clicks on a buble on the Stacked,
       * in MDS we will have all the points belonging to
       * the network channel of the clicked channel.
       */
      var chosenData = data.filter(function (d) {
        // If in Mediaset
        if (
          mediaset.includes(selected_info.channel) &
          mediaset.includes(d.channel)
        ) {
          // The other channels in this network are colored with the third color
          if (d.channel != selected_info.channel) {
            moviesThirdColor.push(d.id);
            textLegend[2] = "Mediaset";
          }
          // This channel
          else {
            // The movies of the clicked month are colored with the first color
            if (d.month == selected_info.month) {
              moviesFirstColor.push(d.id);
              textLegend[0] = d.channel;
              monthLegend[0] = "(" + d.month + ")";
            }
            // The movies of the others months are colored with the second color
            else {
              moviesSecondColor.push(d.id);
              textLegend[1] = d.channel;
              monthLegend[1] = "(others)";
            }
          }

          return d;
        }

        // If in Sky
        if (sky.includes(selected_info.channel) & sky.includes(d.channel)) {
          // The other channels in this network are colored with the third color
          if (d.channel != selected_info.channel) {
            moviesThirdColor.push(d.id);
            textLegend[2] = "Sky";
          }
          // This channel
          else {
            // The movies of the clicked month are colored with the first color
            if (d.month == selected_info.month) {
              moviesFirstColor.push(d.id);
              textLegend[0] = d.channel;
              monthLegend[0] = "(" + d.month + ")";
            }
            // The movies of the others months are colored with the second color
            else {
              moviesSecondColor.push(d.id);
              textLegend[1] = d.channel;
              monthLegend[1] = "(others)";
            }
          }

          return d;
        }

        // If in Other
        if (other.includes(selected_info.channel) & other.includes(d.channel)) {
          // The other channels in this network are colored with the third color
          if (d.channel != selected_info.channel) {
            moviesThirdColor.push(d.id);
            textLegend[2] = "Other";
          }
          // This channel
          else {
            // The movies of the clicked month are colored with the first color
            if (d.month == selected_info.month) {
              moviesFirstColor.push(d.id);
              textLegend[0] = d.channel + "(" + d.month + ")";
            }
            // The movies of the others months are colored with the second color
            else {
              moviesSecondColor.push(d.id);
              textLegend[1] = d.channel + "(others)";
            }
          }

          return d;
        }
      });

      filteredData = chosenData;
    }

    // Manage filtering from Chord
    if (selected_info.name == "chord") {
      /**
       * If you are deselecting from Chord,
       * you need to restore the data before
       * the filtering on the genres.
       */
      if (selected_info.deselected) {
        // If already filterd from the Stacked
        if (filteredData != null) chosenData = filteredData;
        // If you start filtering from Chord
        else chosenData = data;

        createMDS(chosenData);
        createLegend();
        return;
      }

      // If already filterd from the Stacked
      if (filteredData != null) {
        var chosenData = filteredData.filter(function (d) {
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
      // Filtering only from Chord
      else {
        var chosenData = data.filter(function (d) {
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

    createMDS(chosenData);
    createLegend();
  });
}

startMDS();

function createMDS(chosenData) {
  // Reset MDS
  d3.select("#svg_mds").remove();

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

  d3.select("#mds_brushing")
    .style("position", "absolute")
    .style("right", "1px")
    .style("top", "1px");
  //   .append("label")
  //   .attr("x", "50")
  //   // .attr("transform", "translate(5150,100)")
  //   .attr("id", "prroro")
  //   .text("Show/Hide something")
  //   .style("color", "#fff")
  // .attr("transform", "translate()")
  // .insert("input")
  // .attr("type", "checkbox")
  // .attr("checked", true)
  // .style("z-index")
  // .style("position", "absolute")
  // .style("top", "10px")
  // .style("left", "20px");

  var svg = d3
    .select("#area_mds")
    .append("svg")
    .attr("id", "svg_mds")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("z-index", 10)
    .classed("svg-content", true)
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

  // Add circles
  var movies = svg
    .selectAll("circle")
    .data(chosenData)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("id", function (d) {
      return d.id;
    })
    .attr("cx", function (d) {
      return x(d.mds_x);
    })
    .attr("cy", function (d) {
      return y(d.mds_y);
    })
    .attr("r", 2)
    .style("stroke", "black")
    .style("stroke-width", "0.2")
    .style("opacity", 0.7)
    .style("pointer-events", "all")
    .style("cursor", "pointer")
    .style("fill", function (d) {
      // The following happens if you click on the Stacked
      if (
        (moviesFirstColor.length != 0) &
        (moviesSecondColor.length != 0) &
        (moviesThirdColor.length != 0)
      ) {
        // Color of the clicked channel and month
        if (moviesFirstColor.includes(d.id)) {
          return colors[0];
        }
        // Color of the clicked channel and other months
        else if (moviesSecondColor.includes(d.id)) {
          return colors[1];
        }
        // Color all others channels in network
        else if (moviesThirdColor.includes(d.id)) {
          return colors[2];
        }
      }

      // At the beginning
      if (mediaset.includes(d.channel)) {
        // return "#7fc97f";
        return colors[0];
      } else if (sky.includes(d.channel)) {
        // return "#beaed4";
        return colors[1];
      } else {
        // return "#fdc086";
        return colors[2];
      }
    })
    .on("mouseover", function (d) {
      tooltip.html(
        d.title +
          "<br>Genres: " +
          d.genres +
          "<br>channel: " +
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

  document.getElementById("mds_brushing").checked = false;
  activateBrushing();

  // Zoom
  var zoom = d3
    .zoom()
    .scaleExtent([0.8, 20]) // This control how much you can unzoom (x0.8) and zoom (x20)
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", handleZoom);

  svg
    .attr("width", "100%")
    .attr("height", "100%")
    .call(zoom)
    .on("dblclick.zoom", null);
}

function handleZoom() {
  // Get the new scale
  newX = d3.event.transform.rescaleX(x);
  newY = d3.event.transform.rescaleY(y);

  // console.log(d3.event.transform);
  d3.select("#area_mds")
    .selectAll(".bubble")
    .attr("cx", function (d) {
      return newX(d.mds_x);
    })
    .attr("cy", function (d) {
      return newY(d.mds_y);
    });
}

function activateBrushing() {
  var checkbox = document.getElementById("mds_brushing");

  checkbox.onclick = (event) => {
    if (checkbox.checked) {
      // Add brushing
      var brush = d3
        .brush() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height],
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("start", startBrushing)
        .on("brush", updateChart);

      d3.select("#svg_mds").append("g").attr("class", "brush").call(brush);
    }
    // Remove brushing
    else {
      // Reset Opacity
      d3.select("#svg_mds").selectAll(".bubble").style("opacity", 0.7);
      d3.select("#svg_mds")
        .select(".brush")
        .on("start", null)
        .on("brush", null);
      d3.select("#svg_mds").select(".brush").remove();
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

  var movies = d3.select("#area_mds").selectAll(".bubble");

  movies.classed("selected", function (d) {
    return isBrushed(extent, newX(d.mds_x), newY(d.mds_y));
  });

  updateCalendar();
}

function isBrushed(brush_coords, cx, cy) {
  var x0 = brush_coords[0][0],
    x1 = brush_coords[1][0],
    y0 = brush_coords[0][1],
    y1 = brush_coords[1][1];
  return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  // This return TRUE or FALSE depending on if the points is in the selected area
}

function updateCalendar() {
  //MEtto in brushed_ids gli elementi selezionati dal brush
  d3.selectAll(".selected").each(function () {
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

  if (brushed_ids.length != 0) {
    startCalendar(brushed_ids);

    var isBubbleEmpty = d3.select("#area_bubble").selectAll(".bubble");

    if (isBubbleEmpty) {
      var selected_info = {
        name: "mds",
        selectedIds: brushed_ids,
      };
      startBubble(selected_info);
      startChord(brushed_ids);
    }
  }
  return;
}

// Legend
function createLegend() {
  var svg = d3.select("#area_mds").select("svg");

  // Cirlces
  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 80)
    .attr("r", 6)
    .style("fill", colors[0]);
  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 115)
    .attr("r", 6)
    .style("fill", colors[1]);
  svg
    .append("circle")
    .attr("cx", width - 0.2 * width)
    .attr("cy", 150)
    .attr("r", 6)
    .style("fill", colors[2]);

  // Text
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 81)
    .text(textLegend[0])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 95)
    .text(monthLegend[0])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 115)
    .text(textLegend[1])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 130)
    .text(monthLegend[1])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 150)
    .text(textLegend[2])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
}

export { startMDS };
