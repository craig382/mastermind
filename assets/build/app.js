"use strict";
// Global Variables
var log = console.log.bind(console);
// These variables were made global to avoid new
// creation of them each time calculatePegs() is called.
var code0;
var unpairedCode0 = {};
var unpairedCode1 = {};
var allCodes;
var appLog;
var codeColors = 'ABCDEF';
var palletColors = 'ABCDEFX';
/** When validCountHints is true, each turn shows
 * the number of valid codes remaining on the board
 * to the right of the black and white peg display.
 */
var validCountHints = false;
/** When botGuessHints is true, the bot fills
 * in its suggestion for the next guess
 * (which can be overridden by the player).
 * Note that the bot's suggestion for the first
 * move takes precedence over the auto opener guess.
 */
var botGuessHints = false;
/** When autoOpenerMode is true, the first guess
 * is automatically filled in with the
 * opener from the previous game (or the default
 * auto opener for the first game).
 */
var autoOpenerMode = true;
/** The automatically filled in code for the
 * first guess. which he player can override. */
var autoOpener = 'AABB';
var nubColor = 'X';
var nColors = 6;
/** number of holes in the code, i.e. code length */
var nHoles = 4;
var nTurns = 10;
//* number of games played, 1 for the first game */
var nGames = 1;
/** index of the current turn, 0 based */
var turnIndex = 0;
var solution = '';
var u;
/** validCodesArray = codeTree[turn][guess][nBlack][nWhite];
 *
 * A tree structure that stores an array of valid
 * remaining codes for the next turn (0 based) for
 * each possible guess of the next turn and each
 * possible peg combo of that guess.
 *
 * codeTree is the data structure acted upon by the
 * calculateCodeTree function.*/
var codeTree = {};
/** botGuesses[thisTurn] is the bot's guess for this turn
 *  given the human's guesses prior to this turn. */
