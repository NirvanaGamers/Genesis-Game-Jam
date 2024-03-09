import "./Difficulty.css";

function Difficulty(props) {
  return (
    <div className="container">
      <h1>Choose Your Standard</h1>
      <div className="standards">
        <button className="group-1">1-4</button>
        <button className="group-2">5-7</button>
        <button className="group-3">8-10</button>
      </div>
    </div>
  );
}

export default Difficulty;
