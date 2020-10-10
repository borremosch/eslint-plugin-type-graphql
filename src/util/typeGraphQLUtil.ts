import { AST_NODE_TYPES, ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext, RuleFunction, RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { Type, TypeChecker } from 'typescript';
import { TypeGraphQLContext } from './TypeGraphQLContext';

const OPERATION_DECORATORS: string[] = ['Mutation', 'Query', 'Subscription'];
const ARG_DECORATOR = 'Arg';
const ARGS_DECORATOR = 'Args';
const FIELD_DECORATOR = 'Field';
const ALL_DECORATORS = [...OPERATION_DECORATORS, ARG_DECORATOR, ARGS_DECORATOR, FIELD_DECORATOR];

type DecoratorReporterFn = (props: {
  decoratorName: string;
  decoratorType: Type | null;
  decoratedType: null;
  decoratorNode: TSESTree.Decorator;
}) => void;

export function decoratorHasName(decoratorName: string): boolean {
  return decoratorName === ARG_DECORATOR;
}

function getTypeGraphQLDecoratorVisitor<TMessageIds extends string, TOptions extends readonly unknown[]>(
  typeGraphQLContext: TypeGraphQLContext<TMessageIds, TOptions>,
  checker: TypeChecker,
  parserServices: ParserServices,
  reporter: DecoratorReporterFn
): RuleFunction<TSESTree.Decorator> {
  return (node) => {
    const decoratorName = typeGraphQLContext.getImportedName(node);
    if (!decoratorName || !ALL_DECORATORS.includes(decoratorName)) {
      // This is now a known TypeGraphQL decorator
      return;
    }

    const typeFunctionIndex = decoratorHasName(decoratorName) ? 1 : 0;

    const decoratorType = getDecoratorType(
      (node.expression as TSESTree.CallExpression).arguments[typeFunctionIndex],
      checker,
      parserServices
    );

    reporter({ decoratorNode: node, decoratorName, decoratedType: null, decoratorType });
  };
}

function getDecoratorType(
  typeFunctionNode: TSESTree.Expression,
  checker: TypeChecker,
  parserServices: ParserServices
): Type | null {
  if (
    typeFunctionNode.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    typeFunctionNode.type !== AST_NODE_TYPES.FunctionExpression
  ) {
    return null;
  }

  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(typeFunctionNode.body);
  const type = checker.getTypeAtLocation(tsNode);
  // console.log(type);

  return type;
}

export function getTypeGraphQLVisitors<TMessageIds extends string, TOptions extends readonly unknown[]>(
  context: Readonly<RuleContext<TMessageIds, TOptions>>,
  checker: TypeChecker,
  parserServices: ParserServices,
  reporter: DecoratorReporterFn
): RuleListener {
  const typeGraphQLContext = new TypeGraphQLContext(context);
  const visitors = typeGraphQLContext.getImportVisitors();
  visitors.Decorator = getTypeGraphQLDecoratorVisitor(typeGraphQLContext, checker, parserServices, reporter);
  visitors.dec;

  return visitors;
}
