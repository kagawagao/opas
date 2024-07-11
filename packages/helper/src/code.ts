import prettier, { BuiltInParserName, LiteralUnion, Parser } from 'prettier';

export interface CodeFormatOption {
  source: string;
  filePath: string;
  parser?: LiteralUnion<BuiltInParserName> | Parser;
}

export async function formatCode({ source, filePath, parser = 'typescript' }: CodeFormatOption) {
  const config = await prettier.resolveConfig(filePath);

  if (process.env.NODE_ENV === 'test') {
    return source;
  }

  const formattedContent = prettier.format(source, {
    ...config,
    parser,
  });

  return formattedContent;
}
