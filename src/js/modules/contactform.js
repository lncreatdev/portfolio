var $ = require('jquery');

module.exports = (function () {
    'use strict';
    var ContactForm = {},
        selectors = {
            SUBMIT_BUTTON: '#contact-form-submit',
            USER_NAME: '#name',
            USER_PHONE: '#phone',
            USER_EMAIL: '#email',
            USER_SUBJECT: '#subject',
            USER_MESSAGE: '#message'
        },
        events = {
            CLICK: 'click'
        },
        _self;

    ContactForm.init = function () {
        var $submitButton = $(selectors.SUBMIT_BUTTON);

        _self = this;
        $submitButton.on(events.CLICK, _self.submit);
    };

    ContactForm.submit = function (evt) {
        evt.preventDefault();

        var userName = $(selectors.USER_NAME).val(),
            userPhone = $(selectors.USER_PHONE).val(),
            userEail = $(selectors.USER_EMAIL).val(),
            userSubject = $(selectors.USER_SUBJECT).val(),
            userMessage = $(selectors.USER_MESSAGE).val(),
            userContactDetails = {
                name: userName,
                phone: userPhone,
                email: userEail,
                subject: userSubject,
                message: userMessage
            },
            jqxhr = $.ajax({
                url: '/sendquestion',
                type: 'POST',
                data:  userContactDetails
            });

        jqxhr.done(_self.submitSuccessHandler);
        jqxhr.fail(_self.submitFailureHandler);
    };

    ContactForm.submitSuccessHandler = function (data) {
        alert('Message have been sent');
    };

    ContactForm.submitFailureHandler = function (data) {
        alert('Message could not be sent');
    };

    return ContactForm;

}());