var botGuesses = [];
var botPegs = [];
var botValidCounts = [];
var botValid = [];
var botPerfect = {};
var boardGuesses = [];
var boardPegs = [];
var boardValidCounts = [];
var boardValid = [];
var boardPerfect = [];
// Backbone.js models Bbm and views Bbv
var gameBbm;
var gameBbv;
var turnsBbm;
var turnsBbv;
var currentTurnBbm;
var palletBbm;
var palletBbv;
function AsPegCombo(pegs) {
    return `${pegs.b}${pegs.w}`;
}
function AsPegs(peg) {
    return { b: parseInt(peg[0]), w: parseInt(peg[1]) };
}
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
        createAllPiecesView();
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
    /** Empty codeTree and calculate codeTree
     * for the first time in a new game.
     */
    initializeCodeTree() {
        codeTree = {};
        botGuesses = [];
        botPegs = [];
        botValidCounts = [];
        botValid = [];
        botPerfect = {};
        boardGuesses = [];
        boardPegs = [];
        boardValidCounts = [];
        boardValid = [];
        boardPerfect = [];
        this.calculateCodeTree(0, ['AABB', 'ABBC', 'ABCD']);
        // For hint mode, set the turn's
        // suggested guess to the bot's guess.
        if (botGuessHints)
            turnsBbm[turnIndex].set('code', botGuesses[turnIndex]);
        log(`initializeCodeTree() executed, solution: ${solution}.`);
    }
    calculateCodeTree(turn, guessArray) {
        if (turn < 0 || turn > (nTurns - 1))
            return;
        var guessArrayIn = guessArray ? guessArray.join(' ') : 'undefined';
        var validCodesIn = [];
        var pc = '00';
        if (turn === 0) {
            validCodesIn = allCodes;
        }
        else {
            if (!codeTree[turn - 1][boardGuesses[turn - 1]]) {
                this.calculateCodeTree(turn - 1, [boardGuesses[turn - 1]]);
            }
            validCodesIn = codeTree[turn - 1][boardGuesses[turn - 1]][boardPegs[turn - 1]];
            if (!guessArray)
                guessArray = validCodesIn;
        }
        var nPegCombos = 0;
        var maxPegCombos = 0;
        var maxPegComboGuess = '';
        var nValid = validCodesIn.length;
        if (!codeTree[turn])
            codeTree[turn] = {};
        for (var g = 0; g < guessArray.length; g += 1) {
            var guess = guessArray[g];
            if (codeTree[turn][guess])
                break; // skip, guess already processed
            else
                codeTree[turn][guess] = {}; // process guess
            code0 = guess;
            for (var v = 0; v < nValid; v += 1) {
                pc = AsPegCombo(this.calculatePegs(validCodesIn[v]));
                if (!codeTree[turn][guess][pc])
                    codeTree[turn][guess][pc] = [];
                // Push validCodesIn[v] onto the codeTree.
                codeTree[turn][guess][pc].push(validCodesIn[v]);
            }
            // Completed building codeTree for this guess.
            nPegCombos = Object.keys(codeTree[turn][guess]).length;
            if (nPegCombos > maxPegCombos) {
                maxPegCombos = nPegCombos;
                maxPegComboGuess = guess;
            }
            // log(`turn ${turn} guess ${guess} has ${nPegCombos} peg combos.`);
            if (nPegCombos === nValid) {
                if (!botPerfect[turn])
                    botPerfect[turn] = [];
                botPerfect[turn].push(guess);
            }
        }
        if (!botPegs[turn]) {
            log(`botPegs[${turn}] = "${botPegs[turn]}", !botPegs[turn] = "${!botPegs[turn]}".`);
            if (botPerfect[turn]) {
                botGuesses[turn] = botPerfect[turn][0];
                if (nValid > 2) {
                    var perfectMsg = `On turn ${turn + 1}, The bot found ${botPerfect[turn].length} PERFECT guesses with ${nValid} valid codes remaining: ${botPerfect[turn].join(' ')} perfect of ${validCodesIn.join(' ')} valid.`;
                    appLog.insert(perfectMsg);
                }
            }
            else if (!botGuesses[turn]) {
                log(`botGuesses[${turn}]: "${botGuesses[turn]}" <== "${maxPegComboGuess}".`);
                botGuesses[turn] = maxPegComboGuess;
            }
            botPegs[turn] = AsPegCombo(this.setCode0AndCalculatePegs(solution, botGuesses[turn]));
            botValidCounts[turn] = codeTree[turn][botGuesses[turn]][botPegs[turn]].length;
        }
        log(`executed calculateCodeTree(turn: ${turn}, guessArray: ${guessArrayIn}), botGuesses[${turn}]: ${botGuesses[turn]}.`);
        // log(codeTree);
    }
    /** Sets the current turn's code only if the turn is active. */
    setActiveTurnCode(guess) {
        var turnState = turnsBbm[turnIndex].get('locked_class');
        if (turnState !== 'active')
            return;
        turnsBbm[turnIndex].set('code', guess);
    }
    /**
     * Sets code0 to newCode0 and
     * calculates the number of black and white pegs.
     * @param code1 The code to compare to code0.
     * @returns The number of black and white pegs.
     */
    setCode0AndCalculatePegs(newCode0, code1) {
        code0 = newCode0;
        return this.calculatePegs(code1);
    }
    /**
     * Calculates the number of black and white pegs.
     * @param code1 The code to compare to the previously set code0.
     * @returns The number of black and white pegs.
     */
    calculatePegs(code1) {
        let pegs = { b: 0, w: 0 };
        for (let i = 0; i < codeColors.length; i += 1) {
            unpairedCode0[codeColors[i]] = 0;
            unpairedCode1[codeColors[i]] = 0;
        }
        for (let i = 0; i < code0.length; i += 1) {
            if (code0[i] === code1[i]) { // tally black pegs
                pegs.b += 1;
            }
            else { // tally white pegs
                // Test if code0[i] has a pair.
                if (unpairedCode1[code0[i]] > 0) { // found pair
                    pegs.w += 1;
                    unpairedCode1[code0[i]] -= 1;
                }
                else
                    unpairedCode0[code0[i]] += 1; // inc unpaired
                // Test if code1[i] has a pair.
                if (unpairedCode0[code1[i]] > 0) { // found pair
                    pegs.w += 1;
                    unpairedCode0[code1[i]] -= 1;
                }
                else
                    unpairedCode1[code1[i]] += 1; // inc unpaired
            }
        }
        // log(pegs, unpairedCode0, unpairedCode1);
        return pegs;
    }
    /** updateTurnHints() updates only the current turn
     * hints if allTurns is false, otherwise updates
     * all turn hints. */
    updateTurnHints(allTurns = false) {
        var minTurn = allTurns ? 0 : boardPegs.length - 1;
        for (var t = minTurn; t < boardPegs.length; t += 1) {
            var hint_string = '<p class="hint b">' + boardPegs[t][0]
                + '</p><p class="hint w">' + boardPegs[t][1] + '</p>';
            if (validCountHints)
                hint_string += '<p class="hint c">'
                    + codeTree[t][boardGuesses[t]][boardPegs[t]].length + '</p>';
            turnsBbm[t].set('hint_string', hint_string);
        }
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
     * Appends the newText to the beginning of the top text.
     */
    prepend(newText) {
        const oldTop = this.top_el.textContent;
        this.top_el.textContent = oldTop ? `${newText}\n${oldTop}` : newText;
    }
    /**
     * Appends the newText to the end of the top text.
     */
    insert(newText) {
        const oldTop = this.top_el.textContent;
        this.top_el.textContent = oldTop ? `${oldTop}\n${newText}` : newText;
    }
    /**
     * Merges the top text into the bottom text,
     * then sets the top text to the newText.
     */
    merge(newText = '') {
        const oldTop = this.top_el.textContent;
        if (oldTop !== '') {
            this.bottom_el.textContent = `${oldTop}\n${this.bottom_el.textContent}`;
        }
        this.top_el.textContent = newText;
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
    opener_el: 'input#opener',
    counts_el: 'input#counts',
    bot_el: 'input#bot',
    play_el: 'input#play',
    piece_template: '<div class="piece <%= color_class %>"><%= color_class %></div>',
    nub_template: '<div id="current_piece" class="piece <%= color_class %>"><%= color_class %></div>',
    events: {
        'click div.piece': 'nubClicked',
        'click #buttons input': 'buttonClicked'
    },
    /** this = mm.AllPiecesView */
    initialize: function () {
        palletBbv = this;
        this.model = createAllPiecesModel();
        this.model.on('change:color_class', this.render, this);
        this.render(); // reset the piece div
        log(`mm.AllPiecesView.initialize() executed.`);
    },
    /** this = mm.AllPiecesView */
    render: function () {
        var nubHtml = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nubHtml);
    },
    /** this = mm.AllPiecesView */
    buttonClicked: function (e) {
        var id = $(e.currentTarget).attr('id');
        var oldText = $(e.currentTarget).val();
        var newText = '';
        switch (id) {
            case 'opener':
                if (autoOpenerMode) {
                    newText = 'opener off';
                    autoOpenerMode = false;
                }
                else {
                    newText = 'opener on';
                    autoOpenerMode = true;
                }
                break;
            case 'counts':
                if (validCountHints) {
                    newText = 'counts off';
                    validCountHints = false;
                }
                else {
                    newText = 'counts on';
                    validCountHints = true;
                }
                u.updateTurnHints(true);
                break;
            case 'bot':
                if (botGuessHints) {
                    newText = 'bot help off';
                    botGuessHints = false;
                    u.setActiveTurnCode('XXXX');
                }
                else {
                    newText = 'bot help on';
                    botGuessHints = true;
                    u.setActiveTurnCode(botGuesses[turnIndex]);
                }
                break;
            case 'play':
                if (oldText === 'quit') {
                    newText = 'new game';
                    gameBbv.quit();
                }
                else {
                    newText = 'quit';
                    gameBbv.newGame();
                }
                break;
        }
        $(e.currentTarget).val(newText);
        // log(`${id} buttonClicked executed with text changed from "${oldText}" to "${newText}".`);
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
    /** this = mm.AllPiecesView */
    setNub: function (color) {
        nubColor = color;
        palletBbm.set('color_class', color);
    },
    /**
     * Get current nubColor.
     *
     * this = mm.AllPiecesView
     */
    getNub: function () {
        return nubColor;
    },
    /** this = mm.AllPiecesView */
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
        // createAllPiecesView();
        this.model.on('change:gameStatus', this.gameOver, this);
        this.resetBoard(); // START
        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('gameStatus', 'inPlay');
        // newGame stuff belongs here, not in newGame.
        this.newSolution();
        // set the opener for auto opener mode
        if (autoOpenerMode)
            turnsBbm[turnIndex].set('code', autoOpener);
        u.initializeCodeTree();
        appLog.setTitle(`Mastermind (${allCodes.length} possible codes)`);
        // merge the previous game log into the bottom of the log
        appLog.merge(`\nGame ${nGames}`);
        palletBbv.resetNub();
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
        var html_els_array = [this.header_template, this.gameOver_template];
        for (var i = 0; i < nTurns; i += 1) {
            var turnV = turnsBbv[i];
            html_els_array.push(turnV.render());
        }
        $(this.board_el).html(html_els_array);
    },
    /**
     * mm.GameView
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
    },
    /**
    * this = mm.GameView
    */
    checkGuess: function (guess) {
        boardGuesses[turnIndex] = guess;
        var pegs0 = u.setCode0AndCalculatePegs(solution, guess);
        boardPegs[turnIndex] = AsPegCombo(pegs0);
        u.calculateCodeTree(turnIndex, [guess]);
        boardValidCounts[turnIndex] = codeTree[turnIndex][boardGuesses[turnIndex]][boardPegs[turnIndex]].length;
        this.handleResults(pegs0);
    },
    /**
    * this = mm.GameView
    */
    handleResults: function (pegs) {
        u.updateTurnHints();
        if (pegs.b === 4)
            gameBbm.set('gameStatus', 'won');
        else if (turnIndex === (nTurns - 1))
            gameBbm.set('gameStatus', 'lost');
        else {
            // initialize the next turn
            turnIndex += 1; // increment the turn index
            u.calculateCodeTree(turnIndex);
            if (botGuessHints)
                turnsBbm[turnIndex].set('code', botGuesses[turnIndex]);
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
        gameBbm.set('gameStatus', 'quit');
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
        // set the play button to 'new game'
        $(palletBbv.play_el).val('new game');
        $(gameBbv.gameOver_el).text(`you ${status}!`);
        if (status === 'won') {
            turnsBbm[turnIndex].set('locked_class', 'correct');
        }
        else {
            turnsBbm[turnIndex].set('locked_class', 'wrong');
            if (status === 'quit') {
                turnsBbv[turnIndex].hideTurnButton();
            }
        }
        appLog.insert(`You ${status} on turn ${turnIndex + 1}.`);
        appLog.insert(`Secret code ${solution}.`);
        if (boardGuesses.length > 0) {
            appLog.insert(`Turn by turn: board (bot):`);
            for (var i = 0; i < boardGuesses.length; i += 1) {
                appLog.insert(`${boardGuesses[i]} `
                    + `${boardPegs[i][0]} ${boardPegs[i][1]} `
                    + `${boardValidCounts[i]} `
                    + `(${botGuesses[i]} `
                    + `${botPegs[i][0]} ${botPegs[i][1]} `
                    + `${botValidCounts[i]})`);
            }
            i -= 1;
            if (status === 'won' && botGuesses[i] !== boardGuesses[i])
                appLog.insert(`You beat the bot!`);
            i += 1;
            if (botGuesses.length > boardGuesses.length) {
                appLog.insert(`[ you ${status} ] `
                    + `(${botGuesses[i]} `
                    + `${botPegs[i][0]} ${botPegs[i][1]} `
                    + `${botValidCounts[i]})`);
            }
        }
        ;
        nGames += 1; // increment the number of games played
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