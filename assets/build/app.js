"use strict";
/* Minimal TypeScript scaffold: use `declare var` for external globals. */
/** @type {any} */
var Mastermind = {
    colors: ['A', 'B', 'C', 'D', 'E', 'F', 'X'],
    /**
     * Initialize the game by constructing the main game view.
     * @returns {void}
     */
    init: function () {
        // Create the primary game view and pass in a new game model.
        this.GameView = new this.Game_view({ model: new this.Game() });
    }
};
var log = console.log.bind(console);
function getGameView() {
    return Mastermind.GameView;
}
function getTurnModel(view) {
    return view.model;
}
function getSolutionModel(view) {
    return view.model;
}
function getAllPiecesModel(view) {
    return view.model;
}
function getGameModel(view) {
    return view.model;
}
function asGameView(view) {
    return view;
}
function createTurn(attrs = {}) {
    return new Mastermind.Turn(attrs);
}
function createTurnCollection() {
    return new Mastermind.Turn_collection();
}
function createTurnView(model) {
    return new Mastermind.Turn_view({ model: model });
}
function createSolutionView(model) {
    return new Mastermind.Solution_view({ model: model });
}
function createAllPiecesView() {
    return new Mastermind.AllPieces_view();
}
/**
 * Model shared by both the turn rows and the solution row.
 * It stores the current code state, hint text, display classes,
 * and whether the row is active, locked, or frozen.
 */
