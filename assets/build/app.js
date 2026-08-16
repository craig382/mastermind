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
}, log = console.log.bind(console);
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
        var turn_template = $(this.template).html(), turn_html = '';
        turn_html = _.template(turn_template, this.model.toJSON()).toString();
        this.$el.html(turn_html);
        return this.el;
    },
    /**
     * Place a piece (or, when frozen, set the shared nub color).
     * @param {string} color
     * @param {number|string} place
     */
    placePiece: function (color, place) {
        var turnModel = this.model;
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
            Mastermind.GameView.allPiecesView.setNub(code_array[place]);
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
        var target = e.currentTarget, hole_index = target ? ($(target).attr('id') || '0') : '0', color_class = Mastermind.GameView.allPiecesView.getNub();
        // log('holeClicked: hole_index = ', hole_index, ' color_class = ' 	, color_class);
        this.placePiece(color_class, hole_index);
    },
    /** Check whether the turn's code has no holes. @returns {boolean} */
    codeIsValid: function () {
        var turnModel = this.model;
        var code_complete = false, code_array = turnModel.get('code'), num_holes = code_array.length;
        for (var i = 0; i < code_array.length; i += 1) {
            if (code_array[i] !== 'X') {
                num_holes -= 1;
            }
        }
        code_complete = (num_holes === 0);
        return code_complete;
    },
    hideTurnButton: function () {
        var turnModel = this.model;
        turnModel.set('disabled_class', 'hidden');
        this.render();
    },
    showTurnButton: function () {
        var turnModel = this.model;
        turnModel.set('disabled_class', '');
        this.render();
    },
    /**
     * User clicked the guess button for this turn.
     * @param {Event} e
     */
    guessClicked: function (e) {
        var turnModel = this.model;
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
        var turnModel = this.model;
        this.freezeRow();
        Mastermind.GameView.checkGuess(turnModel.get('code'));
    },
    freezeRow: function () {
        var turnModel = this.model;
        turnModel.set('locked_class', 'frozen');
        this.hideTurnButton();
    },
    activateRow: function () {
        var turnModel = this.model;
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
        var solutionModel = this.model;
        // Color X is not a color.
        // Color X means "remove color" or "no color".
        // Subtract 1 because color X cannot be part of the code.
        var num_colors = Mastermind.colors.length - 1, cur_color = 'X', solution = [];
        for (var i = 0; i < 4; i += 1) {
            var random_index = Math.floor(Math.random() * num_colors);
            cur_color = Mastermind.colors[random_index];
            solution.push(cur_color);
        }
        solutionModel.set('code', solution);
        log('newSolution:', solution);
    },
    render: function () {
        var solution_template = $(this.template).html(), solution_html = _.template(solution_template, this.model.toJSON());
        this.$el.html(solution_html);
        return this.el;
    },
    /** @param {boolean} game_won */
    setSolved: function (game_won) {
        var solutionModel = this.model;
        solutionModel.set('button_text', 'New Game');
        solutionModel.set('locked_class', '');
    },
    getCode: function () {
        var solutionModel = this.model;
        return solutionModel.get('code');
    },
    /**
     * Reveal or restart action from the solution view.
     * @param {Event} e
     */
    revealClicked: function (e) {
        var solutionModel = this.model;
        e.preventDefault();
        if (solutionModel.get('button_text') === 'quit') {
            Mastermind.GameView.quit();
        }
        else {
            Mastermind.GameView.restart();
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
        var target = e.currentTarget, classes = target ? ($(target).attr('class') || '') : '', nub_class = (classes.split(' ')[1] || 'X');
        this.setNub(nub_class);
    },
    /** @param {string} nub_class */
    setNub: function (nub_class) {
        var allPiecesModel = this.model;
        log('setNub, nub_class = ', nub_class);
        allPiecesModel.set('nub_class', nub_class);
    },
    /**
     * Get current nub class.
     * @returns {string}
     */
    getNub: function () {
        var allPiecesModel = this.model;
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
        win: undefined
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
        this.turns = new Mastermind.Turn_collection();
        this.solution = new Mastermind.Turn({ locked_class: 'hidden' });
        this.solutionView = new Mastermind.Solution_view({ model: this.solution });
        this.allPiecesView = new Mastermind.AllPieces_view();
        this.turn_views = [];
        this.resetBoard(); // START
        this.model.on('change:win', this.gameOver, this);
    },
    resetBoard: function () {
        var game = this.model;
        var turns_array = [], turn_model = {}, cur_turn = {}, class_name = '', locked_class = '', disabled_class = '';
        for (var i = 0; i < game.get('num_turns'); i += 1) {
            // initialize the model
            class_name = (i % 2) ? 'alt' : '';
            if (i === 0) {
                locked_class = 'active';
                disabled_class = '';
            }
            else {
                locked_class = 'locked';
                disabled_class = 'hidden';
            }
            turn_model = new Mastermind.Turn({ alt_class: class_name, locked_class: locked_class, disabled_class: disabled_class, id: i });
            cur_turn = new Mastermind.Turn_view({ model: turn_model });
            turns_array.push(turn_model);
            this.turn_views.push(cur_turn);
        }
        // reset the game over message
        $(this.gameOver_el).attr('class', '');
        this.turns.reset(turns_array);
        this.render();
        log('resetBoard executed');
    },
    render: function () {
        var html_els_array = [this.header_template, this.gameOver_template, this.solutionView.render()];
        for (var i = 0; i < this.turns.length; i += 1) {
            var turn_view = this.turn_views[i];
            html_els_array.push(turn_view.render());
        }
        $(this.board_el).html(html_els_array);
    },
    checkGuess: function (guess_array) {
        var solution_copy = this.solutionView.getCode().slice(0), guess_copy = guess_array.slice(0), num_black = 0, num_white = 0, code_length = 4;
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
        this.handleResults(num_black, num_white);
    },
    handleResults: function (num_black, num_white) {
        var game = this.model;
        var hint_string = '<p class="hint b">' + num_black + '</p><p class="hint w">' + num_white + '</p>';
        this.getCurrentTurn().set('hint_string', hint_string);
        game.set('turns_remaining', game.get('turns_remaining') - 1);
        if (num_black === 4) {
            game.set('win', true);
        }
        else if (game.get('turns_remaining') === 0) {
            game.set('win', false);
        }
        else {
            var t = this.getCurrentTurn();
            t.set('disabled_class', '');
            t.set('locked_class', 'active');
        }
    },
    getPreviousTurn: function () {
        var cur_turn = this.getCurrentTurn(), prev_id = cur_turn.get('id') - 1, prev_turn = this.turns.get(prev_id);
        return prev_turn;
    },
    getCurrentTurn: function () {
        var game = this.model, turn_index = game.get('num_turns') - game.get('turns_remaining'), cur_turn = this.turns.at(turn_index);
        return cur_turn;
    },
    getNextTurn: function () {
        var cur_turn = this.getCurrentTurn(), next_id = cur_turn.get('id') + 1, next_turn = this.turns.get(next_id);
        return next_turn;
    },
    quit: function () {
        var game = this.model;
        game.set('win', false);
    },
    gameOver: function () {
        var game = this.model;
        var you_won = game.get('win');
        this.solutionView.setSolved(you_won);
        if (you_won) {
            this.getPreviousTurn().set('locked_class', 'correct');
            $(this.gameOver_el).text('you won!');
            $(this.gameOver_el).addClass('win');
        }
        else {
            $(this.gameOver_el).text('you lost.');
            $(this.gameOver_el).addClass('lose');
        }
    },
    restart: function () {
        Mastermind.init();
    }
});
$(function () {
    Mastermind.init();
});
