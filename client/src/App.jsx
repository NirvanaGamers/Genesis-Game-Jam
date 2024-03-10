import React, { useState } from "react";
import { round, evaluate } from "mathjs";
import Swal from "sweetalert2";
import io from "socket.io-client";
import "./App.css";
import Grid from "./Grid/Grid";
import Timer from "./Timer/Timer";
import Move from "./Move/Move";
import MoveSummary from "./Summary/MoveSummary";
import Demo from "./Demo/Demo";
import Instructions from "./Demo/Instructions";
const App = () => {
  const idleSprite = "../src/assets/Character/Archer/Idle.png";
  const attackSprite = "../src/assets/Character/Archer/Shot_1.png";

  const [player, updatePlayer] = useState({
    name: "",
    damage: null,
    health: 100,
    sprite: idleSprite,
    ready: false,
  });
  const [opponent, updateOpponent] = useState({
    name: null,
    damage: null,
    health: 100,
    sprite: idleSprite,
    ready: false,
  });

  const [counter, setCounter] = useState(15);

  const [attackSent, setAttackSent] = useState(false);
  const [attackReceived, setAttackReceived] = useState(false);

  const [showAnimation, setShowAnimation] = useState(false);
  const [showResult, setShowResult] = useState(true);

  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);

  const [isPlayer1, setIsPlayer1] = useState(false);
  const [equations, setEquations] = useState(false);

  const [difficulty, setDifficulty] = useState(null);

  const [history, updateHistory] = useState({ player: [], opponent: [] });
  const [currentRound, updateRound] = useState(0);

  const [isDemo, setIsDemo] = useState(false);

  const handleDemo = () => {
    console.log("Demo");
    setIsDemo(true);
  };

  const handleCellClick = (value) => {
    if (attackSent) {
      return;
    }
    const time = counter;
    console.log(`Clicked cell value: ${value}`);
    const result = round(evaluate(value.replace("x", time)));
    socket?.emit("attack", {
      time: time,
      equation: value,
      damage: result,
      round: currentRound,
    });
    updatePlayer({
      ...player,
      damage: result,
    });
    history.player[currentRound] = {
      time: time,
      equation: value,
      damage: result,
    };
    setAttackSent(true);
  };

  React.useEffect(() => {
    if (attackReceived && attackSent) {
      setShowAnimation(true);

      setTimeout(() => {
        updatePlayer({ ...player, sprite: attackSprite });
        updateOpponent({ ...opponent, sprite: attackSprite });
      }, 750);
      // do animations
      setTimeout(() => {
        const playerDamage = player.damage;
        const opponentDamage = opponent.damage;

        updateOpponent({
          ...opponent,
          health: Math.max(0, opponent.health - playerDamage),
          damage: 0,
          sprite: idleSprite,
        });
        updatePlayer({
          ...player,
          health: Math.max(0, player.health - opponentDamage),
          damage: 0,
          sprite: idleSprite,
        });

        setTimeout(() => {
          setShowAnimation(false);
          setShowResult(true);
        }, 1000);
      }, 3000);
    }
  }, [attackSent, attackReceived]);

  React.useEffect(() => {
    if (player.ready && opponent.ready && isPlayer1) {
      socket?.emit("equations", {});
    }
  }, [player.ready, opponent.ready]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  socket?.on("equations", (data) => {
    console.log(data);
    updatePlayer({ ...player, ready: false });
    updateOpponent({ ...opponent, ready: false });
    setAttackSent(false);
    setAttackReceived(false);
    setEquations(data);
    setCounter(15);
    setShowResult(false);
  });

  socket?.on("opponent_disconnected", () => {
    alert(`Opponent disconnected`);
    window.location.reload()
  });

  socket?.on("damage", (data) => {
    console.log("received damage");
    if (data.attacker !== socket?.id) {
      updateOpponent({ ...opponent, damage: data.damage });
      setAttackReceived(true);
      history.opponent[data.round] = {
        damage: data.damage,
        time: data.time,
        equation: data.equation,
      }
    }
  });

  socket?.on("connect", () => {
    console.log("connected to server");
    setPlayOnline(true);
  });

  socket?.on("match_found", (data) => {
    console.log("match found");
    console.log(data);
    if (data.player1.id !== socket?.id) {
      updateOpponent({
        ...opponent,
        name: data.player1.userName,
      });
      setIsPlayer1(true);
    } else {
      updateOpponent({
        ...opponent,
        name: data.player2.userName,
      });
    }
  });

  socket?.on("ready", (data) => {
    console.log(data);
    if (data.player !== socket?.id) {
      updateOpponent({ ...opponent, ready: true });
    }
  });

  const playOnlineClick = async () => {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    updatePlayer({
      ...player,
      name: username,
    });

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    console.log("finding match");
    newSocket?.emit("find_match", {
      userName: username,
      difficulty: difficulty,
    });

    setSocket(newSocket);
  };

  const onReadyHandler = async () => {
    socket?.emit("ready", {});
    updatePlayer({ ...player, ready: true });
    updateRound(currentRound + 1)
  };

  if (!difficulty) {
    return (
      <div className="container">
        <h1>Choose Your Standard</h1>
        <div className="standards">
          <button onClick={() => setDifficulty("easy")} className="std-btn">
            1-4
          </button>
          <button onClick={() => setDifficulty("medium")} className="std-btn">
            5-7
          </button>
          <button
            onClick={() => setDifficulty("difficult")}
            className="std-btn"
          >
            8-10
          </button>
        </div>
      </div>
    );
  }

  if (!playOnline && !isDemo) {
    return (
      <div className="main-div">
        <button onClick={handleDemo} className="playDemo">
          Instructions
        </button>
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (isDemo) {
    // console.log("Demo");
    setTimeout(() => {
        handleDemo(false);
    }, 5000);
    return <Instructions />;
  }

  if (playOnline && !opponent.name) {
    return (
      <div className="container">
        {/* {player.name} */}
        <h1>Searching for opponent</h1>
      </div>
    );
  }

  return (
    <div className="container">
      {!showAnimation && !showResult && (
        <div>
          <h1 className="game-heading water-background">Math Duel</h1>
          <h2 className="game-heading water-background">
            Round {currentRound}
          </h2>
          <div className="expression-matrix">
            <Grid
              data={equations}
              onCellClick={handleCellClick}
              isCellClicked={attackSent}
            />
          </div>
          <div className="timer">
            <Timer
              counter={counter}
              setCounter={setCounter}
              attackSent={attackSent}
              handleCellClick={handleCellClick}
            />
          </div>
        </div>
      )}
      {!showResult && showAnimation && (
        <Move player={player} opponent={opponent} round={currentRound} />
      )}

      {showResult && !showAnimation && (
        <MoveSummary
          onReady={onReadyHandler}
          player={player}
          opponent={opponent}
          history={history}
          round={currentRound}
        />
      )}
    </div>
  );
};

export default App;
