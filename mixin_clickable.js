/*
i never thought id say this but i miss java. what the fuck is a mixin. im going back to inheritance 
*/

interface ClickableState {
  onClickHandler?: (obj: any) => void;
}

function Clickable<T extends Phaser.GameObjects.GameObject>(
  obj: T,
  onClick?: (obj: T) => void
): T & ClickableState {
  const state: ClickableState = {};

  obj.setInteractive();

  const internalHandler = () => {
    if (state.onClickHandler) {
      state.onClickHandler(obj);
    }
  };

  obj.on("pointerdown", internalHandler);

  if (onClick) {
    state.onClickHandler = onClick;
  }

  return Object.assign(obj, state);
}


