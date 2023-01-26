import { startCalendar } from "./calendar.js";
import { startBubble } from "./bubbleplot.js";
import { startChord } from "./chord.js";

var DATASET_PATH = "./dataset/df_mds.csv";
var brushed_ids = new Array();
var clicked = [false, false, false];

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var colors = ["#f5f5f5", "#d8b365", "#5ab4ac"];
var textLegend = ["Mediaset", "Sky", "Other"];
var monthLegend = ["", "", ""];

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
      monthLegend = ["", "", ""];
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
            textLegend[2] = "Network's";
            monthLegend[2] = "Channels";
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
            textLegend[2] = "Network's";
            monthLegend[2] = "Channels";
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
            textLegend[2] = "Network's";
            monthLegend[2] = "Channels";
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
          // One genre from legend, so we use includes
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
      // Filtering only from Chord
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
    createMDS(chosenData);
    createLegend();
  });
}

startMDS();

function createMDS(chosenData) {
  // Reset MDS
  d3.select("#svg_mds").remove();

  d3.select("#tooltip_mds").remove();

  //tooltip and zoom
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip_mds")
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

  var svg = d3
    .select("#area_mds")
    .append("svg")
    .attr("id", "svg_mds")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("z-index", 10)
    .classed("svg-content", true)
    .style("cursor", "grabbing")
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
      tooltip.html(d.title + " (" + d.year + ")");

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
        ]) // initialise the brush area: start at 0,0 and finishes at width,height
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

    var selected_info = {
      name: "mds",
      type: "brush",
      selectedIds: brushed_ids,
    };
    startBubble(selected_info);
    startChord(brushed_ids);
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

  /// Text

  // First
  svg
    .append("rect")
    .attr("id", "firstColor")
    .attr("width", 82)
    .attr("height", 28)
    .attr("x", width - 0.18 * width)
    .attr("y", 73);

  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 81)
    .text(textLegend[0])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .style("cursor", "pointer")
    .attr("alignment-baseline", "middle")
    .on("click", function () {
      if (clicked[0]) {
        // Already clicked
        clicked[0] = false;
        d3.select("#firstColor").style("fill", "black");
        // true: deselected the text legend
        updateBubble_plot_legend_month(true, textLegend[0], monthLegend[0]);
      } else {
        clicked[0] = true;
        d3.select("#secondColor").style("fill", "black");
        d3.select("#thirdColor").style("fill", "black");
        updateBubble_plot_legend_month(false, textLegend[0], monthLegend[0]);
        d3.select("#firstColor").style("fill", "rgb(141, 111, 199)");
      }
    });
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 95)
    .text(monthLegend[0])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .style("cursor", "default")
    .attr("alignment-baseline", "middle");

  // Second
  svg
    .append("rect")
    .attr("id", "secondColor")
    .attr("width", 83)
    .attr("height", 28)
    .attr("x", width - 0.18 * width)
    .attr("y", 107);
  // .style("fill", "rgb(141, 111, 199)");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 115)
    .text(textLegend[1])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .style("cursor", "pointer")
    .attr("alignment-baseline", "middle")
    .on("click", function () {
      if (clicked[1]) {
        // Already clicked
        clicked[1] = false;
        d3.select("#secondColor").style("fill", "black");
        // true: deselected the text legend
        updateBubble_plot_legend_others(true, textLegend[1], monthLegend[0]);
      } else {
        clicked[1] = true;
        d3.select("#firstColor").style("fill", "black");
        d3.select("#thirdColor").style("fill", "black");
        updateBubble_plot_legend_others(false, textLegend[1], monthLegend[0]);
        d3.select("#secondColor").style("fill", "rgb(141, 111, 199)");
      }
    });
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 130)
    .text(monthLegend[1])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle")
    .style("cursor", "default");

  // Third
  svg
    .append("rect")
    .attr("id", "thirdColor")
    .attr("width", 83)
    .attr("height", 28)
    .attr("x", width - 0.18 * width)
    .attr("y", 142);
  // .style("fill", "rgb(141, 111, 199)");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 150)
    .text(textLegend[2])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .style("cursor", "pointer")
    .attr("alignment-baseline", "middle")
    .on("click", function () {
      if (clicked[2]) {
        // Already clicked
        clicked[2] = false;
        d3.select("#thirdColor").style("fill", "black");
        // true: deselected the text legend
        updateBubble_plot_legend_networks(true, textLegend[0]);
      } else {
        clicked[2] = true;
        d3.select("#firstColor").style("fill", "black");
        d3.select("#secondColor").style("fill", "black");
        updateBubble_plot_legend_networks(false, textLegend[0]);
        d3.select("#thirdColor").style("fill", "rgb(141, 111, 199)");
      }
    });

  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 165)
    .text(monthLegend[2])
    .style("fill", "#fff")
    .style("font-size", "15px")
    .style("cursor", "default")
    .attr("alignment-baseline", "middle");
}

// Clicked on the first text of the legend
function updateBubble_plot_legend_month(deselected, channelOrNetwork, month) {
  month = month.replace("(", "");
  month = month.replace(")", "");

  var type = "network";

  if (channelOrNetwork == "Mediaset") {
    channelOrNetwork = mediaset;
  } else if (channelOrNetwork == "Sky") {
    channelOrNetwork = sky;
  } else if (channelOrNetwork == "Other") {
    channelOrNetwork = other;
  }
  // It was clicked on the Stacked
  else type = "channel";

  var selected_info = {
    name: "mds",
    type: type,
    deselected: deselected,
    channelOrNetwork: channelOrNetwork,
    month: month,
    legend_month: true,
  };

  startBubble(selected_info);
}

// Clicked on the second text of the legend
function updateBubble_plot_legend_others(deselected, channelOrNetwork, month) {
  month = month.replace("(", "");
  month = month.replace(")", "");

  var type = "network";

  var type;
  if (channelOrNetwork == "Mediaset") {
    channelOrNetwork = mediaset;
  } else if (channelOrNetwork == "Sky") {
    channelOrNetwork = sky;
  } else if (channelOrNetwork == "Other") {
    channelOrNetwork = other;
  }
  // It was clicked on the Stacked
  else type = "channel";

  var selected_info = {
    name: "mds",
    type: type,
    deselected: deselected,
    channelOrNetwork: channelOrNetwork,
    month: month,
    legend_month: false,
    legend_others: true,
  };
  startBubble(selected_info);
}
function updateBubble_plot_legend_networks(deselected, channel) {
  console.log(channel);
  var type = "channel";
  var network, channelOrNetwork;

  // It was clicked on the Stacked
  if (mediaset.includes(channel)) {
    network = mediaset;
  } else if (sky.includes(channel)) {
    network = sky;
  } else if (other.includes(channel)) {
    network = other;
  }

  // At the beginning if no clicked on Stacked
  else {
    type = "network";
    channelOrNetwork = other;
  }
  var selected_info = {
    name: "mds",
    type: type,
    deselected: deselected,
    channel: channel,
    network: network,
    channelOrNetwork: channel,
    legend_month: false,
    legend_others: false,
  };
  startBubble(selected_info);
}

export { startMDS };
