
var prova,gh;
var p,paths,stringhe = new Array();

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

    var k=0;

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
    .attr("id",function(d,k){
      k+=1
      return genres[d.source.index] + "_" + genres[d.target.index] + "_path_" + (k-1)   ;
      })
    .style("cursor", "pointer")
    //.style("fill", d => colors[d.source.index]) // colors depend on the source group. Change to target otherwise.
    .style("fill", function (d,k) {
      p=[genres[d.source.index],genres[d.target.index]];
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
      console.log(paths);
      svg.selectAll("path").style("opacity",0.2)
      d3.select(this).style("opacity",1)
      updateMDS(d,genres[d.source.index],genres[d.target.index])
      updateBubble_plot(d,genres[d.source.index],genres[d.target.index])
    })
//LEGEND/////


  for (var t = 0; t < 12; t++){
    svg.append("circle").attr("cx",620 - 0.585 * 620).attr("cy",-150+20*t).attr("r", 6).style("fill", colors[t])
    svg.append("text").attr("x", 620 - 0.565 * 620).attr("y", -150+20*t).attr("id",genres[t]).text(genres[t]).style("font-size", "15px").attr("alignment-baseline","middle")
    // if(t==11){
    //   interactionLegend();
    // }
  }  
    
    svg.select("#Comedy").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Comedy")){
          this["style"]["stroke-width"] = "0.2";
          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Documentary").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Documentary")){
          this["style"]["stroke-width"] = "0.2";
          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Sci-Fi").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Sci-Fi")){
          this["style"]["stroke-width"] = "0.2";
          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Crime").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Crime")){
          this["style"]["stroke"] = "black";
          this["style"]["stroke-width"] = "0.2";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Action").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Action")){
          this["style"]["stroke-width"] = "0.2";
          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Drama").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Drama")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Western").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Western")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Adventure").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Adventure")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Fantasy").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Fantasy")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })
    svg.select("#Thriller").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Thriller")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })

    svg.select("#Romance").on("click",function(t){
      svg.selectAll("path").style("opacity",0.3).style("stroke","none")
      svg.selectAll("path").each(function() {
        stringhe = (this.id).split("_");
        if (stringhe.includes("Romance")){
          this["style"]["stroke-width"] = "0.2";

          this["style"]["stroke"] = "black";
          this["style"]["opacity"] = 2;
        }
      });
    })




   


})


function updateMDS(d,gen1,gen2){
  var mds_circles = d3.select("#area_6").selectAll(".bubble").style("display","block");
  if(gen1==gen2){
    mds_circles.filter(function(f) {
    return f.genres != gen1
  }).style("display","none");
  }
  else{
    mds_circles.filter(function(f) {
      return !(f.genres.includes(gen1)) | !(f.genres.includes(gen2));
    }).style("display","none");
  }
}
function updateBubble_plot(d,gen1,gen2){
  var circles = d3.select("#area_2").selectAll(".bubble").style("display","block");
  if(gen1==gen2){
    circles.filter(function(f) {
      return f.genres != gen1
    }).style("display","none");
  }
  else{
    circles.filter(function(f) {
      return !(f.genres.includes(gen1)) | !(f.genres.includes(gen2))
    }).style("display","none");
  }

}
