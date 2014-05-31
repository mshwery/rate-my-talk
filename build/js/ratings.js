/*jshint laxcomma:true*/

(function() {

  // create a new instance of sockjs for websockets communication w/ server
  var sckt = new socket('ratings');

  // all ratings
  var ratings = ko.observableArray();

  // on this user's rating, emit rating
  var userRating = ko.observable(localStorage.getItem('user-rating'));

  // convenience method so i could use a timeout to add .rated class to body
  var hasRated = ko.observable(!!userRating() && ratings().length);

  // average rating number to 1 decimal precision
  var averageRating = ko.computed(function() {
    if (ratings().length) {
      return (d3.sum(ratings().map(function(rating) {
        return +rating.rating;
      })) / ratings().length).toFixed(1);
    } else {
      return null;
    }
  });

  // emit 'rating' message on websocket channel
  var submitRating = function(rating) {
    sckt.emit('rating', { rating: rating });
  };

  // push a single rating to the rating obsArr
  var addRating = function(rating) {
    ratings.push(rating);
  };

  // push a bunch of new ratings all together to the rating obsArr
  var addRatings = function(ratingArray) {
    console.log(ratingArray);
    ratings(ratings().concat(ratingArray));
    //ratingArray.forEach();
    //Array.prototype.push.apply(ratings(), ratingArray);
  };

  // listen to changes on the userRating value
  // submit that new rating 
  userRating.subscribe(function(newValue) {
    if (newValue != null) {
      submitRating(newValue);
      // also add to local storage so page refresh the browser still knows you rated
      localStorage.setItem('user-rating', newValue);
    }

    setTimeout(function() {
      hasRated(true);
    }, 750);
  });

  // event binding for sockjs 'connect' event
  sckt.on('connect', function() {
    // do something on connect
  });

  sckt.on('load', addRatings);

  sckt.on('rating', addRating);

  // Start the socket instance
  sckt.connect();



  // obj to hold observables/functions and other bindings
  // we wish to expose to the DOM
  var viewmodel = {
    userRating: userRating,
    ratings: ratings,
    hasRated: hasRated,
    averageRating: averageRating
  };



  // apply knockout data bindings
  $(document).ready(function() {
    ko.applyBindings(viewmodel);

    var width = $('.scatterplot').width(),
      height = 50;

    var xScale = d3.time.scale().range([10, width - 10]),
      yScale = d3.scale.linear().domain([1, 5]).range([height - 10, 10]);

    // create an instance of the chart on a d3 selection
    var chart = d3.select('.scatterplot')
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      .chart('ScatterplotChart')
      .xAttr(function(d, i) {
        return xScale(new Date(d.date));
      })
      .yAttr(function(d, i) {
        return yScale(+d.rating);
      })
      .opacity(function(d, i) {
        return 0.5;// d.rating * 2 / 10; 
      })
      .color('#4A90E2');

    var dateExtent = ko.observableArray();

    // render it with some data whenever the ratings obsArray changes
    ratings.subscribe(function(newValue) {
      dateExtent(d3.extent(newValue, function(d) { return new Date(d.date); }));
      xScale.domain(dateExtent());
      chart.draw(newValue);
    });

    // transform data into aggregate totals for each rating
    function bundleRatings(data) {
      var ratingHash = {},
        ratingArray = [0,0,0,0,0];

      for (var i = 0, max = data.length; i < max; i++) {
        ratingHash[data[i].rating] = (ratingHash[data[i].rating] || 0) + 1;
      }

      for (var j = 0; j < ratingArray.length; j++) {
        ratingArray[j] = {
          rating: j + 1,
          count: ratingHash[ j + 1 ]
        }
      }
      // for (var rating in ratingHash) {
      //   if (ratingHash.hasOwnProperty(rating)) {
      //     ratingArray[rating] = {
      //       rating: +rating,
      //       count: ratingHash[rating]
      //     };
      //   }
      // }

      return ratingArray;d//.sort(sortByRating);
    }

    function sortByRating(a, b) {
      return a.rating > b.rating ? 1 : 0;
    }

    var width = 100,
      height = width / 2,
      padding = width * 0.1;

    var barHeight = d3.scale.linear().range([10, height - 10]),
      barX = d3.scale.ordinal().domain([1,2,3,4,5]).rangeBands([0, width]);

    // create an instance of the chart on a d3 selection
    var bars = d3.select('.bar-chart')
      .append('svg')
      .attr('height', height)
      .attr('width', width)
      .chart('BarChart')
      .initialY(function() {
        return d3.max(barHeight.range());
      })
      .initialH(0)
      .height(function(d) {
        return barHeight(d.count) || 1;
      })
      .width(function(d, i) {
        return barX.rangeBand() - padding;
      })
      .xAttr(function(d) {
        return barX(d.rating) + (padding / 2);
      })
      .yAttr(function(d, i) {
        return height - (barHeight(d.count) || 1);
      })
      .color('#4A90E2');

    // update the bar chart when ratings change      
    ratings.subscribe(function(newValue){
      var data = bundleRatings(newValue);
      
      var max = d3.max(data, function(d) { return d.count; });
      barHeight.domain([0, max]);

      bars.draw(data);
    });


    var avgCumulative = ko.observable(0);

    // reset the avg cumulative any time the data set changes
    ratings.subscribe(function(newValue) {
      avgCumulative(0);
    });

    var xScale2 = d3.time.scale().range([10, 100 - 10]);   

    var area = d3.svg.area()
      .x(function(d) {
        return xScale2(new Date(d.date));
      })
      .y0(height)
      .y1(function(d, i) {
        var c = avgCumulative(),
          r = +d.rating,
          count = i + 1;

        if (r < c) r = -r;

        var avg = ((c * i) + r) / count;
        avgCumulative(avg);
        
        return yScale(avg);
      });

    var cumulative = d3.select('.cumulative')
      .append('svg')
      .attr('height', height)
      .attr('width', 100)
      .chart('AreaGraph')
      .area(area);

    // update the cumulative area graph when ratings change
    ratings.subscribe(function(newValue) {
      xScale2.domain(dateExtent());
      cumulative.draw([newValue]);
    });

  });

})();
