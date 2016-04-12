import traverse from 'babel-traverse';

type SourceLocation = {
  start: { line: number, column: number },
  end: { line: number, column: number },
};

type File = {
  type: string,
  start: number,
  end: number,
  tokens: Array<Token>,
  loc: SourceLocation
};

type Node = {
  type: string,
  start: number,
  end: number,
  loc: SourceLocation,
};

type Token = {
  type: { label: string },
  start: number,
  end: number,
};

type BabylonConfig = {
  ast: Node,
  traverse: (node: Node, iterator: (node: Node, parent: ?Node) => void) => void,

  firstTokenOfNode: (node: Node) => Token,
  lastTokenOfNode: (node: Node) => Token,
  tokenAfterToken: (token: Token) => ?Token,
  sourceOfToken: (token: Token) => string,

  startOfToken: (token: Token) => number,
  endOfToken: (token: Token) => number,
  startOfNode: (node: Node) => number,
  endOfNode: (node: Node) => number,

  insert: (index: number, content: string) => void,
  remove: (start: number, end: number) => void,
  insertions: Array<{ index: number, content: string }>,
  removals: Array<{ start: number, end: number }>,
};

export default function build(source: string, ast: File): BabylonConfig {
  let insertions = [];
  let removals = [];
  let tokens = ast.tokens;

  return {
    ast,
    insertions,
    removals,

    traverse(node: Node, iterator: (node: Node, parent: ?Node) => void) {
      traverse(node, {
        enter(path: { node: Node, parent: Node }) {
          iterator(path.node, path.parent);
        }
      });
    },

    firstTokenOfNode(node: Node) {
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.start === node.start) {
          return token;
        }
      }
      throw new Error(
        `cannot find first token for node ${node.type} at ` +
        `${node.loc.start.line}:${node.loc.start.column + 1}`
      );
    },

    lastTokenOfNode(node: Node) {
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.end === node.end) {
          return token;
        }
      }
      throw new Error(
        `cannot find last token for node ${node.type} at ` +
        `${node.loc.start.line}:${node.loc.start.column + 1}`
      );
    },

    tokenAfterToken(token: Token) {
      let index = tokens.indexOf(token);
      if (index < 0) {
        throw new Error(
          `cannot find token in tokens: ${JSON.stringify(token)}`
        );
      }
      return tokens[index + 1];
    },

    sourceOfToken(token: Token) {
      return source.slice(token.start, token.end);
    },

    insert(index: number, content: string) {
      insertions.push({ index, content });
    },

    remove(start: number, end: number) {
      removals.push({ start, end });
    },

    startOfNode(node: Node) {
      return node.start;
    },

    endOfNode(node: Node) {
      return node.end;
    },

    startOfToken(token: Token) {
      return token.start;
    },

    endOfToken(token: Token) {
      return token.end;
    }
  };
}
