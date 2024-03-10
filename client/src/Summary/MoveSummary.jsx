import { useEffect, useState } from "react";
import "./MoveSummary.css";

const MoveSummary = ({ onReady, player, opponent, history, round }) => {
    if (round === 0) {
        const [time, setTime] = useState(3)

        useEffect(() => {
            if (time === 0) {
                onReady()
            }
            setTimeout(() => {
                setTime(time - 1)
            }, 1000)
        }, [time])

        return (
            <div className="container">
                <h1>Starting in {time}</h1>
            </div>
        )
    }

    let winMessage
    if (player.health === 0 && opponent.health === 0) {
        winMessage = "Draw"
    } else if (opponent.health == 0 && player.health != 0) {
        winMessage = "You Win"
    } else if (player.health === 0 && opponent.health != 0) {
        winMessage = "You Loose"
    }
    console.log(`${player.health} ${opponent.health}`)

    if (winMessage) {
        return (
            <div className="container">
                <h1>{winMessage}</h1>
                <button className="playOnline" style={{ marginTop: 0 }} onClick={() => window.location.reload()}>Home</button>
            </div>
        )
    }



    if (!player.ready) {
        const [time, setTime] = useState(100000)

        useEffect(() => {
            if (time === 0) {
                onReady()
            }
            setTimeout(() => {
                setTime(time - 1)
            }, 1000)
        }, [time])

        return (
            <div className="container" style={{gap: 0}}>
                <h2 className="game-heading water-background">Round {round}</h2>
                <div className="users">
                    <div className="player">
                        <div className="player-tag">{player.name}</div>
                        <div>Move Chosen: {history.player[round].equation}</div>
                        <div>Time Remaining: {history.player[round].time}</div>
                        <div>Attack Power: {history.player[round].damage}</div>
                        <div>Initial Health: {player.health + history.opponent[round].damage}</div>
                        <div>Damage Taken: {history.opponent[round].damage}</div>
                        <div>Health After: {player.health}</div>
                    </div>

                    <div className="opponent">
                        <div className="opp-tag">{opponent.name}</div>
                        <div>Move Chosen: {history.opponent[round].equation}</div>
                        <div>Time Remaining: {history.opponent[round].time}</div>
                        <div>Attack Power: {history.opponent[round].damage}</div>
                        <div>Initial Health: {opponent.health + history.player[round].damage}</div>
                        <div>Damage Taken: {history.player[round].damage}</div>
                        <div>Health After: {opponent.health}</div>
                    </div>
                </div>
                <button className="playOnline" style={{ marginTop: 0 }} onClick={onReady}>Ready</button>
                <p>Skipping in {time}</p>
            </div>
        )
    } else {
        return <div className="container"><h1>Waiting for other Player</h1></div>
    }
}

export default MoveSummary;