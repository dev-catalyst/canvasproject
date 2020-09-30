import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/front_large_extended.png";

const MainSecion = () => {
  const [text, setText] = useState("");
  const [texts, setTexts] = useState([]);
  const [borderVisible, setBorderVisible] = useState(false);

  const canvasRef = useRef();
  let offsetX, offsetY, startX, startY, dragok;

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
    setBorderVisible(true);
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    let mx = parseInt(e.clientX - offsetX);
    let my = parseInt(e.clientY - offsetY);

    // test each text to see if mouse is inside
    dragok = false;
    let textsObj = texts;
    for (let i = 0; i < textsObj.length; i++) {
      let r = textsObj[i];
      if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
        // if yes, set that texts isDragging=true

        dragok = true;
        r.isDragging = true;
      }
    }
    // save the current mouse position
    startX = mx;
    startY = my;
  }

  function canvasMouseMove(e) {
    // if we're dragging anything...
    if (dragok) {
      e.preventDefault();
      e.stopPropagation();

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

  function addTextToShirt() {
    let context = canvasRef.current.getContext("2d");
    if (text) {
      context.font = "40px 'Comic Sans MS'";
      let textObj = {
        x: 0,
        y: 0,
        width: context.measureText(text).width,
        height: 40,
        isDragging: false,
        value: text,
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
      context.fillText(text.value, text.x, text.height + text.y);
    }
  }

  function clearDragFlags() {
    dragok = false;
    let textsObj = texts;
    for (let i = 0; i < textsObj.length; i++) {
      textsObj[i].isDragging = false;
    }
    setTexts(textsObj);
  }

  return (
    <div className="main-container">
      <div className="app-menu">
        <p>Add text</p>
        <input
          type="text"
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        ></input>
        <button onClick={addTextToShirt}>Add</button>
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
