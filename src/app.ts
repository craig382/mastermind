/* Minimal TypeScript scaffold: use `declare var` for external globals. */

declare var Backbone: any;

declare var _: any;

declare var $: any;

type TurnModel = {
    get(key: 'code'): Array<NubClass>;
    get(key: 'id'): number;
    get(key: 'locked_class'): LockedClass;
    get(key: 'disabled_class'): DisabledClass;
    get(key: 'hint_string'): string;
    get(key: 'button_text'): ButtonText;
    get(key: string): any;
    set(key: 'disabled_class', value: DisabledClass): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(key: 'hint_string', value: string): any;
    set(key: 'code', value: Array<NubClass>): any;
    set(key: 'button_text', value: ButtonText): any;
    set(attrs: Partial<{
        id: number;
        code: Array<NubClass>;
        hint_string: string;
        alt_class: string;
        disabled_class: DisabledClass;
        locked_class: LockedClass;
        button_text: ButtonText;
    }>): any;
    set(key: string, value: any): any;
};

type GameModel = {
    get(key: 'num_turns'): number;
    get(key: 'turns_remaining'): number;
    get(key: 'status'): GameStatus;
    get(key: string): any;
    set(key: 'turns_remaining', value: number): any;
    set(key: 'status', value: GameStatus): any;
    set(attrs: Partial<{
        num_turns: number;
        turns_remaining: number;
        status: GameStatus;
    }>): any;
    set(key: string, value: any): any;
};

type SolutionModel = {
    get(key: 'code'): Array<NubClass>;
    get(key: 'button_text'): ButtonText;
    get(key: 'locked_class'): LockedClass;
    get(key: string): any;
    set(key: 'code', value: Array<NubClass>): any;
    set(key: 'button_text', value: ButtonText): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(attrs: Partial<{
        code: Array<NubClass>;
        button_text: ButtonText;
        locked_class: LockedClass;
    }>): any;
    set(key: string, value: any): any;
};

type AllPiecesModel = {
    get(key: 'nub_class'): NubClass;
    get(key: string): any;
    set(key: 'nub_class', value: NubClass): any;
    set(attrs: Partial<{
        nub_class: NubClass;
    }>): any;
    set(key: string, value: any): any;
};

type TurnViewInstance = {
    render: () => Element;
    activateRow: () => void;
};

type AllPiecesViewInstance = {
    setNub(nub_class: NubClass): void;
    getNub(): NubClass;
    resetNub(): void;
};

type SolutionViewInstance = {
    render(): Element;
    getCode(): Array<NubClass>;
    setSolved(game_won: boolean): void;
};

type GameViewInstance = {
    turns: TurnCollectionModel;
    turn_views: Array<TurnViewInstance>;
    solution: TurnModel;
    allPiecesView: AllPiecesViewInstance;
    solutionView: SolutionViewInstance;
    checkGuess(guess_array: Array<NubClass>): void;
    getCurrentTurn(): TurnModel;
    getPreviousTurn(): TurnModel;
    quit(): void;
    restart(): void;
    handleResults(num_black: number, num_white: number): void;
    gameOver_el: string;
};

type TurnCollectionModel = {
    length: number;
    reset(models: Array<TurnModel>): any;
    get(id: number): TurnModel;
    at(index: number): TurnModel;
};

type ViewEvent = Event;
type LockedClass = '' | 'active' | 'locked' | 'frozen' | 'correct' | 'hidden';
type DisabledClass = '' | 'hidden' | 'disabled';
type NubClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'X';
type PlayableColor = Exclude<NubClass, 'X'>;
type GuessMark = 'x' | 'z';
type ButtonText = 'quit' | 'New Game';
type GameStatus = 'notStarted' | 'inPlay' | 'won' | 'lost';

type TurnAttrs = Partial<{
    id: number;
    alt_class: string;
    locked_class: LockedClass;
    disabled_class: DisabledClass;
}>;


type TurnConstructor = new (attrs?: TurnAttrs) => TurnModel;
type TurnCollectionConstructor = new () => TurnCollectionModel;
type TurnViewConstructor = new (options: { model: TurnModel }) => TurnViewInstance;
type SolutionViewConstructor = new (options: { model: TurnModel }) => SolutionViewInstance;
type AllPiecesModelConstructor = new () => AllPiecesModel;
type AllPiecesViewConstructor = new () => AllPiecesViewInstance;
type GameModelConstructor = new () => GameModel;
type GameViewConstructor = new (options: { model: GameModel }) => GameViewInstance;

