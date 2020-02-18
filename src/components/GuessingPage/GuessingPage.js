import React, { Component } from 'react'
import Canvas from '../../Utils/Canvas/Canvas'
import './GuessingPage.css'
import ColorContext from '../../Context/ColorContext'
import DigiDoodleApiService from '../../services/digi-doodle-api-service'
import Cookies from 'js-cookie';
import socket from '../../services/socket-service'
import '../../Utils/Canvas/Canvas.css'

export default class GuessingPage extends Component {
    static contextType = ColorContext;
    constructor(props) {
        super(props);
        this.state = {
            guess: '',
            username: '',
            players: [],
            score: 0,
            messages: [{
                player: 'Lobby',
                message: 'Welcome to the room!'
            }]
        }
    }

    async componentDidMount() {
        let cookie = Cookies.get();
        let data = JSON.parse(cookie['digi-doodle-user']);

        await this.setState({
            username: data.username
        });

        socket.emit('sendRoom', `${data.gameId}`);
        socket.on('chat message', msg => {
            console.log('from server: ', msg);
        })
        socket.on('drawing', (data) => {
            
        })

        DigiDoodleApiService.getWordPrompt()
            .then(res => {
                this.context.getPrompt(res.prompt)
            })
        DigiDoodleApiService.getAllPlayersInGame(data.gameId)
            .then(playersArray => {
                this.context.setPlayers(playersArray)
            })
    }

    
    handleGuessSubmit = async (ev) => {
        ev.preventDefault();
        let guess = await DigiDoodleApiService.postGuess(this.context.gameId, this.context.userId, this.state.guess);

        socket.emit('guess', {player: this.state.username, message: this.state.guess});
        socket.on('chat response', (msg) => {
            this.setState({ 
                 messages: [...this.state.messages, msg]
             });
         })
         console.log(this.state.messages)

        // console.log('guess response: ', guess);
        await this.setState({
            guess: ''
        });
    }

    handleTextInput = (ev) => {
        this.setState({
            guess: ev.target.value
        })
    }

    //event handler for submit button to validate answer

    render() {
        return (
            <div className="disabled-canvas">
                <h1 className="guess-page-header">What are they drawing</h1>
                <Canvas />


                <div className="players-container">
                    <ul className="player-ul">
                        {this.context.players.map((player, index) => {
                            return (
                                <li className="player-li" key={index}>
                                    <span>{player.username} : {player.score} </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>

                    <form className="guess-input" >
                        <label htmlFor="chat-input">Guess goes here: </label>
                        <input type="text" onChange={this.handleTextInput}
                            id="chat-input"
                            value={this.state.guess}
                            required
                            spellCheck="false"
                            maxLength="30"
                        />
                        <button className="submit-guess" type="submit" id="chat-submit" onClick={this.handleGuessSubmit}>&#10004;</button>
                    </form>

                <div className="chat-window">
                    <ul>
                     {this.state.messages.map((message, index) => {
                         return(
                            <li key={index}>{message.player}: {message.message}</li>
                            )
                        })}   
                    </ul>
                </div>

                
            </div>
        )
    }
}