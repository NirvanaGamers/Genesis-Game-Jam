/* eslint-disable no-unused-vars */
import React from "react";

const Timer = ({ counter, setCounter, attackSent }) => {
  React.useEffect(() => {
    let timeoutId;

    if (counter > 0 && !attackSent) {
      timeoutId = setTimeout(() => setCounter(counter-1), 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [counter, attackSent]);

  return <div>Countdown: {counter}</div>;
};

export default Timer;
