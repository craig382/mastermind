/* Minimal TypeScript scaffold: use `declare var` for external globals. */

declare var Backbone: any;

declare var _: any;

declare var $: any;

type TurnModel = {
    get(key: 'code'): Array<NubClass>;
    get(key: 'id'): number;
    get(key: 'locked_class'): LockedClass;
    get(key: 'disabled_class'): DisabledClass;
    get(key: string): any;
    set(key: 'disabled_class', value: DisabledClass): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(key: 'hint_string', value: string): any;
    set(key: 'code', value: Array<NubClass>): any;
    set(attrs: { code: Array<NubClass> }): any;
    set(key: string, value: any): any;
};

type GameModel = {
    get(key: 'num_turns'): number;
    get(key: 'turns_remaining'): number;
    get(key: 'status'): GameStatus;
    get(key: string): any;
    set(key: 'turns_remaining', value: number): any;
    set(key: 'status', value: GameStatus): any;
    set(key: string, value: any): any;
};

type SolutionModel = {
    get(key: 'code'): Array<NubClass>;
    get(key: 'button_text'): ButtonText;
    get(key: string): any;
    set(key: 'code', value: Array<NubClass>): any;
    set(key: 'button_text', value: ButtonText): any;
    set(key: 'locked_class', value: LockedClass): any;
    set(key: string, value: any): any;
};

type AllPiecesModel = {
    get(key: 'nub_class'): NubClass;
    get(key: string): any;
    set(key: 'nub_class', value: NubClass): any;
    set(key: string, value: any): any;
};

type TurnViewInstance = {
    render: () => Element;
    activateRow: () => void;
};

type ViewEvent = Event;
type LockedClass = '' | 'active' | 'locked' | 'frozen' | 'correct' | 'hidden';
type DisabledClass = '' | 'hidden' | 'disabled';
type NubClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'X';
type GuessMark = 'x' | 'z';
type ButtonText = 'quit' | 'New Game';
type GameStatus = 'notStarted' | 'inPlay' | 'won' | 'lost';

