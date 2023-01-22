var DATASET_PATH = "./dataset/df_main_info.csv";

var breaks = [5, 10, 20, 40];
var colours = ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"];

//general layout information
var cellSize = 10;
var calY = 40; //offset of calendar in each group
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

var current_year = "2022";
var parseDate = d3.timeParse("%d/%m/%Y");
var format = d3.timeFormat("%d-%m-%Y");
var toolDate = d3.timeFormat("%d %B %Y");

// When the user selects a channel, this function is triggered
function manageOnSelection(data, selectorName, level) {
  var selection = document.getElementById(selectorName);
  selection.onchange = (event) => {
    var selectedChannel = event.target.value;

    calendarCreate(
      data.filter(function (d) {
        return d.channel == selectedChannel.replace("_", " ");
      }),
      level
    );
  };
}

function startCalendar(brushed_ids) {
  d3.csv(DATASET_PATH, function (data) {
    manageOnSelection(data, "channel_selector", "top");
    manageOnSelection(data, "channel_selector_2", "bottom");

    if (brushed_ids != null) {
      var dataFromMDS = data.filter(function (d) {
        return brushed_ids.includes(d.id);
      });

      calendarCreate(dataFromMDS, "bottom");
      return;
    }

    var default_set = data.filter(function (d) {
      return d.channel === "Italia 1";
    });

    var default_set_2 = data.filter(function (d) {
      return d.channel === "Cielo";
    });

    calendarCreate(default_set, "top");
    calendarCreate(default_set_2, "bottom");

    create_legend();
  });
}

function start_calendar_from_mds(brushed_ids) {
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

  d3.csv(DATASET_PATH, function (data) {
    data.forEach(function (d) {
      d.date = d.day_number + "/" + monthMap[d.month] + "/" + current_year;
      d.date = parseDate(d.date);
      d.value = d.advertising;
    });

    // var selection = document.getElementById("channel_selector");
    // selection.onchange = (event) => {
    //   var selectedChannel = event.target.value;

    //   calendarCreate(
    //     data.filter(function (d) {
    //       return d.channel === channel;
    //     }),
    //     "top"
    //   );
    // };

    // var selection_2 = document.getElementById("channel_selector_2");
    // selection_2.onchange = (event) => {
    //   var selectedChannel = event.target.value;
    //   calendarCreate(
    //     data.filter(function (d) {
    //       return d.channel === selectedChannel;
    //     }),
    //     "bottom"
    //   );
    // };

    // var default_set = data.filter(function (d) {
    //   return d.channel === "Italia 1";
    // });

    // var default_set_2 = data.filter(function (d) {
    //   return d.channel === "Cielo";
    // });

    var daje = data.filter(function (d) {
      console.log(d.id);
      return brushed_ids.includes(d.id);
    });

    calendarCreate(daje, "bottom");

    create_legend();
  });
}

startCalendar();

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

function calendarCreate(chosenData, level) {
  if (document.getElementById(current_year + level) != null) {
    document.getElementById(current_year + level).parentNode.remove();
  }
  var units = " minutes";

  var dataGroupByDate = d3
    .nest()
    .key(function (d) {
      // Compose the date
      d.date = d.day_number + "/" + monthMap[d.month] + "/" + current_year;
      d.date = parseDate(d.date);
      return d.date;
    })
    .rollup(function (d) {
      return {
        advertising_all: d3.sum(d, function (e) {
          return e.advertising;
        }),
        duration_with_advertising_all: d3.sum(d, function (e) {
          return e.duration_with_advertising;
        }),
      };
    })
    .entries(chosenData);

  var yearlyData = d3
    .nest()
    .key(function (d) {
      return current_year;
    })
    .entries(chosenData);

  var svg = d3
    .select("#area_1_" + level)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "110px");

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
      // This will outputs every day from 01-01-2022 to 01-01-2023 (excluded)
      return d3.timeDays(
        new Date(parseInt(d.key), 0, 1),
        new Date(parseInt(d.key) + 1, 0, 1)
      );
    })
    .enter()
    .append("rect")
    .attr("id", function (d) {
      // Change the day format to the Italian one
      return "_" + format(d);
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
    .datum(format);

  // Create day labels
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

  // Let's draw the data on
  var dataRects = cals
    .append("g")
    .attr("id", "dataDays")
    .selectAll(".dataday")
    // .data(function (d) {
    //   return d.values;
    // })
    .data(dataGroupByDate)
    .enter()
    .append("rect")
    // .attr("id", function (d) {
    //   return format(d.date) + ":" + d.value;
    // })
    .attr("stroke", "#ccc")
    .attr("class", "mannaggia")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function (d) {
      var now = new Date();
      // console.log(now.getDate())
      // console.log()
      // return calX + d3.timeWeek.count(d3.timeYear(now), d.date) * cellSize;
      return (
        calX + d3.timeWeek.count(d3.timeYear(now), new Date(d.key)) * cellSize
      );
    })
    .attr("y", function (d) {
      // return calY + d.date.getDay() * cellSize;
      // console.log(parseDate(d.key).getDay())
      return calY + new Date(d.key).getDay() * cellSize;
    })
    .attr("fill", function (d) {
      var value =
        (d.value.advertising_all / d.value.duration_with_advertising_all) * 100;

      if (value < breaks[0]) {
        return colours[0];
      }
      for (i = 0; i < breaks.length + 1; i++) {
        if (value >= breaks[i] && value < breaks[i + 1]) {
          return colours[i];
        }
      }
      if (value > breaks.length - 1) {
        return colours[breaks.length];
      }
    })
    .style("cursor", "pointer");

  //append a title element to give basic mouseover info
  dataRects.append("title").text(function (d) {
    // var perc = parseFloat(
    //   (parseInt(d.advertising) / parseInt(d.duration_with_advertising)) * 100
    // ).toFixed(2);

    var value = (
      (d.value.advertising_all / d.value.duration_with_advertising_all) *
      100
    ).toFixed(2);

    return (
      toolDate(new Date(d.key)) +
      ":\n" +
      value.toString() +
      "% of advertising in " +
      d.value.duration_with_advertising_all +
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
    var boxCentre = d.width / 2;
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
      return "translate(70, 15)";
    });

  key
    .selectAll("rect")
    .data(colours)
    .enter()
    .append("rect")
    .attr("width", cellSize)
    .attr("height", cellSize)
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
    .attr("font-size", "1rem")
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
    })
    .style("fill", "#fff");
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


export { startCalendar };
