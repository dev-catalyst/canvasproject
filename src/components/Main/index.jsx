import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/front_large_extended.png";
import resizeIcon from "../../assets/resize.svg";
import { ChromePicker } from "react-color";
import Fonts from "../Fonts";
import EmojiPicker from "emoji-picker-react";

const MainSection = () => {
  const [text, setText] = useState("");
  const [elements, setElements] = useState([]);
  const [color, setColor] = useState("#000");
  const [font, setFont] = useState("Arial");
  const [borderVisible, setBorderVisible] = useState(false);
  const [currentSelected, setCurrentSelected] = useState(null);
  const [currentSelectedText, setCurrentSelectedText] = useState(null);
  const [currentSelectedColor, setCurrentSelectedColor] = useState(null);
  const [currentSelectedFont, setCurrentSelectedFont] = useState(null);
  const [currentSelectedRotate, setCurrentSelectedRotate] = useState(0);

  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [picture, setPicture] = useState(null);

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

  // ***************************** MOUSE DOWN *********************************//
  function canvasMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setBorderVisible(true);
    // get the current mouse position
    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);
    let currentSelectedIndex = -1;
    let elementsObj = elements;
    drawElements(elementsObj);
    clearDragFlags();
    setCurrentSelected(null);
    // test each text to see if mouse is inside
    for (let i = elementsObj.length - 1; i >= 0; i--) {
      let r = elementsObj[i];
      if (r.isSelected) {
        if (anchorHitTest(mx, my, r)) {
          draggingResizer = true;
          r.isResizing = true;
          break;
        }
      }
      if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
        // if yes, set that element isDragging=true
        currentSelectedIndex = i;
        draggingElement = true;
        r.index = i;
        r.isSelected = true;
        r.isDragging = true;
        getValuesOfCurrentSelected(r);
        drawResizeImage(r);
        drawBorderOfSelectedElement(r);
        break;
      }
    }
    if (currentSelectedIndex > -1)
      for (let i = 0; i < elementsObj.length; i++) {
        if (i !== currentSelectedIndex) {
          elementsObj[i].isSelected = false;
        }
      }
    setElements(elementsObj);

    // save the current mouse position
    startX = mx;
    startY = my;
  }

  // ***************************** MOUSEMOVE *********************************//
  function canvasMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggingResizer) {
      let mx = parseInt(e.clientX - offsetX);
      let my = parseInt(e.clientY - offsetY);

      let dx = mx - startX;
      let dy = my - startY;

      let elementsObj = elements;
      let context = canvasRef.current.getContext("2d");
      for (let i = 0; i < elementsObj.length; i++) {
        let r = elementsObj[i];
        if (
          r.isResizing &&
          r.height + dy > 10
          // &&
          // r.x + r.width + dx + 24 < canvasRef.current.width &&
          // r.y + r.height + dy + 24 < canvasRef.current.height
        ) {
          if (r.type === "picture") {
            r.height += dy;
            r.width += dx;
          } else {
            let ratio = (r.height + dy) / r.height;
            r.height += dy;
            r.width *= ratio;
            // r.width = context.measureText(r.value).width;
          }
        }
      }
      setElements(elementsObj);

      // redraw the scene with the new rect positions
      drawElements(elementsObj);

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

      let elementsObj = elements;
      // move each rect that isDragging
      // by the distance the mouse has moved
      // since the last mousemove
      for (let i = 0; i < elementsObj.length; i++) {
        let r = elementsObj[i];
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
      setElements(elementsObj);

      // redraw the scene with the new rect positions
      drawElements(elementsObj);

      // reset the starting mouse position for the next mousemove
      startX = mx;
      startY = my;
    }
  }

  // ***************************** MOUSEUP *********************************//
  function canvasMouseUp(e) {
    setBorderVisible(false);
    e.preventDefault();
    e.stopPropagation();
    clearDragFlags();
  }

  // ***************************** MOUSELEAVE *********************************//
  function canvasMouseLeave(e) {
    setBorderVisible(false);
    e.preventDefault();
    e.stopPropagation();
    clearDragFlags();
  }

  // ***************************** EMOJIS *********************************//
  useEffect(() => {
    if (chosenEmoji) {
      addTextToShirt("emoji");
    }
  }, [chosenEmoji]);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };

  // ***************************** PICTURE *********************************//
  useEffect(() => {
    if (picture) {
      addTextToShirt("picture");
    }
  }, [picture]);

  function drawPicture(imageSrc) {
    // let ctx = canvasRef.current.getContext("2d");
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.onload = function () {
        let ratio = 80 / this.width;
        this.width = 80;
        this.height = this.height * ratio;
        let imgObj = {
          src: this.src,
          height: this.height,
          width: this.width,
        };
        setPicture(imgObj);
        // console.log(imgObj);
        // ctx.drawImage(img, 0, 0, this.width, this.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageSrc);
  }

  function picUploadHandler(e) {
    e.preventDefault();
    if (e.target.files[0] !== "") {
      drawPicture(e.target.files[0]);
    }
  }

  // ***************************** FUNCTIONS *********************************//
  //****** to draw resize icon *************//
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

  //****** to check if mouse clicked on resize icon *************//
  function anchorHitTest(mx, my, element) {
    if (
      mx > element.x + element.width &&
      mx < element.x + element.width + 24 &&
      my > element.y + element.height &&
      my < element.y + element.height + 24
    ) {
      return true;
    } else {
      return false;
    }
  }

  //****** to set values of current selected text for editing *************//
  function getValuesOfCurrentSelected(element) {
    setCurrentSelectedText(element.value);
    setCurrentSelectedColor(element.color);
    setCurrentSelectedFont(element.font);
    setCurrentSelected(element);
  }
  //****** to draw border of selected element *************//
  function drawBorderOfSelectedElement(element) {
    let context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.rect(element.x, element.y, element.width, element.height);
    context.stroke();
  }

  //****** to add element to shirt *************//
  function addTextToShirt(type) {
    let context = canvasRef.current.getContext("2d");
    let elementObj;
    if (type === "text") {
      context.font = `40px ${font}`;
      if (text) {
        elementObj = {
          // index: elements.length,
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
          rotationAngle: 0,
          type: "text",
        };
        setText("");
      }
    } else if (type === "emoji") {
      // context.font = `40px Arial`;
      elementObj = {
        // index: elements.length,
        x: 0,
        y: 0,
        height: 40,
        width: 40,
        isDragging: false,
        isSelected: false,
        isResizing: false,
        value: chosenEmoji.emoji,
        rotationAngle: 0,
        type: "emoji",
      };
    } else if (type === "picture") {
      elementObj = {
        // index: elements.length,
        x: 0,
        y: 0,
        height: picture.height,
        width: picture.width,
        isDragging: false,
        isSelected: false,
        isResizing: false,
        value: picture.src,
        rotationAngle: 0,
        type: "picture",
      };
    }
    let elementsTemp = elements;
    elementsTemp.push(elementObj);
    setElements(elementsTemp);
    drawElements(elementsTemp);
  }

  //****** to draw elements on shirt *************//
  function drawElements(textArray) {
    let context = canvasRef.current.getContext("2d");

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (let i = 0; i < textArray.length; i++) {
      let text = textArray[i];
      if (text.type === "text") {
        context.fillStyle = text.color;
        context.font = `${text.height}px ${text.font}`;
        context.fillText(text.value, text.x, text.height + text.y);
      } else if (text.type === "emoji") {
        context.font = `${text.height}px Arial`;
        context.fillText(text.value, text.x, text.height + text.y);
      } else if (text.type === "picture") {
        let image = new Image();
        image.src = text.value;
        context.drawImage(image, text.x, text.y, text.width, text.height);
      }
      if (text.isDragging && text.isSelected) {
        context.beginPath();
        context.rect(text.x, text.y, text.width, text.height);
        context.closePath();
        context.stroke();
      }
      if (text.isResizing) {
        drawResizeImage(text);
      }
    }
  }

  //****** to rotate element (not finished)*************//
  function drawRotated(textArray) {
    let context = canvasRef.current.getContext("2d");

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for (let i = 0; i < textArray.length; i++) {
      let text = textArray[i];

      context.fillStyle = text.color;
      context.font = `${text.height}px ${text.font}`;
      context.save();
      context.translate((text.x + text.width) / 2, (text.y + text.height) / 2);
      context.rotate((text.rotationAngle * Math.PI) / 180);
      if (text.type === "text" || text.type === "emoji") {
        // context.translate(-text.width / 2, -text.height / 2);
        context.fillText(text.value, -text.width / 2, -text.height / 2);
      }
      if (text.type === "picture") {
        let image = new Image();
        image.src = text.value;
        context.drawImage(
          image,
          -text.width / 2,
          -text.height / 2,
          text.width,
          text.height
        );
      }
      context.restore();

      if (text.isDragging && text.isSelected) {
        context.beginPath();
        context.rect(text.x, text.y, text.width, text.height);
        context.closePath();
        context.stroke();
      }
      if (text.isResizing) {
        drawResizeImage(text);
      }
    }
  }

  //****** to clear the checks that element is dragging *************//
  function clearDragFlags() {
    draggingElement = false;
    draggingResizer = false;
    let elementsObj = elements;
    for (let i = 0; i < elementsObj.length; i++) {
      elementsObj[i].isDragging = false;
      elementsObj[i].isResizing = false;
    }
    setElements(elementsObj);
  }

  //***********************************UPDATE Text and its style*************************/
  function updateText(e) {
    let context = canvasRef.current.getContext("2d");
    setCurrentSelectedText(e.target.value);
    let selected = currentSelected;
    selected.value = e.target.value;
    selected.width = context.measureText(e.target.value).width;

    let updated = elements;
    updated[selected.index] = selected;

    drawElements(updated);
    setElements(updated);
  }

  function updateColor(color) {
    setCurrentSelectedColor(color.hex);

    let selectedText = currentSelected;
    selectedText.color = color.hex;

    let updated = elements;
    updated[selectedText.index] = selectedText;

    drawElements(updated);
    setElements(updated);
  }

  function updateFont(font) {
    setCurrentSelectedFont(font);

    let selectedText = currentSelected;
    selectedText.font = font;

    let updated = elements;
    updated[selectedText.index] = selectedText;

    drawElements(updated);
    setElements(updated);
  }

  function updateRotationAngle() {
    let selectedText = currentSelected;
    selectedText.rotationAngle = currentSelectedRotate;

    let updated = elements;
    updated[selectedText.index] = selectedText;

    drawRotated(updated);
    setElements(updated);
  }

  function deleteCurrentSelected() {
    let elementObj = elements;
    elementObj.splice(currentSelected.index, 1);
    drawElements(elementObj);
    setElements(elementObj);
    setCurrentSelected(null);
  }

  //***************************************USER INTERFACE*************************/

  return (
    <div className="main-container">
      <div className="app-menu">
        <div className="text-enter">
          {currentSelected ? (
            currentSelected.type === "text" ? (
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
                <div className="rotation-wrap">
                  <p>Rotation</p>
                  <div className="rotation">
                    <input
                      type="range"
                      id="rotate"
                      min="-180"
                      max="180"
                      value={currentSelectedRotate}
                      onChange={(e) => {
                        setCurrentSelectedRotate(e.target.value);
                        updateRotationAngle();
                      }}
                    />
                    <span>{currentSelectedRotate}</span>
                  </div>
                </div>
                <button
                  style={{ backgroundColor: "#ff0000", marginRight: "20px" }}
                  onClick={deleteCurrentSelected}
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    let elementObj = elements;
                    elementObj[currentSelected.index].isSelected = false;
                    setElements(elementObj);
                    setCurrentSelected(null);
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="rotation-wrap">
                  <p>Rotation</p>
                  <div className="rotation">
                    <input
                      type="range"
                      id="rotate"
                      min="-180"
                      max="180"
                      value={currentSelectedRotate}
                      onChange={(e) => {
                        setCurrentSelectedRotate(e.target.value);
                        updateRotationAngle();
                      }}
                    />
                    <span>{currentSelectedRotate}</span>
                  </div>
                </div>
                <button
                  style={{ backgroundColor: "#ff0000", marginRight: "20px" }}
                  onClick={deleteCurrentSelected}
                >
                  Delete
                </button>
              </>
            )
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
              <button
                onClick={() => {
                  addTextToShirt("text");
                }}
              >
                Add
              </button>
            </>
          )}
        </div>

        <div className="section-wrap">
          <div className="emoji-wrap">
            <p>Add emoji</p>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              disableAutoFocus={true}
              groupNames={{ smileys_people: "PEOPLE" }}
            />
          </div>
          <div className="image-upload">
            <p>Upload an image</p>
            <input
              type="file"
              id="picture"
              accept="image/*"
              className="input"
              onChange={(e) => picUploadHandler(e)}
              aria-label="File browser"
              hidden
            />
            <button
              className="button"
              onClick={(e) => {
                document.getElementById("picture").click();
              }}
            >
              Upload
            </button>
          </div>
        </div>
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

export default MainSection;
