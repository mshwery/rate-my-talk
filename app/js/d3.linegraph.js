// define a new chart type: a circle chart
d3.chart("AreaGraph", {

  initialize: function() {
    // create a layer of circles that will go into
    // a new group element on the base of the chart
    this.layer("circles", this.base.append("g"), {

      // select the elements we wish to bind to and
      // bind the data to them.
      dataBind: function(data) {
        return this.selectAll(".area")
          .data(data);
      },

      insert: function() {
        return this.append("path").attr("class", "area");
      },

      // define lifecycle events
      events: {

        // paint new elements, but set their radius to 0
        // and make them red
        "enter": function() {
          var chart = this.chart();
          this.attr("d", chart.area());
        },

        "merge:transition": function() {
          var chart = this.chart();
          this.attr("d", chart.area());
        }
      }
    });
  },

  area: function(newValue) {
    if (arguments.length === 0) {
      return this._area;
    }
    this._area = newValue;
    return this;
  }
});

