
var prova,gh;
var p,paths,stringhe = new Array()
var clicked = new Array(65).fill(false)
console.log(clicked)

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

var num_titles=0
var titles = new Array();

var matrix = new Array(12);
for (var i = 0; i < matrix.length; i++) {
  matrix[i] = new Array(12).fill(0);
}


var matrix2 = new Array(12);
for (var i = 0; i < matrix2.length; i++) {
  matrix2[i] = new Array(12).fill(0);
}

const data = d3.csv("./dataset/df_final_with_additional_info.csv",function(data){

  // Get the list of genres
  data.forEach(function (d) {
    if (!titles.includes(d.title)){
      titles.push(d.title)
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
 
  const svg = d3.select("#area_5")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(220,215)")

  //tooltip
  var tooltip = d3.select("body")
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
      // console.log(d3.select(this))
      this["style"]["stroke"]="black";
      if ( genres[d.source.index] ==  genres[d.target.index]){
        tooltip.html(genres[d.source.index] + "<br> Number of films of" + genres[d.source.index] + " :<br>" + matrix2[d.source.index][d.source.index] + " out of " + num_titles);
      }
      else{
        tooltip.html(genres[d.source.index] +","+ genres[d.target.index] + "<br> Number of films of" + genres[d.source.index] +", "+ genres[d.target.index] + " :<br>" + matrix2[d.source.index][d.target.index] + " out of " + num_titles);
      }
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      return tooltip.style("top",
      (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    })
    .on("mouseout", function (d) {
      if(!clicked[d.source.index] & !clicked[d.target.index] ){
        this["style"]["stroke"]=null;
      }
      return tooltip.style("visibility", "hidden");
    })
    .on("click", function (d){
      if(!clicked[d.source.index] & !clicked[d.target.index] ){
        svg.selectAll("path").style("opacity",0.2)
        d3.select(this).style("opacity",1)
        updateMDS(d,genres[d.source.index],genres[d.target.index])
        updateBubble_plot(d,genres[d.source.index],genres[d.target.index])
        clicked[d.source.index]=true;
        clicked[d.targetindex]=true;
      }
      else{
        svg.selectAll("path").style("opacity",1.2)
        var circles = d3.select("#area_2").selectAll(".bubble").style("display","block")
        var mds_circles = d3.select("#area_6").selectAll(".bubble").style("display","block")
        for (var k=0; k < clicked.length ; k++){
          clicked[k]=false;
        }
      }
    })
//LEGEND/////
  for (var t = 0; t < 12; t++){
    svg.append("circle").attr("cx",620 - 0.585 * 620).attr("cy",-150+20*t).attr("r", 6).style("fill", colors[t])
    svg.append("text").attr("x", 620 - 0.565 * 620).attr("y", -150+20*t).attr("id",genres[t]).text(genres[t]).style("font-size", "15px").attr("alignment-baseline","middle")
    if(t==11){
      interactionLegend(svg);
    }
  }  
///END legend
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

function updateBubble_plot_from_chord(gen1){
  var circles = d3.select("#area_2").selectAll(".bubble").style("display","block");
  circles.filter(function(f) {
      return !(f.genres.includes(gen1))
    }).style("display","none");

}


function interactionLegend(svg){

svg.select("#Comedy").
  on("click",function(t){
    svg.selectAll("path").style("opacity",0.3).style("stroke","none")
    svg.selectAll("path").each(function() {
      stringhe = (this.id).split("_");
      if (stringhe.includes("Comedy")){
        updateBubble_plot_from_chord(stringhe[0]);
        this["style"]["stroke-width"] = "0.2";
        this["style"]["stroke"] = "black";
        this["style"]["opacity"] = 2;
      }
    });
  })
svg.select("#Documentary")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Documentary")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Sci-Fi").style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Sci-Fi")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Crime")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Crime")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke"] = "black";
      this["style"]["stroke-width"] = "0.2";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Action")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Action")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Drama")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Drama")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Western")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Western")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Adventure")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Adventure")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Fantasy")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Fantasy")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})
svg.select("#Thriller")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Thriller")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})

svg.select("#Romance")
.style("cursor", "pointer")
.on("click",function(t){
  svg.selectAll("path").style("opacity",0.3).style("stroke","none")
  svg.selectAll("path").each(function() {
    stringhe = (this.id).split("_");
    if (stringhe.includes("Romance")){
      updateBubble_plot_from_chord(stringhe[0]);
      this["style"]["stroke-width"] = "0.2";
      this["style"]["stroke"] = "black";
      this["style"]["opacity"] = 2;
    }
  });
})



}