Mastermind.Turn = Backbone.Model.extend({
    defaults: {
        id: -1,
        code: ['X', 'X', 'X', 'X'],
        hint_string: '',
        alt_class: '', // presentation
        disabled_class: 'disabled', // for the guess button
        locked_class: 'locked',
        button_text: 'quit' // for the solution view
    }
});
Mastermind.Turn_collection = Backbone.Collection.extend({
    model: Mastermind.Turn,
    initialize: function () {
        /* */
    }
});
/*************************************************************************************************
* Turn View
*************************************************************************************************/
Mastermind.Turn_view = Backbone.View.extend({
    tagName: 'li',
    className: 'turn',
    template: 'script#turnView',
    guess_el: 'input.guess',
    events: {
        'click input.go': 'guessClicked',
        'click div.piece': 'holeClicked'
    },
    initialize: function () {
        _.bindAll(this, 'render', 'placePiece');
        this.model.on('change:code', this.render);
        this.model.on('change:hint_string', this.render);
        this.model.on('change:locked_class', this.render);
    },
    render: function () {
        var turn_template = $(this.template).html();
        var turn_html = '';
        turn_html = _.template(turn_template, this.model.toJSON()).toString();
        this.$el.html(turn_html);
        return this.el;
    },
    /**
     * Place a piece (or, when frozen, set the shared nub color).
     * @param {string} color
     * @param {number} place
     */
    placePiece: function (color, place) {
        var turnModel = getTurnModel(this);
        var gameView = getGameView();
        // For a frozen (past) turn, set the nub 
        // (the color picker) to the color of the frozen piece.
        // For an active (current) or locked (future) turn, 
        // set the piece to the nub (the color picker).
        // The player can use locked (future) turns 
        // as a scratch pad to plan their next guess.
        // log('place piece',color,place);
        var code_array = turnModel.get('code').slice(0);
        if (turnModel.get('locked_class') === 'frozen') {
            // set the nub color to the color clicked in the frozen turn
            gameView.allPiecesView.setNub(code_array[place]);
        }
        else {
            code_array[place] = color;
            turnModel.set({ code: code_array });
            log('code_array', code_array);
        }
    },
    /**
     * Handle click on a hole in a turn row.
     * @param {Event} e
     */
    holeClicked: function (e) {
        // log('holeClicked');
        var gameView = getGameView();
        var target = e.currentTarget;
        var hole_id = target ? ($(target).attr('id') || '0') : '0';
        var hole_index = parseInt(hole_id, 10);
        var color_class = gameView.allPiecesView.getNub();
        // log('holeClicked: hole_index = ', hole_index, ' color_class = ' 	, color_class);
        this.placePiece(color_class, hole_index);
    },
    /** Check whether the turn's code has no holes. @returns {boolean} */
    codeIsValid: function () {
        var turnModel = getTurnModel(this);
        var code_complete = false;
        var code_array = turnModel.get('code');
        var num_holes = code_array.length;
        for (var i = 0; i < code_array.length; i += 1) {
            if (code_array[i] !== 'X') {
                num_holes -= 1;
            }
        }
        code_complete = (num_holes === 0);
        return code_complete;
    },
    hideTurnButton: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', 'hidden');
        this.render();
    },
    showTurnButton: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', '');
        this.render();
    },
    /**
     * User clicked the guess button for this turn.
     * @param {Event} e
     */
    guessClicked: function (_e) {
        var turnModel = getTurnModel(this);
        if (turnModel.get('locked_class') !== 'active') {
            return;
        }
        if (this.codeIsValid() === false) {
            return;
        }
        this.goGuess();
    },
    /**
     * Execute the guess flow for this turn.
     */
    goGuess: function () {
        var turnModel = getTurnModel(this);
        var gameView = getGameView();
        this.freezeRow();
        gameView.checkGuess(turnModel.get('code'));
    },
    freezeRow: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class', 'frozen');
        this.hideTurnButton();
    },
    activateRow: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class', 'active');
        this.showTurnButton();
    }
});
/*************************************************************************************************
* Solution View
*************************************************************************************************/
Mastermind.Solution_view = Backbone.View.extend({
    tagName: 'li',
    template: 'script#solutionView',
    code_el: 'span#code',
    events: {
        'click input#reveal': 'revealClicked'
    },
    initialize: function () {
        this.newSolution();
        this.model.on('change:locked_class', this.render, this);
    },
    newSolution: function () {
        var solutionModel = getSolutionModel(this);
        // Color X is not a color.
        // Color X means "remove color" or "no color".
        // Subtract 1 because color X cannot be part of the code.
        var playable_colors = Mastermind.colors.filter(function (c) {
            return c !== 'X';
        });
        var num_colors = playable_colors.length;
        var cur_color = 'A';
        var solution = [];
        for (var i = 0; i < 4; i += 1) {
            var random_index = Math.floor(Math.random() * num_colors);
            cur_color = playable_colors[random_index];
            solution.push(cur_color);
        }
        solutionModel.set('code', solution);
        log('newSolution:', solution);
    },
    render: function () {
        var solution_template = $(this.template).html();
        var solution_html = _.template(solution_template, this.model.toJSON());
        this.$el.html(solution_html);
        return this.el;
    },
    /** @param {boolean} _game_won */
    setSolved: function (_game_won) {
        var solutionModel = getSolutionModel(this);
        solutionModel.set('button_text', 'New Game');
        solutionModel.set('locked_class', '');
    },
    getCode: function () {
        var solutionModel = getSolutionModel(this);
        return solutionModel.get('code');
    },
    /**
     * Reveal or restart action from the solution view.
     * @param {Event} e
     */
    revealClicked: function (e) {
        var solutionModel = getSolutionModel(this);
        var gameView = getGameView();
        e.preventDefault();
        if (solutionModel.get('button_text') === 'quit') {
            gameView.quit();
        }
        else {
            gameView.restart();
        }
    }
});
/*************************************************************************************************
* All Pieces View
*************************************************************************************************/
Mastermind.AllPieces = Backbone.Model.extend({
    defaults: {
        nub_class: 'X'
    }
});
Mastermind.AllPieces_view = Backbone.View.extend({
    el: 'div#allPieces',
    cur_piece_el: 'div#current_piece',
    piece_template: '<div class="piece <%= nub_class %>"><%= nub_class %></div>',
    nub_template: '<div id="current_piece" class="piece <%= nub_class %>"><%= nub_class %></div>',
    events: {
        'click div.piece': 'nubClicked'
    },
    initialize: function () {
        this.model = new Mastermind.AllPieces();
        this.model.on('change:nub_class', this.render, this);
        this.render(); // reset the piece div
        // this.resetNub(); // reset the nub to X
    },
    render: function () {
        var nub_copy = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nub_copy);
    },
    /**
     * User clicked a color in the palette.
     * @param {Event} e
     */
    nubClicked: function (e) {
        // log('nubClick');
        var target = e.currentTarget;
        var classes = target ? ($(target).attr('class') || '') : '';
        var nub_class = (classes.split(' ')[1] || 'X');
        this.setNub(nub_class);
    },
    /** @param {string} nub_class */
    setNub: function (nub_class) {
        var allPiecesModel = getAllPiecesModel(this);
        log('setNub, nub_class = ', nub_class);
        allPiecesModel.set('nub_class', nub_class);
    },
    /**
     * Get current nub class.
     * @returns {string}
     */
    getNub: function () {
        var allPiecesModel = getAllPiecesModel(this);
        return allPiecesModel.get('nub_class');
    },
    resetNub: function () {
        this.setNub('X');
    }
});
/*************************************************************************************************
* Game View
*************************************************************************************************/
Mastermind.Game = Backbone.Model.extend({
    defaults: {
        num_turns: 10,
        turns_remaining: 10,
        status: 'notStarted'
    }
});
Mastermind.Game_view = Backbone.View.extend({
    el: 'div#game',
    board_el: 'ul#board',
    header_template: '<div id="header">Mastermind</div>',
    gameOver_el: 'div#gameOver',
    gameOver_template: '<div id="gameOver"></div>',
    events: { /* see initialize */},
    initialize: function () {
        var gameView = asGameView(this);
        gameView.turns = createTurnCollection();
        gameView.solution = createTurn({ locked_class: 'hidden' });
        gameView.solutionView = createSolutionView(gameView.solution);
        gameView.allPiecesView = createAllPiecesView();
        gameView.turn_views = [];
        this.model.on('change:status', this.gameOver, this);
        this.resetBoard(); // START
        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('status', 'inPlay');
    },
    resetBoard: function () {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var turns = gameView.turns;
        var turns_array = [];
        for (var i = 0; i < game.get('num_turns'); i += 1) {
            // initialize the model
            var class_name = (i % 2) ? 'alt' : '';
            var locked_class;
            var disabled_class;
            if (i === 0) {
                locked_class = 'active';
                disabled_class = '';
            }
            else {
                locked_class = 'locked';
                disabled_class = 'hidden';
            }
            var turn_model = createTurn({ alt_class: class_name, locked_class: locked_class, disabled_class: disabled_class, id: i });
            var cur_turn = createTurnView(turn_model);
            turns_array.push(turn_model);
            gameView.turn_views.push(cur_turn);
        }
        // reset the game over message
        $(this.gameOver_el).attr('class', '');
        turns.reset(turns_array);
        this.render();
        log('resetBoard executed');
    },
    render: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var html_els_array = [this.header_template, this.gameOver_template, gameView.solutionView.render()];
        for (var i = 0; i < turns.length; i += 1) {
            var turn_view = gameView.turn_views[i];
            html_els_array.push(turn_view.render());
        }
        $(this.board_el).html(html_els_array);
    },
    checkGuess: function (guess_array) {
        var gameView = asGameView(this);
        var solution_copy = gameView.solutionView.getCode().slice(0);
        var guess_copy = guess_array.slice(0);
        var num_black = 0;
        var num_white = 0;
        var code_length = 4;
        for (var i = 0; i < code_length; i += 1) {
            if (guess_copy[i] === solution_copy[i]) {
                num_black += 1;
                guess_copy[i] = 'x';
                solution_copy[i] = 'z';
            }
        }
        for (var j = 0; j < code_length; j += 1) {
            for (var k = 0; k < code_length; k += 1) {
                if (guess_copy[j] === solution_copy[k]) {
                    num_white += 1;
                    guess_copy[j] = 'x';
                    solution_copy[k] = 'z';
                }
            }
        }
        gameView.handleResults(num_black, num_white);
    },
    handleResults: function (num_black, num_white) {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var hint_string = '<p class="hint b">' + num_black + '</p><p class="hint w">' + num_white + '</p>';
        gameView.getCurrentTurn().set('hint_string', hint_string);
        game.set('turns_remaining', game.get('turns_remaining') - 1);
        if (num_black === 4) {
            game.set('status', 'won');
        }
        else if (game.get('turns_remaining') === 0) {
            game.set('status', 'lost');
        }
        else {
            var t = gameView.getCurrentTurn();
            t.set('disabled_class', '');
            t.set('locked_class', 'active');
        }
    },
    getPreviousTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn = this.getCurrentTurn();
        var prev_id = cur_turn.get('id') - 1;
        var prev_turn = turns.get(prev_id);
        return prev_turn;
    },
    getCurrentTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var game = getGameModel(this);
        var turn_index = game.get('num_turns') - game.get('turns_remaining');
        var cur_turn = turns.at(turn_index);
        return cur_turn;
    },
    getNextTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn = this.getCurrentTurn();
        var next_id = cur_turn.get('id') + 1;
        var next_turn = turns.get(next_id);
        return next_turn;
    },
    quit: function () {
        var game = getGameModel(this);
        game.set('status', 'lost');
    },
    gameOver: function () {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var status = game.get('status');
        if (status === 'notStarted' || status === 'inPlay') {
            return;
        }
        var you_won = (status === 'won');
        gameView.solutionView.setSolved(you_won);
        if (status === 'won') {
            gameView.getPreviousTurn().set('locked_class', 'correct');
            $(gameView.gameOver_el).text('you won!');
            $(gameView.gameOver_el).addClass('win');
        }
        else {
            $(gameView.gameOver_el).text('you lost.');
            $(gameView.gameOver_el).addClass('lose');
        }
    },
    restart: function () {
        Mastermind.init();
    }
});
$(function () {
    Mastermind.init();
});
