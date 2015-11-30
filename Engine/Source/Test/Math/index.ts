
mocha.setup('bdd');
chai.should();

require('./hello');

mocha.checkLeaks();
mocha.globals(['require']);
mocha.run();
