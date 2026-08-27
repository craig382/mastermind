declare var Backbone: any;
declare var _: any;
declare var $: any;

// Global Variables
var log = console.log.bind(console);

// These variables were made global to avoid new
// creation of them each time calculatePegs() is called.
var code0: string;
var unpairedCode0: {[color: string]: number} = {};
var unpairedCode1: {[color: string]: number} = {};
var allCodes: string[];
var validCodeCount: number[] = [];

var appLog: AppLog;
/** guesses contains all the guesses
 * separated by spaces.
 * For outputting to the appLog at the end of the game.
 */
var guesses: string;
var codeColors = 'ABCDEF';
var palletColors = 'ABCDEFX';
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
var solution= '';
var u: MastermindUtilities;

/** validCodesArray = codeTree[turn][guess][nBlack][nWhite];
 * 
 * A tree structure that stores an array of valid 
 * remaining codes for the next turn (0 based) for 
 * each possible guess of the next turn and each 
 * possible peg combo of that guess.
 * 
 * codeTree is the data structure acted upon by the
 * calculateCodeTree function.*/
var codeTree: {[turn: number]: {[guess: string]: {[pc: PegCombo]: string[]}}} = {};
/** botGuess[thisTurn] is the bot's guess for this turn
 *  given the human's guesses prior to this turn. */
var botGuesses: string[] = [];
var boardGuesses: string[] = [];
var boardPegs: PegCombo[] = [];

// Backbone.js models Bbm and views Bbv
var gameBbm: GameModel;
var gameBbv: GameViewInstance;
var turnsBbm: Array<TurnModel>;
var turnsBbv: Array<TurnViewInstance>;
var currentTurnBbm: TurnModel;
var solutionBbm: SolutionModel;
var solutionBbv: SolutionViewInstance;
var palletBbm: AllPiecesModel;
var palletBbv: AllPiecesViewInstance;

/** example: var pegs: Pegs = { b: 0, w: 0 }; */
type Pegs = {
    b: number;
    w: number;
};

/** "03" is 0 black pegs and 3 white pegs */
type PegCombo = string;

function AsPegCombo(pegs: Pegs): PegCombo {
    return `${pegs.b}${pegs.w}`;
}

function AsPegs(peg: PegCombo): Pegs {
    return { b: parseInt(peg[0]), w: parseInt(peg[1]) };
}

type MastermindRoot = {
    Turn?: TurnConstructor;
    TurnView?: TurnViewConstructor;
    SolutionView?: SolutionViewConstructor;
    AllPieces?: AllPiecesModelConstructor;
    AllPiecesView?: AllPiecesViewConstructor;
    Game?: GameModelConstructor;
    GameView?: GameViewConstructor;
    init(): void;
};

var mm: MastermindRoot = {
    /**
     * Initialize the game by constructing the main game view.
     * 
     * Runs only once as the app starts.
     */
    init: function (): void {
        // Create the primary game view and pass in a new game model.
        appLog = new AppLog();
        u = new MastermindUtilities();
        u.generateAllCodes();
        createGameView(createGameModel());
        log('mm.init() executed');
    }
};

class MastermindUtilities {

