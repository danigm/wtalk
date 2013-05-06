(function() {
    var Wtalk = this.Wtalk = {};
    Wtalk.token = '';
    Wtalk.username = '';

    Wtalk.storeData = function(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('password', data.passwd);
        localStorage.setItem('domain', data.domain);
        localStorage.setItem('server', data.server);
        localStorage.setItem('port', data.port);
    };

    Wtalk.restoreData = function() {
        var username = localStorage.getItem('username');
        var password = localStorage.getItem('password')
        var domain = localStorage.getItem('domain');
        var server = localStorage.getItem('server');
        var port = localStorage.getItem('port');
        if (username)
            $('#login-row form input[name="username"]').val(username);
        if (password)
            $('#login-row form input[name="password"]').val(password);
        if (domain)
            $('#login-row form input[name="domain"]').val(domain);
        if (server)
            $('#login-row form input[name="server"]').val(server);
        if (port)
            $('#login-row form input[name="port"]').val(port);
    };

    Wtalk.login = function () {
        var form = $("#login-row form");

        var data = {
            username: form.find('input[name="username"]').val(),
            domain: form.find('input[name="domain"]').val(),
            server: form.find('input[name="server"]').val(),
            port: form.find('input[name="port"]').val(),
            passwd: form.find('input[name="password"]').val()
        };

        if ($("#remember").is(":checked"))
            Wtalk.storeData(data);

        function cb(data) {
            if (data.status == 'ok') {
                Wtalk.token = data.token;

                $("#input").show();
                $("#talk-row").show();

                Wtalk.getMessages();
                Wtalk.getContacts();
                $("#subtitle").html(Wtalk.username);
            } else {
                $("#login-row").show();
                $("#input").hide();
                $("#talk-row").hide();
                $("#contacts-row").hide();

                Wtalk.token = '';
                Wtalk.username = '';
            }
        };

        $("#login-row").hide();
        Wtalk.username = data.username + "@" + data.domain;
        $.post('/login', data, cb);
    };

    Wtalk.sendMessage = function(to, msg) {
        function cb(data) {
            message = $('<div class="message"></div>');
            message.append('<div class="pull-right date label">'+new Date()+'</div>');
            message.append('<div class="pull-right label label-success">'+Wtalk.username+'</div>');
            message.append('<div class="msg well">'+msg+'</div>');
            $("#messages").append(message);
        }
        $.post('/send', {'token': Wtalk.token, 'msg': msg, 'to': to}, cb);
    };

    Wtalk.send = function() {
        to = $("#to").data('val');
        msg = $("#textinput").val();
        Wtalk.sendMessage(to, msg);
        $("#textinput").val("");
    };

    Wtalk.getContacts = function() {
        function cb(data) {
            if (data.status == 'ok') {
                $("#contacts").empty();
                for (var i=0; i<data.contacts.length; i++) {
                    var c = data.contacts[i];
                    var contactlink = $('<a class="btn btn-inverse" href="#" data-val="'+c[0]+'">'+c[1]+' ('+c[0]+')</a>');
                    contactlink.click(function() {
                        $("#to").html($(this).html());
                        $("#to").data('val', $(this).data('val'));
                        return false;
                    });
                    var contact = $('<div class="contact"></div>');
                    contact.append(contactlink);
                    $("#contacts").append(contact);
                }
            }
        }
        $.post('/contacts', {'token': Wtalk.token}, cb);
    };

    Wtalk.messageReceived = function(data) {
        for(var i=0; i<data.messages.length; i++) {
            var msg = data.messages[i];

            message = $('<div class="message"></div>');
            message.append('<div class="pull-left from label label-info">'+msg.fromn+' ('+msg.from+')</div>');
            message.append('<div class="pull-left date label">'+msg.date+'</div>');
            message.append('<div class="msg well">'+msg.msg+'</div>');
            message.click(function() {
                $("#to").html($(this).find(".from").html());
                $("#to").data('val', $(this).find(".from").html());
            });
            $("#messages").append(message);
            $("#to").html(msg.fromn + ' (' + msg.from + ')');
            $("#to").data('val', msg.from);
            Wtalk.notify(msg.from, msg.msg);
            window.scrollTo(0, document.body.scrollHeight);
        }
    };

    Wtalk.getMessages = function() {
        $.post('/messages', {'token': Wtalk.token}, Wtalk.messageReceived);


        if (Wtalk.token != '')
            setTimeout(function() { Wtalk.getMessages(); }, 5000);
    };

    Wtalk.notify = function(title, body) {
        var notification = navigator.mozNotification;
        if (notification) {
            var n = notification.createNotification(title, body);
            n.show();
        }
    };

    Wtalk.facebook = function() {
        var domain = 'chat.facebook.com';
        var server = 'chat.facebook.com';
        var port = '5222';
        $('#login-row form input[name="domain"]').val(domain);
        $('#login-row form input[name="server"]').val(server);
        $('#login-row form input[name="port"]').val(port);
    };

    Wtalk.gtalk = function() {
        var domain = 'gmail.com';
        var server = 'talk.google.com';
        var port = '5222';
        $('#login-row form input[name="domain"]').val(domain);
        $('#login-row form input[name="server"]').val(server);
        $('#login-row form input[name="port"]').val(port);
    };

    Wtalk.main = function() {
        $("#login").click(function() {
            Wtalk.login();
            return false;
        });

        Wtalk.restoreData();

        $("#send").click(function() {
            Wtalk.send();
            return false;
        });

        $("#showcontacts").click(function() {
            $("#contacts-row").toggle();
            Wtalk.getContacts();
        });

        $("#input").hide();
        $("#talk-row").hide();
        $("#contacts-row").hide();

        $("#facebook").click(function() {
            Wtalk.facebook();
        });

        $("#gtalk").click(function() {
            Wtalk.gtalk();
        });
    };
}).call(this);
