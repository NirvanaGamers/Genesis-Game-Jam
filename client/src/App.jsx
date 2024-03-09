import React, { useState } from "react";
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
  const idleSprite = "../src/assets/Character/Archer/Idle.png";
  const attackSprite = "../src/assets/Character/Archer/Shot_1.png";

  const [player, updatePlayer] = useState({
    name: "",
    damage: null,
    health: 100,
    sprite: idleSprite
  })
  const [opponent, updateOpponent] = useState({
    name: null,
    damage: null,
    health: 100,
    sprite: idleSprite
  })

  const [counter, setCounter] = useState(15)
  const [attackSent, setAttackSent] = useState(false)
  const [attackReceived, setAttackReceived] = useState(false)
  const [canPlay, setCanPlay] = useState(true)

  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);

  const [difficulty, setDifficulty] = useState(null);

  const handleCellClick = (value) => {
    if (attackSent) {
      return;
    }
    console.log(`Clicked cell value: ${value}`);
    const result = evaluate(value.replace("x", counter));
    socket?.emit("attack", {
      damage: round(result)
    });
    updatePlayer({
      ...player,
      damage: round(result)
    })
    setAttackSent(true)
  };

  React.useEffect(() => {
    if (attackReceived && attackSent) {
      setCanPlay(false)

      setTimeout(() => {
        updatePlayer({ ...player, sprite: attackSprite })
        updateOpponent({ ...opponent, sprite: attackSprite })
      }, 750)
      // do animations
      setTimeout(() => {
        const playerDamage = player.damage
        const opponentDamage = opponent.damage

        updateOpponent({ ...opponent, health: Math.max(0, opponent.health - playerDamage), damage: 0, sprite: idleSprite })
        updatePlayer({ ...player, health: Math.max(0, player.health - opponentDamage), damage: 0, sprite: idleSprite })

        setTimeout(() => {
          setCanPlay(true)
          setAttackReceived(false)
          setAttackSent(false)
          setCounter(15)
        }, 1000)
      }, 3000);
    }
  }, [attackSent, attackReceived]);

  React.useEffect(() => {
    if (player.health == 0 && opponent.health == 0) {
      alert("Game Draw")
    } else if (player.health == 0) {
      alert("You Loose")
    } else if (opponent.health == 0) {
      alert("You Win")
    } else {
      return
    }
    window.location.reload()
  }, [canPlay])

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
    alert(`${opponent.name} disconnected`)
    updateOpponent({...opponent, health: 0})
  });

  socket?.on("damage", (data) => {
    console.log("received damage");
    if (data.attacker !== socket?.id) {
      updateOpponent({ ...opponent, damage: data.damage });
      setAttackReceived(true)
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
        name: data.player1.userName
      })
    } else {
      updateOpponent({
        ...opponent,
        name: data.player2.userName
      })
    }
  });

  async function playOnlineClick() {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;
    updatePlayer({
      ...player,
      name: username
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
  }

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

  if (!playOnline) {
    return (
      <div className="main-div">
        <button onClick={playOnlineClick} className="playOnline">
          Play Online
        </button>
      </div>
    );
  }

  if (playOnline && !opponent.name) {
    return (
      <div className="waiting">
        {player.name}
        <p>Waiting for opponent</p>
      </div>
    );
  }

  return (
    <div className="main-div">
      {canPlay &&
        <div>
          <h1 className="game-heading water-background">Math Duel</h1>
          <div className="expression-matrix">
            <Grid
              data={data}
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
      }
      {!canPlay &&
        <div className="users">
          <div className="player">
            <div className="player-tag">{player.name}</div>
            <Player imageUrl={player.sprite} />
            <div className="user-health">HP : {player.health}</div>
            <div className="user-damage">Attack : {player.damage}</div>
          </div>
          <div className="opponent">
            <div className="opp-tag">{opponent.name}</div>
            <Player imageUrl={opponent.sprite} flip />
            <div className="opp-health">HP : {opponent.health}</div>
            <div className="opp-damage">Attack : {opponent.damage}</div>
          </div>
        </div>
      }
    </div>
  );
};

export default App;
