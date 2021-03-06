/*eslint-disable no-unused-vars*/
const inferReturn = require('../../../src/infer/return');
const parse = require('../../../src/parsers/javascript');

function toComment(fn, filename) {
  return parse(
    {
      file: filename,
      source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
    },
    {}
  )[0];
}

function evaluate(code) {
  return inferReturn(toComment(code));
}

test('inferReturn', function() {
  expect(evaluate('/** */function a(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(evaluate('/** */var a = function(): number {}').returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'number',
        type: 'NameExpression'
      }
    }
  ]);
  expect(
    evaluate('/** @returns {string} */function a(): number {}').returns[0].type
  ).toEqual({
    name: 'string',
    type: 'NameExpression'
  });
  const generatorFn = evaluate(
    '/** */function *a(): Generator<Foo, Bar, Baz> {}'
  );
  expect(generatorFn.generator).toBe(true);
  expect(generatorFn.yields).toEqual([
    {
      title: 'yields',
      type: {
        name: 'Foo',
        type: 'NameExpression'
      }
    }
  ]);
  expect(generatorFn.returns).toEqual([
    {
      title: 'returns',
      type: {
        name: 'Bar',
        type: 'NameExpression'
      }
    }
  ]);
});
