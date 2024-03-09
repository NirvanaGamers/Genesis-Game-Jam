import Player from "../Player/Player"

const Move = ({ player, opponent, round }) => {

    return (
        <>
            <h2 className="game-heading water-background">Round {round}</h2>
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
        </>)
}

export default Move;