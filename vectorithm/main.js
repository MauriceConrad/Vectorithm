var phantom = require('phantom');
var fs = require("fs");



/*if (process.argv[2]) {
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].search("=") > -1) {
      argSplits = process.argv[i].split("=");
      if (argSplits[1] == "true") {
        argSplits[1] = true;
      }
      if (argSplits[1] == "false") {
        argSplits[1] = false;
      }
      cardSettings[argSplits[0]] = argSplits[1];
    }
  }
}*/

module.exports = {
  options: {
    width: "9cm",
    border: false,
    max: 100,
    output: "tickets.pdf",
    variables: {},
    source: '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
  },
  cardsAdded: 0,
  create: function(handler) {
    var sitepage = null;
    var phInstance = null;
    var variables = {};
    var cardFormat = 1;
    var cardsInWidth, cardsInHeight, cardsOnSite;
    var startTime, endTime;
    var allCardsOuterHTML = "";
    var self = this;
    if (self.options.source.search('viewBox="') > -1) {
      var viewBoxStrPos = self.options.source.indexOf('viewBox="', 0);
      var viewBoxStrEndsPos = self.options.source.indexOf('"', viewBoxStrPos + 9);
      var viewBoxStr = self.options.source.substring(viewBoxStrPos + 9, viewBoxStrEndsPos);
      var viewBoxParts = viewBoxStr.split(" ");
      cardFormat = viewBoxParts[3] / viewBoxParts[2];
    }
    else {
      cardFormat = height / width;
    }
    variables = self.options.variables;
    phantom.create()
        .then(instance => {
            phInstance = instance;
            startTime = new Date().getTime();
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            page.property('paperSize', {
              width: 842,
              height: 595,
              orientation: 'landscape'
            });
            return page.open(__dirname + '/templates/source.html');
        })
        .then(content => {
            handle();
        })
        .catch(error => {
            console.log(error);
            phInstance.exit();
        });
    function handle(outputFile) {
      var cardSettings = self.options;
      sitepage.evaluate(function() {
        return document.getElementById("card-main").innerHTML;
      }).then(function(result) {
        if ((cardSettings.height == undefined && cardSettings.width != undefined)) {
          cardSettings.pxWidth = (cardSettings.width.replace("cm", "") / 29.7) * 842;
          cardSettings.pxHeight = cardSettings.pxWidth * cardFormat;
        }
        if (cardSettings.width == undefined && cardSettings.height != undefined) {
          cardSettings.pxHeight = (cardSettings.height.replace("cm", "") / 21) * 595;
          cardSettings.pxWidth = cardSettings.pxHeight / cardFormat;
        }
        if ((cardSettings.width != undefined && cardSettings.height != undefined)) {
          cardSettings.pxWidth = (cardSettings.width.replace("cm", "") / 29.7) * 842;
          cardSettings.pxHeight = (cardSettings.height.replace("cm", "") / 21) * 595;
        }
        if (cardSettings.width == undefined && cardSettings.height == undefined) {
          cardSettings.pxWidth = 842 / 4;
          cardSettings.pxHeight = cardSettings.pxWidth * cardFormat;
        }
        cardSettings.pxHeight = Math.round(cardSettings.pxHeight);
        cardsInWidth = Math.floor(824 / cardSettings.pxWidth);
        cardsInHeight = Math.floor(595 / cardSettings.pxHeight);
        cardsOnSite = cardsInWidth * cardsInHeight;
        var offsetRight = 842 - (cardsInWidth * cardSettings.pxWidth);
        var rightVerticalCount = Math.floor(offsetRight / cardSettings.pxHeight);
        var absCardsOnSite = rightVerticalCount + cardsOnSite;
        //console.log(rightVerticalCount, absCardsOnSite);
        var cardsOffset = (595 - cardsInHeight * cardSettings.pxHeight);

        for (var i = 0; i < cardSettings.max; i++) {
          var addOffset = cardsOnSite - (i % (cardsOnSite)) <= cardsInWidth ? cardsOffset : 0;
          addCard(cardSettings, addOffset);
        }
      });
    }
    function addCard(cardSettings, currOffset) {
      var parsedContext = parseContextVars(self.options.source);
      module.exports.cardsAdded++;
      var classes = "";
      if (cardSettings.border == true) {
        classes = " bordered";
      }
      var dataURi = 'data:image/svg+xml;utf8,' + encodeURI(parsedContext);
      var bgColor = "transparent";
      allCardsOuterHTML += '<div class="card' + classes + '" style="width: ' + cardSettings.pxWidth + 'px; height: ' + cardSettings.pxHeight + 'px; margin-bottom: ' + currOffset + 'px; box-sizing: border-box; background-color: ' + bgColor + '"><img src="' + dataURi + '" alt="Card" style="width: 100%; height: 100%;"/></div>';
      if (module.exports.cardsAdded >= cardSettings.max) {
        sitepage.evaluate(function(cardsStr) {
          var cardMain = document.getElementById("card-main");
          cardMain.innerHTML = cardsStr;
          return cardMain.innerHTML;
        }, allCardsOuterHTML).then(function(ret) {
          endTime = new Date().getTime();
          sitepage.render(cardSettings.output, function(arg) {
            if (!arg) {
              console.log("Successfully Saved!");
            }
          });
          phInstance.exit();
          handler({
            "count": cardSettings.max,
            "file": cardSettings.output,
            "success": true,
            "time": endTime - startTime
          });
        });
      }
    }
    var currParseRepeat = -1;
    function parseContextVars(context) {
      currParseRepeat++;
      if (variables["count"] != undefined) {
        var currArrayLength = variables["count"].length;
        if (currArrayLength == 0) {
          currArrayLength = 1;
        }
        variables.count[currParseRepeat % currArrayLength]++;
      }
      var startPos = 0;
      var allContextVars = [];
      while (context.indexOf("{{", startPos) > -1) {
        var currStart = context.indexOf("{{", startPos);
        var currEnd = context.indexOf("}}", currStart);
        startPos = currEnd + 1;
        allContextVars.push({
          start: currStart,
          end: currEnd,
          inner: context.substring(currStart + 2, currEnd)
        });
      }
      var searchStartPos = 0;
      for (var i = 0; i < allContextVars.length; i++) {
        if (variables[allContextVars[i].inner].constructor == Array) {
          var currArrayLength = variables[allContextVars[i].inner].length;
          if (currArrayLength == 0) {
            currArrayLength = 1;
          }
          var replaceText = variables[allContextVars[i].inner][currParseRepeat % currArrayLength];
          //replaceText = "x";
        }
        else {
          var replaceText = variables[allContextVars[i].inner];
        }
        if (replaceText == undefined) {
          replaceText = "placeholder";
        }
        context = context.replace("{{" + allContextVars[i].inner + "}}", replaceText);
      }
      return context;
    }
  }
};
