/** @type {any} */
var Mastermind = {

		colors: ['zero', 'one', 'two', 'three', 'four', 'five', 'six'],

		/**
		 * Initialize the game by constructing the main game view.
		 * @returns {void}
		 */
		init: function () {
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
		code: ['hole', 'hole', 'hole', 'hole'],
		hint_string: '',
		alt_class: '', 	// presentation
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
	placePiece: function (color, place) {
		// Do not allow placePiece in a frozen (past) turn.
		// Do allow placePiece for active (current) and 
		// locked (future) turns.
		// The player can use locked (future) turns 
		// as a scratch pad to plan their next guess.
		log('place piece',color,place);
		var code_array = this.model.get('code').slice(0);
		if (this.model.get('locked_class') === 'frozen') {
			// set the nub color to the color clicked in the frozen turn
			Mastermind.GameView.allPiecesView.setNub(code_array[place]);
		} else {
			if (color === 'zero') {
				code_array[place] = 'hole';
			} else {
				code_array[place] = 'nub ' + color;
			}
			this.model.set({code:code_array});
			log('code_array', code_array);
		}
	},
	
	/**
	 * Handle click on a hole in a turn row.
	 * @param {Event} e
	 */
	holeClicked: function (e) {
		// @ts-ignore
		var hole_index = $(e.currentTarget).attr('id'),
			color_class = Mastermind.GameView.allPiecesView.getNub();
		this.placePiece(color_class, hole_index);
	},

	/** Check whether the turn's code has no holes. @returns {boolean} */
	codeIsValid: function () {
		var code_complete = false,
			code_array = this.model.get('code'),
			num_holes = code_array.length;

		for (var i = 0; i < code_array.length; i += 1) {
			if (code_array[i] !== 'hole') { num_holes -= 1; }
		}
		code_complete = (num_holes === 0);
		return code_complete;
	},

	hideTurnButton: function () { 
		this.model.set('disabled_class','hidden');
		this.render();
	},

	showTurnButton: function () { 
		this.model.set('disabled_class', '');
		this.render();
	},

	/**
	 * User clicked the guess button for this turn.
	 * @param {Event} e
	 */
	guessClicked: function (e) {
		if (this.model.get('locked_class') !== 'active') { return; }
		if (this.codeIsValid() === false) { return; }
		this.goGuess();
	},

	/**
	 * Execute the guess flow for this turn.
	 * @param {Array<string>} guess_array
	 */
	goGuess: function (guess_array) {
		this.freezeRow();
		Mastermind.GameView.checkGuess(this.model.get('code'));
	},

	freezeRow: function () {
		this.model.set('locked_class','frozen');
		this.hideTurnButton();
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
		// Color zero is not a color.
		// Color zero means "remove color" or "reset color".
		// Subtract 1 because color zero cannot be part of the code.
		var num_colors = Mastermind.colors.length-1,
			cur_color = '',
			solution = [];

		for (var i = 0; i < 4; i += 1) {
			// Add 1 because random_index starts at 0 but 
			// the first real color is 1 (not 0).
			var random_index = Math.floor(Math.random()*num_colors + 1);
			cur_color = 'nub ' + Mastermind.colors[random_index];
			solution.push(cur_color);
		}
		this.model.set({code: solution});
		// log('newSolution:', solution);
	},

		render: function () {
			var solution_template = $(this.template).html(),
				solution_html = _.template(solution_template, this.model.toJSON());

			this.$el.html(solution_html);
		return this.el;
	},

	/** @param {boolean} game_won */
	setSolved: function (game_won) {
		var end_text = (game_won) ? 'you won! :D' : 'you lost!!!';
		this.model.set('button_text','New Game');
		this.model.set('locked_class','');
	},

	getCode: function () {
		return this.model.get('code');
	},

	/**
	 * Reveal or restart action from the solution view.
	 * @param {Event} e
	 */
	revealClicked: function (e) {
		e.preventDefault();
		if (this.model.get('button_text') ==='quit') {
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
		nub_class: 'zero'
	}
});

Mastermind.AllPieces_view = Backbone.View.extend({
	el: 'div#allPieces',
	cur_piece_el: 'div#current_piece',
	piece_template: '<div class="piece nub <%= nub_class %>"></div>',
	events: {
		'click div.nub': 'nubClick'
	},


	initialize: function () {
		this.model = new Mastermind.AllPieces();
		this.model.on('change:nub_class', this.render, this);

		this.render(); // reset the piece div
	},


	render: function () {
		var nub_copy = _.template(this.piece_template, this.model.attributes);
		$(this.cur_piece_el).html(nub_copy);
	},

	/**
	 * User clicked a nub color in the palette.
	 * @param {Event} e
	 */
	nubClick: function (e) {
		// @ts-ignore
		var classes_string = $(e.currentTarget).attr('class'),
			classes_array = classes_string.split(' '),
			nub_class = classes_array[2]; // this is a hack

			this.setNub(nub_class);	
	},

	/** @param {string} nub_class */
	setNub: function (nub_class) {
		log('setNub, nub_class = ', nub_class);
		this.model.set('nub_class', nub_class); 	
	},

	/**
	 * Get current nub class.
	 * @param {string=} nub_class optional (ignored)
	 * @returns {string}
	 */
	getNub: function (nub_class) {
		return this.model.get('nub_class'); 	
	},

	resetNub: function () {
		this.setNub('zero');	
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

	events: { /* see initialize */ },

	initialize: function () {
		this.turns = new Mastermind.Turn_collection();
		this.solution = new Mastermind.Turn({locked_class:'hidden'});
		this.solutionView = new Mastermind.Solution_view({model:this.solution});
		this.allPiecesView = new Mastermind.AllPieces_view();
		this.turn_views = [];

		this.resetBoard(); // START

		this.model.on('change:win',this.gameOver,this);
	},

	resetBoard: function () {
		var turns_array = [],
			turn_model = {},
			cur_turn = '',
			class_name = '',
			locked_class = '',
			disabled_class = '';

		for (var i = 0; i < this.model.get('num_turns'); i +=1 ) {
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

	render: function () { // only fired when game is initialized

		var html_els_array = [this.header_template, this.gameOver_template, this.solutionView.render()];

		for(var i = 0; i < this.turns.length; i += 1) {
			html_els_array.push(this.turn_views[i].render());
			// this.turns.at(i).set('',0);
		}
		// @ts-ignore
		$(this.board_el).html(html_els_array);
	},

	/**
	 * Check a guess array against the solution.
	 * @param {Array<string>} guess_array
	 */
	checkGuess: function (guess_array) {
		var solution_copy = this.solutionView.getCode().slice(0),
			guess_copy = guess_array.slice(0),
			num_black = 0,
			num_white = 0,
			code_length = 4;

		// check for exact matches
		for (var i = 0; i < code_length; i += 1) {
			if (guess_copy[i] === solution_copy[i]) {
				num_black += 1;
				guess_copy[i] ='x';
				solution_copy[i] = 'z';
			}
		}
		// check for color match only
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

	/**
	 * Handle guess results: update hints and advance turns.
	 * @param {number} num_black
	 * @param {number} num_white
	 */
	handleResults: function (num_black, num_white) {

		// display the hints / do next turn
		var hint_string = '<p class="hint b">' + num_black + '</p><p class="hint w">' + num_white + '</p>';
		this.getCurrentTurn().set('hint_string', hint_string);

		// decrement turns_remaining // (this.getCurrentTurn === next turn)
		this.model.set('turns_remaining', this.model.get('turns_remaining') - 1);

		// WIN?
		if (num_black === 4) {
			this.model.set('win',true);
		} else if (this.model.get('turns_remaining') === 0) {
			this.model.set('win',false);
		} else {
			// log('turns_remaining: ', this.model.get('turns_remaining'));
			var t = this.getCurrentTurn();
			t.set('disabled_class',''); // show the guess button
			t.set('locked_class','active'); // unlock the next turn
		}
	},

	getPreviousTurn: function () {
		var cur_turn = this.getCurrentTurn(),
			prev_id = cur_turn.get('id') - 1,
			prev_turn = this.turns.get(prev_id);
			
		return prev_turn;
	},

	getCurrentTurn: function () {
		var turn_index = this.model.get('num_turns') - this.model.get('turns_remaining'),
			cur_turn = this.turns.at(turn_index);

		return cur_turn;
	},

	getNextTurn: function () {
		var cur_turn = this.getCurrentTurn(),
			next_id = cur_turn.get('id') + 1,
			next_turn = this.turns.get(next_id);
			
		return next_turn;
	},

	quit: function () {
		this.model.set('win', false);
	},

	gameOver: function () {
		var you_won = this.model.get('win');
		this.solutionView.setSolved(you_won);
		if (you_won) {
			this.getPreviousTurn().set('locked_class', 'correct');
			$(this.gameOver_el).text('you won!');
			$(this.gameOver_el).addClass('win');
		} else {
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
