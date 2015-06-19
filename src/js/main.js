var app = require('./app.js'),

    ParallaxScrolling = require('./services/parallaxscrolling.js'),
    ResizeManager = require('./services/resizemanager.js'),

    ContactForm = require('./modules/navigation.js'),
    Gallery = require('./modules/gallery.js'),
    Navigation = require('./modules/contactform.js');

app.init([ContactForm, Gallery, Navigation]);
