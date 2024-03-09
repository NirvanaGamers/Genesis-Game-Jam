import React, { useState, useRef } from "react";
import { round, evaluate } from "mathjs";
import Swal from "sweetalert2";
import io from "socket.io-client";
import "./App.css";
import Grid from "./Grid/Grid";
import Timer from "./Timer/Timer";
import Player from "./Player/Player";

const data = [
  "2 * x",
  "x + 20",
  "200 - x",
  "500 / x",
  "3 * x - 2 * x",
  "2000 + x",
  "3 * x / 2",
  "x",
  "2 * x + 1",
];

const App = () => {
  const [playerDamage, setPlayerDamage] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [opponentDamage, setOpponentDamage] = useState(null);
  const [counter, setCounter] = useState(15);
  const [isCellClicked, setIsCellClicked] = useState(false);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isOppAttacking, setIsOppAttacking] = useState(false);
  const setCounterRef = useRef(setCounter);
  const idleSprite = "../src/assets/Character/Archer/Idle.png";
  const attackSprite = "../src/assets/Character/Archer/Shot_1.png";
  const [playerActiveSprite, setPlayerActiveSprite] = useState(idleSprite);
  const [oppActiveSprite, setOppActiveSprite] = useState(idleSprite);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);

  const handleCellClick = (value) => {
    if (isCellClicked) {
      return;
    }
    setIsCellClicked(true);
    console.log(`Clicked cell value: ${value}`);
    const result = evaluate(value.replace("x", counter));
    console.log("sent attack")
    socket?.emit("attack", {
      damage: result
    });
    setPlayerDamage(round(result));
  };

  React.useEffect(() => {
    setCounterRef.current = setCounter;
  }, [setCounter]);

  React.useEffect(() => {
    if (playerDamage) {
      setIsPlayerAttacking(true);
      // Decrease playerHealth by 1 unit until it becomes zero or equal to playerHealth - playerDamage
      const interval = setInterval(() => {
        setOpponentHealth((prevHealth) => {
          if (prevHealth <= prevHealth - playerDamage || prevHealth == 0) {
            clearInterval(interval);
            return prevHealth;
          }
          return prevHealth - 1;
        });
        setPlayerDamage((prevDamage) => {
          if (prevDamage <= 0) {
            return prevDamage;
          }
          return prevDamage - 1;
        });
      }, 500);
      // Clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
    setIsPlayerAttacking(false);
  }, [playerDamage]);

  React.useEffect(() => {
    if (opponentDamage) {
      setIsOppAttacking(true);
      // Decrease playerHealth by 1 unit until it becomes zero or equal to playerHealth - playerDamage
      const interval = setInterval(() => {
        setPlayerHealth((prevHealth) => {
          if (prevHealth <= prevHealth - opponentDamage || prevHealth == 0) {
            clearInterval(interval);
            return prevHealth;
          }
          return prevHealth - 1;
        });
        setOpponentDamage((prevDamage) => {
          if (prevDamage <= 0) {
            return prevDamage;
          }
          return prevDamage - 1;
        });
      }, 300);
      // Clear the interval when the component unmounts
      return () => clearInterval(interval);
    }
    setIsOppAttacking(false);
  }, [opponentDamage]);

  React.useEffect(() => {
    isPlayerAttacking
      ? setPlayerActiveSprite(attackSprite)
      : setPlayerActiveSprite(idleSprite);
    isOppAttacking
      ? setOppActiveSprite(attackSprite)
      : setOppActiveSprite(idleSprite);

    // console.log(playerActiveSprite);
  }, [isPlayerAttacking, isOppAttacking, playerActiveSprite]);

  React.useEffect(() => {
    if (!isPlayerAttacking && !isOppAttacking && playOnline) {
      if (playerHealth > opponentHealth) {
        alert(playerName + " You Won");
      } else if (opponentHealth > playerHealth) {
        alert(opponentName + "You Won");
      } else {
        alert("It's a DRAW");
      }
    }
  }, [isPlayerAttacking, isOppAttacking, playerHealth, opponentHealth]);

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

  socket?.on("opponent_disconnected", () => {
    alert("You Won");
  });

  socket?.on("damage", (data) => {
    console.log("received damage")
    if (data.attacker != socket?.id) {
      setOpponentDamage(data.result);
    }
  });

  socket?.on("connect", function () {
    console.log("connected to server")
    setPlayOnline(true);
  });

  socket?.on("match_found", function (data) {
    console.log("match found")
    console.log(data)
    if (data.player1.id !== socket?.id) {
      setOpponentName(data.player1.userName);
    } else {
      setOpponentName(data.player2.userName);
    }
  });

  // socket?.on("winner", function (data) {
  //   alert(data.username + " Won");
  // });

  // socket?.on("draw", function () {
  //   alert("Match was a draw!!!");
  // });

  async function playOnlineClick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    console.log("finding match")
    newSocket?.emit("find_match", {
      userName: username,
      difficulty: "easy"
    });

    setSocket(newSocket);
  }

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="waiting">
        <p>Waiting for opponent</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      <div>
        <h1 className="game-heading water-background">Math Duel</h1>
        <div className="expression-matrix">
          <Grid
            data={data}
            onCellClick={handleCellClick}
            isCellClicked={isCellClicked}
          />
        </div>
        <div className="timer">
          <Timer
            counter={counter}
            setCounter={setCounterRef.current}
            isCellClicked={isCellClicked}
          />
        </div>
      </div>
      <div className="users">
        <div className="player">
          <div className="player-tag">{playerName}</div>
          <Player imageUrl={playerActiveSprite} />
          <div className="user-health">HP : {playerHealth}</div>
          <div className="user-damage">Attack : {playerDamage}</div>
        </div>
        <div className="opponent">
          <div className="opp-tag">{opponentName}</div>
          <Player imageUrl={oppActiveSprite} flip />
          <div className="opp-health">HP : {opponentHealth}</div>
          <div className="opp-damage">Attack : {opponentDamage}</div>
        </div>
      </div>
    </div>
  );
};

export default App;
