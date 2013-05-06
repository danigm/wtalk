from threading import Timer
import datetime

from flask import Flask
from flask import jsonify
from flask import g
from flask import request
from flask import render_template

import lib


app = Flask(__name__)
clients = {}
running = False


@app.route("/", methods=['GET'])
def index():
    return render_template('base.html')


@app.route("/login", methods=['POST'])
def login():
    data = request.json or request.form
    username = data['username']
    passwd = data['passwd']
    domain = data.get('domain', 'google.com')
    server = data.get('server', 'talk.google.com')
    port = int(data.get('port', 5222))
    client = lib.connect(username, passwd, domain, server, port)
    if not client:
        data = {'status': 'nok'}
        return jsonify(data)

    client.last = datetime.datetime.now()
    token = lib.newtoken()
    clients[token] = client

    if not running:
        disconnect()

    data = {'status': 'ok',
            'token': token}
    return jsonify(data)


@app.route("/ping", methods=['POST'])
def ping():
    data = request.json or request.form
    token = data['token']
    data = {'status': 'nok'}
    c = clients.get(token, '')
    if c:
        c.last = datetime.datetime.now()
        data = {'status': 'ok'}

    return jsonify(data)


@app.route("/contacts", methods=['POST'])
def contacts():
    data = request.json or request.form
    c = clients[data['token']]
    data = {'status': 'ok', 'contacts': lib.contact_list(c)}
    return jsonify(data)


@app.route("/messages", methods=['POST'])
def messages():
    data = request.json or request.form
    c = clients[data['token']]
    c.last = datetime.datetime.now()
    messages = []
    if hasattr(c, 'messages'):
        messages = [i.serialize(c) for i in c.messages]
        c.messages = []
    data = {'status': 'ok', 'messages': messages}
    return jsonify(data)


@app.route("/send", methods=['POST'])
def send():
    data = request.json or request.form
    c = clients[data['token']]
    msg = data['msg']
    to = data['to']
    lib.send(c, to, msg)
    data = {'status': 'ok'}
    return jsonify(data)


def disconnect():
    running = True
    todel = []
    for k, v in clients.items():
        v.Process(1)
        n = datetime.datetime.now()
        seconds = (n - v.last).seconds
        if seconds > 30:
            todel.append(k)

    for k in todel:
        try:
            clients[k].disconnect()
        except:
            pass
        del clients[k]

    if clients:
        t = Timer(5, disconnect)
        t.start()
    else:
        running = False


if __name__ == "__main__":
    app.run()
