var fs = require("fs");

var vectorithm = require(__dirname + "/vectorithm");

vectorithm.options.variables = {
  "color": ["#f00", "#00f", "#0f0"],
  "count": [0]
};
vectorithm.options.output = __dirname + "/cards.pdf";
vectorithm.options.max = 100;
vectorithm.options.border = true;
vectorithm.options.width = "9cm";
fs.readFile(__dirname + "/source.svg", "utf8", function(err, data) {
  if (err) {
    return console.log(err);
  }
  vectorithm.options.source = data;
  vectorithm.create(function(result) {
    console.log(result);
  });
});

//console.log(ticketGenerator);
