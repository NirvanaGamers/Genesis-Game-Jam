/* eslint-disable no-unused-vars */
import React from "react";

const Timer = ({ turn, setTurn }) => {
  React.useEffect(() => {
    let timeoutId;

    if (turn.counter > 0 && !turn.attack_sent) {
      timeoutId = setTimeout(() => setTurn({...turn, counter: turn.counter - 1}), 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [turn.counter, turn.attack_sent]);

  return <div>Countdown: {turn.counter}</div>;
};

export default Timer;
