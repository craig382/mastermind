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
5. Created an appLog at the bottom of the screen for keeping game history and for debugging messages, etc.

## Future Changes?:
- allCodes[0..1295] array with all possible 1296 combos.
- validCodeCount[turn 0 .. turn 9].
- let iMax = (iTurn === 0 ? allCodes.length : validCodeCount[iTurn - 1]) - 1;
- Guess Suggestion Mode automatically fills in a guess suggestion for the active turn (suggestion of ABBC for turn 0 or allCodes[0] for any other turn). The user then gets to accept or modify the suggestion before hitting the GUESS button.
- Add a timer and show game play time in the "you won" message.
- Add "Stats" to the bottom of the screen showing: reset stats button, number of games played, how many games lost, win percentage, average number of guesses to win a game (excludes lost games), guess distribution, current winning streak, max winning streak, time distribution, average time to win a game (excludes lost games), etc.
- Add settings to the bottom of the screen: number of colors, max number of turns, length of code, repeat colors allowed in secret code, blanks allowed in guess, row hint toggle, color palette hint toggle, etc.
- Add row hint that show number of remaining possible solutions on past turns.
- Add color palette hint that shows number of colors that the secret code contains.
- Add a bot that gives analysis of the top 5 remaining guesses for each turn given the player's turn history up to that point. The bot should also give its solution from the start (if the bot were to play the game by itself, how many moves it required in total and what each of those moves were, and how many possible solutions were left after each of its moves). Of course, the bot is not allowed to know the secret code. It is only allowed to make guesses based on the black and white peg feedback it receives.
- Add row hints on frozen rows that every time you change the code on the active row, it shows the black and white peg results vs the active code (only when each differs from the true black and white peg (vs the secret code) row hint).

## Craig's Mastermind Strategy
(For 6 colors, duplicates allowed, code length 4, blanks not allowed.)
Move 1. AABB.
Depending on the number of pegs found in move 1:
Move 2. DCCE for 0 or 3 pegs.
Move 2. ACCD for 1 black peg, DCCA for 1 white peg.
Move 2. ACCB for 2 black pegs, BCCA for 2 white pegs, ABCC for 1 black 1 white peg.
Move 2. For 4 move 1 pegs, a new permutation of AABB that satisfies the 4 move 1 pegs.
For the following moves, if possible, satisfy the previous moves using only 2 pegs, and then fill in the other 2 pegs with a doublet of an unused color (most preferred).
Alternately, satisfy the previous moves using 3 pegs and fill in the last peg with by duplicating the color of one of those 3 pegs to create a doublet of a color that in previous guesses has only ben used as a singlet. And after the fourth peg is thus placed, the guess still should satisfy all previous guesses (else try a different guess).

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


