function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  //var text = " 一二三四五六七八九　　";
  var self = this;
  //var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 1048576) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  //inner.textContent = text[text2(tile.value)];
    inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(20);
  mytxt[0]="听听第一张创作专辑（1999）";
  mytxt[1]="第168场演唱会（1999）";
  mytxt[2]="就让我吻你吻你吻你（2000）";
  mytxt[3]="十万青年站出来（2000）";
  mytxt[4]="我们活在这人生海海（2001）";
  mytxt[5]="你要去哪里 请不要走（2001）";
  mytxt[6]="We are Mayday（2003）";
  mytxt[7]="一起去天空之城吧（2003）";
  mytxt[8]="我愿意付出所有来换一个时光机（2003）";
  mytxt[9]="神的孩子都在跳舞（2004）";
  mytxt[10]="Final Home 当我们混在一起（2004-06）";
  mytxt[11]="如果你快乐不是为我（2005）"; 
  mytxt[12]="只因我为爱而生（2006）"; 
  mytxt[13]="离开地球表面（2007-08）"; 
  mytxt[14]="后青春期的诗（2008）"; 
  mytxt[15]="属于你的D.N.A（2009-10）"; 
  mytxt[16]="你的第二人生（2011）"; 
  mytxt[17]="多遥远多纠结多想念（2011）"; 
  mytxt[18]="一起登上诺亚方舟（2011-13）"; 
  mytxt[19]="一步步走过最美心愿（通关了啦！~\(≧▽≦)/~)"; 

  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  
  var type    = won ? "game-won" : "game-over";
  var message = won ? "一步步走过最美心愿（通关了啦！~\(≧▽≦)/~)" : mytxt[text3(maxscore)-1];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "mayday");
  tweet.setAttribute("data-url", "http://llalex.github.io/mayday/");
  tweet.setAttribute("data-counturl", "http://llalex.github.io/mayday/");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at Mayday2048, a game where you " +
             "join numbers to score high! #Mayday2048";
  tweet.setAttribute("data-text", text);

  return tweet;
};
