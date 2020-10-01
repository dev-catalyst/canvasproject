import React from "react";
import data from "./Data";

const Fonts = (props) => {
  return (
    <div className="select-font">
      <p>Choose font:</p>
      <select
        id="font"
        value={props.font}
        onChange={(e) => {
          props.selectFont(e.target.value);
        }}
      >
        {data.fonts.map((font) => {
          return (
            <option
              value={font.value}
              key={font.className}
              className={`${font.className} medium-font`}
            >
              {font.value}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Fonts;
