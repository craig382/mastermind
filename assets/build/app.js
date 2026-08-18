"use strict";
var mm = {
    codeColors: 'ABCDEF',
    palletColors: 'ABCDEFX',
    nubColor: 'X',
    nColors: 6,
    nCode: 4,
    nTurns: 10,
    solution: '',
    /**
     * Initialize the game by constructing the main game view.
     */
    init: function () {
        // Create the primary game view and pass in a new game model.
        this.gameView = createGameView(createGameModel());
    }
};
var log = console.log.bind(console);
function required(value) {
    if (value === undefined) {
        throw new Error('Attempted to get an undefined Backbone.js model or view.');
    }
    return value;
}
function getGameView() {
    return required(mm.gameView);
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
    var TurnClass = required(mm.Turn);
    return new TurnClass(attrs);
}
function createTurnCollection() {
    var TurnCollectionClass = required(mm.TurnCollection);
    return new TurnCollectionClass();
}
function createTurnView(model) {
    var TurnViewClass = required(mm.TurnView);
    return new TurnViewClass({ model: model });
}
function createSolutionView(model) {
    var SolutionViewClass = required(mm.SolutionView);
    return new SolutionViewClass({ model: model });
}
function createAllPiecesView() {
    var AllPiecesViewClass = required(mm.AllPiecesView);
    return new AllPiecesViewClass();
}
function createAllPiecesModel() {
    var AllPiecesModelClass = required(mm.AllPieces);
    return new AllPiecesModelClass();
}
function createGameModel() {
    var GameModelClass = required(mm.Game);
    return new GameModelClass();
}
function createGameView(model) {
    var GameViewClass = required(mm.GameView);
    return new GameViewClass({ model: model });
}
/**
 * Model shared by both the turn rows and the solution row.
 * It stores the current code state, hint text, display classes,
 * and whether the row is active, locked, or frozen.
 */
mm.Turn = Backbone.Model.extend({
    defaults: {
        id: -1,
        code: 'XXXX',
        hint_string: '',
        alt_class: '', // presentation
        disabled_class: 'disabled', // for the guess button
        locked_class: 'locked',
        button_text: 'quit' // for the solution view
    }
});
mm.TurnCollection = Backbone.Collection.extend({
    model: mm.Turn,
    initialize: function () {
        /* */
    }
});
/**
 * mm.TurnView.
 */
