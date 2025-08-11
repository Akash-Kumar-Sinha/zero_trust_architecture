package ws

type Hub struct {
	broadcast chan BroadcastMessage

	register chan *Client

	unregister chan *Client

	conversations map[uint][]*Client
}

func NewHub() *Hub {
	return &Hub{
		broadcast:     make(chan BroadcastMessage),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		conversations: make(map[uint][]*Client),
	}
}

func (h *Hub) Hubrun() {
	for {
		select {
		case client := <-h.register:
			h.conversations[client.conversationID] = append(h.conversations[client.conversationID], client)
		case client := <-h.unregister:
			if _, ok := h.conversations[client.conversationID]; ok {
				delete(h.conversations, client.conversationID)
				close(client.send)
			}
		case message := <-h.broadcast:
			clients := h.conversations[message.ConversationID]
			for _, client := range clients {
				if client.profileID == message.SenderID {
					continue
				}
				select {
				case client.send <- message.Data:
				default:
					close(client.send)
					delete(h.conversations, client.conversationID)
				}
			}
		}
	}
}
