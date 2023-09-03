# Auto Balls Modded v2
## Requirements
1. Install Git
2. Install NodeJS and npm (latest versions)
3. Install Typescript (5.2.2 or later)
4. Install Visual Studio Code (optional but helpful)

## Development
### Setup
1. Clone or download this repository to your local machine
2. Open the root folder (containing `src`, `def`, etc.) in Visual Studio Code or another editor

### Modify Source Code
- `lectvs`: folder containing source code for the base engine
- `src`: folder containing source code for the game
- `bin`: folder containing compiled game code, libraries, and assets
	- `bin/assets`: folder containing all game assets (art, sounds, etc.)

#### VS Code Notes
VS Code is the recommended way to edit this source code. Simply open the root folder (containing `src`, `def`, etc.) in VS Code and enjoy Typescript definitions, auto-complete, etc. :)
- In VS Code, press `CTRL-SHIFT-B` to either build the code or start a watch daemon

### Build
Run `tsc -w` to start a Typescript watch daemon. This will build the whole game whenever it detects a file change. Specifically, it compiles all Typescript code to create `bin/js/game.js`.

### Run
In order to run the game in browser, you will need to start up a web server. This can be accomplished many ways, I recommend using [Mongoose](https://mongoose.ws/binary/) as it's lightweight and does not require configuration.
1. Start a web server in the root directory (containing `src`, `bin`, etc.).
	- If using Mongoose, you can copy the .exe into the root folder and then run it.
2. Visit `http://localhost:[PORT]/bin/` in your web browser, where PORT is the port you started your web server with.

### Build V1 Mod
Run the script `node build_v1_mod.js` to create a ZIP file you can send to others. They can upload the ZIP using the client at https://autoballs.lectvs.net/modded/ and play your mod!

## Can I use your code/assets in my game?
Sure! You can use any of my code from the `lectvs` or `src` folders, and any **ART** assets. Unfortunately, as I don't own all of the sound assets used in this game, I don't have the authority to let you use them in your own game. If you make a game using my stuff, do let me know on Twitter (@lectvs), as I would love to play it! :)

Source code is provided under the MIT License, while **ART** assets are provided under CC0-1.0. For more information, see LICENSE files in each of `lectvs`, `src`, and `bin/assets` folders.