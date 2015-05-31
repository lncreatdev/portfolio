exports.index = function (req, res) {
    res.sendFile('/index.html', {root: __dirname});
};

exports.sendquestion = function (sendgrid) {
    return function (req, res) {
        if (!req.body) {
            return res.sendStatus(400);
        }
        var mailOptions = {
            from: req.body.email,
            to: 'kwame.23@gmail.com',
            subject: ['LNCD WEBSITE', req.body.subject].join(' '),
            text: req.body.message,
            html: ['<h1>LNCD - Customer Request </h1>',
                   '<p><strong>Name</strong>', req.body.name,'</p>',
                   '<p><strong>Email</strong>', req.body.email,'</p>',
                   '<p><strong>Phone</strong>', req.body.phone,'</p>',
                   '<p>', req.body.message, '</p>'].join(' ')
            };

        sendgrid.send(mailOptions, function(err, json) {
            if (err) {
                return console.error(err);
            }
            console.log(json);
            res.sendStatus(200);
        });
    };
};

