import Typewriter from "./StoryComponent/TypeWriter";
import { useState, useEffect } from "react";
import Grid from './Grid/SimpleGrid';
import Player from "./Player/Player";

const AttackData = ["7 * 8", "9 + 19", "240 - 215"];
let startStory = "A long long time ago there was a math-kingdom which was having war against math barbarians, as a main attacker help math-kingdom....";

const Demo = () => {
  const [isStory, setIsStory] = useState(true);
  const [isGame, setIsGame] = useState(false);
  const [attack, setAttack] = useState(0);
  const [isOutput, setIsOutput] = useState(false);
  const [userHealth, setUserHealth] = useState(100);
  const [oppHealth, setOppHealth] = useState(100);
  const [userAttack, setUserAttack] = useState(0);
  const [defence, setDefence] = useState(20);

  useEffect(() => {
    if (!isStory && !isGame) {
      setTimeout(() => {
        setIsOutput(true);
      }, 7000);
    }
  }, [isStory, isGame]);

  function StoryHandle() {
    setIsStory(!isStory);
  }

  function GameHandle() {
    setIsGame(!isGame);
  }

  function handleCellClick(attackDamage) {
    if (attackDamage === "9 + 19") {
      attackDamage = 28;
    } else if (attackDamage === "7 * 8") {
      attackDamage = 56;
    } else if (attackDamage === "240 - 215") {
      attackDamage = 25;
    }
    setAttack(attackDamage);
    setUserAttack(attackDamage);
    GameHandle();
  }

//   function OutputHandle() {
//     setIsOutput(!isOutput);
//   }

  if (isStory) {
    setTimeout(() => {
      StoryHandle();
      GameHandle();
    }, startStory.length * 60);

    return <Typewriter text={startStory} speed={50} />;
  }

  if (isGame) {
    return (
      <div className="game">
        <Grid
          data={AttackData}
          onCellClick={handleCellClick}
        />
        <p><br /> Choose Your Attack</p>
      </div>
    );
  }

  if (!isGame && !isStory) {
    return (
      <Typewriter text="The opponent has chosen shield guard of 20 pts" speed={50} />
    );
  }

  if (isOutput) {
    return (
      <div className="users">
        <div className="player">
          Player
          <Player />
          <div className="user-health">HP: {userHealth}</div>
          <div className="user-damage">Attack: {userAttack}</div>
        </div>
        <div className="opponent">
          Opponent
          <Player />
          <div className="opp-health">HP: {oppHealth}</div>
          <div className="opp-damage">Defense: {defence}</div>
        </div>
      </div>
    );
  }
}

export default Demo;
