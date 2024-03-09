/* eslint-disable no-unused-vars */
import React from "react";

const Timer = ({ counter, setCounter, attackSent, handleCellClick }) => {
  React.useEffect(() => {
    let timeoutId;

    if (counter > 0 && !attackSent) {
      timeoutId = setTimeout(() => setCounter(counter-1), 1000);
    }
    if (counter === 0) {
      handleCellClick("0")
    }

    return () => clearTimeout(timeoutId);
  }, [counter, attackSent]);

  return <div>Countdown: {counter}</div>;
};

export default Timer;