/** @type {any} */
var Mastermind: any = {

		colors: ['A', 'B', 'C', 'D', 'E', 'F', 'X'],

		/**
		 * Initialize the game by constructing the main game view.
		 * @returns {void}
		 */
        init: function (): void {
			// Create the primary game view and pass in a new game model.
			this.GameView = new this.Game_view({model: new this.Game()});
		}
	},
	log = console.log.bind(console);

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
        var turn_template = $(this.template).html(),
            turn_html = '';

        turn_html = _.template(turn_template, this.model.toJSON()).toString();
        this.$el.html(turn_html);

        return this.el;
    },

    /**
     * Place a piece (or, when frozen, set the shared nub color).
     * @param {string} color
     * @param {number|string} place
     */
    placePiece: function (color: NubClass, place: number | string): void {
        var turnModel = this.model as TurnModel;
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
        } else {
            code_array[place] = color;
            turnModel.set({code:code_array});
            log('code_array', code_array);
        }
    },
    
    /**
     * Handle click on a hole in a turn row.
     * @param {Event} e
     */
    holeClicked: function (e: ViewEvent): void {
        // log('holeClicked');
        var target = e.currentTarget as Element | null,
            hole_index = target ? ($(target).attr('id') || '0') : '0',
            color_class: NubClass = Mastermind.GameView.allPiecesView.getNub();
        // log('holeClicked: hole_index = ', hole_index, ' color_class = ' 	, color_class);
        this.placePiece(color_class, hole_index);
    },

    /** Check whether the turn's code has no holes. @returns {boolean} */
    codeIsValid: function (): boolean {
        var turnModel = this.model as TurnModel;
        var code_complete = false,
            code_array = turnModel.get('code'),
            num_holes = code_array.length;

        for (var i = 0; i < code_array.length; i += 1) {
            if (code_array[i] !== 'X') { num_holes -= 1; }
        }
        code_complete = (num_holes === 0);
        return code_complete;
    },

    hideTurnButton: function (): void { 
        var turnModel = this.model as TurnModel;
        turnModel.set('disabled_class', 'hidden');
        this.render();
    },

    showTurnButton: function (): void { 
        var turnModel = this.model as TurnModel;
        turnModel.set('disabled_class', '');
        this.render();
    },

    /**
     * User clicked the guess button for this turn.
     * @param {Event} e
     */
    guessClicked: function (e: ViewEvent): void {
        var turnModel = this.model as TurnModel;
        if (turnModel.get('locked_class') !== 'active') { return; }
        if (this.codeIsValid() === false) { return; }
        this.goGuess();
    },

    /**
     * Execute the guess flow for this turn.
     */
    goGuess: function (): void {
        var turnModel = this.model as TurnModel;
        this.freezeRow();
        Mastermind.GameView.checkGuess(turnModel.get('code'));
    },

    freezeRow: function (): void {
        var turnModel = this.model as TurnModel;
        turnModel.set('locked_class','frozen');
        this.hideTurnButton();
    },

    activateRow: function (): void {
        var turnModel = this.model as TurnModel;
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
        var solutionModel = this.model as SolutionModel;
        // Color X is not a color.
        // Color X means "remove color" or "no color".
        // Subtract 1 because color X cannot be part of the code.
        var num_colors = Mastermind.colors.length-1,
            cur_color: NubClass = 'X',
            solution: Array<NubClass> = [];

        for (var i = 0; i < 4; i += 1) {
            var random_index = Math.floor(Math.random()*num_colors);
            cur_color = Mastermind.colors[random_index];
            solution.push(cur_color);
        }
        solutionModel.set('code', solution);
        log('newSolution:', solution);
    },

    render: function (): Element {
        var solution_template = $(this.template).html(),
            solution_html = _.template(solution_template, this.model.toJSON());

        this.$el.html(solution_html);
    return this.el;
    },

    /** @param {boolean} game_won */
    setSolved: function (game_won: boolean): void {
        var solutionModel = this.model as SolutionModel;
        solutionModel.set('button_text','New Game');
        solutionModel.set('locked_class','');
    },

    getCode: function (): Array<NubClass> {
        var solutionModel = this.model as SolutionModel;
        return solutionModel.get('code');
    },

    /**
     * Reveal or restart action from the solution view.
     * @param {Event} e
     */
    revealClicked: function (e: ViewEvent): void {
        var solutionModel = this.model as SolutionModel;
        e.preventDefault();
        if (solutionModel.get('button_text') === 'quit') {
            Mastermind.GameView.quit();
        } else {
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
        var target = e.currentTarget as Element | null,
            classes = target ? ($(target).attr('class') || '') : '',
            nub_class = (classes.split(' ')[1] || 'X') as NubClass;
        this.setNub(nub_class);    
    },

    /** @param {string} nub_class */
    setNub: function (nub_class: NubClass): void {
        var allPiecesModel = this.model as AllPiecesModel;
        log('setNub, nub_class = ', nub_class);
        allPiecesModel.set('nub_class', nub_class);    
    },

    /**
     * Get current nub class.
     * @returns {string}
     */
    getNub: function (): NubClass {
        var allPiecesModel = this.model as AllPiecesModel;
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
        this.turns = new Mastermind.Turn_collection();
        this.solution = new Mastermind.Turn({locked_class:'hidden'});
        this.solutionView = new Mastermind.Solution_view({model:this.solution});
        this.allPiecesView = new Mastermind.AllPieces_view();
        this.turn_views = [] as Array<TurnViewInstance>;

        this.model.on('change:status',this.gameOver,this);

        this.resetBoard(); // START

        // Keep current behavior: game begins immediately for now.
        // A future change can keep this as notStarted until user clicks New Game.
        this.model.set('status', 'inPlay');
    },

    resetBoard: function (): void {
        var game = this.model as GameModel;
        var turns_array: Array<TurnModel> = [],
            turn_model = {} as TurnModel,
            cur_turn = {} as TurnViewInstance,
            class_name: string = '',
            locked_class: LockedClass = '',
            disabled_class: DisabledClass = '';

        for (var i = 0; i < game.get('num_turns'); i +=1 ) {
            // initialize the model
            class_name = (i % 2) ? 'alt' : '';
            if (i === 0) { 
                locked_class = 'active';
                disabled_class = ''; 
            } else { 
                locked_class = 'locked';
                disabled_class = 'hidden'; 
            }
            turn_model = new Mastermind.Turn({alt_class:class_name, locked_class:locked_class, disabled_class:disabled_class, id:i});
            cur_turn = new Mastermind.Turn_view({model:turn_model});
            turns_array.push(turn_model);
            this.turn_views.push(cur_turn);
        }
        
        // reset the game over message
        $(this.gameOver_el).attr('class',''); 
        this.turns.reset(turns_array);

        this.render();
        log('resetBoard executed');
    },

    render: function (): void { // only fired when game is initialized

        var html_els_array: Array<string | Element> = [this.header_template, this.gameOver_template, this.solutionView.render()];

        for(var i = 0; i < this.turns.length; i += 1) {
            var turn_view: TurnViewInstance = this.turn_views[i];
            html_els_array.push(turn_view.render());
        }
        $(this.board_el).html(html_els_array);
    },

    checkGuess: function (guess_array: Array<NubClass>): void {
        var solution_copy: Array<NubClass | GuessMark> = this.solutionView.getCode().slice(0),
            guess_copy: Array<NubClass | GuessMark> = guess_array.slice(0),
            num_black: number = 0,
            num_white: number = 0,
            code_length: number = 4;

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
        this.handleResults(num_black,num_white);
    },

    handleResults: function (num_black: number, num_white: number): void {
        var game = this.model as GameModel;
        var hint_string: string = '<p class="hint b">' + num_black + '</p><p class="hint w">' + num_white + '</p>';
        this.getCurrentTurn().set('hint_string', hint_string);

        game.set('turns_remaining', game.get('turns_remaining') - 1);

        if (num_black === 4) {
            game.set('status','won');
        } else if (game.get('turns_remaining') === 0) {
            game.set('status','lost');
        } else {
            var t: TurnModel = this.getCurrentTurn();
            t.set('disabled_class','');
            t.set('locked_class','active');
        }
    },

    getPreviousTurn: function (): TurnModel {
        var cur_turn: TurnModel = this.getCurrentTurn(),
            prev_id: number = cur_turn.get('id') - 1,
            prev_turn = this.turns.get(prev_id);
            
        return prev_turn;
    },

    getCurrentTurn: function (): TurnModel {
        var game = this.model as GameModel,
            turn_index: number = game.get('num_turns') - game.get('turns_remaining'),
            cur_turn = this.turns.at(turn_index);

        return cur_turn;
    },

    getNextTurn: function (): TurnModel {
        var cur_turn: TurnModel = this.getCurrentTurn(),
            next_id: number = cur_turn.get('id') + 1,
            next_turn = this.turns.get(next_id);
            
        return next_turn;
    },

    quit: function (): void {
        var game = this.model as GameModel;
        game.set('status', 'lost');
    },

    gameOver: function (): void {
        var game = this.model as GameModel;
        var status: GameStatus = game.get('status');
        if (status === 'notStarted' || status === 'inPlay') { return; }

        var you_won = (status === 'won');
        this.solutionView.setSolved(you_won);
        if (status === 'won') {
            this.getPreviousTurn().set('locked_class', 'correct');
            $(this.gameOver_el).text('you won!');
            $(this.gameOver_el).addClass('win');
        } else {
            $(this.gameOver_el).text('you lost.');
            $(this.gameOver_el).addClass('lose');
        }
    },

    restart: function (): void {
        Mastermind.init();
    }
});

$(function () {
    Mastermind.init();
});
