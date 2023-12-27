const setAttributes = (element, object) => {
  for (const [key, value] of Object.entries(object)) {
    element.setAttribute(key, value);
  }
};
const drawPalette = async (colors) => {
  pickedColor = colors[0];
  const palette = document.querySelector("#palette");
  const fragment = document.createDocumentFragment();
@@ -49,8 +48,18 @@ const hardcodedColors = [
];

let pickedColor = null;
const ACTIONS = {
  getColors: drawPalette,
}
  document.addEventListener('websocket.connection', e => {
  const ws = e.detail;
  ws.send(JSON.stringify({type: 'getColors'}));
  ws.onmessage = e => {
  const { type, payload } = JSON.parse(e.data);
  if (type && type in ACTIONS) ACTIONS[type](payload);
}
});

const picker = {
  get color() {
    return pickedColor;
  }
};
export default picker;
