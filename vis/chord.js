var DATASET_PATH = "./dataset/df_main_info.csv";

var prova, gh;
var p,
  paths,
  stringhe = new Array();
var clicked = new Array(65).fill(false);
var clicked_legend = new Array(12).fill(false);


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

const colors = [
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f",
];

var num_titles = 0;
var titles = new Array();

var matrix = new Array(12);
for (var i = 0; i < matrix.length; i++) {
  matrix[i] = new Array(12).fill(0);
}

var matrix2 = new Array(12);
for (var i = 0; i < matrix2.length; i++) {
  matrix2[i] = new Array(12).fill(0);
}

const data = d3.csv(DATASET_PATH, function (data) {
  // Get the list of genres
  data.forEach(function (d) {
    if (!titles.includes(d.title)) {
      titles.push(d.title);
      var extracted2 = d.genres.split(",");
      for (var i = 0; i < extracted2.length; i++) {
        for (var j = 0; j < extracted2.length; j++) {
          matrix2[dict[extracted2[i]]][dict[extracted2[j]]] += 1;
        }
      }
    }

    var extracted = d.genres.split(",");
    for (var i = 0; i < extracted.length; i++) {
      for (var j = 0; j < extracted.length; j++) {
        matrix[dict[extracted[i]]][dict[extracted[j]]] += 1;
      }
    }
  });
  num_titles = titles.length;

  const svg = d3
    .select("#area_chord")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    // .attr("transform", "translate(220,215)");
    .attr("transform", "translate(180,190)");

  //tooltip
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip2")
    .style("background-color", "#636363")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("font-size", "20px")
    .style("color", "white")
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
    .style("fill", (d, i) => colors[i])
    .style("stroke", "white")
    .attr(
      "d",
      d3
        .arc()
        // .innerRadius(200)
        // .outerRadius(210)
        .innerRadius(150)
        .outerRadius(160)
    );

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

    // .attr("d", d3.arc().innerRadius(190).outerRadius(200));
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
      return colors[d.source.index];
    })
    .attr("stop-opacity", 1);

  gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", "100%")
    .attr("stop-color", function (d) {
      return colors[d.target.index];
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
    // .attr("d", d3.ribbon().radius(200))
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
    //.style("fill", d => colors[d.source.index]) // colors depend on the source group. Change to target otherwise.
    .style("fill", function (d, k) {
      p = [genres[d.source.index], genres[d.target.index]];
      return "url(#gradient-" + d.source.index + "-" + d.target.index + ")";
    })
    //evidenza i path
    .on("mouseover", function (d) {
      this["style"]["stroke"] = "#000";
      if (genres[d.source.index] == genres[d.target.index]) {
        tooltip.html(
          genres[d.source.index] +
          "<br> Number of films of" +
          genres[d.source.index] +
          " :<br>" +
          matrix2[d.source.index][d.source.index] +
          " out of " +
          num_titles
        );
      } else {
        tooltip.html(
          genres[d.source.index] +
          "," +
          genres[d.target.index] +
          "<br> Number of films of" +
          genres[d.source.index] +
          ", " +
          genres[d.target.index] +
          " :<br>" +
          matrix2[d.source.index][d.target.index] +
          " out of " +
          num_titles
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
        updateMDS(d, genres[d.source.index], genres[d.target.index]);
        updateBubble_plot(genres[d.source.index], genres[d.target.index], data);
        clicked[d.source.index] = true;
        clicked[d.targetindex] = true;
        for (var i = 0; i < clicked_legend.length; i++) {
          clicked_legend[i] = false;
        }
      } else {
        svg.selectAll("path").style("opacity", 1.2);
        var circles = d3
          .select("#area_bubble")
          .selectAll(".bubble")
          .style("display", "block");
        var mds_circles = d3
          .select("#area_mds")
          .selectAll(".bubble")
          .style("display", "block");
        for (var k = 0; k < clicked.length; k++) {
          clicked[k] = false;
        }
      }
    });

  /// LEGEND
  for (var t = 0; t < 12; t++) {
    svg
      .append("circle")
      .attr("cx", 560 - 0.585 * 620)
      .attr("cy", -120 + 20 * t)
      .attr("r", 6)
      .style("fill", colors[t]);
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
  interactionLegend(svg, data);
  /// END legend
});

//interaction_legend
function interactionLegend(svg, data) {
  var gen = "Comedy";
  for (var g = 0; g < 12; g++) {
    var gen = genres[g];
    svg.select("#" + gen)
      .style("cursor", "pointer")
      .on("click", function () {
        if (!clicked_legend[dict[gen]]) {
          gen = this.id;
          svg.selectAll("path").style("opacity", 0.3).style("stroke", "none");
          svg.selectAll("path").each(function () {
            stringhe = this.id.split("_");
            if (stringhe.includes(gen)) {
              updateBubble_plot_from_legend(gen, data);
              this["style"]["stroke-width"] = "0.2";
              this["style"]["stroke"] = "black";
              this["style"]["opacity"] = 2;
            }
          });
          clicked_legend[dict[gen]] = true;
        }
        else {
          svg.selectAll("path").style("opacity", 1.2);
          var circles = d3
            .select("#area_bubble")
            .selectAll(".bubble")
            .style("display", "block");
          var mds_circles = d3
            .select("#area_mds")
            .selectAll(".bubble")
            .style("display", "block");
          for (var k = 0; k < clicked_legend.length; k++) {
            clicked_legend[dict[gen]] = false;
          }
        }
      });
  }
}
//updateMDS
function updateMDS(d, gen1, gen2) {
  var mds_circles = d3
    .select("#area_mds")
    .selectAll(".bubble")
    .style("display", "block");
  if (gen1 == gen2) {
    mds_circles
      .filter(function (f) {
        return f.genres != gen1;
      })
      .style("display", "none");
  } else {
    mds_circles
      .filter(function (f) {
        return !f.genres.includes(gen1) | !f.genres.includes(gen2);
      })
      .style("display", "none");
  }
}
//normal update from chord
function updateBubble_plot(gen1, gen2, data) {
  var circles = d3
    .select("#area_bubble")
    .selectAll(".bubble")
    .style("display", "block");

  if (gen1 == gen2) {
    circles
      .filter(function (f) {
        return f.genres != gen1;
      })
      .style("display", "none");
  } else {
    circles
      .filter(function (f) {
        return !f.genres.includes(gen1) | !f.genres.includes(gen2);
      })
      .style("display", "none");
  }
  updateYAxis(gen1, gen2, data);
}
//normal update from legend
function updateBubble_plot_from_legend(gen1, data) {
  var circles = d3
    .select("#area_bubble")
    .selectAll(".bubble")
    .style("display", "block");

  circles
    .filter(function (f) {
      return !f.genres.includes(gen1);
    })
    .style("display", "none");

  updateYAxis_from_legend(gen1, data);
}

function updateYAxis(gen1, gen2, data) {
  var circleList = [];
  d3.select("#area_bubble")
    .selectAll(".bubble")
    .data(data)
    .filter(function (d) {
      if (gen1 == gen2) return d.genres == gen1;
      else return d.genres.includes(gen1) & d.genres.includes(gen2);
      // return d.genres.includes(genre_1) ; //prende tutti i cerchi con il genere uguale a quello passato
    })
    .each(function (d) {
      circleList.push(parseInt(d.duration));
    });
  console.log(circleList);

  //ricalcolo l'asse
  var new_y = d3
    .scaleLinear()
    .domain([d3.min(circleList) - 5, d3.max(circleList) + 5])
    .range([280, 0]);

  var y_axis = d3.axisLeft(new_y).ticks();

  d3.selectAll("#y-axis").call(y_axis).selectAll("text").style("fill", "white");
  d3.select("#area_bubble").selectAll("line").style("stroke", "#fff");
  // d3.select("#area_bubble").selectAll("path").style("stroke", "#fff");

  //update positions
  d3.select("#area_bubble")
    .data(data)
    .selectAll(".bubble")
    .filter(function (d) {
      if (gen1 == gen2) return d.genres == gen1;
      else return d.genres.includes(gen1) & d.genres.includes(gen2);
      // return d.genres == genre; //prende tutti i cerchi con il genere uguale a quello passato
    })
    .attr("cy", function (d) {
      return new_y(parseInt(d.duration));
    });
}


function updateYAxis_from_legend(gen1, data) {
  var circleList = [];
  d3.select("#area_bubble")
    .selectAll(".bubble")
    .data(data)
    .filter(function (d) {
      return d.genres.includes(gen1);
    })
    .each(function (d) {
      circleList.push(parseInt(d.duration));
    });
  // console.log(circleList);

  //ricalcolo l'asse
  var new_y = d3
    .scaleLinear()
    .domain([d3.min(circleList) - 5, d3.max(circleList) + 5])
    .range([280, 0]);

  var y_axis = d3.axisLeft(new_y).ticks();

  d3.selectAll("#y-axis").call(y_axis).selectAll("text").style("fill", "white");
  d3.select("#area_bubble").selectAll("line").style("stroke", "#fff");
  // d3.select("#area_bubble").selectAll("path").style("stroke", "#fff");

  //update positions
  d3.select("#area_bubble")
    .data(data)
    .selectAll(".bubble")
    .filter(function (d) {
      return d.genres.includes(gen1);
    })
    .attr("cy", function (d) {
      return new_y(parseInt(d.duration));
    });
}
