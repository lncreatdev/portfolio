exports.index = function (req, res) {
    res.sendFile('/index.html', {root: __dirname});
};

exports.sendquestion = function (transporter) {
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

        transporter.sendMail(mailOptions, function (error, info) {
            if(error) {
                res.send(error);
                return console.log(error);
            }
           // console.log('Message sent: ' + info);
         //   res.sendStatus(200);
            res.send(info);
        });
    };
};

