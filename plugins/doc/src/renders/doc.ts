import { Document, HeadingLevel, ISectionOptions, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { FileChild } from 'docx/build/file/file-child';
import { APIField, DocumentRender, LocaleData } from '../types';

function formatType(type: string | string[] | undefined) {
  if (Array.isArray(type)) {
    return type.join(' | ');
  }

  return type ?? '-';
}

function renderTable(fields: APIField[], locales: LocaleData) {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: locales.name })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: locales.type })] })] }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: locales.required })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: locales.default })] })],
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: locales.description })] })],
          }),
        ],
      }),
      ...fields.map((field) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: field.name ?? '-', italics: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: formatType(field.type), italics: true })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: field.required ? field.required.toString() : '-', italics: true })],
                }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: field.default ?? '-', italics: true })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: field.description ?? '-', italics: true })] })],
            }),
          ],
        });
      }),
    ],
  });
}

const docRender: DocumentRender = async (nodes, locales) => {
  const doc = new Document({
    sections: nodes.map((node) => {
      const { uri, summary, description, method, parameters, response } = node;

      const children: FileChild[] = [
        new Paragraph({
          children: [new TextRun({ text: summary })],
          heading: HeadingLevel.HEADING_2,
        }),
      ];

      if (description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: description })],
          }),
        );
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ text: locales.method })],
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          children: [new TextRun({ text: method, italics: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: locales.uri })],
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          children: [new TextRun({ text: uri, italics: true })],
        }),
      );

      const section: ISectionOptions = {
        properties: {},
        children,
      };

      if (parameters?.length) {
        parameters.forEach((parameter) => {
          const { type, fields, definitions } = parameter;
          const title = locales[(type + 'Parameters') as keyof typeof locales];
          children.push(
            new Paragraph({
              children: [new TextRun({ text: title })],
              heading: HeadingLevel.HEADING_3,
            }),
          );

          if (fields) {
            children.push(renderTable(fields, locales));
          }

          if (definitions) {
            Object.entries(definitions).forEach(([key, value]) => {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: key })],
                  heading: HeadingLevel.HEADING_4,
                }),
              );

              children.push(renderTable(value, locales));
            });
          }
        });
      }

      if (response) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: locales.responses })],
            heading: HeadingLevel.HEADING_3,
          }),
        );

        const { fields, definitions } = response;
        if (fields) {
          children.push(renderTable(fields, locales));
        }

        if (definitions) {
          Object.entries(definitions).forEach(([key, value]) => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: key })],
                heading: HeadingLevel.HEADING_4,
              }),
            );

            children.push(renderTable(value, locales));
          });
        }
      }

      return section;
    }),
  });

  const buffer = await Packer.toBuffer(doc);

  return {
    content: buffer,
    ext: 'docx',
  };
};

export default docRender;
