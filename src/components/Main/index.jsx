import React, { useEffect, useRef, useState } from "react";
import img from "../../assets/front_large_extended.png";
import Text from "./Text";

const MainSecion = () => {
  const [text, setText] = useState();
  const canvasRef = useRef();

  function addTextToShirt() {
    let canvas = canvasRef.current;
    let context = canvas.getContext("2d");
    context.font = "20px Arial";
    context.fillText(text, 0, 20);
    context.fill();
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
        <canvas ref={canvasRef} id="shirt" height="380" width="200"></canvas>
      </div>
    </div>
  );
};

export default MainSecion;
