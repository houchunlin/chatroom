import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';


const users = [ {"name": "James Bond"}, {"name": "Ethan Hunt"}, {"name": "Natasha Romanoff"}, {"name": "Jason Bourne"}];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: true,
      userID: 0,
      friendID: 0,
      chatLog: [],
      notification: [false,false,false,false]
    }
    this.socket = socketIOClient('http://localhost:3125');
    this.socket.on("receiveHistory", history => {receiveHistory(history);} );
    this.socket.on("receiveMessage", message => {receiveMessage(message);} );

    const receiveHistory = data => {
      if(data.userID === this.state.userID && data.friendID === this.state.friendID){
        this.setState({chatLog: data.history});
      }
    }
    
    const receiveMessage = data => {
      if(data.userID===this.state.userID && data.friendID===this.state.friendID){
        let tmp_chatLog = this.state.chatLog;
        tmp_chatLog.push(data.record);
        this.setState({chatLog: tmp_chatLog});
      }
      else if(data.userID===this.state.userID){
        let tmp_notification = this.state.notification;
        this.state.notification[data.friendID] = true;
        this.setState({notification: tmp_notification});
      }
    }
  }

  requestHistory = (user, friend) => {
    this.socket.emit("requestHistory", {
      user: user,
      friend: friend
    });
  }

  sendMessage = message => {
    this.socket.emit("sendMessage", {
      user: this.state.userID,
      friend: this.state.friendID,
      message: message
    });
  }
 
  chooseUser = user => {
    var tmp_friend = 0;
    if(user===this.state.userID){
      this.setState({friendID: 1});
      tmp_friend = 1;
    }
    else
      this.setState({userID: user});

    
    this.setState({menu: false});
    document.title = users[user].name;
    this.requestHistory(user,tmp_friend);
  }

  render() {
    var characterList = [];
    for(let i=0; i<users.length; ++i){
      characterList.push(<p className="character" onClick={()=>this.chooseUser(i)}>{users[i].name}</p>);
    }
    if(this.state.menu)
        return (
          <div>
            <h2>Choose an identity:</h2>
            {characterList}
          </div>
        );
    else
        return (
          <div>
           <ContactList users={users} user={this.state.userID} friend={this.state.friendID} />
           <h1>{users[this.state.friendID].name}</h1>
           <History log={this.state.chatLog} />
           <Chatbox sendMethod={this.sendMessage}/>


          </div>
        );
  }
}

class ContactList extends Component {
  render() {
    let contacts = [];
    for(let i=0; i<users.length; ++i){
      if(i!==this.props.user)
        contacts.push(<p>{users[i].name}</p>);
    }
    return(
      <div>
        <h2>Contact List:</h2>
        {contacts}
      </div>
    )
  }
};

class History extends Component {
  render() {
    let history = [];
    for(let i=0; i<this.props.log.length; ++i){
        history.push(<p>{this.props.log[i].message}</p>);
    }
    return(
      <div>
        {history}
      </div>
    );
  }
};

class Chatbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
        value: ""
    };    
  }
  send = () => {
    this.props.sendMethod(this.state.value);
    this.setState({value: ""});
  }
  /*change(e){
    this.setState({value: event.target.value});
  }*/

  render() {
    return(
      <div>
        <input type="text" value={this.state.value} onChange={(e) => this.setState({value: e.target.value})}/>
        <button onClick={()=>{this.send()}}>Send</button>
      </div>
    );
  }
};

export default App;
