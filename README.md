# bajo-config

![GitHub package.json version](https://img.shields.io/github/package-json/v/ardhi/bajo-emitter) ![NPM Version](https://img.shields.io/npm/v/bajo-emitter)

> <br />**Attention**: I do NOT accept any pull request at the moment, thanks!<br /><br />

Event emitter and message broker for [Bajo Framework](https://github.com/ardhi/bajo)
based on excellence [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2).

## Installation

Goto your ```<bajo-base-dir>``` and type:

```bash
$ npm install bajo-emitter
```

Now open your ```<bajo-data-dir>/config/.plugins``` and add ```bajo-emitter``` in it

## Configuration

Open/create ```<bajo-data-dir>/config/bajoEmitter.json```:

| Key | Type | Required | Default | Description |
| --- | ---- | -------- | ------- | ----------- |
| ```maxListeners``` | ```integer``` | no | ```100``` | Max number of listeners that can be assigned to an event |
| ```verboseMemoryLeak``` | ```boolean``` | no | ```false``` | Show event name in memory leak message when more than maximum amount of listeners is assigned |
| ```ignoreErrors``` | ```boolean``` | no | ```false``` | Disable throwing uncaughtException if an error event is emitted and it has no listeners |
| ```broadcastPools``` | ```array``` | no | ```[]``` | Broadcast pools |
| &nbsp;&nbsp;```name``` | ```string``` | no | ```default``` | Pool name |
| &nbsp;&nbsp;```from``` | ```string/array of string``` | yes || Source address(es) |
| &nbsp;&nbsp;```to``` | ```string/array of string``` | no || Destinatin address(es) |
| &nbsp;&nbsp;```handler``` | ```string``` | no || If not empty, messages are handled by this plugin helper instead of simply routed to ```to``` address(es) |

Note:
- Only incoming messages from connections marked for broadcast will be processed
- ```from``` should be one or more addresses with format ```<connection>@<plugin>```. Only messages coming from one of these addresses are handled by this pool
- ```to``` should be one or more addresses with format ```[subject:]<connection>@<plugin>```
- ```handler``` is a plugin helper name with format ```<plugin>:<helper>```. If you use ```.js``` config file, you can attach a custom function instead.

## Helper

### function addressSplit (address)

- A valid address should be in ```[<subject>:]<connection>@<plugin>```
- This helper destructs address into their components.
- Returns object with the following keys:
  - ```plugin```
  - ```connection```
  - ```subject```

### function addressVerify (address, options)

- Validate address of its components correctness. All options are optional:
  - ```skipConnectionCheck```: won't check whether the connection is valid or not. Default: ```false```
- Returns ```true``` if address is valid, otherwise ```false```

### function emit (event, ...params)

- Emit message as event named ```event```
- Zero, one or more parameters to emit
- Returns none

### function broadcast (params)

- Send message as a broadcast
- Parameters
  - ```msg```: message to send
  - ```from```: address from where message is originated
  - ```to```: address to where message will be sent
  - ```subject```: message subject
- Returns none

## Event Handling

To consume event emitted you should do these steps:

- Create ```bajoEmitter/event/<eventType>``` directory inside your ```<bajo-plugin-dir>```. Event type could be one of ```on```, ```once``` and ```off```
- Create a file named ```[<plugin>@]<event>.js``` inside directory you just created above. ```<plugin>``` is optional, if not supplied, it defaults to current plugin
- ```<event>``` is the name of event emitted. Name is then camel cased to form a valid event name
- Write ```<bajo-handler>``` inside the above file

As an example, I use ```main``` plugin here and try to consume ```message``` event of ```bajoMqtt```

1. Directory structure:

   ```
   ...
   app
   |-- main
   |   |-- bajoEmitter
   |       |-- event
   |           |-- on
   |               |-- bajoMqtt@message.js
   ...
   ```

2. Inside ```bajoMqtt@message.js```:

   ```js
   async function onBajoMqttMessage (conn, ...params) {
     const [topic, msg] = params
     console.log(topic, msg.toString())
   }

   export default onBajoMqttMessage
   ```

## License

[MIT](LICENSE)
