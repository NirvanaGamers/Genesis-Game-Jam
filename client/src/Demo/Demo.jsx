import Typewriter from "../StoryComponent/TypeWriter";
import { useState, useEffect } from "react";
import "./Demo.css";
import Grid from "../Grid/Grid";
import Player from "../Player/Player";

const AttackData = ["7 * 8", "9 + 19", "240 - 215"];
const startStory =
  "A long long time ago there was a math-kingdom which was having war against math barbarians, as a main attacker help math-kingdom....";

const round1Text =
  "The opponent also gets the same choices and has the same objective as you that is to defeat you.";

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

  function storyHandle() {
    setIsStory(!isStory);
  }

  function gameHandle() {
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
    gameHandle();
  }

  function OutputHandle() {
    setIsOutput(true);
  }

  if (isStory) {
    setTimeout(() => {
      storyHandle();
      gameHandle();
    }, startStory.length * 80);

    return (
      <div className="story">
        <Typewriter text={startStory} speed={60} />;
      </div>
    );
  }

  if (isGame) {
    return (
      <div className="game">
        <p>Choose Your Attack</p>
        <Grid data={AttackData} onCellClick={handleCellClick} />
        <p>Click On The Expression That Has The Highest Value</p>
      </div>
    );
  }

  if (!isGame && !isStory && !isOutput) {
    setTimeout(() => {
      OutputHandle();
    }, round1Text.length * 80);
    return (
      <div className="story">
        <Typewriter text={round1Text} speed={60} />
      </div>
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
};

export default Demo;