    generateAllCodes(): void {
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
    initializeCodeTree(): void {
        codeTree = {};
        u.calculateCodeTree(0, ['ABCD', 'ABBC', 'AABB', 'AAAA']);
    }

    calculateCodeTree(turn:number, guessArray?: string[]): void {
        log(`execute calculateCodeTree(turn: ${turn}, guessArray: ${guessArray ? guessArray.join(' ') : 'undefined'}).`);
        if (turn < 0 || turn > (nTurns - 1)) return;
        var validCodesIn: string[] = [];
        var pc: PegCombo = '00';
        if (turn === 0) {
            validCodesIn = allCodes;
            botGuesses = [];
        } else {
            if (!codeTree[turn-1][boardGuesses[turn-1]]) {
                this.calculateCodeTree(turn-1, [boardGuesses[turn-1]]);
            }
            validCodesIn = codeTree[turn-1][boardGuesses[turn-1]][boardPegs[turn-1]];
            if (!guessArray) guessArray = validCodesIn;
        }

        for (var g = 0; g < guessArray.length; g += 1) {
            var guess = guessArray[g];
            code0 = guess;
            for (var v = 0; v < validCodesIn.length; v += 1) {
                pc = AsPegCombo(this.calculatePegs(validCodesIn[v]));
                // Push validCodesIn[v] onto the codeTree.
                if (!codeTree[turn]) codeTree[turn] = {};
                if (!codeTree[turn][guess]) codeTree[turn][guess] = {};
                if (!codeTree[turn][guess][pc]) codeTree[turn][guess][pc] = [];
                codeTree[turn][guess][pc].push(validCodesIn[v]);
            }
        }

        log(`calculateCodeTree executed for turn ${turn}.`);
        log(codeTree);
    }
        

    /**
     * Sets code0 to newCode0 and 
     * calculates the number of black and white pegs.
     * @param code1 The code to compare to code0.
     * @returns [nBlack, nWhite] The number of black and white pegs.
     */
    setCode0AndCalculatePegs(newCode0: string, code1: string): Pegs {
        code0 = newCode0;
        return this.calculatePegs(code1);
    }

    /**
     * Calculates the number of black and white pegs.
     * @param code1 The code to compare to previously set code0.
     * @returns [nBlack, nWhite] The number of black and white pegs.
     */
    calculatePegs(code1: string): Pegs {
        let pegs: Pegs = { b: 0, w: 0 };
        for (let i = 0; i < codeColors.length; i += 1) {
            unpairedCode0[codeColors[i]] = 0;
            unpairedCode1[codeColors[i]] = 0;
        }
        for (let i = 0; i < code0.length; i += 1) {
            if (code0[i] === code1[i]) { // tally black pegs
                pegs.b += 1;
            } else { // tally white pegs
                // Test if code0[i] has a pair.
                if (unpairedCode1[code0[i]] > 0) { // found pair
                    pegs.w += 1;
                    unpairedCode1[code0[i]] -= 1;
                } else unpairedCode0[code0[i]] += 1; // inc unpaired
                // Test if code1[i] has a pair.
                if (unpairedCode0[code1[i]] > 0) { // found pair
                    pegs.w += 1;
                    unpairedCode0[code1[i]] -= 1;
                } else unpairedCode1[code1[i]] += 1; // inc unpaired
            }
        }
        // log(pegs, unpairedCode0, unpairedCode1);
        return pegs;
    }

    /**
     * Calculates the number of valid codes remaining after a guess.
     * 
     * Assumes calculateValidCodeCount() has been called 
     * for all previous turns.
     * @param guess The guess code to compare to allCodes.
     * @param gPegs The number of black and white pegs for the guess.
     * @param gIndex The index of the turn for the guess.
     */
    calculateValidCodeCount(guess: string, 
        gPegs: Pegs, 
        gIndex: number): void {

        var iMin = 0;
        var iMax: number;
        var tempCode: string;
        var acPegs: Pegs;

        if (gIndex !== turnIndex)
            throw new Error(`calculateValidCodeCount() called with guessTurnIndex(${gIndex}) !== turnIndex(${turnIndex}).`);

        if (gIndex === 0) {
            validCodeCount = new Array(nTurns);
            iMax = allCodes.length - 1;
            guesses = guess;
        } else {
            iMax = validCodeCount[gIndex - 1] - 1;
            guesses += ' ' + guess;
        }

        code0 = guess;
        while (iMin <= iMax) {
            acPegs = this.calculatePegs(allCodes[iMin]);
            if (acPegs.b === gPegs.b && acPegs.w === gPegs.w) {
                // valid code, keep it and move to the next code
                iMin += 1;
            } else {
                // invalid code, swap it with the last valid code
                tempCode = allCodes[iMax];
                allCodes[iMax] = allCodes[iMin];
                allCodes[iMin] = tempCode;
                iMax -= 1;
            }
        }
        iMax += 1; // iMax is now the valid code count
        validCodeCount[gIndex] = iMax;

        appLog.setTitle(allCodes.slice(0, iMax).join(' '));
        // log(`calculateValidCodeCount() on turn index ${gIndex} found ${validCodeCount[gIndex]} valid codes.`);
        // log(`first valid code ${allCodes[0]}, last valid code ${allCodes[validCodeCount[gIndex] - 1]}, and first invalid code ${allCodes[validCodeCount[gIndex]]}`);
    }

}

class AppLog {
    private appLog_el: HTMLElement;
    private title_el: HTMLElement;
    private top_el: HTMLElement;
    private bottom_el: HTMLElement;

