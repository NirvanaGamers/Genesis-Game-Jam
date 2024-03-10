import { useEffect, useState } from "react"

const MoveSummary = ({ onReady, player, opponent, history, round }) => {
    if (round === 0) {
        const [time, setTime] = useState(3)
        
        useEffect(() => {
            if (time === 0) {
                onReady()
            }
            setTimeout(() => {
                setTime(time-1)
            }, 1000)
        }, [time])

        return <h2>Startings in {time}</h2>
    }

    if (player.health === 0 && opponent.health === 0) {
        return <div>Draw <button onClick={() => window.location.reload()}>Home</button></div>
    } else if (opponent.health === 0) {
        return <div>You Win <button onClick={() => window.location.reload()}>Home</button></div>
    } else if (player.health === 0) {
        return <div>You Loose <button onClick={() => window.location.reload()}>Home</button></div>
    }
    console.log(history)
    if (!player.ready) {
        return (
            <div>
                Round {round}
                <button onClick={onReady}>Ready</button>
            </div>
        )
    } else {
        return <div>Waiting for other Player</div>
    }
}

export default MoveSummary;