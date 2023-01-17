
var dict = {
  "Documentary": 0,
  "Western": 1,
  "Adventure": 2,
  "Fantasy": 3,
  "Horror": 4,
  "Sci-Fi": 5,
  "Comedy": 6,
  "Drama": 7,
  "Thriller": 8,
  "Action": 9,
  "Romance": 10,
  "Crime": 11
}
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
  "Crime"
]


const colors = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
 "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];

const generi_info = [
  {"genere":"Documentary", "colore": "#000000", "id": 0},
  {"genere":"Western", "colore": "#333333", "id": 1},
  {"genere":"Adventure", "colore": "#666666", "id": 2},
  {"genere":"Fantasy", "colore": "#999999", "id": 3},
  {"genere":"Horror", "colore": "#cccccc", "id": 4},
  {"genere":"Sci-Fi", "colore": "#ffffff", "id": 5},
  {"genere":"Comedy", "colore": "#ff0000", "id": 6},
  {"genere":"Drama", "colore": "#00ff00", "id": 7},
  {"genere":"Thriller", "colore": "#ffff00", "id": 8},
  {"genere":"Action", "colore": "#00ffff", "id": 9},
  {"genere":"Romance", "colore": "#0000ff", "id": 10},
  {"genere":"Crime", "colore": "#ff00ff", "id": 11},


]







var matrix = new Array(12);
for (var i = 0; i < matrix.length; i++) {
  matrix[i] = new Array(12).fill(0);
}

const data = d3.csv("./dataset/df_final_with_additional_info.csv",function(data){

  // Get the list of genres
  data.forEach(function (d) {

    var extracted = d.genres.split(",");
    for (var i = 0; i < extracted.length; i++) {
      for (var j = 0; j < extracted.length; j++) {

        matrix[dict[extracted[i]]][dict[extracted[j]]] += 1;

      }
    }

  });



  const svg = d3.select("#area_5")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(220,220)")

    //label
  for (var i = 0; i < 12; i++){
    svg.append("circle").attr("cx",620 - 0.585 * 620).attr("cy",-150+20*i).attr("r", 6).style("fill", colors[i])
    svg.append("text").attr("x", 620 - 0.565 * 620).attr("y", -150+20*i).text(genres[i]).style("font-size", "15px").attr("alignment-baseline","middle")
  }

  const res = d3.chord()
    .padAngle(0.05)     // padding between entities (black arc)
    .sortSubgroups(d3.descending)
    (matrix)

  svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(function (d) { return d.groups; })
    .enter().append("g")
    .attr("class", "chord")

  //al momento evidenzia soltanto la parte in alto degli archi ma non tutto il collegamento. Che classe devo usare??
    .append("path")
    .style("fill", (d, i) => colors[i])
    .style("stroke", "white")
    .attr("d", d3.arc()
      .innerRadius(200)
      .outerRadius(210)
    )


  const group = svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(d => d.groups)
    .enter()

  group.append("g")
    .append("path")
    .style("fill", "grey")
    .style("stroke", "white")
    .style("stroke-width", 0.01)
    

    .attr("d", d3.arc()
      .innerRadius(190)
      .outerRadius(200)
    )



  // Add one gradient for each link
  var gradient = svg.append('defs').selectAll("radialGradient")
    .data(res)
    .enter()
    .append("radialGradient")
    .attr("id", function (d) {
      return "gradient-" + d.source.index + '-' + d.target.index;
    })
    .each(function (d) {
      var centerAngle = (d.source.endAngle - d.source.startAngle) / 2;
      centerAngle += d.source.startAngle;
      const radius = 0.5;

      d3.select(this)
        .attr('cx', function () {
          return Math.sin(centerAngle) * radius + 0.5;
        })
        .attr('cy', function () {
          return -Math.cos(centerAngle) * radius + 0.5;
        })
        .attr('r', 1);
    });

  gradient.append("stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", function (d) {
      return colors[d.source.index];
    })
    .attr("stop-opacity", 1);

  gradient.append("stop")
    .attr('class', 'end')
    .attr("offset", "100%")
    .attr("stop-color", function (d) {
      return colors[d.target.index];
    })
    .attr("stop-opacity", 1);


    //PATH!!!!
  svg
    .datum(res)
    .append("g")
    .selectAll("path")
    .data(d => d)
    .enter().append("path")
    .attr("d", d3.ribbon()
      .radius(200)
    )
    .style("cursor", "pointer")
    //.style("fill", d => colors[d.source.index]) // colors depend on the source group. Change to target otherwise.
    .style("fill", function (d) {
      return "url(#gradient-" + d.source.index + '-' + d.target.index + ")";
    })
    //evidenza i path
    .on("mouseover", function (d) {
        this["style"]["stroke"]="black";
    })
    .on("mouseout", function (d) {
      
      this["style"]["stroke"]=null;

    })
    .on("click", function (d){


        updateMDS(d,genres[d.source.index],genres[d.target.index])
        updateBubble_plot(d,genres[d.source.index],genres[d.target.index])
    })


  // group
  //   .selectAll(".group-tick-label")
  //   .data(d => {
  //     //console.log(d)
  //     return [{ value: genres[d.index], angle: (d.endAngle + d.startAngle) / 2 }];
  //   })
  //   .enter()
  //   .filter(d => d.value)
  //   .append("g")
  //   .attr("transform", d => `rotate(${d.angle * 180 / Math.PI - 90}) translate(200,0)`)
  //   .append("text")
  //   .attr("x", 8)
  //   .attr("dy", ".35em")
  //   .attr("transform", function (d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
  //   .style("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
  //   .text(d => d.value)
  //   .style("font-size", 9)






   


})


function updateMDS(d,gen1,gen2){
  console.log(gen1,gen2);
  var mds_circles = d3.select("#area_6").selectAll(".bubble").style("display","block");
  mds_circles.filter(function(f) {
    return gen1 != f.genres | gen2 != f.genres;
  }).style("display","none");


  return ;
}
function updateBubble_plot(d,gen1,gen2){
    var circles = d3.select("#area_2").selectAll(".bubble").style("display","block");
    circles.filter(function(f) {
      return f.genres != gen1 | gen2 != f.genres
    }).style("display","none");


}
