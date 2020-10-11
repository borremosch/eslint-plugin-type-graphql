import { ParserServices, TSESTree } from '@typescript-eslint/experimental-utils';
import { RuleContext, RuleFunction, RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { TypeChecker } from 'typescript';
import { DecoratedProps, getDecoratedProps, ValidDecoratedType } from './decoratedValue';
import { DecoratorProps, ValidDecoratorType, getDecoratorProps } from './decoratorValue';
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

interface FoundTypeGraphQLDecoratorSignature {
  typeFunction: string;
  nullableOption: string | undefined;
}
export function getTypeGraphQLDecoratorSignature(type: ValidDecoratorType): FoundTypeGraphQLDecoratorSignature {
  return {
    typeFunction: getTypeFunction(type),
    nullableOption: getNullableOption(type),
  };
}

function getTypeFunction(type: ValidDecoratorType | ValidDecoratedType): string {
  let typeFunctionBody = type.name;
  if (type.isArray) {
    typeFunctionBody = '[' + typeFunctionBody + ']';
  }

  return `() => ${typeFunctionBody}`;
}

function getNullableOption(type: ValidDecoratorType | ValidDecoratedType): string | undefined {
  if (type.isArray) {
    if (type.isArrayNullable || (type as ValidDecoratedType).isArrayUndefinable) {
      if (type.isNullable || (type as ValidDecoratedType).isUndefinable) {
        return "{ nullable: 'itemsAndList' }";
      }
      return '{ nullable: true }';
    } else if (type.isNullable || (type as ValidDecoratedType).isUndefinable) {
      return "{ nullable: 'items' }";
    }
  } else if (type.isNullable || (type as ValidDecoratedType).isUndefinable) {
    return '{ nullable: true }';
  }

  return undefined;
}

const EXPECTED_TYPE_NAME_MAP: { [key: string]: string[] } = {
  number: ['Int', 'Float'],
  string: ['String'],
  boolean: ['Boolean'],
  Date: ['Date', 'String'],
};

interface ExpectedTypeGraphQLDecoratorSignature {
  typeFunctions: string[];
  nullableOption: string | undefined;
}
export function getExpectedTypeGraphQLSignatures(type: ValidDecoratedType): ExpectedTypeGraphQLDecoratorSignature {
  const expectedTypeNames = EXPECTED_TYPE_NAME_MAP[type.name] || [type.name];

  return {
    typeFunctions: expectedTypeNames.map((expectedTypeName) => getTypeFunction({ ...type, name: expectedTypeName })),
    nullableOption: getNullableOption(type),
  };
}
