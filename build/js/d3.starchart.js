// define a new chart type: a circle chart
d3.chart("BarChart", {

  initialize: function() {
    // create a layer of circles that will go into
    // a new group element on the base of the chart
    this.layer("bars", this.base.append("g"), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll(".bar")
          .data(data);
      },

      // insert actual circles
      insert: function() {
        return this.append("rect").attr('class', 'bar');
      },

      // define lifecycle events
      events: {

        "enter": function() {
          var chart = this.chart();
          chart
            .attr("width", 0)
            .attr("height", 20)
            .attr("x", chart.xAttr())
            .attr("y", chart.yAttr())
            .style("fill", "grey");
        },
        "merge:transition": function() {
          var chart = this.chart();
          chart
            .attr("width", chart.width())
            .attr("height", chart.height())
            .attr("x", chart.xAttr())
            .attr("y", chart.yAttr());
        }
      }
    });
  },

  updateAttrs: function(node) {
    node.attr("width", this.xAttr());
    return node;
  },

  // set/get the xAttr for mapping the plot's x value
  xAttr: function(xAttr) {
    if (arguments.length === 0) {
      return this._xAttr;
    }
    this._xAttr = xAttr;
    return this;
  },

  yAttr: function(yAttr) {
    if (arguments.length === 0) {
      return this._yAttr;
    }
    this._yAttr = yAttr;
    return this;
  },

  width: function(newWidth) {
    if (arguments.length === 0) {
      return this._width;
    }
    this._width = newWidth;
    return this;
  },

  height: function(newHeight) {
    if (arguments.length === 0) {
      return this._height;
    }
    this._height = newHeight;
    return this;
  },

  // set/get the color to use for the circles as they are
  // rendered.
  color: function(newColor) {
    if (arguments.length === 0) {
      return this._color;
    }
    this._color = newColor;
    return this;
  }
});

