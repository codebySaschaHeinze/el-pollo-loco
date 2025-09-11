/**
 * Simple input state container for keyboard controls.
 * Each property is a boolean flag indicating whether the key is currently pressed.
 * @class
 */
class Keyboard {
  /** Whether the left movement key is pressed. @type {boolean} */
  LEFT = false;

  /** Whether the right movement key is pressed. @type {boolean} */
  RIGHT = false;

  /** Whether the up/jump key is pressed. @type {boolean} */
  UP = false;

  /** Whether the down/crouch key is pressed. @type {boolean} */
  DOWN = false;

  /** Whether the action/space key is pressed. @type {boolean} */
  SPACE = false;
}
