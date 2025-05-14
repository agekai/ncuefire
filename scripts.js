const totalScenes = 10;
let currentScene = 1;

const frame = document.getElementById("sceneFrame");
document.getElementById("prev").onclick = () => {
  currentScene = (currentScene - 1) < 1 ? totalScenes : currentScene - 1;
  frame.src = `scenes/scene${currentScene}/index.html`;
};

document.getElementById("next").onclick = () => {
  currentScene = (currentScene + 1) > totalScenes ? 1 : currentScene + 1;
  frame.src = `scenes/scene${currentScene}/index.html`;
};
