import chalk from 'chalk';
import fs from 'fs-extra';
import signale from 'signale';
import { formatCode } from './code';
import { WriteFileMode } from './types';

export interface OutputFileOptions {
  tips: {
    start: string;
    success: string;
    error: string;
  };
  outFileName: string;
  code: string;
  writeFileMode: WriteFileMode | string;
}

/**
 * check should overwrite file
 */
async function checkToOverwrite(writeFileMode: WriteFileMode | string, outFileName: string) {
  try {
    const isExisted = await fs.pathExists(outFileName);
    if (!isExisted) {
      return true;
    }
    const existedTip = `${outFileName} is already existed`;
    if (writeFileMode === WriteFileMode.error) {
      throw Error(chalk.redBright(existedTip));
    }
    if (writeFileMode === WriteFileMode.warn) {
      signale.warn(chalk.yellowBright(existedTip));
      return false;
    }
    if (writeFileMode === WriteFileMode.overwrite) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * output file
 */
export async function outFile({ tips, outFileName, code, writeFileMode = WriteFileMode.skip }: OutputFileOptions) {
  const { start, success, error } = tips;
  const allowed = await checkToOverwrite(writeFileMode, outFileName);
  if (!allowed) return;
  signale.start(chalk.greenBright(start));
  const normalizedCode = await formatCode({
    source: code,
    filePath: outFileName,
  });
  try {
    await fs.outputFile(outFileName, normalizedCode);
    signale.success(chalk.greenBright(success));
  } catch (e) {
    signale.error(chalk.redBright(error));
    signale.error(chalk.redBright(e as unknown as any));
  }
}
