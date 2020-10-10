import { ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext, RuleFunction, RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { TypeChecker } from 'typescript';
import { DecoratedProps, getDecoratedProps } from './decoratedValue';
import { DecoratorProps, getDecoratorProps } from './decoratorValue';
import { TypeGraphQLContext } from './TypeGraphQLContext';

type DecoratorReporterFn = (props: { decoratorProps: DecoratorProps; decoratedProps: DecoratedProps }) => void;

function getTypeGraphQLDecoratorVisitor<TMessageIds extends string, TOptions extends readonly unknown[]>(
  typeGraphQLContext: TypeGraphQLContext<TMessageIds, TOptions>,
  checker: TypeChecker,
  parserServices: ParserServices,
  reporter: DecoratorReporterFn
): RuleFunction<TSESTree.Decorator> {
  return (decoratorNode) => {
    const decoratorProps = getDecoratorProps({ node: decoratorNode, typeGraphQLContext });
    if (!decoratorProps) {
      // Not a TypeGraphQL decorator, ignore
      return;
    }

    const decoratedProps = getDecoratedProps({ decoratorNode, checker, parserServices });

    reporter({ decoratorProps, decoratedProps });
  };
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
