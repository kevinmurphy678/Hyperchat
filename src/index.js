import React from 'react';
import ReactDOM from 'react-dom';
const IPFS = require('ipfs')
const Room = require('ipfs-pubsub-room')

class App extends React.Component{
   constructor(){
       super()
       this.setupIPFS()
       this.state = {
           messages : [],
           nodeID : "Initiating IPFS Node.."
       }
       this.sendMessage = this.sendMessage.bind(this)
       this.setupIPFS = this.setupIPFS.bind(this)
       this.getMessage = this.getMessage.bind(this)
   }
    render(){
        return(

            <div className="app">
                <Header id={this.state.nodeID}/>
                <MessageList
                    messages={this.state.messages}
                />
                <SendMessageBox sendMessage={this.sendMessage}/>
            </div>
        )
    }

    setupIPFS(){
        window.node = new IPFS({
            repo: String(Math.random() + Date.now()),
            EXPERIMENTAL: {
                pubsub: true
            },
            config: {
                Addresses: {
                    Swarm: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                    ]
                }
            }
        })

        window.node.once('ready', () => node.id((err, info) => {
            console.log('Online status: ', node.isOnline() ? 'online' : 'offline')
            console.log('IPFS node ready with address ' + info.id)
            this.setState({ nodeID : "Welcome " + info.id })


            window.room = Room(node, 'SharpChat')
            room.on('message', (message) => this.getMessage(message))

            room.on('peer joined', (peer) => console.log('peer ' + peer + ' joined'))
            room.on('peer left', (peer) => console.log('peer ' + peer + ' left'))
        }))
    }

    getMessage(message)
    {
        this.setState({
            messages: [...this.state.messages, message.from + ": " + message.data.toString()]
        });
        console.log('got message from ' + message.from + ': ' + message.data.toString())
    }

    sendMessage(message){
        console.log("Sending Message:" + message)
        window.room.broadcast(message)
    }
}

class Header extends React.Component{
    render() {
        return(<div> <h1>Wow!?</h1> <p>{this.props.id}</p> </div>)
    }
}

class SendMessageBox extends React.Component{
    constructor(){
        super()
        this.state = { value: '', added_file_hash: ''}
        this.handleChange = this.handleChange.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.captureFile = this.captureFile.bind(this)
        this.saveToIpfs = this.saveToIpfs.bind(this)
    }

    handleChange(e)
    {
        this.setState({value : e.target.value})
    }

    handleKeyPress(e)
    {
        if(e.key === 'Enter'){
            this.props.sendMessage(this.state.value)
        }
    }

    captureFile (event) {
        event.stopPropagation()
        event.preventDefault()
        this.saveToIpfs(event.target.files)
    }

    saveToIpfs (files) {
        let ipfsId
        window.node.add([...files], { progress: (prog) => console.log(`received: ${prog}`) })
            .then((response) => {
                console.log(response)
                ipfsId = response[0].hash
                console.log(ipfsId)
                this.setState({ added_file_hash: ipfsId })
            }).catch((err) => {
            console.error(err)
        })
    }

    handleSubmit (event) {
        event.preventDefault()
    }

    render() {
        return(
            <div className="SendMessageBox">
                <input type="text" onKeyDown={this.handleKeyPress} onChange={this.handleChange} value={this.state.value}/>
                <form id='captureMedia' onSubmit={this.handleSubmit}>
                    <input type='file' onChange={this.captureFile} /><br/>
                </form>
            </div> )
    }
}

class MessageList extends React.Component{
    render() {
        return (
            <ul className="message-list">
                {this.props.messages.map((message, index) => {
                    return (
                        <li className="message">
                            <div>{message}</div>
                        </li>
                    )
                })}
            </ul>
        )}}

ReactDOM.render(
  <App/>,
  document.getElementById('app')
)




module.hot.accept();