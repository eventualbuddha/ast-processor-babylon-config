import build from '../src/index.js';
import { parse } from 'babylon';
import { deepEqual, strictEqual } from 'assert';

describe('babylon config', () => {
  it('has the ast', () => {
    let source = 'foo';
    let ast = parse(source);
    let config = build(source, ast);
    strictEqual(config.ast, ast);
  });

  it('can perform a simple traverse', () => {
    let source = '1 + a;';
    let ast = parse(source);
    let config = build(source, ast);
    let expected = [
      ast.program,
      ast.program.body[0],
      ast.program.body[0].expression,
      ast.program.body[0].expression.left,
      ast.program.body[0].expression.right
    ];
    config.traverse(ast, node => strictEqual(node, expected.shift()));
    strictEqual(expected.length, 0, 'all nodes should have been traversed');
  });

  it('can get the first token for a node', () => {
    let source = 'a;';
    let ast = parse(source);
    let config = build(source, ast);
    let token = config.firstTokenOfNode(ast.program.body[0]);
    strictEqual(token, ast.tokens[0]);
  });

  it('can get the last token for a node', () => {
    let source = 'a;';
    let ast = parse(source);
    let config = build(source, ast);
    let token = config.lastTokenOfNode(ast.program.body[0]);
    strictEqual(token, ast.tokens[ast.tokens.length - 2]);
  });

  it('can get the token after a token', () => {
    let source = '1 + 2;';
    let ast = parse(source);
    let config = build(source, ast);
    let plusToken = config.tokenAfterToken(ast.tokens[0]);
    strictEqual(plusToken, ast.tokens[1]);
  });

  it('can get the source of a token', () => {
    let source = '1 + 2;';
    let ast = parse(source);
    let config = build(source, ast);
    let oneToken = ast.tokens[0];
    strictEqual(config.sourceOfToken(oneToken), '1');
  });

  it('can track inserts', () => {
    let source = '';
    let ast = parse(source);
    let config = build(source, ast);
    config.insert(0, ';');
    deepEqual(config.insertions, [{ index: 0, content: ';' }]);
  });

  it('can track removals', () => {
    let source = 'a';
    let ast = parse(source);
    let config = build(source, ast);
    config.remove(0, 1);
    deepEqual(config.removals, [{ start: 0, end: 1 }]);
  });

  it('can get the range of a node', () => {
    let source = 'a';
    let ast = parse(source);
    let config = build(source, ast);
    deepEqual(
      [config.startOfNode(ast), config.endOfNode(ast)],
      [0, 1]
    );
  });

  it('can get the range of a token', () => {
    let source = 'a = b';
    let ast = parse(source);
    let config = build(source, ast);
    deepEqual(
      [config.startOfToken(ast.tokens[1]), config.endOfToken(ast.tokens[1])],
      [2, 3]
    );
  });
});
