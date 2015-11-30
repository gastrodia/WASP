
mocha.setup('bdd');
chai.should();

//require('./hello');
require('./Vector2')
mocha.checkLeaks();
mocha.globals(['require','Wasp']);
mocha.run();
