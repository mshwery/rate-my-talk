// define a new chart type: a circle chart
d3.chart("ScatterplotChart", {

  initialize: function() {
    // defaults
    this._xAttr = this._yAttr = function(d, i) {
      return d;
    };

    this._opacity = 1;

    // create a layer of circles that will go into
    // a new group element on the base of the chart
    this.layer("circles", this.base.append("g"), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll("circle")
          .data(data);
      },

      // insert actual circles
      insert: function() {
        return this.append("circle");
      },

      // define lifecycle events
      events: {

        // paint new elements, but set their radius to 0
        // and make them red
        "enter": function() {
          var chart = this.chart();
          chart
            .updateAttrs(this)
            .attr("r", 0)
            .style("opacity", chart.opacity())
            .style("fill", chart.color());
        },
        // then transition them to a radius of 5 and change
        // their fill to blue
        "enter:transition": function() {
          var chart = this.chart();
          this.attr("r", 5);
        },
        "update:transition": function() {
          var chart = this.chart();
          chart
            .updateAttrs(this);
        }
      }
    });
  },

  updateAttrs: function(node) {
    node.attr("cx", this.xAttr())
      .attr("cy", this.yAttr());
    return node;
  },

  opacity: function(newValue) {
    if (arguments.length === 0) {
      return this._opacity;
    }
    this._opacity = newValue;
    return this;
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

