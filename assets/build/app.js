"use strict";
// Global Variables
var log = console.log.bind(console);
// These variables were made global to avoid new
// creation of them each time calculatePegs() is called.
var code0;
var unpairedCode0 = {};
var unpairedCode1 = {};
var pegs0 = [0, 0];
var allCodes;
var validCodeCount;
var appLog;
var codeColors = 'ABCDEF';
var palletColors = 'ABCDEFX';
var nubColor = 'X';
var nColors = 6;
var nCode = 4;
var nTurns = 10;
var solution = '';
var u;
var mm = {
    /**
     * Initialize the game by constructing the main game view.
     *
     * Runs only once as the app starts.
     */
    init: function () {
        // Create the primary game view and pass in a new game model.
        createGameView(createGameModel());
        appLog = new AppLog();
        u = new MastermindUtilities();
        appLog.setTitle('Mastermind Log. Solution: ' + solution);
        log('mm.init() executed');
    }
};
class MastermindUtilities {
    /**
     * Sets code0 to newCode0 and
     * calculates the number of black and white pegs.
     * @param code1 The code to compare to code0.
     * @returns [nBlack, nWhite] The number of black and white pegs.
     */
    setCode0AndCalculatePegs(newCode0, code1) {
        code0 = newCode0;
        return this.calculatePegs(code1);
    }
    /**
     * Calculates the number of black and white pegs.
     * @param code1 The code to compare to previously set code0.
     * @returns [nBlack, nWhite] The number of black and white pegs.
     */
    calculatePegs(code1) {
        let nBlack = 0;
        let nWhite = 0;
        for (let i = 0; i < codeColors.length; i += 1) {
            unpairedCode0[codeColors[i]] = 0;
            unpairedCode1[codeColors[i]] = 0;
        }
        for (let i = 0; i < code0.length; i += 1) {
            if (code0[i] === code1[i]) { // tally black pegs
                nBlack += 1;
            }
            else { // tally white pegs
                // Test if code0[i] has a pair.
                if (unpairedCode1[code0[i]] > 0) { // found pair
                    nWhite += 1;
                    unpairedCode1[code0[i]] -= 1;
                }
                else
                    unpairedCode0[code0[i]] += 1; // inc unpaired
                // Test if code1[i] has a pair.
                if (unpairedCode0[code1[i]] > 0) { // found pair
                    nWhite += 1;
                    unpairedCode0[code1[i]] -= 1;
                }
                else
                    unpairedCode1[code1[i]] += 1; // inc unpaired
            }
        }
        // log(nBlack, nWhite, unpairedCode0, unpairedCode1);
        return [nBlack, nWhite];
    }
}
class AppLog {
    appLog_el;
    title_el;
    top_el;
    bottom_el;
    constructor() {
        this.appLog_el = document.getElementById('appLog');
        this.title_el = this.appLog_el.querySelector('#title');
        this.top_el = this.appLog_el.querySelector('#top');
        this.bottom_el = this.appLog_el.querySelector('#bottom');
        log('AppLog constructor() executed');
    }
    setTitle(text) {
        this.title_el.textContent = text;
    }
    setTop(text) {
        this.top_el.textContent = text;
    }
    setBottom(text) {
        this.bottom_el.textContent = text;
    }
    /**
     * Merges the top text into the bottom text,
     * then sets the top text to the newText.
     */
    prepend(newText) {
        const oldTop = this.top_el.textContent;
        if (oldTop !== '') {
            this.bottom_el.textContent = `${oldTop}\n${this.bottom_el.textContent}`;
        }
        this.top_el.textContent = newText;
    }
    /**
     * Appends the newText to the end of the top text.
     */
    insert(newText) {
        const oldTop = this.top_el.textContent;
        this.top_el.textContent = oldTop ? `${oldTop}\n${newText}` : newText;
    }
    /**
     * Appends the newText to the end of the bottom text.
     */
    append(newText) {
        const oldBot = this.bottom_el.textContent;
        this.bottom_el.textContent = oldBot ? `${oldBot}\n${newText}` : newText;
    }
}
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
        var color = nubColor;
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
        solution = '';
        for (var i = 0; i < nCode; i += 1) {
            var randomIndex = Math.floor(Math.random() * nColors);
            randomColor = codeColors[randomIndex];
            solution += randomColor;
        }
        this.model.set('code', solution);
        // log('newSolution:', solution);
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
     * Reveal or start a new game action from the solution view.
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
            gameView.newGame();
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
        nubColor = color;
        this.model.set('color_class', color);
    },
    /**
     * Get current nub class.
     *
     * this = mm.AllPiecesView
     */
    getNub: function () {
        return nubColor;
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
     * Executes at the beginning of each new game.
     *
    * this = mm.GameView
    */
    initialize: function () {
        mm.gameView = this;
        this.turns = createTurnCollection();
        this.solution = createTurn({ locked_class: 'hidden' });
        this.solutionView = createSolutionView(this.solution);
        this.allPiecesView = createAllPiecesView();
        this.turn_views = [];
        this.model.on('change:status', this.gameOver, this);
        this.resetBoard(); // START
        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('status', 'inPlay');
    },
    /**
     * Executes at the beginning of each new game.
     *
    * this = mm.GameView
    */
    resetBoard: function () {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var turns_array = [];
        for (var i = 0; i < nTurns; i += 1) {
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
    },
    /**
     * Executes at the beginning of each new game.
     *
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
        pegs0 = u.setCode0AndCalculatePegs(solution, guess);
        this.handleResults(pegs0);
    },
    /**
    * this = mm.GameView
    */
    handleResults: function ([nBlack, nWhite]) {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var hint_string = '<p class="hint b">' + nBlack + '</p><p class="hint w">' + nWhite + '</p>';
        gameView.getCurrentTurn().set('hint_string', hint_string);
        game.set('turns_remaining', game.get('turns_remaining') - 1);
        if (nBlack === 4) {
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
     * Runs at the beginning of each new game.
     *
    * this = mm.GameView
    */
    newGame: function () {
        // Create the primary game view and pass in a new game model.
        mm.gameView = createGameView(createGameModel());
        appLog.setTitle('Mastermind Log. Solution: ' + solution);
        appLog.prepend('Solution: ' + solution);
    }
});
$(function () {
    mm.init();
});
//# sourceMappingURL=app.js.map