    constructor() {
        this.appLog_el = document.getElementById('appLog')!;
        this.title_el = this.appLog_el.querySelector('#title')!;
        this.top_el = this.appLog_el.querySelector('#top')!;
        this.bottom_el = this.appLog_el.querySelector('#bottom')!;
        log('AppLog constructor() executed');
    }
    
    setTitle(text: string): void {
        this.title_el.textContent = text;
    }

    setTop(text: string): void {
        this.top_el.textContent = text;
    }

    setBottom(text: string): void {
        this.bottom_el.textContent = text;
    }

    /**
     * Merges the top text into the bottom text,
     * then sets the top text to the newText.
     */
    prepend(newText: string): void {
        const oldTop = this.top_el.textContent;
        if (oldTop !== '') {
            this.bottom_el.textContent = `${oldTop}\n${this.bottom_el.textContent}`;
        }
        this.top_el.textContent = newText;
    }

    /**
     * Appends the newText to the end of the top text.
     */
    insert(newText: string): void {
        const oldTop = this.top_el.textContent;
        this.top_el.textContent = oldTop ? `${oldTop}\n${newText}` : newText;
    }

    /**
     * Appends the newText to the end of the bottom text.
     */
    append(newText: string): void {
        const oldBot = this.bottom_el.textContent;
        this.bottom_el.textContent = oldBot ? `${oldBot}\n${newText}` : newText;
    }
}

type TurnModel = {
    get(key: 'code'): string;
    get(key: 'id'): number;
    get(key: 'locked_class'): LockedClass;
    get(key: 'disabled_class'): DisabledClass;
    get(key: 'hint_string'): string;
    get(key: 'button_text'): ButtonText;
    get(key: string): any;
    set(key: 'disabled_class', value: DisabledClass): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(key: 'hint_string', value: string): any;
    set(key: 'code', value: string): any;
    set(key: 'button_text', value: ButtonText): any;
    set(attrs: Partial<{
        id: number;
        code: string;
        hint_string: string;
        alt_class: string;
        disabled_class: DisabledClass;
        locked_class: LockedClass;
        button_text: ButtonText;
    }>): any;
    set(key: string, value: any): any;
};

type GameModel = {
    gameStatus: GameStatus;
    get(key: 'gameStatus'): GameStatus;
    get(key: string): any;
    set(key: 'turns_remaining', value: number): any;
    set(key: 'gameStatus', value: GameStatus): any;
    set(key: string, value: any): any;
};

type SolutionModel = {
    get(key: 'code'): string;
    get(key: 'button_text'): ButtonText;
    get(key: 'locked_class'): LockedClass;
    get(key: string): any;
    set(key: 'code', value: string): any;
    set(key: 'button_text', value: ButtonText): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(attrs: Partial<{
        code: string;
        button_text: ButtonText;
        locked_class: LockedClass;
    }>): any;
    set(key: string, value: any): any;
};

type AllPiecesModel = {
    get(key: 'color_class'): string;
    get(key: string): any;
    set(key: 'color_class', value: string): any;
    set(attrs: Partial<{
        color_class: string;
    }>): any;
    set(key: string, value: any): any;
};

type TurnViewInstance = {
    render: () => Element;
    activateRow: () => void;
    freezeRow: () => void;
    hideTurnButton: () => void;
    showTurnButton: () => void;
};

type AllPiecesViewInstance = {
    setNub(color_class: string): void;
    getNub(): string;
    resetNub(): void;
};

type SolutionViewInstance = {
    render(): Element;
    setSolved(): void;
};

type GameViewInstance = {
    checkGuess(guess: string): void;
    getCurrentTurnBbm(): TurnModel;
    getPreviousTurnBbm(): TurnModel;
    getNextTurnBbm(): TurnModel;
    quit(): void;
    newGame(): void;
    handleResults(pegs: Pegs): void;
    game_el: string;
    gameOver_el: string;
};

type ViewEvent = Event;
type LockedClass = '' | 'active' | 'locked' | 'frozen' | 'correct' | 'wrong' | 'hidden';
type DisabledClass = '' | 'hidden' | 'disabled';
type GuessMark = 'x' | 'z';
type ButtonText = 'quit' | 'New Game';
type GameStatus = 'notStarted' | 'inPlay' | 'won' | 'quit' | 'lost';

type ViewModelOption<TModel> = {
    model: TModel;
};

type TurnAttrs = Partial<{
    id: number;
    alt_class: string;
    locked_class: LockedClass;
    disabled_class: DisabledClass;
}>;

type TurnConstructor = new (attrs?: TurnAttrs) => TurnModel;
type TurnViewConstructor = new (options: ViewModelOption<TurnModel>) => TurnViewInstance;
type SolutionViewConstructor = new (options: ViewModelOption<TurnModel>) => SolutionViewInstance;
type AllPiecesModelConstructor = new () => AllPiecesModel;
type AllPiecesViewConstructor = new () => AllPiecesViewInstance;
type GameModelConstructor = new () => GameModel;
type GameViewConstructor = new (options: ViewModelOption<GameModel>) => GameViewInstance;

function required<T>(value: T | undefined): T {
    if (value === undefined) {
        throw new Error('Attempted to get an undefined Backbone.js model or view.');
    }
    return value;
}

type ViewWithModel<TModel = unknown> = {
    model: TModel;
};

type GameViewContext = ViewWithModel<GameModel> & Partial<GameViewInstance>;

function asGameView(view: GameViewContext): GameViewInstance {
    return view as GameViewInstance;
}

function createTurnModel(attrs: TurnAttrs = {}): TurnModel {
    var TurnClass = required(mm.Turn);
    return new TurnClass(attrs);
}

function createTurnView(model: TurnModel): TurnViewInstance {
    var TurnViewClass = required(mm.TurnView);
    return new TurnViewClass({model: model});
}

function createSolutionView(model: TurnModel): SolutionViewInstance {
    var SolutionViewClass = required(mm.SolutionView);
    return new SolutionViewClass({model: model});
}

function createAllPiecesView(): AllPiecesViewInstance {
    var AllPiecesViewClass = required(mm.AllPiecesView);
    return new AllPiecesViewClass();
}

function createAllPiecesModel(): AllPiecesModel {
    var AllPiecesModelClass = required(mm.AllPieces);
    return new AllPiecesModelClass();
}

function createGameModel(): GameModel {
    var GameModelClass = required(mm.Game);
    return new GameModelClass();
}

function createGameView(model: GameModel): GameViewInstance {
    var GameViewClass = required(mm.GameView);
    return new GameViewClass({model: model});
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
    initialize: function (): void {
        _.bindAll(this, 'render', 'placePiece');
        this.model.on('change:code', this.render);
        this.model.on('change:hint_string', this.render);
        this.model.on('change:locked_class', this.render);
    },

    /**
     * mm.TurnView.
     */
    render: function (): Element {
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
    placePiece: function (color: string, place: number): void {
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
            var newCode: string;
            codeArray[place] = color;
            newCode = codeArray.join('');
            this.model.set({code: newCode});
            // log('placePiece oldCode color place newCode:', code, color, place, newCode);
        } else {
            // set the nub color to the color clicked in the frozen turn
            palletBbv.setNub(code[place]);
        }
    },
    
    /**
     * Handle click on a hole in a turn row.
     * 
     * mm.TurnView.
     */
    holeClicked: function (e: ViewEvent): void {
        // log('holeClicked');
        var holeId : number = $(e.currentTarget).attr('id');
        var color = nubColor;
        // log('holeClicked: holeId = ', holeId, ' color = ' 	, color);
        this.placePiece(color, holeId);
    },

    /** Check whether the turn's code has no holes.
     * 
     * mm.TurnView.
     * 
    */
    codeIsValid: function (): boolean {
        var code: String = this.model.get('code');
        if (code.includes('X')) return false;
        else return true;
    },

    /**
     * mm.TurnView.
     */
    hideTurnButton: function (): void { 
        this.model.set('disabled_class', 'hidden');
        this.render();
    },

    /**
     * mm.TurnView.
     */
    showTurnButton: function (): void { 
        this.model.set('disabled_class', '');
        this.render();
    },

    /**
     * User clicked the guess button for this turn.
     * 
     * mm.TurnView.
     */
    guessClicked: function (_e: ViewEvent): void {
        if (this.model.get('locked_class') !== 'active') return;
        if (this.codeIsValid() === false) return;
        this.goGuess();
    },

    /**
     * Execute the guess flow for this turn.
     * 
     * mm.TurnView.
     */
    goGuess: function (): void {
        this.freezeRow();
        gameBbv.checkGuess(this.model.get('code'));
    },

    /**
     * mm.TurnView.
     */
    freezeRow: function (): void {
        this.model.set('locked_class', 'frozen');
        this.hideTurnButton();
    },
    /**
     * mm.TurnView.
     */
    activateRow: function (): void {
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
    initialize: function (): void {
        solutionBbv = this;
        this.newSolution();
        this.model.on('change:locked_class', this.render, this);
    },

    /**
     * mm.SolutionView
     */
    newSolution: function (): void {
        var randomColor: string;
        solution = '';
        for (var i = 0; i < nHoles; i += 1) {
            var randomIndex = Math.floor(Math.random() * nColors);
            randomColor = codeColors[randomIndex];
            solution += randomColor;
        }
        // log('newSolution:', solution);
        solutionBbm.set({code: solution});
    },

    /**
     * mm.SolutionView
     */
    render: function (): Element {
        var solutionTemplate = $(this.template).html();
        var solutionHtml = _.template(solutionTemplate, this.model.toJSON());
        this.$el.html(solutionHtml);
        return this.el;
    },

    /**
     * mm.SolutionView
     */
    setSolved: function (): void {
        this.model.set('button_text', 'New Game');
        this.model.set('locked_class', '');
    },

    /**
     * Reveal or start a new game action from the solution view.
     *
     * mm.SolutionView
     */
    revealClicked: function (e: ViewEvent): void {
        e.preventDefault();
        if (solutionBbm.get('button_text') === 'quit') {
            gameBbv.quit();
        } else {
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
    initialize: function (): void {
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
    initialize: function (): void {
        palletBbv = this;
        this.model = createAllPiecesModel();
        this.model.on('change:color_class', this.render, this);

        this.render(); // reset the piece div
        // this.resetNub(); // reset the nub to X
    },


    /**
     * this = mm.AllPiecesView
     */
    render: function (): void {
        var nubHtml = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nubHtml);
    },

    /**
     * User clicked a color in the palette.
     * 
     * this = mm.AllPiecesView
     */
    nubClicked: function (e: ViewEvent): void {
        // log('nubClicked');
        var color = $(e.currentTarget).text();
        // log('nubClicked read color: ', color);
        palletBbv.setNub(color);
    },

    /**
     * this = mm.AllPiecesView
     */
    setNub: function (color: string): void {
        nubColor = color;
        palletBbm.set('color_class', color);
    },

    /**
     * Get current nub class.
     * 
     * this = mm.AllPiecesView
     */
    getNub: function (): string {
        return nubColor;    
    },

    /**
     * this = mm.AllPiecesView
     */
    resetNub: function (): void {
        this.setNub('X');    
    }
});


/**
* mm.Game model for mm.GameView
*/
mm.Game = Backbone.Model.extend({
    gameStatus: 'notStarted',

    initialize:function (): void {
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

    events: { /* see initialize */ },

    /**
     * Executes at the beginning of each new game.
     * 
    * this = mm.GameView
    */
    initialize: function (): void {
        gameBbv = this;
        solutionBbm = createTurnModel({locked_class: 'hidden'});
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

        u.initializeCodeTree();

        appLog.setTitle('Mastermind Log.');

        this.render(); // must be last line of initialize()
    },

    /**
     * Executes at the beginning of each new game.
     * 
    * this = mm.GameView
    */
    resetBoard: function (): void {
        turnsBbm = [];
        turnsBbv = [];
        for (var i = 0; i < nTurns; i += 1) {
            // initialize the model
            var class_name: string = (i % 2) ? 'alt' : '';
            var locked_class: LockedClass;
            var disabled_class: DisabledClass;
            if (i === 0) { 
                locked_class = 'active';
                disabled_class = ''; 
            } else { 
                locked_class = 'locked';
                disabled_class = 'hidden'; 
            }
            var turnM = createTurnModel({alt_class: class_name, locked_class: locked_class, disabled_class: disabled_class, id: i});
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
    render: function (): void {
        var html_els_array: Array<string | Element> = [this.header_template, this.gameOver_template, solutionBbv.render()];
        for (var i = 0; i < nTurns; i += 1) {
            var turnV = turnsBbv[i];
            html_els_array.push(turnV.render());
        }
        $(this.board_el).html(html_els_array);
    },

    /**
    * this = mm.GameView
    */
    checkGuess: function (guess: string): void {
        var pegs0 = u.setCode0AndCalculatePegs(solution, guess);
        boardGuesses[turnIndex] = guess;
        boardPegs[turnIndex] =  AsPegCombo(pegs0);
        u.calculateValidCodeCount(guess, pegs0, turnIndex);
        if (pegs0.b < nHoles) u.calculateCodeTree(turnIndex + 1);
        this.handleResults(pegs0);
    },


    /**
    * this = mm.GameView
    */
    handleResults: function (pegs: Pegs): void {
        var hint_string: string = '<p class="hint b">' + pegs.b 
            + '</p><p class="hint w">' + pegs.w + '</p><p class="hint c">' 
            + validCodeCount[turnIndex] + '</p>';
        this.getCurrentTurnBbm().set('hint_string', hint_string);

        if (pegs.b === 4) gameBbm.set('gameStatus', 'won');
        else if (turnIndex === (nTurns - 1)) gameBbm.set('gameStatus', 'lost');
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
    getPreviousTurnBbm: function (): TurnModel {
        return turnsBbm[turnIndex-1];
    },

    /**
    * this = mm.GameView
    */
    getCurrentTurnBbm: function (): TurnModel {
        return turnsBbm[turnIndex];
    },
    /**
    * this = mm.GameView
    */
    getNextTurnBbm: function (): TurnModel {
        return turnsBbm[turnIndex+1];
    },

    /**
    * this = mm.GameView
    */
    quit: function (): void {
        gameBbm.set('gameStatus', 'quit');
    },

    /**
    * this = mm.GameView
    */
    gameOver: function (): void {
        var status: GameStatus = gameBbm.get('gameStatus');
        $(gameBbv.game_el).attr('class', status);
        if (status === 'notStarted' || status === 'inPlay') { return; }

        var turnProgress: string = allCodes.length.toString();
        var completedTurns: number = turnIndex + 1;
        // Set next game's opener equal to this game's opener.
        autoOpener = turnsBbm[0].get('code'); 
        solutionBbv.setSolved();
        if (status === 'won') {
            turnsBbm.at(turnIndex).set('locked_class', 'correct');
            $(gameBbv.gameOver_el).text('you won!');
            completedTurns = turnIndex + 1;
        } else {
            turnsBbm.at(turnIndex).set('locked_class', 'wrong');
            if (status === 'quit') { 
                turnsBbv.at(turnIndex).hideTurnButton();
                $(gameBbv.gameOver_el).text('you quit.');
                completedTurns = turnIndex;
            } else {
                $(gameBbv.gameOver_el).text('you lost.');
                completedTurns = nTurns;
            }
        }
        if (completedTurns > 0) turnProgress += ' ' 
            + validCodeCount.slice(0, completedTurns).join(' ');
        appLog.prepend(`\nYou ${status} game ${nGames} on turn ${turnIndex + 1}. Secret code ${solution}, guesses ${guesses}, turn by turn progress: ${turnProgress}.`);

        nGames += 1; // increment the number of games played
    },

    /**
     * Runs at the beginning of each new game.
     * 
    * this = mm.GameView
    */
    newGame: function (): void {
        // Create the primary game view and pass in a new game model.
        // Put nothing else but the following line in newGame().
        createGameView(createGameModel());
    }
});

$(function () {
    mm.init();
});