type MastermindRoot = {
    colors: Array<NubClass>;
    GameView?: GameViewInstance;
    Turn?: TurnConstructor;
    Turn_collection?: TurnCollectionConstructor;
    Turn_view?: TurnViewConstructor;
    Solution_view?: SolutionViewConstructor;
    AllPieces?: AllPiecesModelConstructor;
    AllPieces_view?: AllPiecesViewConstructor;
    Game?: GameModelConstructor;
    Game_view?: GameViewConstructor;
    init(): void;
};

/** @type {any} */
var Mastermind: MastermindRoot = {

    colors: ['A', 'B', 'C', 'D', 'E', 'F', 'X'],

    /**
     * Initialize the game by constructing the main game view.
     * @returns {void}
     */
    init: function (): void {
        // Create the primary game view and pass in a new game model.
        this.GameView = createGameView(createGameModel());
    }
};

var log = console.log.bind(console);

function getGameView(): GameViewInstance {
    return Mastermind.GameView as GameViewInstance;
}

type ViewWithModel<TModel = unknown> = {
    model: TModel;
};

function getTurnModel(view: ViewWithModel): TurnModel {
    return view.model as TurnModel;
}

function getSolutionModel(view: ViewWithModel): SolutionModel {
    return view.model as SolutionModel;
}

function getAllPiecesModel(view: ViewWithModel): AllPiecesModel {
    return view.model as AllPiecesModel;
}

function getGameModel(view: ViewWithModel): GameModel {
    return view.model as GameModel;
}

function asGameView(view: unknown): GameViewInstance {
    return view as GameViewInstance;
}

function createTurn(attrs: TurnAttrs = {}): TurnModel {
    var TurnClass = Mastermind.Turn as TurnConstructor;
    return new TurnClass(attrs);
}

function createTurnCollection(): TurnCollectionModel {
    var TurnCollectionClass = Mastermind.Turn_collection as TurnCollectionConstructor;
    return new TurnCollectionClass();
}

function createTurnView(model: TurnModel): TurnViewInstance {
    var TurnViewClass = Mastermind.Turn_view as TurnViewConstructor;
    return new TurnViewClass({model: model});
}

function createSolutionView(model: TurnModel): SolutionViewInstance {
    var SolutionViewClass = Mastermind.Solution_view as SolutionViewConstructor;
    return new SolutionViewClass({model: model});
}

function createAllPiecesView(): AllPiecesViewInstance {
    var AllPiecesViewClass = Mastermind.AllPieces_view as AllPiecesViewConstructor;
    return new AllPiecesViewClass();
}

function createGameModel(): GameModel {
    var GameModelClass = Mastermind.Game as GameModelConstructor;
    return new GameModelClass();
}

function createGameView(model: GameModel): GameViewInstance {
    var GameViewClass = Mastermind.Game_view as GameViewConstructor;
    return new GameViewClass({model: model});
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
        alt_class: '', 	// presentation
        disabled_class: 'disabled', // for the guess button
        locked_class: 'locked', 
        button_text: 'quit' // for the solution view
    }
});

