exports.index = function (req, res) {
    res.sendFile('/index.html', {root: __dirname});
};

exports.sendquestion = function (transporter) {
    return function (req, res) {
        if (!req.body) {
            return res.sendStatus(400);
        }

        var mailOptions = {
            from: req.body.name,
            to: 'i_am_lloyd@hotmail.com',
            subject: req.body.subject,
            text: req.body.message,
            html: ['<h1>hello world!</h1>',
                   '<p><strong>Name</strong>', req.body.name,'</p>',
                   '<p><strong>Email</strong>', req.body.email,'</p>',
                   '<p><strong>Phone</strong>', req.body.phone,'</p>',
                   '<p>, req.body.message, </p>'].join()
            };

        transporter.sendMail(mailOptions, function (error, info) {
            if(error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    };
};

