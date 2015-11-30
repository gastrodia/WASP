describe('Hello Test', function() {
  describe('#传说中的hello world', function () {
    it('"hello world" is a string', function () {
      var foo = 'hello world';
    foo.should.be.a('string');
    });
  });
});
