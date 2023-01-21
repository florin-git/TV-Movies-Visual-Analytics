var DATASET_PATH = "./dataset/df_main_info.csv";

var breaks = [2, 5, 15, 20];
var colours = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];

//general layout information
var cellSize = 10;
var calY = 70; //offset of calendar in each group
var calX = 550;
var width = 500; //prima con dimensioni normali era window.innerWidth
var height = 400;

var holidaysList = [
  "1/1/2022",
  "6/1/2022",
  "1/3/2022",
  "17/4/2022",
  "18/4/2022",
  "25/4/2022",
  "1/5/2022",
  "2/6/2022",
  "15/8/2022",
  "1/11/2022",
  "8/12/2022",
  "25/12/2022",
  "26/12/2022",
];

function start_calendar() {
  var parseDate = d3.timeParse("%d/%m/%y");
  format = d3.timeFormat("%d-%m-%Y");
  toolDate = d3.timeFormat("%d %B %Y");

  d3.csv(DATASET_PATH, function (data) {
    var mid_processed = {};
    var final_processed = {};

    //set up an array of all the dates in the data which we need to work out the range of the data
    var dates = new Array();
    var values = new Array();
    var monthMap = {
      gennaio: 1,
      febbraio: 2,
      marzo: 3,
      aprile: 4,
      maggio: 5,
      giugno: 6,
      luglio: 7,
      agosto: 8,
      settembre: 9,
      ottobre: 10,
      novembre: 11,
      dicembre: 12,
    };

    var year = "22";
    var units = " minutes";

    //parse the data
    data.forEach(function (d) {
      var original_month = d.month;
      d.month = monthMap[d.month];

      d.date = d.day_number + "/" + d.month + "/" + year;
      dates.push(parseDate(d.date));
      values.push(d.advertising);
      d.date = parseDate(d.date);
      d.value = d.advertising;
      d.year = d.date.getFullYear();

      var temp = d.channel.replaceAll(" ", "_");
      if (mid_processed.hasOwnProperty(temp)) {
        var keyD = d.day_number + original_month;

        if (mid_processed[temp].hasOwnProperty(keyD)) {
          var sum_time =
            parseInt(mid_processed[temp][keyD].duration_with_advertising) +
            parseInt(d.duration_with_advertising);
          var sum =
            parseInt(mid_processed[temp][keyD].advertising) +
            parseInt(d.advertising);
          mid_processed[temp][keyD].advertising = sum.toString();
          mid_processed[temp][keyD].duration_with_advertising =
            sum_time.toString();
        } else {
          mid_processed[temp][keyD] = d;
        }
      } else {
        mid_processed[temp] = {};
      }
    });

    Object.keys(mid_processed).forEach((channel) => {
      if (!final_processed.hasOwnProperty(channel)) {
        final_processed[channel] = [];
      }
      Object.keys(mid_processed[channel]).forEach((date) => {
        final_processed[channel].push(mid_processed[channel][date]);
      });
    });

    var selection = document.getElementById("channel_selector");
    selection.onchange = (event) => {
      var text = event.target.value;
      calendarCreate(final_processed[text], "top");
    };

    var selection2 = document.getElementById("channel_selector_2");
    selection2.onchange = (event) => {
      var text = event.target.value;
      calendarCreate(final_processed[text], "bottom");
    };

    var default_set = final_processed["Italia_1"];
    var default_set_1 = final_processed["Cielo"];
    calendarCreate(default_set, "top");

    if (document.getElementById("2022bottom") == null) {
      calendarCreate(default_set_1, "bottom");
    }

    create_legend();
  });
}

function monthPath(t0) {
  var now = new Date();
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
    d0 = t0.getDay(),
    w0 = d3.timeWeek.count(d3.timeYear(now), t0),
    d1 = t1.getDay(),
    w1 = d3.timeWeek.count(d3.timeYear(now), t1);

  return (
    "M" +
    (w0 + 1) * cellSize +
    "," +
    d0 * cellSize +
    "H" +
    w0 * cellSize +
    "V" +
    7 * cellSize +
    "H" +
    w1 * cellSize +
    "V" +
    (d1 + 1) * cellSize +
    "H" +
    (w1 + 1) * cellSize +
    "V" +
    0 +
    "H" +
    (w0 + 1) * cellSize +
    "Z"
  );
}

