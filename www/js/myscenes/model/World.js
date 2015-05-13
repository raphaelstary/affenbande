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
        this.updateModel();
        this.worldView.drawLevel(this.snakes, this.ground, this.newParts, this.spikes);
    };

    World.prototype.updateModel = function () {
        this.snakes = this.domainGridHelper.getSnakes();
        this.heads = [];
        this.snakes.forEach(function (snake) {
            this.heads.push(snake[0]);
            this.heads.push(snake[snake.length - 1]);
        }, this);
        this.ground = this.domainGridHelper.getGround();
        this.newParts = this.domainGridHelper.getNewParts();
        this.spikes = this.domainGridHelper.getSpikes();
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

        function postGravity() {
            if (self.domainGridHelper.isSnakeOutOfMap(snake) || self.domainGridHelper.isSnakeOverSpike(snake)) {
                var lastChangeSet = self.history.pop();
                self.domainGridHelper.undo(lastChangeSet, snake);
                self.worldView.undoMove(lastChangeSet, function () {
                    var lastChangeSet = self.history.pop();
                    self.domainGridHelper.undo(lastChangeSet, snake);
                    self.updateModel();
                    self.worldView.undoMove(lastChangeSet, callback);
                });
            } else {
                if (callback)
                    callback();
            }
        }

        function postMove() {
            if (self.domainGridHelper.isSnakeInAir(snake)) {
                var gravityChangeSet = self.domainGridHelper.applyGravity(snake);
                self.worldView.moveSnake(gravityChangeSet, postGravity);

            } else if (self.domainGridHelper.isSnakeOverSpike(snake) || self.domainGridHelper.isSnakeOutOfMap(snake)) {
                var lastChangeSet = self.history.pop();
                self.domainGridHelper.undo(lastChangeSet, snake);
                self.updateModel();
                self.worldView.undoMove(lastChangeSet, callback);

            } else {
                if (callback)
                    callback();
            }
        }

        var changeSet = (tailMove && !headMove) ? this.domainGridHelper.moveSnakeReverse(snake, u, v) :
            this.domainGridHelper.moveSnake(snake, u, v);
        this.history.push(changeSet);
        this.worldView.moveSnake(changeSet, postMove);
        return true;
    };

    return World;
})();