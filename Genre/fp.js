/**
 * Created by Aman on 3/6/15.
 */
window.onload = function () {

    var margin = {top: 75, right: 20, bottom: 30, left: 40};
    var width = 1200 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;


    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>Percentage:</strong> <span style='color:white'>" + d.value + "%</span> <br> <br>Category: " + d.name;
        })

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
    );

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(""));


    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.right + margin.left + 100)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.call(tip);


    d3.csv("dataset.csv", update);

    function update(error, data) {
        //svg.remove();
        var genreNames = d3.keys(data[0]).filter(function (key) {
            return key !== "Country";
        });
        //console.log(genreNames);

        data.forEach(function (d) {
            d.genre = genreNames.map(function (name) {
                return {name: name, value: +d[name]};
            });
        });

        x0.domain(data.map(function (d) {
            return d.Year;
        }));
        x1.domain(genreNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(d.genre, function (d) {
                return d.value;
            });
        })])

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        //resetting the y axis
        svg.select(".y.axis").remove();
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Percentage");

        var Year = svg.selectAll(".Year")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) {
                return "translate(" + x0(d.Year) + ",0)";
            });

        var chartData = Year.selectAll("rect")
            .data(function (d) {
                return d.genre;
            });

        chartData
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("class", "chartData")
            .attr("id", "chartData")
            .attr("x", function (d) {
                return x1(d.name);
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("height", function (d) {
                return height - y(d.value);
            })
            .style("fill", function (d) {
                return color(d.name);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


        chartData.transition()
            .duration(750)
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("height", function (d) {
                return height - y(d.value);
            });


        var legend = svg.selectAll(".legend")
            .data(genreNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("id", "legend")
            .attr("x", width)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color)
            .on("mouseover", function (d) {
                return "cursor: pointer; cursor: hand;";
            })
            .on("click", function (d) {
                var genreName = d;
                var filtered = data.map(function (e) {
                    if (e.hasOwnProperty(genreName)) {
                        var obj = {};
                        obj[genreName] = e[genreName];
                        obj['Year'] = e.Year;
                        return obj;
                    }
                });
                d3.selectAll("#chartData").remove();
                update(error, filtered);
            });

        legend.append("text")
            .attr("x", width + 20)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function (d) {
                return d;
            });
    }


}