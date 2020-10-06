import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/front_large_extended.png";
import resizeIcon from "../../assets/resize.svg";
import { ChromePicker } from "react-color";
import Fonts from "../Fonts";

const MainSecion = () => {
  const [text, setText] = useState("");
  const [texts, setTexts] = useState([]);
  const [color, setColor] = useState("#000");
  const [font, setFont] = useState("Arial");
  const [borderVisible, setBorderVisible] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(null);
  const [currentSelectedText, setCurrentSelectedText] = useState(null);
  const [currentSelectedColor, setCurrentSelectedColor] = useState(null);
  const [currentSelectedFont, setCurrentSelectedFont] = useState(null);

  const canvasRef = useRef();
  let offsetX, offsetY, startX, startY, draggingElement, draggingResizer;

  useEffect(() => {
    let canvas = canvasRef.current;
    const coordinates = canvas.getBoundingClientRect();
    offsetX = coordinates.x;
    offsetY = coordinates.y;

    canvas.onmousedown = canvasMouseDown;
    canvas.onmouseup = canvasMouseUp;
    canvas.onmousemove = canvasMouseMove;
    canvas.onmouseleave = canvasMouseLeave;
  }, []);

  function canvasMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setBorderVisible(true);
    // get the current mouse position
    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);

    let textsObj = texts;
    drawTexts(textsObj);
    clearDragFlags();
    // setCurrentSelected(null);
    // test each text to see if mouse is inside
    for (let i = textsObj.length - 1; i >= 0; i--) {
      let r = textsObj[i];
      if (r.isSelected) {
        console.log("selected");
        if (anchorHitTest(mx, my, r)) {
          console.log(true);
          draggingResizer = true;
          r.isResizing = true;
        }
      }
      if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
        // if yes, set that texts isDragging=true
        draggingElement = true;
        r.isSelected = true;
        r.isDragging = true;
        getValuesOfCurrentSelected(r);
        drawResizeImage(r);
        drawBorderOfSelectedElement(r);
        break;
      }
    }
    setTexts(textsObj);

    // save the current mouse position
    startX = mx;
    startY = my;
  }

  function drawResizeImage(element) {
    let context = canvasRef.current.getContext("2d");
    let image = new Image();
    image.src = resizeIcon;
    context.drawImage(
      image,
      element.x + element.width,
      element.y + element.height
    );
  }

  function canvasMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggingResizer) {
      console.log("dragging resizer");
      let mx = parseInt(e.clientX - offsetX);
      let my = parseInt(e.clientY - offsetY);

      let dx = mx - startX;
      let dy = my - startY;

      let textsObj = texts;
      // move each rect that isDragging
      // by the distance the mouse has moved
      // since the last mousemove
      for (let i = 0; i < textsObj.length; i++) {
        let r = textsObj[i];
        if (
          r.isResizing
          // &&
          // r.x + dx > 0 &&
          // r.y + dy > 0 &&
          // r.x + r.width + dx < canvasRef.current.width &&
          // r.y + r.height + dy < canvasRef.current.height
        ) {
          r.width += dx;
          r.height += dy;
        }
      }
      setTexts(textsObj);

      // redraw the scene with the new rect positions
      drawTexts(textsObj);

      // reset the starting mouse position for the next mousemove
      startX = mx;
      startY = my;
    }
    // if we're dragging anything...
    else if (draggingElement) {
      // get the current mouse position
      let mx = parseInt(e.clientX - offsetX);
      let my = parseInt(e.clientY - offsetY);

      // calculate the distance the mouse has moved
      // since the last mousemove
      let dx = mx - startX;
      let dy = my - startY;

      let textsObj = texts;
      // move each rect that isDragging
      // by the distance the mouse has moved
      // since the last mousemove
      for (let i = 0; i < textsObj.length; i++) {
        let r = textsObj[i];
        if (
          r.isDragging &&
          r.x + dx > 0 &&
          r.y + dy > 0 &&
          r.x + r.width + dx < canvasRef.current.width &&
          r.y + r.height + dy < canvasRef.current.height
        ) {
          r.x += dx;
          r.y += dy;
        }
      }
      setTexts(textsObj);

      // redraw the scene with the new rect positions
      drawTexts(textsObj);

      // reset the starting mouse position for the next mousemove
      startX = mx;
      startY = my;
    }
  }

  function canvasMouseUp(e) {
    setBorderVisible(false);
    e.preventDefault();
    e.stopPropagation();
    clearDragFlags();
  }

  function canvasMouseLeave(e) {
    setBorderVisible(false);
    e.preventDefault();
    e.stopPropagation();
    clearDragFlags();
  }

  function anchorHitTest(mx, my, element) {
    if (
      mx > element.x + element.width &&
      mx < element.x + element.width + 24 &&
      my > element.y + element.height &&
      my < element.y + element.height + 24
    ) {
      console.log(true);
      return true;
    } else {
      console.log(false);

      return false;
    }
  }

  function getValuesOfCurrentSelected(element) {
    setCurrentSelectedText(element.value);
    setCurrentSelectedColor(element.color);
    setCurrentSelectedFont(element.font);
    setCurrentSelected(element);
  }

  function drawBorderOfSelectedElement(element) {
    let context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.rect(element.x, element.y, element.width, element.height);
    context.stroke();
  }

  function addTextToShirt() {
    let context = canvasRef.current.getContext("2d");
    context.font = `40px ${font}`;

    if (text) {
      let textObj = {
        index: texts.length,
        x: 0,
        y: 0,
        width: context.measureText(text).width,
        height: 40,
        isDragging: false,
        isSelected: false,
        isResizing: false,
        value: text,
        color: color,
        font: font,
      };
      setText("");
      let textsTemp = texts;
      textsTemp.push(textObj);
      setTexts(textsTemp);
      drawTexts(textsTemp);
    }
  }

  function drawTexts(textArray) {
    let context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (let i = 0; i < textArray.length; i++) {
      let text = textArray[i];
      context.fillStyle = text.color;
      context.font = `${text.height}px ${text.font}`;
      context.fillText(text.value, text.x, text.height + text.y);
      if (text.isDragging && text.isSelected) {
        context.beginPath();
        context.rect(text.x, text.y, text.width, text.height);
        context.closePath();
        context.stroke();
        // drawAnchorsOfSelectedElement(text);
      }
      if (text.isResizing) {
        drawResizeImage(text);
      }
    }
  }

  function clearDragFlags() {
    draggingElement = false;
    draggingResizer = false;
    let textsObj = texts;
    for (let i = 0; i < textsObj.length; i++) {
      textsObj[i].isDragging = false;
      textsObj[i].isResizing = false;
    }
    setTexts(textsObj);
  }

  function updateText(e) {
    let context = canvasRef.current.getContext("2d");
    setCurrentSelectedText(e.target.value);
    let selected = currentSelected;
    selected.value = e.target.value;
    selected.width = context.measureText(e.target.value).width;

    let updated = texts;
    updated[selected.index] = selected;

    drawTexts(updated);
    setTexts(updated);
  }

  function updateColor(color) {
    setCurrentSelectedColor(color.hex);

    let selectedText = currentSelected;
    selectedText.color = color.hex;

    let updated = texts;
    updated[selectedText.index] = selectedText;

    drawTexts(updated);
    setTexts(updated);
  }

  function updateFont(font) {
    setCurrentSelectedFont(font);

    let selectedText = currentSelected;
    selectedText.font = font;

    let updated = texts;
    updated[selectedText.index] = selectedText;

    drawTexts(updated);
    setTexts(updated);
  }

  function deleteCurrentSelected() {
    let textsObj = texts;
    textsObj.splice(currentSelected.index, 1);
    drawTexts(textsObj);
    setTexts(textsObj);
    setCurrentSelected(null);
  }

  return (
    <div className="main-container">
      <div className="app-menu">
        {currentSelected ? (
          <div>
            <p>Edit text</p>
            <input
              type="text"
              placeholder="Enter text here..."
              value={currentSelectedText}
              onChange={updateText}
            ></input>
            <div className="fonts-dropdwon-wrap">
              <Fonts font={currentSelectedFont} selectFont={updateFont} />
            </div>
            <div className="color-picker">
              <p>Update Color</p>
              <ChromePicker
                color={currentSelectedColor}
                onChange={updateColor}
              />
            </div>
            <button
              style={{ backgroundColor: "#ff0000" }}
              onClick={deleteCurrentSelected}
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                let textsObj = texts;
                textsObj[currentSelected.index].isSelected = false;
                setTexts(textsObj);
                setCurrentSelected(null);
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <p>Add text</p>
            <input
              type="text"
              placeholder="Enter text here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            ></input>
            <div className="fonts-dropdwon-wrap">
              <Fonts font={font} selectFont={setFont} />
            </div>
            <div className="color-picker">
              <p>Choose Color</p>
              <ChromePicker
                color={color}
                onChange={(color) => {
                  setColor(color.hex);
                }}
              />
            </div>
            <button onClick={addTextToShirt}>Add</button>
          </>
        )}
      </div>
      <div className="canvas-container">
        <img className="product-photo" src={img} alt="" />
        <canvas
          ref={canvasRef}
          id="shirt"
          height="380"
          width="200"
          className={`${borderVisible ? "border" : "invisible-border"}`}
        ></canvas>
      </div>
    </div>
  );
};

export default MainSecion;
