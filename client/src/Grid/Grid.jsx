/* eslint-disable no-unused-vars */
import React from "react";
import "./Grid.css";

const Grid = (props) => {
  const cells = [];
  for (let i = 0; i < 3; i++) {
    const jlimit = props.data.length / 3
    for (let j = 0; j < jlimit; j++) {
      cells.push(
        <div
          id={"cell" + (i + j * 3)}
          key={i + j * 3}
          className="cell"
          onClick={() => {
            props.onCellClick(props.data[i + j * 3]);
          }}
        >
          {props.data[i + j * 3]}
        </div>
      );
    }
  }

  return <div className="grid">{cells}</div>;
};

export default Grid;
