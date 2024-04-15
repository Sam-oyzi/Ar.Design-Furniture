let modelViewer;
let assetListContainer;
let assetListHeader;
let assetList;
let assets = [];
let sliderVisible = !1;
let lastClickedAsset = null;
async function fetchAssetsList(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch assets list");
    }
    assets = await response.json();
    const categories = [...new Set(assets.map((asset) => asset.category))];
    return { categories, assets };
  } catch (error) {
    console.error(error);
    return { categories: [], assets: [] };
  }
}
async function generateAssetListAndButtons() {
  const { categories } = await fetchAssetsList("Assets.json");
  assetList.innerHTML = "";
  const container = document.getElementById("slidesContainer");
  container.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category;
    button.onclick = () => {
      switchCategory(category);
      showSlider();
    };
    assetList.appendChild(button);
  });
  preloadModels();
}
function preloadModels() {
  assets.forEach((asset) => {
    const modelBaseURL = `Assets/`;
    const model = new Image();
    model.src = `${modelBaseURL}${asset.name}.glb`;
  });
}
function showSlider() {
  sliderVisible = !0;
  const slider = document.querySelector(".slider");
  slider.style.display = "block";
  adjustARButtonPosition();
  const arButton = document.getElementById("ar-button");
  if (sliderVisible) {
    arButton.style.display = "none";
  } else {
    arButton.style.display = "inline-block";
  }
}
function switchCategory(category) {
  const filteredAssets = assets.filter((asset) => asset.category === category);
  const container = document.getElementById("slidesContainer");
  container.innerHTML = "";
  filteredAssets.forEach((asset) => {
    const slideButton = document.createElement("button");
    slideButton.className = "slide";
    slideButton.onclick = () => switchSrc(slideButton, asset.name);
    slideButton.setAttribute("data-asset", asset.name);
    const modelBaseURL = `Assets/`;
    slideButton.style.backgroundImage = `url('${modelBaseURL}${asset.name}.webp')`;
    container.appendChild(slideButton);
  });
  adjustModelViewerPosition();
}
function switchSrc(element, filename) {
  if (lastClickedAsset === filename) {
    sliderVisible = !sliderVisible;
    const slider = document.querySelector(".slider");
    slider.style.display = sliderVisible ? "block" : "none";
  } else {
    const modelBaseURL = `Assets/`;
    modelViewer.src =
      `${modelBaseURL}${filename}.glb?v=` + new Date().getTime();
    modelViewer.poster =
      `${modelBaseURL}${filename}.webp?v=` + new Date().getTime();
    sliderVisible = !0;
    const slider = document.querySelector(".slider");
    slider.style.display = "block";
  }
  lastClickedAsset = filename;
  document.querySelectorAll(".slide").forEach((slide) => {
    slide.classList.remove("selected");
  });
  if (element) {
    element.classList.add("selected");
  }
  adjustModelViewerPosition();
  modelViewer.scrollIntoView({ behavior: "smooth" });
}
function lazyLoadAssets(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      modelViewer.src = modelViewer.dataset.src;
      modelViewer.poster = modelViewer.dataset.poster;
      observer.unobserve(modelViewer);
    }
  });
}
function adjustModelViewerPosition() {
  const modelViewerBottom = modelViewer.getBoundingClientRect().bottom;
  const sliderBottom = document
    .querySelector(".slider")
    .getBoundingClientRect().bottom;
  const overlapHeight = Math.max(0, sliderBottom - modelViewerBottom);
  modelViewer.style.marginTop = `-${overlapHeight}px`;
}
function adjustARButtonPosition() {
  const arButton = document.getElementById("ar-button");
  const toggleSliderButton = document.querySelector(".toggle-slider-button");
  if (toggleSliderButton && arButton) {
    const toggleSliderButtonRect = toggleSliderButton.getBoundingClientRect();
    const arButtonTop = toggleSliderButtonRect.top - 50;
    arButton.style.top = `${arButtonTop}px`;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  modelViewer = document.querySelector("#modelViewer");
  assetListContainer = document.querySelector(".asset-list-container");
  assetListHeader = document.querySelector(".asset-list-container h3");
  assetList = document.querySelector(".asset-list");
  const placeholder = document.querySelector(".model-placeholder");
  placeholder.style.display = "none";
  modelViewer.style.display = "block";
  const arButton = document.getElementById("ar-button");
  arButton.style.display = "inline-block";
  generateAssetListAndButtons();
  assetListHeader.addEventListener("click", function () {
    assetList.classList.toggle("hidden");
    assetListHeader.classList.toggle("active");
  });
  const toggleSliderButton = document.createElement("button");
  toggleSliderButton.classList.add("toggle-slider-button");
  toggleSliderButton.innerHTML = `<img src="https://cdn.glitch.global/f2692db9-36b1-4d00-9d2d-3e0a86952614/Slide-up-button.svg?v=1712776488849" alt="Toggle Slider">`;
  toggleSliderButton.onclick = toggleSliderVisibility;
  document.body.appendChild(toggleSliderButton);
  adjustModelViewerPosition();
});
function toggleSliderVisibility() {
  sliderVisible = !sliderVisible;
  const slider = document.querySelector(".slider");
  slider.style.display = sliderVisible ? "block" : "none";
  adjustARButtonPosition();
  const arButton = document.getElementById("ar-button");
  if (sliderVisible) {
    arButton.style.display = "none";
  } else {
    arButton.style.display = "inline-block";
  }
}
