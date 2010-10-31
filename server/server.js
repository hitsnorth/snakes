/**
 * Copyright (c) David Durman & Ales Sturala 2010.
 */

var ws = require('websocket-server'),
    server = ws.createServer(),
    static_server = require('./static_server'),
    path = require('path'),
    GLOBALS = require('../client/globals'),
    nPlayers = 0;       // number of connected users so far

static_server.create( GLOBALS.SERVER.WEBROOT );
static_server.listen( GLOBALS.SERVER.STATIC_SERVER_PORT );

server.on("connection", function(conn){
    
    nPlayers += 1;
    conn.send( JSON.stringify({ action: "start", id: conn.id }) );

    if ( nPlayers === 2 || nPlayers === 3 ) {
        
        conn.broadcast( JSON.stringify({ action: "ready" }) );
        conn.send( JSON.stringify({ action: "ready" }) );
        
    } else if ( nPlayers > GLOBALS.PLAYERS.maxCount ) {
        
        conn.broadcast(JSON.stringify({ action: "refuse" }));
        return;
    }

    conn.on( "message", function(message) {
        
        message = JSON.parse(message);
        
        if ( message.action == "died" ) {
            return;
        }
        
        conn.broadcast( JSON.stringify(message) );
        
    });
});

server.on( "close", function(conn){
    
    nPlayers -= 1;
    conn.broadcast( JSON.stringify({ id: conn.id, action: "close"}) );
    
});

server.listen( GLOBALS.SERVER.WS_SERVER_PORT );
