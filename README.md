# El Pollo Loco

El Pollo Loco is a browser-based JavaScript game. The player controls a character, moves through a small side-scrolling game world, avoids or fights enemies, collects items, and faces an endboss.

## Live Demo

[elpolloloco.saschaheinze.de](https://elpolloloco.saschaheinze.de/)

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Canvas API
- Object-oriented JavaScript
- Browser audio via `HTMLAudioElement`
- Browser storage via `localStorage`

## Features

- Canvas-based game rendering
- Object-oriented JavaScript structure with separate classes for the world, character, enemies, rendering, throwing, collisions, and HUD elements
- Side-scrolling level with layered background, foreground, decorative objects, clouds, and birds
- Character movement, jumping, idle, hurt, and death animations
- Enemy movement with chickens and chicks
- Endboss fight with health bar, attack behavior, and spawned chicks
- Collision detection for enemies, pickups, throwable bottles, and boss interactions
- Collectable coins and bottles
- Throwable bottle objects
- Player health bar, bottle bar, coin counter, and boss health bar
- Keyboard controls
- Touch controls for movement, jumping, and throwing on supported devices
- Start screen, settings overlay, win screen, and game over screen
- Sound effects, background music, mute option, and volume control

## Controls

### Keyboard

- Move left: `Arrow Left` or `A`
- Move right: `Arrow Right` or `D`
- Jump: `Arrow Up` or `W`
- Throw bottle: `Space`
- Close settings overlay: `Escape`

### Touch

On touch devices in landscape orientation, on-screen buttons are available for:

- Move left
- Move right
- Jump
- Throw bottle

## Local Setup

This is a static frontend project. It does not require a build step or package manager scripts.

To run it locally, serve the project folder with a local static server, for example the Visual Studio Code Live Server extension, and open `index.html` in the browser through that server.

## Project Status

El Pollo Loco is a portfolio project and may be improved further over time.
