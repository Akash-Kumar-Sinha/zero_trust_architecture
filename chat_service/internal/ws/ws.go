package ws

import (
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
)

var wg = &sync.WaitGroup{}

var Wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Wshandler(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conversationID := r.URL.Query().Get("conversationId")
	profileID := r.URL.Query().Get("profileId")
	if conversationID == "" {
		http.Error(w, "Missing conversationId", http.StatusBadRequest)
		return
	}
	num, err := strconv.ParseUint(conversationID, 10, 64)
	if err != nil {
		http.Error(w, "Invalid conversationId", http.StatusBadRequest)
		return
	}

	profileIDNum, err := strconv.ParseUint(profileID, 10, 64)
	if err != nil {
		http.Error(w, "Invalid profileId", http.StatusBadRequest)
		return
	}

	conn, err := Wsupgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{
		hub:            hub,
		conn:           conn,
		send:           make(chan []byte, 256),
		conversationID: uint(num),
		profileID:      uint(profileIDNum),
	}
	client.hub.register <- client

	wg.Add(2)

	go client.writePump()
	go client.readPump()
	wg.Wait()
}
