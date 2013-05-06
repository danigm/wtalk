import time
import datetime
import random
import string

import xmpp


class Message:
    def __init__(self, f, msg):
        self.f = f
        self.msg = msg
        self.date = datetime.datetime.now()

    def serialize(self, client=None):
        fromn = ''
        if client:
            fromn = client.Roster.getName(self.f.getStripped())
        data = {'from': self.f.getStripped(),
                'fromn': fromn,
                'msg': self.msg,
                'date': self.date.strftime("%d/%m/%Y %H:%M:%S")}
        return data



def connect(username, passwd, domain, server, port):
    client = xmpp.Client(domain, debug=[])
    client.connect(server=(server, port))
    auth = client.auth(username, passwd)
    if not auth:
        return None

    client.sendInitPresence()
    client.messages = []

    def xmpp_message(conn, event):
        f = event.getFrom()
        msg = event.getBody()
        if not msg:
            return
        client.messages.append(Message(f, msg))

    client.RegisterHandler('message', xmpp_message)
    # caching contact list
    contact_list(client)
    return client


def send(client, to, msg):
    message = xmpp.Message(to, msg)
    message.setAttr('type', 'chat')
    client.send(message)


def contact_list(client):
    roster = client.getRoster()
    contacts = roster.getItems()
    cx = []
    for c in contacts:
        res = roster.getResources(c)
        if res:
            cx.append((c, client.Roster.getName(c)))
    return cx


def newtoken():
    return ''.join(random.choice(string.letters) for i in range(20))
