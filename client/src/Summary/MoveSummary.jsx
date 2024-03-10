import { useEffect, useState } from "react"

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
        return (
            <div className="container">
                Round {round}
                <button onClick={onReady}>Ready</button>
            </div>
        )
    } else {
        return <div className="container"><h1>Waiting for other Player</h1></div>
    }
}

export default MoveSummary;