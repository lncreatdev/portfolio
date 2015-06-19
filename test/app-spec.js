var app = require('../src/js/app.js');

describe('LNCD Portfolio Application', function () {
    describe('init()', function () {

        beforeEach(function () {
            Navigation = {
                init: function () {
                   return '';
                }
            };

            ContactForm = {
                init: function () {
                   return '';
                }
            };

            Gallery = {
                init: function () {
                   return '';
                }
            };

            spyOn(Navigation, 'init');
            spyOn(ContactForm, 'init');
            spyOn(Gallery, 'init');

            app.init([Navigation, ContactForm, Gallery]);
        });

        it('should have been initialised Navigation', function () {
            expect(Navigation.init).toHaveBeenCalled();
        });

        it('should have been initialised ContactForm', function () {
            expect(ContactForm.init).toHaveBeenCalled();
        });

        it('should have been initialised Gallery', function () {
            expect(Gallery.init).toHaveBeenCalled();
        });
    });
});
