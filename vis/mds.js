import { startCalendar } from "./calendar.js";

var DATASET_PATH = "./dataset/df_mds.csv";
var brushed_ids = new Array();

var margin = { top: 0, right: 0, bottom: 0, left: 5 };
var width = 470 - margin.left - margin.right;
var height = 340 - margin.top - margin.bottom;

/* Axis
 x_range: [-38.7, 56.5]
 y_range: [-56.2, 35.5]
*/
var x = d3.scaleLinear().domain([-42, 58]).range([0, width]);
var y = d3.scaleLinear().domain([-58, 38]).range([height, 0]);

var sky = ["Sky Drama", "Sky Due", "Sky Suspense", "Sky Comedy", "Sky Action"];
var mediaset = ["Italia 1", "Iris", "Rete 4", "Cine34"];
var other = ["Cielo"];

var filterdData;

function startMDS(selected_info) {
  d3.csv(DATASET_PATH, function (data) {
    // If the array is empty, we are not filtering data
    if (selected_info == null) {
      createMDS(data);
      createLegend();
      return;
    }

    /// Filtering data (selected_info NOT empty)

    // Filtering from Stacked
    if (selected_info.name == "stacked") {
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
        )
          return d;

        // If in Sky
        if (sky.includes(selected_info.channel) & sky.includes(d.channel))
          return d;

        // If in Other
        if (other.includes(selected_info.channel) & other.includes(d.channel))
          return d;
      });

      filterdData = chosenData;
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
        if (filterdData != null) chosenData = filterdData;
        // If you start filtering from Chord
        else chosenData = data;

        createMDS(chosenData);
        createLegend();
        return;
      }

      // If already filterd from the Stacked
      if (filterdData != null) {
        var chosenData = filterdData.filter(function (d) {
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

  var svg = d3
    .select("#area_mds")
    .append("svg")
    .attr("id", "svg_mds")
    .attr("width", "100%")
    .attr("height", "100%")
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

  // Add brushing
  var brush = svg.call(
    d3
      .brush() // Add the brush feature using the d3.brush function
      .extent([
        [0, 0],
        [width, height],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("start", startBrushing)
      .on("brush", updateChart)
  );
}

function startBrushing() {
  console.log("START");
  d3.event.sourceEvent.stopPropagation();
}

// Function that is triggered when brushing is performed
function updateChart() {
  var extent = d3.event.selection;

  // Reset ids
  brushed_ids = [];

  var movies = d3.select("#area_mds").selectAll(".bubble");

  movies.classed("selected", function (d) {
    return isBrushed(extent, x(d.mds_x), y(d.mds_y));
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

  if (brushed_ids.length != 0) startCalendar(brushed_ids);

  return;
}

// Legend
function createLegend() {
  var svg = d3.select("#area_mds").select("svg");

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
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 111)
    .text("Mediaset")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  svg
    .append("text")
    .attr("x", width - 0.18 * width)
    .attr("y", 141)
    .text("Other")
    .style("fill", "#fff")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
}

export { startMDS };
