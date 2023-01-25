import { startBubble } from "./bubbleplot.js";
import { startMDS } from "./mds.js";

var DATASET_PATH = "./dataset/df_main_info.csv";
var genres = new Array();

var p,
  stringhe = new Array();
var clicked = new Array().fill(false);
var clicked_legend;
var clicked_legend = new Array(genres.length).fill(false);

var dict = {
  Documentary: 0,
  Western: 1,
  Adventure: 2,
  Fantasy: 3,
  Horror: 4,
  "Sci-Fi": 5,
  Comedy: 6,
  Drama: 7,
  Thriller: 8,
  Action: 9,
  Romance: 10,
  Crime: 11,
};
var genres = [
  "Documentary",
  "Western",
  "Adventure",
  "Fantasy",
  "Horror",
  "Sci-Fi",
  "Comedy",
  "Drama",
  "Thriller",
  "Action",
  "Romance",
  "Crime",
];
var reverse_dict = {};
for (var i = 0; i < genres.length; i++) {
  reverse_dict[i] = genres[i];
}

var colors = {
  Documentary: "#8dd3c7",
  Western: "#ffffb3",
  Adventure: "#bebada",
  Fantasy: "#fb8072",
  Horror: "#80b1d3",
  "Sci-Fi": "#fdb462",
  Comedy: "#b3de69",
  Drama: "#fccde5",
  Thriller: "#d9d9d9",
  Action: "#bc80bd",
  Romance: "#ccebc5",
  Crime: "#ffed6f",
};

//start chord
function startChord(brushed_ids) {
  d3.csv(DATASET_PATH, function (data) {
    if (brushed_ids != null) {
      var chosenData = data.filter(function (d) {
        return brushed_ids.includes(d.id);
      });
      genres = [];
      //Creo la lista dei generi dell'elemento selezionato
      chosenData.forEach(function (d) {
        var genres_extracted = d.genres.split(",");
        for (var i = 0; i < genres_extracted.length; i++) {
          if (!genres.includes(genres_extracted[i])) {
            genres.push(genres_extracted[i]);
          }
        }
      });
      console.log("Questi sono i generi del nuovo chord " + genres);
      //Creo dizionario per i generi
      dict = {};
      reverse_dict = {};
      for (var i = 0; i < genres.length; i++) {
        dict[genres[i]] = i;
        reverse_dict[i] = genres[i];
      }
    } else var chosenData = data;

    // Create matrix for paths
    var matrix = new Array(genres.length);
    for (var i = 0; i < matrix.length; i++) {
      matrix[i] = new Array(genres.length).fill(0);
    }

    // Get the list of genres
    chosenData.forEach(function (d) {
      var extracted = d.genres.split(",");
      for (var i = 0; i < extracted.length; i++) {
        for (var j = 0; j < extracted.length; j++) {
          matrix[dict[extracted[i]]][dict[extracted[j]]] += 1;
        }
      }
    });

    console.log(matrix)
    clicked_legend = new Array(genres.length).fill(false);
    createChord(chosenData, matrix, reverse_dict, genres);
  });
}

