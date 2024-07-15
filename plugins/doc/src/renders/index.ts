import { DocumentRender, InternalRenderType } from '../types';
import docRender from './doc';
import markdownRender from './md';

const renders: Record<InternalRenderType, DocumentRender> = {
  md: markdownRender,
  doc: docRender,
};

export default renders;
