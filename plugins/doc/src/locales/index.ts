import { LocaleData } from '../types';
import enUS from './en-us';
import zhCN from './zh-cn';

const locales: Record<string, LocaleData> = {
  'zh-cn': zhCN,
  'en-us': enUS,
};

export default locales;