function createChord(data, matrix, reverse_dict, genres) {
  d3.select("#area_chord").select("svg").remove();
  const svg = d3
    .select("#area_chord")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(180,173)");

  //tooltip
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip5")
    .style("background-color", "#636363")
    .style("color", "white")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("font-size", "20px")
    .text("");
  //end tooltip

  const res = d3
    .chord()
    .padAngle(0.05) // padding between entities (black arc)
    .sortSubgroups(d3.descending)(matrix);

  svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function (d) {
      return d.groups;
    })
    .enter()
    .append("g")
    .attr("class", "chord")

    //al momento evidenzia soltanto la parte in alto degli archi ma non tutto il collegamento. Che classe devo usare??
    .append("path")
    .style("fill", function (d, i) {
      return colors[reverse_dict[i]];
    })
    .style("stroke", "white")
    .attr("d", d3.arc().innerRadius(150).outerRadius(160));

  const group = svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data((d) => d.groups)
    .enter();

  group
    .append("g")
    .append("path")
    .style("fill", "grey")
    .style("stroke", "white")
    .style("stroke-width", 0.01)
    .attr("d", d3.arc().innerRadius(140).outerRadius(150));

  // Add one gradient for each link
  var gradient = svg
    .append("defs")
    .selectAll("radialGradient")
    .data(res)
    .enter()
    .append("radialGradient")
    .attr("id", function (d) {
      return "gradient-" + d.source.index + "-" + d.target.index;
    })
    .each(function (d) {
      var centerAngle = (d.source.endAngle - d.source.startAngle) / 2;
      centerAngle += d.source.startAngle;
      const radius = 0.5;

      d3.select(this)
        .attr("cx", function () {
          return Math.sin(centerAngle) * radius + 0.5;
        })
        .attr("cy", function () {
          return -Math.cos(centerAngle) * radius + 0.5;
        })
        .attr("r", 1);
    });

  gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", "0%")
    .attr("stop-color", function (d) {
      return colors[genres[d.source.index]];
    })
    .attr("stop-opacity", 1);

  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", "100%")
    .attr("stop-color", function (d) {
      return colors[genres[d.target.index]];
    })
    .attr("stop-opacity", 1);

  var k = 0;

  //PATH !!!!
  svg
    .datum(res)
    .append("g")
    .selectAll("path")
    .data((d) => d)
    .enter()
    .append("path")
    .attr("d", d3.ribbon().radius(150))
    .attr("id", function (d, k) {
      k += 1;
      return (
        genres[d.source.index] +
        "_" +
        genres[d.target.index] +
        "_path_" +
        (k - 1)
      );
    })
    .style("cursor", "pointer")
    .style("fill", function (d, k) {
      return "url(#gradient-" + d.source.index + "-" + d.target.index + ")";
    })
    //evidenza i path
    .on("mouseover", function (d) {
      this["style"]["stroke"] = "#000";
      if (genres[d.source.index] == genres[d.target.index]) {

        // console.log(matrix[d.source.index][d.source.index])
        tooltip.html(
          genres[d.source.index] +
            "<br> Number of broadcast movies: <br>" +
            matrix[d.source.index][d.source.index] +
            " out of " +
            data.length
        );
      } else {
        tooltip.html(
          genres[d.source.index] +
            ", " +
            genres[d.target.index] +
            "<br> Number of broadcast movies: <br>" +
            matrix[d.source.index][d.target.index] +
            " out of " +
            data.length
        );
      }
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function () {
      return tooltip
        .style("top", d3.event.pageY - 10 + "px")
        .style("left", d3.event.pageX + 10 + "px");
    })
    .on("mouseout", function (d) {
      if (!clicked[d.source.index] & !clicked[d.target.index]) {
        this["style"]["stroke"] = null;
      }
      return tooltip.style("visibility", "hidden");
    })
    .on("click", function (d) {
      if (!clicked[d.source.index] & !clicked[d.target.index]) {
        svg.selectAll("path").style("opacity", 0.2);
        d3.select(this).style("opacity", 1);

        // false: I've clicked on the path
        updateMDS(false, genres[d.source.index], genres[d.target.index]);
        //false: i've clicked now
        updateBubble_plot(
          false,
          genres[d.source.index],
          genres[d.target.index]
        );
        clicked[d.source.index] = true;
        clicked[d.targetindex] = true;
        for (var i = 0; i < clicked_legend.length; i++) {
          clicked_legend[i] = false;
        }
      }
      // Was already selected
      else {
        // true: deselected the path
        updateMDS(true, genres[d.source.index], genres[d.target.index]);
        updateBubble_plot(true, genres[d.source.index], genres[d.target.index]);

        svg.selectAll("path").style("opacity", 1.2);
        for (var k = 0; k < clicked.length; k++) {
          clicked[k] = false;
        }
      }
    });

  /// LEGEND
  for (var t = 0; t < genres.length; t++) {
    svg
      .append("circle")
      .attr("cx", 560 - 0.585 * 620)
      .attr("cy", -120 + 20 * t)
      .attr("r", 6)
      .style("fill", colors[genres[t]]);

    svg
      .append("rect")
      .attr("id", "rect_" + genres[t])
      .attr("width", 82)
      .attr("height", 18)
      .attr("x", 560 - 0.565 * 620)
      .attr("y", -130 + 20 * t);
    // .style("fill", "rgb(141, 111, 199)");
    svg
      .append("text")
      .attr("x", 560 - 0.565 * 620)
      .attr("y", -120 + 20 * t)
      .attr("id", genres[t])
      .text(genres[t])
      .style("fill", "#fff")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }
  interactionLegend(svg, data, genres);
  /// END legend
}

startChord();
//interaction_legend
function interactionLegend(svg, data, genres) {
  var gen = "Comedy";
  for (var g = 0; g < 12; g++) {
    var gen = genres[g];
    svg
      .select("#" + gen)
      .style("cursor", "pointer")
      .on("click", function () {
        gen = this.id;
        if (!clicked_legend[dict[gen]]) {
          genres.forEach((gen) => {
            d3.select("#rect_" + gen).style("fill", "black");
          });
          d3.select("#rect_" + gen).style("fill", "rgb(141, 111, 199)");

          svg.selectAll("path").style("opacity", 0.3).style("stroke", "none");
          svg.selectAll("path").each(function () {
            stringhe = this.id.split("_");
            if (stringhe.includes(gen)) {
              updateBubble_plot_from_legend(false, gen);
              updateMDS_from_legend(false, gen);
              this["style"]["stroke-width"] = "0.2";
              this["style"]["stroke"] = "black";
              this["style"]["opacity"] = 2;
            }
          });
          clicked_legend[dict[gen]] = true;
        } else {
          d3.select("#rect_" + gen).style("fill", "black");
          svg.selectAll("path").style("opacity", 1.2);
          updateBubble_plot_from_legend(true, gen);
          updateMDS_from_legend(true, gen);
          for (var k = 0; k < clicked_legend.length; k++) {
            clicked_legend[dict[gen]] = false;
          }
        }
      });
  }
}
//updateMDS from chord
function updateMDS(deselected, gen1, gen2) {
  var selected_info = {
    name: "chord",
    deselected: deselected,
    gen1: gen1,
    gen2: gen2,
  };

  startMDS(selected_info);
}

//normal update from legend
function updateMDS_from_legend(deselected, gen1) {
  var selected_info = {
    name: "chord",
    deselected: deselected,
    gen1: gen1,
    gen2: null,
    legend: true,
  };

  startMDS(selected_info);
}

//normal update from chord
function updateBubble_plot(deselected, gen1, gen2) {
  var selected_info = {
    name: "chord",
    deselected: deselected,
    gen1: gen1,
    gen2: gen2,
  };
  startBubble(selected_info);
}
//normal update from legend
function updateBubble_plot_from_legend(deselected, gen1) {
  var selected_info = {
    name: "chord",
    deselected: deselected,
    gen1: gen1,
    gen2: null,
    legend: true,
  };
  startBubble(selected_info);
}

export { startChord, startBubble };
