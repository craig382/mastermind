"use strict";
// Global Variables
var log = console.log.bind(console);
// These variables were made global to avoid new
// creation of them each time calculatePegs() is called.
var code0;
var unpairedCode0 = {};
var unpairedCode1 = {};
var allCodes;
var validCodeCount = [];
var appLog;
var codeColors = 'ABCDEF';
var palletColors = 'ABCDEFX';
/** The code that
 * is automatically filled in for the first guess.
 * The player can override this guess. */
var autoOpener = 'ABCD';
var nubColor = 'X';
var nColors = 6;
/** number of holes in the code, i.e. code length */
var nHoles = 4;
var nTurns = 10;
/** index of the current turn, 0 based */
var turnIndex = 0;
var solution = '';
var u;
// Backbone.js models Bbm and views Bbv
var gameBbm;
var gameBbv;
var turnsBbm;
var turnsBbv;
var currentTurnBbm;
var solutionBbm;
var solutionBbv;
var palletBbm;
var palletBbv;
var mm = {
    /**
     * Initialize the game by constructing the main game view.
     *
     * Runs only once as the app starts.
     */
    init: function () {
        // Create the primary game view and pass in a new game model.
        appLog = new AppLog();
        u = new MastermindUtilities();
        u.generateAllCodes();
        createGameView(createGameModel());
        log('mm.init() executed');
    }
};
class MastermindUtilities {
    generateAllCodes() {
        allCodes = [];
        const c = codeColors;
        // nest nHoles loops to generate all possible codes
        for (let i0 = 0; i0 < nColors; i0 += 1) {
            for (let i1 = 0; i1 < nColors; i1 += 1) {
                for (let i2 = 0; i2 < nColors; i2 += 1) {
                    for (let i3 = 0; i3 < nColors; i3 += 1) {
                        allCodes.push(c[i0] + c[i1] + c[i2] + c[i3]);
                    }
                }
            }
        }
        log('generateAllCodes() executed. allCodes.length = ', allCodes.length);
        // log(allCodes.join(' '));
    }
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
    /**
     * Calculates the number of valid codes remaining after a guess.
     *
     * Assumes calculateValidCodeCount() has been called
     * for all previous turns.
     * @param guess The guess code to compare to allCodes.
     * @param gBpegs The number of black pegs for the guess.
     * @param gWpegs The number of white pegs for the guess.
     * @param gIndex The index of the turn for the guess.
     */
    calculateValidCodeCount(guess, gBpegs, gWpegs, gIndex) {
        var iMin = 0;
        var iMax;
        var tempCode;
        var acBpegs;
        var acWpegs;
        if (gIndex !== turnIndex)
            throw new Error(`calculateValidCodeCount() called with guessTurnIndex(${gIndex}) !== turnIndex(${turnIndex}).`);
        if (gIndex === 0) {
            validCodeCount = new Array(nTurns);
            iMax = allCodes.length - 1;
        }
        else
            iMax = validCodeCount[gIndex - 1] - 1;
        code0 = guess;
        while (iMin <= iMax) {
            [acBpegs, acWpegs] = this.calculatePegs(allCodes[iMin]);
            if (acBpegs === gBpegs && acWpegs === gWpegs) {
                // valid code, keep it and move to the next code
                iMin += 1;
            }
            else {
                // invalid code, swap it with the last valid code
                tempCode = allCodes[iMax];
                allCodes[iMax] = allCodes[iMin];
                allCodes[iMin] = tempCode;
                iMax -= 1;
            }
        }
        validCodeCount[gIndex] = iMax + 1;
        // log(`calculateValidCodeCount() on turn index ${gIndex} found ${validCodeCount[gIndex]} valid codes.`);
        // log(`first valid code ${allCodes[0]}, last valid code ${allCodes[validCodeCount[gIndex] - 1]}, and first invalid code ${allCodes[validCodeCount[gIndex]]}`);
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
function asGameView(view) {
    return view;
}
function createTurnModel(attrs = {}) {
    var TurnClass = required(mm.Turn);
    return new TurnClass(attrs);
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
        // For a frozen (past) turn, set the nub 
        // (the color picker) to the color of the frozen piece.
        // For an active (current) or locked (future) turn, 
        // set the piece to the nub (the color picker).
        // The player can use locked (future) turns 
        // as a scratch pad to plan their next guess.
        var turnState = this.model.get('locked_class');
        var code = this.model.get('code');
        // log('placePiece turnModel.get code color place:', code, color, place);
        if (turnState === 'active' || turnState === 'locked') {
            // set the piece in the turn to the nub color
            var codeArray = code.split('');
            var newCode;
            codeArray[place] = color;
            newCode = codeArray.join('');
            this.model.set({ code: newCode });
            // log('placePiece oldCode color place newCode:', code, color, place, newCode);
        }
        else {
            // set the nub color to the color clicked in the frozen turn
            palletBbv.setNub(code[place]);
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
        var code = this.model.get('code');
        if (code.includes('X'))
            return false;
        else
            return true;
    },
    /**
     * mm.TurnView.
     */
    hideTurnButton: function () {
        this.model.set('disabled_class', 'hidden');
        this.render();
    },
    /**
     * mm.TurnView.
     */
    showTurnButton: function () {
        this.model.set('disabled_class', '');
        this.render();
    },
    /**
     * User clicked the guess button for this turn.
     *
     * mm.TurnView.
     */
    guessClicked: function (_e) {
        if (this.model.get('locked_class') !== 'active')
            return;
        if (this.codeIsValid() === false)
            return;
        this.goGuess();
    },
    /**
     * Execute the guess flow for this turn.
     *
     * mm.TurnView.
     */
    goGuess: function () {
        this.freezeRow();
        gameBbv.checkGuess(this.model.get('code'));
    },
    /**
     * mm.TurnView.
     */
    freezeRow: function () {
        this.model.set('locked_class', 'frozen');
        this.hideTurnButton();
    },
    /**
     * mm.TurnView.
     */
    activateRow: function () {
        this.model.set('locked_class', 'active');
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
        solutionBbv = this;
        this.newSolution();
        this.model.on('change:locked_class', this.render, this);
    },
    /**
     * mm.SolutionView
     */
    newSolution: function () {
        var randomColor;
        solution = '';
        for (var i = 0; i < nHoles; i += 1) {
            var randomIndex = Math.floor(Math.random() * nColors);
            randomColor = codeColors[randomIndex];
            solution += randomColor;
        }
        // log('newSolution:', solution);
        solutionBbm.set({ code: solution });
    },
    /**
     * mm.SolutionView
     */
    render: function () {
        var solutionTemplate = $(this.template).html();
        var solutionHtml = _.template(solutionTemplate, this.model.toJSON());
        this.$el.html(solutionHtml);
        return this.el;
    },
    /**
     * mm.SolutionView
     */
    setSolved: function () {
        this.model.set('button_text', 'New Game');
        this.model.set('locked_class', '');
    },
    /**
     * Reveal or start a new game action from the solution view.
     *
     * mm.SolutionView
     */
    revealClicked: function (e) {
        e.preventDefault();
        if (solutionBbm.get('button_text') === 'quit') {
            gameBbv.quit();
        }
        else {
            gameBbv.newGame();
        }
    }
});
/**
 * mm.AllPieces model for mm.AllPiecesView.
 */
mm.AllPieces = Backbone.Model.extend({
    defaults: {
        color_class: 'X'
    },
    initialize: function () {
        palletBbm = this;
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
        palletBbv = this;
        this.model = createAllPiecesModel();
        this.model.on('change:color_class', this.render, this);
        this.render(); // reset the piece div
        // this.resetNub(); // reset the nub to X
    },
    /**
     * this = mm.AllPiecesView
     */
    render: function () {
        var nubHtml = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nubHtml);
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
        palletBbv.setNub(color);
    },
    /**
     * this = mm.AllPiecesView
     */
    setNub: function (color) {
        nubColor = color;
        palletBbm.set('color_class', color);
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
    gameStatus: 'notStarted',
    initialize: function () {
        gameBbm = this;
        turnIndex = 0;
        gameBbm.set('gameStatus', 'notStarted');
    }
});
/**
* this = mm.GameView
*/
mm.GameView = Backbone.View.extend({
    game_el: 'div#game',
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
        gameBbv = this;
        solutionBbm = createTurnModel({ locked_class: 'hidden' });
        createSolutionView(solutionBbm);
        createAllPiecesView();
        this.model.on('change:gameStatus', this.gameOver, this);
        this.resetBoard(); // START
        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('gameStatus', 'inPlay');
        // newGame stuff belongs here, not in newGame.
        // set the opener for auto opener mode
        turnsBbm[turnIndex].set('code', autoOpener);
        appLog.setTitle('Mastermind Log. Solution: ' + solution);
        appLog.prepend('Solution: ' + solution);
        this.render(); // must be last line of initialize()
    },
    /**
     * Executes at the beginning of each new game.
     *
    * this = mm.GameView
    */
    resetBoard: function () {
        turnsBbm = [];
        turnsBbv = [];
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
            var turnM = createTurnModel({ alt_class: class_name, locked_class: locked_class, disabled_class: disabled_class, id: i });
            var turnV = createTurnView(turnM);
            turnsBbm.push(turnM);
            turnsBbv.push(turnV);
        }
    },
    /**
     * Executes at the beginning of each new game.
     *
    * this = mm.GameView
    */
    render: function () {
        var html_els_array = [this.header_template, this.gameOver_template, solutionBbv.render()];
        for (var i = 0; i < nTurns; i += 1) {
            var turnV = turnsBbv[i];
            html_els_array.push(turnV.render());
        }
        $(this.board_el).html(html_els_array);
    },
    /**
    * this = mm.GameView
    */
    checkGuess: function (guess) {
        var pegs0 = u.setCode0AndCalculatePegs(solution, guess);
        u.calculateValidCodeCount(guess, pegs0[0], pegs0[1], turnIndex);
        this.handleResults(pegs0);
    },
    /**
    * this = mm.GameView
    */
    handleResults: function ([nBlack, nWhite]) {
        var hint_string = '<p class="hint b">' + nBlack
            + '</p><p class="hint w">' + nWhite + '</p><p class="hint b">'
            + validCodeCount[turnIndex] + '</p>';
        this.getCurrentTurnBbm().set('hint_string', hint_string);
        if (nBlack === 4)
            gameBbm.set('gameStatus', 'won');
        else if (turnIndex === (nTurns - 1))
            gameBbm.set('gameStatus', 'lost');
        else { // activate the next turn
            turnIndex += 1; // increment the turn index
            // set the next turn's code to the first valid code
            // for help mode or hint mode
            turnsBbm[turnIndex].set('code', allCodes[0]);
            turnsBbv[turnIndex].activateRow();
        }
    },
    /**
    * this = mm.GameView
    */
    getPreviousTurnBbm: function () {
        return turnsBbm[turnIndex - 1];
    },
    /**
    * this = mm.GameView
    */
    getCurrentTurnBbm: function () {
        return turnsBbm[turnIndex];
    },
    /**
    * this = mm.GameView
    */
    getNextTurnBbm: function () {
        return turnsBbm[turnIndex + 1];
    },
    /**
    * this = mm.GameView
    */
    quit: function () {
        gameBbm.set('gameStatus', 'lost');
    },
    /**
    * this = mm.GameView
    */
    gameOver: function () {
        var status = gameBbm.get('gameStatus');
        $(gameBbv.game_el).attr('class', status);
        if (status === 'notStarted' || status === 'inPlay') {
            return;
        }
        // Set next game's opener equal to this game's opener.
        autoOpener = turnsBbm[0].get('code');
        solutionBbv.setSolved();
        if (status === 'won') {
            turnsBbm.at(turnIndex).set('locked_class', 'correct');
            $(gameBbv.gameOver_el).text('you won!');
        }
        else {
            turnsBbm.at(turnIndex).set('locked_class', 'wrong');
            $(gameBbv.gameOver_el).text('you lost.');
            turnsBbv.at(turnIndex).hideTurnButton();
        }
    },
    /**
     * Runs at the beginning of each new game.
     *
    * this = mm.GameView
    */
    newGame: function () {
        // Create the primary game view and pass in a new game model.
        // Put nothing else but the following line in newGame().
        createGameView(createGameModel());
    }
});
$(function () {
    mm.init();
});
//# sourceMappingURL=app.js.map