function calendarCreate(chosen_data, level) {
  if (document.getElementById("2022" + level) != null) {
    document.getElementById("2022" + level).parentNode.remove();
  }
  var units = " minutes";

  var yearlyData = d3
    .nest()
    .key(function (d) {
      return d.year;
    })
    .entries(chosen_data);

  var svg = d3
    .select("#area_1_" + level)
    .append("svg")
    .attr("width", "100%");
  //.attr("viewBox", "0 0 " + width + " 540");

  var cals = svg
    .selectAll("g")
    .data(yearlyData)
    .enter()
    .append("g")
    .attr("id", function (d) {
      return d.key + level;
    })
    .attr("transform", function (d, i) {
      return "translate(0," + i * (height + calY) + ")";
    });

  var rects = cals
    .append("g")
    .attr("id", "alldays")
    .selectAll(".day")
    .data(function (d) {
      return d3.timeDays(
        new Date(parseInt(d.key), 0, 1),
        new Date(parseInt(d.key) + 1, 0, 1)
      );
    })
    .enter()
    .append("rect")
    .attr("id", function (d) {
      return "_" + format(d);
      //return toolDate(d.date)+":\n"+d.value+" dead or missing";
    })
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function (d) {
      var now = new Date();
      return calX + d3.timeWeek.count(d3.timeYear(now), d) * cellSize;
    })
    .attr("y", function (d) {
      return calY + d.getDay() * cellSize;
    })
    // .attr("fill", "rgba(83, 255, 199, 0.1)")
    .datum(format);

  //create day labels
  var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  var dayLabels = cals.append("g").attr("id", "dayLabels");
  days.forEach(function (d, i) {
    dayLabels
      .append("text")
      .attr("class", "dayLabel")
      .attr("x", function (d) {
        return 4;
      })
      .attr("y", function (d) {
        return calY + i * cellSize - 2;
      })
      .attr("dy", "0.9em")
      .text(d)
      .style("fill", "#fff");
  });

  //let's draw the data on
  var dataRects = cals
    .append("g")
    .attr("id", "dataDays")
    .selectAll(".dataday")
    .data(function (d) {
      return d.values;
    })
    .enter()
    .append("rect")
    .attr("id", function (d) {
      return format(d.date) + ":" + d.value;
    })
    .attr("stroke", "#ccc")
    .attr("class", "mannaggia")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function (d) {
      var now = new Date();
      return calX + d3.timeWeek.count(d3.timeYear(now), d.date) * cellSize;
    })
    .attr("y", function (d) {
      return calY + d.date.getDay() * cellSize;
    })
    .attr("fill", function (d) {
      if (d.value < breaks[0]) {
        return colours[0];
      }
      for (i = 0; i < breaks.length + 1; i++) {
        if (d.value >= breaks[i] && d.value < breaks[i + 1]) {
          return colours[i];
        }
      }
      if (d.value > breaks.length - 1) {
        return colours[breaks.length];
      }
    })
    .style("cursor", "pointer");

  //append a title element to give basic mouseover info
  dataRects.append("title").text(function (d) {
    var perc = parseFloat(
      (parseInt(d.advertising) / parseInt(d.duration_with_advertising)) * 100
    ).toFixed(2);
    return (
      toolDate(d.date) +
      ":\n" +
      perc.toString() +
      " % of advertising in " +
      d.duration_with_advertising +
      units
    );
  });

  //add montly outlines for calendar
  cals
    .append("g")
    .attr("id", "monthOutlines")
    .selectAll(".month")
    .data(function (d) {
      return d3.timeMonths(
        new Date(parseInt(d.key), 0, 1),
        new Date(parseInt(d.key) + 1, 0, 1)
      );
    })
    .enter()
    .append("path")
    .attr("class", "month")
    .attr("transform", "translate(" + calX + "," + calY + ")")
    .attr("d", monthPath);

  var BB = new Array();
  var mp = document.getElementById("monthOutlines").childNodes;
  for (var i = 0; i < mp.length; i++) {
    BB.push(mp[i].getBBox());
  }

  var monthX = new Array();
  BB.forEach(function (d, i) {
    boxCentre = d.width / 2;
    monthX.push(calX + d.x + boxCentre);
  });

  //create centred month labels around the bounding box of each month path
  //create day labels
  var months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  var monthLabels = cals.append("g").attr("id", "monthLabels");
  months.forEach(function (d, i) {
    monthLabels
      .append("text")
      .attr("class", "monthLabel")
      .attr("x", monthX[i])
      .attr("y", calY / 1.2)
      .text(d)
      .style("fill", "#fff");
  });

  updateHoliday(document.getElementById("holiday_check"));
}

function create_legend() {
  if (document.getElementById("legend") != null) {
    return;
  }

  var svg = d3
    .select("#area_calendars")
    .append("svg")
    .attr("id", "legend")
    .attr("width", "100%");

  var key = svg
    .append("g")
    .attr("id", "key")
    .attr("class", "key")
    .attr("transform", function (d) {
      return "translate(70, 10)";
    });

  key
    .selectAll("rect")
    .data(colours)
    .enter()
    .append("rect")
    .attr("width", cellSize * 1.5)
    .attr("height", cellSize * 1.5)
    .attr("x", function (d, i) {
      return i * 105;
    })
    .attr("fill", function (d) {
      return d;
    });

  key
    .selectAll("text")
    .data(colours)
    .enter()
    .append("text")
    .attr("font-size", "1.4rem")
    .attr("x", function (d, i) {
      return cellSize + 10 + i * 105;
    })
    .attr("y", "1rem")
    .text(function (d, i) {
      if (i < colours.length - 1) {
        return "up to " + breaks[i];
      } else {
        return "over " + breaks[i - 1];
      }
    });
}

function updateHoliday(checkbox) {
  var rect = d3.selectAll(".mannaggia");

  if (checkbox.checked) {
    var rect = d3
      .selectAll(".mannaggia")
      .attr("stroke", (d) => {
        var date = d.date;
        if (holidaysList.includes(String(date.toLocaleDateString("it-IT")))) {
          return "black";
        } else {
          return "#ccc";
        }
      })
      .attr("stroke-width", (d) => {
        var date = d.date;

        if (holidaysList.includes(String(date.toLocaleDateString("it-IT")))) {
          return 3;
        } else {
          return 1;
        }
      })
      .attr("z-index", (d) => {
        var date = d.date;

        if (holidaysList.includes(String(date.toLocaleDateString("it-IT")))) {
          return 100;
        } else {
          return 1;
        }
      });
  } else {
    var rect = d3
      .selectAll(".mannaggia")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
  }
}

function ResetVis() {
  window.localStorage.clear();
  location.reload();
  console.log("here");
}
