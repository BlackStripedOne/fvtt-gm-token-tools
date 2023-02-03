![GitHub Latest Version](https://img.shields.io/github/v/release/BlackStripedOne/fvtt-gm-token-tools?sort=semver)
![GitHub Latest Release](https://img.shields.io/github/downloads/BlackStripedOne/fvtt-gm-token-tools/latest/module.zip)
![GitHub All Releases](https://img.shields.io/github/downloads/BlackStripedOne/fvtt-gm-token-tools/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fgm-token-tools)](https://forge-vtt.com/bazaar#package=gm-token-tools)
![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FBlackStripedOne%2Ffvtt-gm-token-tools%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.minimum&colorB=orange)
![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FBlackStripedOne%2Ffvtt-gm-token-tools%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=green)


# Gamemaster Token Tools for DSA5

Gamemaster Token Tools for DSA5, showing infos, actions and call-for-actions on a token HUD.

![Gamemaster Token Tools](./.github/readme/gm-token-tools_overview_de.webm)

# Features
- Have various, configurable actions when clicking:
  - Request a roll from the selected token's player via chat.
  - Request a roll from all players via chat.
  - Open a dialog for configuring options for a given roll request before requesting that roll.
  - Roll the check yourself and display the outcomes to either the token's player or everyone.
- Request rolls for skills, attributes and health related attributes.
- Roll damage for a token or heal in place.
- Select kind of damage:
  - Generic damage.
  - Fall damage
  - Fire- or Acid damage.
  - Frost damage.
  - Heat damage.
- Show a quick overview of walking/dash speed, current XP and armor rating for the gamemaster and/or the token owning players.

# Installation

## Method 1
1. On Foundry VTT's **Configuration and Setup** screen, go to **Add-on Modules**
2. Click **Install Module**
3. Search for **Gamemaster Token Tools for DSA5** 
4. Click **Install** next to the module listing

## Method 2
1. On Foundry VTT's **Configuration and Setup** screen, go to **Add-on Modules**
2. Click **Install Module**
3. In the Manifest URL field, paste: `https://github.com/BlackStripedOne/fvtt-gm-token-tools/releases/latest/download/module.json`
4. Click **Install** next to the pasted Manifest URL

## Required Modules

Currently the tools are independant of other modules. It only requires the game system for **DSA 5th Edition** to be installed.

# Support

For questions, feature requests or bug reports, please open an issue [here](https://github.com/BlackStripedOne/fvtt-gm-token-tools/issues).

Pull requests are welcome. Please include a reason for the request or create an issue before starting one.

# Acknowledgements

Thanks to the Foundry VTT Developers as well as Ulissis to give us such an awesome platform to play our VTT on.

# License

This Foundry VTT module is licensed under a [Creative Commons Attribution Share Alike 4.0 International](https://choosealicense.com/licenses/cc-by-sa-4.0/) and this work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).