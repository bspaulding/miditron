var $ = require("jquery");
var React = require('react');
var io = require("socket.io-client");
var socket = io();

var Miditron = React.createClass({
  componentWillMount: function() {
    var self = this;
    $.getJSON('/ports.json').then(function(ports) {
      self.setState({ ports: ports });
    });
    socket.on('midiMessage', function(message) {
      self.addMessage(JSON.stringify(message));
    });
    socket.on('connectedToPort', function(portNum) {
      self.addMessage('Connected to port ' + portNum + ': ' + ports[portNum]);
    });
  },
  addMessage: function(message) {
    this.setState({ messages: (this.state.messages + message + "\n") });
  },
  getInitialState: function() {
    return { ports: [], messages: "" };
  },
  connectToPort: function(portNum) {
    socket.emit('connectToPort', portNum);
  },
  render: function() {
    var self = this;
    var ports = this.state.ports.map(function(port) {
      return <li key={port} onClick={self.connectToPort.bind(self, self.state.ports.indexOf(port))}>{port}</li>;
    });

    return (
      <div>
        <h1>Ports</h1>
        <ul id="ports">
          {this.state.ports.length ? ports : <li>Loading ports...</li>}
        </ul>
        <textarea id="messages" value={this.state.messages}></textarea>
      </div>
    )
  }
});

module.exports = Miditron;
