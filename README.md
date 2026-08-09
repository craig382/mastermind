# Mastermind
===============

A web app to play mastermind. Written in Backbone.js.

[Play Craig's Mastermind Game](http://crraig382.github.io/mastermind/)

[Craig's Mastermind Game Source Code](https://github.com/craig382/mastermind)

## Change Log:
1. The player can use future turns as a scratchpad for working out the secret code.
2. Changed the appearance and location of the end game "you won" or "you lost" message. It no longer obscures the player's completed game.
3. Color palette improvements. Moved the current color selected nub into the color palette. And added a "remove color" nub to the color palette. The current color nub now keeps its color until it is changed to a new color which makes placing duplicate colors easier. (The old behavior was that the current color automatically reset to no color after each color placement.) Also, the color palette is now at the bottom of the board (instead of the bottom of the screen).

## Future Changes?:
- Add a timer and show game play time in the "you won" message.
- Add "Stats" to the bottom of the screen showing: reset stats button, number of games played, how many games lost, win percentage, average number of guesses to win a game (excludes lost games), guess distribution, current winning streak, max winning streak, time distribution, average time to win a game (excludes lost games), etc.
- Add settings to the bottom of the screen: number of colors, max number of turns, length of code, repeat colors allowed in secret code, blanks allowed in guess, row hint toggle, color palette hint toggle, etc.
- Add row hint that show number of remaining possible solutions on past turns.
- Add color palette hint that shows number of colors that the secret code contains.
- Add a bot that gives analysis of the top 5 remaining guesses for each turn given the player's turn history up to that point. The bot should also give its solution from the start (if the bot were to play the game by itself, how many moves it required in total and what each of those moves were, and how many possible solutions were left after each of its moves). Of course, the bot is not allowed to know the secret code. It is only allowed to make guesses based on the black and white peg feedback it receives.

## Forked from bobbyroe/Mastermind_demo

Thank you Bobby Roe!

[Bobby Roe's Mastermind Source Code](https://github.com/bobbyroe/Mastermind_demo)

[Play Bobby Roe's Mastermind Demo](http://bobbyroe.github.io/Mastermind_demo/)

[Bobby Roe's slideshare "Backbone.js – an introduction"](https://www.slideshare.net/slideshow/backbonejs-an-introduction-14284042/14284042)


