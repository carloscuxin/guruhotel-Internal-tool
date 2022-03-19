import { GraphQLScalarType, Kind } from 'graphql';
import moment from 'moment';


function convertStringToDate(dateString: string) {
  try {
    return moment(dateString).format('DD/MM/YYYY');
  } catch {
    throw new Error('Provided date string is invalid and cannot be parsed');
  }
}

export const DateScalar = new GraphQLScalarType({
  name: 'DateScalar',
  description: 'The javascript `Date` as string. Type represents date and time as the ISO Date string.',
  serialize(value: unknown) {
    if (!(new Date(value as string) instanceof Date)) {
      throw new Error(`Unable to serialize value '${value}' as it's not an instance of 'Date'`);
    }

    return value;
  },
  parseValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new Error(
        `Unable to parse value '${value}' as GraphQLISODateTime scalar supports only string values`
      );
    }

    return convertStringToDate(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(
        `Unable to parse literal value of kind '${ast.kind}' as GraphQLISODateTime scalar supports only '${Kind.STRING}' ones`
      );
    }

    return convertStringToDate(ast.value);
  }
});