mm.TurnView = Backbone.View.extend({
    tagName: 'li',
    className: 'turn',
    template: 'script#turnView',
    guess_el: 'input.guess',
    events: {
        'click input.go': 'guessClicked',
        'click div.piece': 'holeClicked'
    },
    /**
     * mm.TurnView.
     */
    initialize: function () {
        _.bindAll(this, 'render', 'placePiece');
        this.model.on('change:code', this.render);
        this.model.on('change:hint_string', this.render);
        this.model.on('change:locked_class', this.render);
    },
    /**
     * mm.TurnView.
     */
    render: function () {
        var turn_template = $(this.template).html();
        var turn_html = '';
        turn_html = _.template(turn_template, this.model.toJSON()).toString();
        this.$el.html(turn_html);
        return this.el;
    },
    /**
     * Place a piece (or, when frozen, set the shared nub color).
     *
     * mm.TurnView.
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
        var code = turnModel.get('code');
        // log('placePiece turnModel.get code color place:', code, color, place);
        if (turnModel.get('locked_class') === 'frozen') {
            // set the nub color to the color clicked in the frozen turn
            gameView.allPiecesView.setNub(code[place]);
        }
        else {
            var codeArray = code.split('');
            var newCode;
            codeArray[place] = color;
            newCode = codeArray.join('');
            // log('placePiece oldCode color place newCode:', code, color, place, newCode);
            turnModel.set({ code: newCode });
        }
    },
    /**
     * Handle click on a hole in a turn row.
     *
     * mm.TurnView.
     */
    holeClicked: function (e) {
        // log('holeClicked');
        var holeId = $(e.currentTarget).attr('id');
        var color = mm.nubColor;
        // log('holeClicked: holeId = ', holeId, ' color = ' 	, color);
        this.placePiece(color, holeId);
    },
    /** Check whether the turn's code has no holes.
     *
     * mm.TurnView.
     *
    */
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
    /**
     * mm.TurnView.
     */
    hideTurnButton: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', 'hidden');
        this.render();
    },
    /**
     * mm.TurnView.
     */
    showTurnButton: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', '');
        this.render();
    },
    /**
     * User clicked the guess button for this turn.
     *
     * mm.TurnView.
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
     *
     * mm.TurnView.
     */
    goGuess: function () {
        var turnModel = getTurnModel(this);
        var gameView = getGameView();
        this.freezeRow();
        gameView.checkGuess(turnModel.get('code'));
    },
    /**
     * mm.TurnView.
     */
    freezeRow: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class', 'frozen');
        this.hideTurnButton();
    },
    /**
     * mm.TurnView.
     */
    activateRow: function () {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class', 'active');
        this.showTurnButton();
    }
});
mm.SolutionView = Backbone.View.extend({
    tagName: 'li',
    template: 'script#solutionView',
    code_el: 'span#code',
    events: {
        'click input#reveal': 'revealClicked'
    },
    /**
     * mm.SolutionView
     */
    initialize: function () {
        this.newSolution();
        this.model.on('change:locked_class', this.render, this);
    },
    /**
     * mm.SolutionView
     */
    newSolution: function () {
        var randomColor;
        mm.solution = '';
        for (var i = 0; i < mm.nCode; i += 1) {
            var randomIndex = Math.floor(Math.random() * mm.nColors);
            randomColor = mm.codeColors[randomIndex];
            mm.solution += randomColor;
        }
        this.model.set('code', mm.solution);
        log('newSolution:', mm.solution);
    },
    /**
     * mm.SolutionView
     */
    render: function () {
        var solution_template = $(this.template).html();
        var solution_html = _.template(solution_template, this.model.toJSON());
        this.$el.html(solution_html);
        return this.el;
    },
    /**
     * mm.SolutionView
     */
    setSolved: function () {
        var solutionModel = getSolutionModel(this);
        solutionModel.set('button_text', 'New Game');
        solutionModel.set('locked_class', '');
    },
    /**
     * Reveal or restart action from the solution view.
     *
     * mm.SolutionView
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
/**
 * mm.AllPieces model for mm.AllPiecesView.
 */
mm.AllPieces = Backbone.Model.extend({
    defaults: {
        color_class: 'X'
    }
});
/**
 * mm.AllPiecesView handles the click and
 * sets the color_class in the model.
 */
mm.AllPiecesView = Backbone.View.extend({
    el: 'div#allPieces',
    cur_piece_el: 'div#current_piece',
    piece_template: '<div class="piece <%= color_class %>"><%= color_class %></div>',
    nub_template: '<div id="current_piece" class="piece <%= color_class %>"><%= color_class %></div>',
    events: {
        'click div.piece': 'nubClicked'
    },
    /**
     * this = mm.AllPiecesView
     */
    initialize: function () {
        this.model = createAllPiecesModel();
        this.model.on('change:color_class', this.render, this);
        this.render(); // reset the piece div
        // this.resetNub(); // reset the nub to X
    },
    /**
     * this = mm.AllPiecesView
     */
    render: function () {
        var nub_copy = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nub_copy);
    },
    /**
     * User clicked a color in the palette.
     *
     * this = mm.AllPiecesView
     */
    nubClicked: function (e) {
        // log('nubClicked');
        var color = $(e.currentTarget).text();
        // log('nubClicked read color: ', color);
        this.setNub(color);
    },
    /**
     * this = mm.AllPiecesView
     */
    setNub: function (color) {
        mm.nubColor = color;
        this.model.set('color_class', color);
    },
    /**
     * Get current nub class.
     *
     * this = mm.AllPiecesView
     */
    getNub: function () {
        return mm.nubColor;
    },
    /**
     * this = mm.AllPiecesView
     */
    resetNub: function () {
        this.setNub('X');
    }
});
/**
* mm.Game model for mm.GameView
*/
mm.Game = Backbone.Model.extend({
    defaults: {
        num_turns: 10,
        turns_remaining: 10,
        status: 'notStarted'
    }
});
/**
* this = mm.GameView
*/
mm.GameView = Backbone.View.extend({
    el: 'div#game',
    board_el: 'ul#board',
    header_template: '<div id="header">Mastermind</div>',
    gameOver_el: 'div#gameOver',
    gameOver_template: '<div id="gameOver"></div>',
    events: { /* see initialize */},
    /**
    * this = mm.GameView
    */
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
    /**
    * this = mm.GameView
    */
    resetBoard: function () {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var turns = gameView.turns;
        var turns_array = [];
        for (var i = 0; i < mm.nTurns; i += 1) {
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
    /**
    * this = mm.GameView
    */
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
    /**
    * this = mm.GameView
    */
    checkGuess: function (guess) {
        var gameView = asGameView(this);
        var solutionArray = mm.solution.split('');
        var guessArray = guess.split('');
        var nBlack = 0;
        var nWhite = 0;
        for (var i = 0; i < mm.nCode; i += 1) {
            if (guessArray[i] === solutionArray[i]) {
                nBlack += 1;
                guessArray[i] = 'x';
                solutionArray[i] = 'z';
            }
        }
        for (var j = 0; j < mm.nCode; j += 1) {
            for (var k = 0; k < mm.nCode; k += 1) {
                if (guessArray[j] === solutionArray[k]) {
                    nWhite += 1;
                    guessArray[j] = 'x';
                    solutionArray[k] = 'z';
                }
            }
        }
        gameView.handleResults(nBlack, nWhite);
    },
    /**
    * this = mm.GameView
    */
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
    /**
    * this = mm.GameView
    */
    getPreviousTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn = this.getCurrentTurn();
        var prev_id = cur_turn.get('id') - 1;
        var prev_turn = turns.get(prev_id);
        return prev_turn;
    },
    /**
    * this = mm.GameView
    */
    getCurrentTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var game = getGameModel(this);
        var turn_index = game.get('num_turns') - game.get('turns_remaining');
        var cur_turn = turns.at(turn_index);
        return cur_turn;
    },
    /**
    * this = mm.GameView
    */
    getNextTurn: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn = this.getCurrentTurn();
        var next_id = cur_turn.get('id') + 1;
        var next_turn = turns.get(next_id);
        return next_turn;
    },
    /**
    * this = mm.GameView
    */
    quit: function () {
        var game = getGameModel(this);
        game.set('status', 'lost');
    },
    /**
    * this = mm.GameView
    */
    gameOver: function () {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var status = game.get('status');
        if (status === 'notStarted' || status === 'inPlay') {
            return;
        }
        gameView.solutionView.setSolved();
        if (status === 'won') {
            gameView.getPreviousTurn().set('locked_class', 'correct');
            $(gameView.gameOver_el).text('you won!');
            $(gameView.gameOver_el).addClass('win');
        }
        else {
            $(gameView.gameOver_el).text('you lost.');
            $(gameView.gameOver_el).addClass('lose');
            gameView.turn_views.at(game.get('num_turns') - game.get('turns_remaining')).freezeRow();
        }
    },
    /**
    * this = mm.GameView
    */
    restart: function () {
        mm.init();
    }
});
$(function () {
    mm.init();
});
//# sourceMappingURL=app.js.map