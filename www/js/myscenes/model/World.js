var World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;

        this.history = [];
    }

    World.prototype.init = function () {
        this.snakes = this.domainGridHelper.getSnakes();
        this.worldView.drawLevel(this.snakes, this.domainGridHelper.getGround(), this.domainGridHelper.getNewParts(),
            this.domainGridHelper.getSpikes());
    };

    World.prototype.getHeads = function () {
        var heads = [];
        this.snakes.forEach(function (snake) {
            heads.push(snake[0]);
            heads.push(snake[snake.length - 1]);
        }, this);
        return heads;
    };

    World.prototype.moveSnakeLeft = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            if (this.gridHelper.equals(snake[0], head) || this.gridHelper.equals(snake[snake.length - 1], head))
                return this.__moveSnake(head.u - 1, head.v, snake, callback);
        }
        return false;
    };

    World.prototype.moveSnakeRight = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            if (this.gridHelper.equals(snake[0], head) || this.gridHelper.equals(snake[snake.length - 1], head))
                return this.__moveSnake(head.u + 1, head.v, snake, callback);
        }
        return false;
    };

    World.prototype.moveSnakeTop = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            if (this.gridHelper.equals(snake[0], head) || this.gridHelper.equals(snake[snake.length - 1], head))
                return this.__moveSnake(head.u, head.v - 1, snake, callback);
        }
        return false;
    };

    World.prototype.moveSnakeBottom = function (head, callback) {
        for (var i = 0; i < this.snakes.length; i++) {
            var snake = this.snakes[i];
            if (this.gridHelper.equals(snake[0], head) || this.gridHelper.equals(snake[snake.length - 1], head))
                return this.__moveSnake(head.u, head.v + 1, snake, callback);
        }
        return false;
    };

    World.prototype.__moveSnake = function (u, v, snake, callback) {
        var headMove = this.domainGridHelper.canSnakeMoveHead(snake, u, v);
        var tailMove = this.domainGridHelper.canSnakeMoveTail(snake, u, v);
        if (!(headMove || tailMove))
            return false;

        var self = this;

        function postMove() {
            if (self.domainGridHelper.isSnakeInAir(snake)) {
                var gravityHistory = self.domainGridHelper.applyGravity(snake);
                self.history.push(gravityHistory);
                self.worldView.moveSnake(gravityHistory.changes, postMove);

            } else if (self.domainGridHelper.isSnakeJustOverSpike(snake) ||
                self.domainGridHelper.isSnakeOutOfMapNext(snake)) {

                self.undoLastMove(callback);

            } else if (callback)
                callback();
        }

        var historyEntry = (tailMove && !headMove) ? this.domainGridHelper.moveSnakeReverse(snake, u, v) :
            this.domainGridHelper.moveSnake(snake, u, v);
        this.history.push(historyEntry);
        this.worldView.moveSnake(historyEntry.changes, postMove);
        return true;
    };

    World.prototype.undoLastMove = function (callback) {
        if (this.history.length < 1)
            return false;

        var self = this;
        var last;

        function extendedCallback() {
            if (last.type != 'user') {
                undo();
            } else if (callback)
                callback();
        }

        function undo() {
            last = self.history.pop();
            self.domainGridHelper.undo(last.changes, last.entity);
            self.worldView.undoMove(last.changes, extendedCallback);
            return last;
        }

        undo();
        return true
    };

    return World;
})();