Mastermind.Turn_collection = Backbone.Collection.extend({
    model: Mastermind.Turn,

    initialize: function (): void {
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

    initialize: function (): void {
        _.bindAll(this, 'render', 'placePiece');

        this.model.on('change:code', this.render);
        this.model.on('change:hint_string', this.render);
        this.model.on('change:locked_class', this.render);
    },

    render: function (): Element {
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
    placePiece: function (color: NubClass, place: number): void {
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
        } else {
            code_array[place] = color;
            turnModel.set({code: code_array});
            log('code_array', code_array);
        }
    },
    
    /**
     * Handle click on a hole in a turn row.
     * @param {Event} e
     */
    holeClicked: function (e: ViewEvent): void {
        // log('holeClicked');
        var gameView = getGameView();
        var target = e.currentTarget as Element | null;
        var hole_id = target ? ($(target).attr('id') || '0') : '0';
        var hole_index = parseInt(hole_id, 10);
        var color_class: NubClass = gameView.allPiecesView.getNub();
        // log('holeClicked: hole_index = ', hole_index, ' color_class = ' 	, color_class);
        this.placePiece(color_class, hole_index);
    },

    /** Check whether the turn's code has no holes. @returns {boolean} */
    codeIsValid: function (): boolean {
        var turnModel = getTurnModel(this);
        var code_complete = false;
        var code_array = turnModel.get('code');
        var num_holes = code_array.length;

        for (var i = 0; i < code_array.length; i += 1) {
            if (code_array[i] !== 'X') { num_holes -= 1; }
        }
        code_complete = (num_holes === 0);
        return code_complete;
    },

    hideTurnButton: function (): void { 
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', 'hidden');
        this.render();
    },

    showTurnButton: function (): void { 
        var turnModel = getTurnModel(this);
        turnModel.set('disabled_class', '');
        this.render();
    },

    /**
     * User clicked the guess button for this turn.
     * @param {Event} e
     */
    guessClicked: function (_e: ViewEvent): void {
        var turnModel = getTurnModel(this);
        if (turnModel.get('locked_class') !== 'active') { return; }
        if (this.codeIsValid() === false) { return; }
        this.goGuess();
    },

    /**
     * Execute the guess flow for this turn.
     */
    goGuess: function (): void {
        var turnModel = getTurnModel(this);
        var gameView = getGameView();
        this.freezeRow();
        gameView.checkGuess(turnModel.get('code'));
    },

    freezeRow: function (): void {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class','frozen');
        this.hideTurnButton();
    },

    activateRow: function (): void {
        var turnModel = getTurnModel(this);
        turnModel.set('locked_class','active');
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
    
    initialize: function (): void {
        this.newSolution();
        this.model.on('change:locked_class', this.render, this);
    },

    newSolution: function (): void {
        var solutionModel = getSolutionModel(this);
        // Color X is not a color.
        // Color X means "remove color" or "no color".
        // Subtract 1 because color X cannot be part of the code.
        var playable_colors: Array<PlayableColor> = Mastermind.colors.filter(function (c: NubClass): c is PlayableColor {
            return c !== 'X';
        });
        var num_colors = playable_colors.length;
        var cur_color: PlayableColor = 'A';
        var solution: Array<NubClass> = [];

        for (var i = 0; i < 4; i += 1) {
            var random_index = Math.floor(Math.random()*num_colors);
            cur_color = playable_colors[random_index];
            solution.push(cur_color);
        }
        solutionModel.set('code', solution);
        log('newSolution:', solution);
    },

    render: function (): Element {
        var solution_template = $(this.template).html();
        var solution_html = _.template(solution_template, this.model.toJSON());

        this.$el.html(solution_html);
    return this.el;
    },

    /** @param {boolean} _game_won */
    setSolved: function (_game_won: boolean): void {
        var solutionModel = getSolutionModel(this);
        solutionModel.set('button_text','New Game');
        solutionModel.set('locked_class','');
    },

    getCode: function (): Array<NubClass> {
        var solutionModel = getSolutionModel(this);
        return solutionModel.get('code');
    },

    /**
     * Reveal or restart action from the solution view.
     * @param {Event} e
     */
    revealClicked: function (e: ViewEvent): void {
        var solutionModel = getSolutionModel(this);
        var gameView = getGameView();
        e.preventDefault();
        if (solutionModel.get('button_text') === 'quit') {
            gameView.quit();
        } else {
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


    initialize: function (): void {
        this.model = new Mastermind.AllPieces();
        this.model.on('change:nub_class', this.render, this);

        this.render(); // reset the piece div
        // this.resetNub(); // reset the nub to X
    },


    render: function (): void {
        var nub_copy = _.template(this.piece_template, this.model.attributes);
        $(this.cur_piece_el).html(nub_copy);
    },

    /**
     * User clicked a color in the palette.
     * @param {Event} e
     */
    nubClicked: function (e: ViewEvent): void {
        // log('nubClick');
        var target = e.currentTarget as Element | null;
        var classes = target ? ($(target).attr('class') || '') : '';
        var nub_class = (classes.split(' ')[1] || 'X') as NubClass;
        this.setNub(nub_class);    
    },

    /** @param {string} nub_class */
    setNub: function (nub_class: NubClass): void {
        var allPiecesModel = getAllPiecesModel(this);
        log('setNub, nub_class = ', nub_class);
        allPiecesModel.set('nub_class', nub_class);    
    },

    /**
     * Get current nub class.
     * @returns {string}
     */
    getNub: function (): NubClass {
        var allPiecesModel = getAllPiecesModel(this);
        return allPiecesModel.get('nub_class');    
    },

    resetNub: function (): void {
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

    events: { /* see initialize */ },

    initialize: function (): void {
        var gameView = asGameView(this);
        gameView.turns = createTurnCollection();
        gameView.solution = createTurn({locked_class: 'hidden'});
        gameView.solutionView = createSolutionView(gameView.solution);
        gameView.allPiecesView = createAllPiecesView();
        gameView.turn_views = [] as Array<TurnViewInstance>;

        this.model.on('change:status',this.gameOver,this);

        this.resetBoard(); // START

        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('status', 'inPlay');
    },

    resetBoard: function (): void {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var turns = gameView.turns;
        var turns_array: Array<TurnModel> = [];

        for (var i = 0; i < game.get('num_turns'); i +=1 ) {
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
            var turn_model = createTurn({alt_class: class_name, locked_class: locked_class, disabled_class: disabled_class, id: i});
            var cur_turn = createTurnView(turn_model);
            turns_array.push(turn_model);
            gameView.turn_views.push(cur_turn);
        }
        
        // reset the game over message
        $(this.gameOver_el).attr('class',''); 
        turns.reset(turns_array);

        this.render();
        log('resetBoard executed');
    },

    render: function (): void { // only fired when game is initialized
        var gameView = asGameView(this);
        var turns = gameView.turns;

        var html_els_array: Array<string | Element> = [this.header_template, this.gameOver_template, gameView.solutionView.render()];

        for(var i = 0; i < turns.length; i += 1) {
            var turn_view: TurnViewInstance = gameView.turn_views[i];
            html_els_array.push(turn_view.render());
        }
        $(this.board_el).html(html_els_array);
    },

    checkGuess: function (guess_array: Array<NubClass>): void {
        var gameView = asGameView(this);
        var solution_copy: Array<NubClass | GuessMark> = gameView.solutionView.getCode().slice(0);
        var guess_copy: Array<NubClass | GuessMark> = guess_array.slice(0);
        var num_black: number = 0;
        var num_white: number = 0;
        var code_length: number = 4;

        for (var i = 0; i < code_length; i += 1) {
            if (guess_copy[i] === solution_copy[i]) {
                num_black += 1;
                guess_copy[i] ='x';
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
        gameView.handleResults(num_black,num_white);
    },

    handleResults: function (num_black: number, num_white: number): void {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var hint_string: string = '<p class="hint b">' + num_black + '</p><p class="hint w">' + num_white + '</p>';
        gameView.getCurrentTurn().set('hint_string', hint_string);

        game.set('turns_remaining', game.get('turns_remaining') - 1);

        if (num_black === 4) {
            game.set('status','won');
        } else if (game.get('turns_remaining') === 0) {
            game.set('status','lost');
        } else {
            var t: TurnModel = gameView.getCurrentTurn();
            t.set('disabled_class','');
            t.set('locked_class','active');
        }
    },

    getPreviousTurn: function (): TurnModel {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn: TurnModel = this.getCurrentTurn();
        var prev_id: number = cur_turn.get('id') - 1;
        var prev_turn = turns.get(prev_id);
            
        return prev_turn;
    },

    getCurrentTurn: function (): TurnModel {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var game = getGameModel(this);
        var turn_index: number = game.get('num_turns') - game.get('turns_remaining');
        var cur_turn = turns.at(turn_index);

        return cur_turn;
    },

    getNextTurn: function (): TurnModel {
        var gameView = asGameView(this);
        var turns = gameView.turns;
        var cur_turn: TurnModel = this.getCurrentTurn();
        var next_id: number = cur_turn.get('id') + 1;
        var next_turn = turns.get(next_id);
            
        return next_turn;
    },

    quit: function (): void {
        var game = getGameModel(this);
        game.set('status', 'lost');
    },

    gameOver: function (): void {
        var gameView = asGameView(this);
        var game = getGameModel(this);
        var status: GameStatus = game.get('status');
        if (status === 'notStarted' || status === 'inPlay') { return; }

        var you_won = (status === 'won');
        gameView.solutionView.setSolved(you_won);
        if (status === 'won') {
            gameView.getPreviousTurn().set('locked_class', 'correct');
            $(gameView.gameOver_el).text('you won!');
            $(gameView.gameOver_el).addClass('win');
        } else {
            $(gameView.gameOver_el).text('you lost.');
            $(gameView.gameOver_el).addClass('lose');
        }
    },

    restart: function (): void {
        Mastermind.init();
    }
});

$(function () {
    Mastermind.init();
});
