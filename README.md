# Mastermind
===============

A web app to play mastermind. Written in Backbone.js.

[Play Craig's Mastermind Game](http://craig382.github.io/mastermind/)

[Craig's Mastermind Game Source Code](https://github.com/craig382/mastermind)

## Change Log:
1. The player can use future turns as a scratchpad for working out the secret code.
2. The player can pick a color from the color palette or past turns.
3. Changed the appearance and location of the end game "you won" or "you lost" message. It no longer obscures the player's completed game.
4. Color palette improvements. Moved the current color selected nub into the color palette. And added a "remove color" nub to the color palette. The current color nub now keeps its color until it is changed to a new color which makes placing duplicate colors easier. (The old behavior was that the current color automatically reset to no color after each color placement.) Also, the color palette is now at the bottom of the board (instead of the bottom of the screen).
5. Created an appLog at the bottom of the screen for keeping game history.
6. Created Valid Count Hints that can be enabled or disabled. A Valid Count Hint displays the number of valid codes remaining to the right of the black and white peg display.
7. Created Auto Opener Mode that can be enabled or disabled. When enabled, the first guess is automatically filled in with the opener from the previous game (or the default auto opener for the first game).
8. Created Bot Guess Hints that can be enabled or disabled. When enabled, the bot fills in its suggestion for the next guess. The player can accept or override this suggestion. Note that Bot Guess Hints take precedence over Auto Opener Mode.

## Future Changes?:
- Have the bot find all PERFECT guesses (not just the first one) and log them all, too.
- botValid[]: boolean and boardValid[]: boolean. Used for Valid  feedback (uppercase letters for valid, lowercase letters for invalid) in the turns and log. The tutor on/off button will provide two types of feedback. The first is uppercase / lowercase letters on the board and in the log (the log will always have this). The second is "live" help, as each color is placed in the current turn, the previous turn hints (peg results) will be outlined in green if their constraint has been met by the (possibly partial) guess.
- maxPegCombos = 14. botPerfect[][]: string and boardPerfect[]: string. Perfect guesses in the log by the board and the bot will be underlined. Also, the bot will look for and log all perfect guesses, not just the first one. The bot will open up guessArray to allCodes when 2 < validCodesIn.length <= maxPegCombos. Because it is impossible to find a perfect guess when there are more than 14 (maxPegCompbos) validCodesIn.
- Add a timer and show game play time in the "you won" message.
- Add "Stats" to the bottom of the screen showing: reset stats button, number of games played, how many games lost, win percentage, average number of guesses to win a game (excludes lost games), guess distribution, current winning streak, max winning streak, time distribution, average time to win a game (excludes lost games), etc.
- Add settings to the bottom of the screen: number of colors, max number of turns, length of code, repeat colors allowed in secret code, blanks allowed in guess, row hint toggle, color palette hint toggle, etc.
- Add color palette hint that shows number of colors that the secret code contains.
- Add row hints on frozen rows that every time you change the code on the active row, it shows the black and white peg results vs the active code (only when each differs from the true black and white peg (vs the secret code) row hint).

## Development Setup After Conversion to TypeScript

`npm run serve`

## Development setup

This project now includes a minimal `package.json` for editor and type support.

A new developer should run:

```bash
npm install
```

This installs local type declarations for Backbone, jQuery, and Underscore, which improves IntelliSense without changing runtime behavior.

After `npm install`, reload the editor or window so the TypeScript server picks up the new types.

The repository intentionally ignores `node_modules/`; this folder is only needed for local development and should not be published to GitHub Pages.

## Mastermind Strategies

### ABBC, DDEE Openers
- Usually solves in 4, 5, or 6.

### ABCD, EEFF Opener
- ABCD = 1 eliminates 3 colors. Follow with EEFF = b, then A | B | C | D: is quadruple for b = 0, triplicate for b = 1, duplicate for b = 2, or single for b = 3.
- ABCD = 2 leaves 0, 1 or 2 colors. Follow with EEFF = b.
- ABCD = 3 leaves 0 (2 singles and 1 duplicate) or 1 (3 singles) color. Thus guess 2 should not have duplicate of E or F. Make guess 2 a valid combination of ABEF. ABEF = b = 1 (e.g. ACCD) | 2 (e.g. ABCD) | 3 (e.g. ABED). b = 0 | 4 is impossilbe.
- ABCD = 4 eliminates the remaining 2 colors. Try another combination of ABCD for guess 2.
- ABCD = 0 eliminates 4 colors. Follow with EEFF = b, then E | F is: quadruple for b = 2; or triplicate for b = 3; for b = 4, E and F are both duplicate. 

## Craig's Mastermind Strategy
- (For 6 colors, duplicates allowed, code length 4, blanks not allowed.)
- Move 1. AABB.
- Depending on the number of pegs found in move 1:
    - Move 2. DCCE for 0 or 3 pegs.
    - Move 2. ACCD for 1 black peg, DCCA for 1 white peg.
    - Move 2. ACCB for 2 black pegs, BCCA for 2 white pegs, ABCC for 1 black 1 white peg.
    - Move 2. For 4 move 1 pegs, a new permutation of AABB that satisfies the 4 move 1 pegs.
- For the following moves, if possible, satisfy the previous moves using only 2 pegs, and then fill in the other 2 pegs with a doublet of an unused color (most preferred).
- Alternately, satisfy the previous moves using 3 pegs and fill in the last peg with by duplicating the color of one of those 3 pegs to create a doublet of a color that in previous guesses has only ben used as a singlet. And after the fourth peg is thus placed, the guess still should satisfy all previous guesses (else try a different guess).
- 14 possible peg results: 0b 0w, 1b 0w, 0b 1w, 2b 0w, 1b 1w, 0b 2w, 3b 0w, 2b 1w, 1b 2w, 0b 3w, 4b 0w, 2b 2w, 1b 3w, 0b 4w.
- Note that 3b 1w is impossible.
- pegs[key:code0, key:code1]:[nBlack: number, nWhite: number]. Peg lookup array. code0, code1 are 0..1295 code combos.
- pegs is a symmetric array (pegs[code0, code1] = pegs[code1, code0]).
- codeTree[turnIndex: number, guess: string, pegs[nBlack:number, nWhite:number]]: string[].


## Forked from bobbyroe/Mastermind_demo

Thank you Bobby Roe!

[Bobby Roe's Mastermind Source Code](https://github.com/bobbyroe/Mastermind_demo)

[Play Bobby Roe's Mastermind Demo](http://bobbyroe.github.io/Mastermind_demo/)

[Bobby Roe's slideshare "Backbone.js – an introduction"](https://www.slideshare.net/slideshow/backbonejs-an-introduction-14284042/14284042)

## VS Code launch & dev server

- The VS Code launch configuration included in this repo starts a background task before opening Brave. That task currently uses Python's static server (`python3 -m http.server 8080`) because the system `npm` binary on this machine was failing when invoked from tasks.
- Behavior: the background task waits until the server prints its ready message, then the `Launch in Brave` debug configuration opens `http://127.0.0.1:8080/`.
- To restore an npm-based preLaunchTask (if your `npm` is healthy):
	- edit `.vscode/tasks.json` to run `npm run serve` (label it `npm: serve`), and
	- edit `.vscode/launch.json` to set `preLaunchTask` to `npm: serve`.
- Alternatively, run `npm run serve` manually in a terminal and then use the existing `Launch in Brave` configuration.


