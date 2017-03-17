//BOT 0.0.1
const cron = require("cron").CronJob;
const slackBot = require("slackbots");
const Bot = new slackBot({
    //settings..
    token: "",
    name: ""
});

let players = [];
const playerPool = [];
let game = {
    time: "",
    day: 0,
    against: ""
}

const personCache = {};


Bot.on("start", () => {
    console.info("Bot connected");
});


cron("00 00 10 * * 1-5", () => {

    //alert the players...

    //so this runs at 10:00am every day, m-f

    if ( daysAway == 0 ){
        alertOtherPlayers("The game is " + daysAway + " days away, remember to bring your gear!");
    } else {
        alertOtherPlayers("The game is today, it's at " + game.time + " today!");
    }


});


function getPlayer(id, cb){
    if ( personCache[id] ){
        cb(personCache[id]);
    } else {
      Bot.getUserById( id ).then((user) => {
          //we have who it's from and the message...
          personCache[id] = user.name;
          cb(user.name);
      });
    }
}



Bot.on("message", ( $event ) => {
    // console.log( $event );
    if ( $event && $event.type == "message" ){
          let from = $event.user;
          let command = $event.text.split(" ");

          const action = command.shift();
          const args = command.slice(0);

          console.log( `action ${action} with args of ${args}` );



          getPlayer(from, (name) => {
              //we have who it's from and the message...
              checkAction( action, name, args );
          });

    }
});


Bot.on("close", ( data ) => {
    console.log("Connection closed... Reconnecting.", data);
    Bot.login();
});


Bot.on("error", function(data){
    console.log("Error", data);
});


function alertOtherPlayers(msg){
    //first we need to just dm all the current players...

    players.forEach((player) => {
        Bot.postMessageToUser(player, msg);
    });
}

function checkStatus(){
    //checks the player status

}

function newGame(gameDetails){
    players = [];
    playerPool.forEach((from) => {
        Bot.postMessageToUser(from, "A new game has come in! do you want to play? " + gameDetails.day + " at " +  gameDetails.time);
    });
    game = gameDetails;
}


function alertMorePlayers(from){
    //we have more players than we need
    Bot.postMessageToUser(from, "message");
}

function checkAction( action, from, args ){
    checkStatus();
    switch ( action.toLowerCase() ){
        case "join":
            if ( playerPool.indexOf(from) == -1 ){
                playerPool.push(from);
            }


            if ( players.indexOf(from) == -1 ){

                if ( players.length >= 6 ){
                    return alertMorePlayers(from);
                }

                alertOtherPlayers(from);
                console.info("Player '%s' joined! %s", from, players.length+1);
                players.push(from);
            } else {
                Bot.postMessageToUser(from, "You have already joinned this game!");
            }
            break;
        case "remove":
            let index = players.indexOf(from);
            players.splice(index, 1);
            alertOtherPlayers("Player '" + from + "' has been removed from the game, due to his request");
            break;
        case "players":
            Bot.postMessageToUser(from, "Currently we have " + players.length + " players " + players.join("\n > ") );
            break;
        case "ping":
            Bot.postMessageToUser(from, "Pong... I see you like games huh");
            break;
        case "bench":
            Bot.postMessageToUser(from, "Currently we have " + playerPool.length + " players in the pool " + playerPool.join("\n > ") );
            break;
        case "add":
            if ( playerPool.indexOf(args[0].trim()) == -1 ){
                playerPool.push(args[0].trim());
            }

    }
}
