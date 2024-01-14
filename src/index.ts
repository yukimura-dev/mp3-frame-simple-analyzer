#!/usr/bin/env node

import util from 'util';
import mp3Parser from 'mp3-parser';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';

type ByteLength = Record<number, number>;

function main() {
  yargs(hideBin(process.argv))
    .scriptName('mp3fan')
    .usage('$0 <command> [args]')
    .command(
      'info <file>',
      'Display detail information about the tag and the first and last frames of an MP3 file',
      (yargs) => {
        return yargs.positional('file', {
          describe: 'Path to the MP3 file',
          demandOption: true,
          type: 'string',
        });
      },
      (argv) => {
        processInfo(argv.file);
      }
    )
    .command(
      'summary <file>',
      'Display summary of the byte lengths by type for an MP3 file',
      (yargs) => {
        return yargs.positional('file', {
          describe: 'Path to the MP3 file',
          demandOption: true,
          type: 'string',
        });
      },
      (argv) => {
        processSummary(argv.file);
      }
    )
    .command(
      'frame <file> <frameNumber>',
      'Display detailed information for the specified frame of an MP3 file',
      (yargs) => {
        return yargs
          .positional('file', {
            describe: 'Path to the MP3 file',
            demandOption: true,
            type: 'string',
          })
          .positional('frameNumber', {
            describe: 'Frame number to display information',
            demandOption: true,
            type: 'number',
          });
      },
      (argv) => {
        processFrame(argv.file, argv.frameNumber);
      }
    )
    .demandCommand(1, 'You need at least one command')
    .strict()
    .help()
    .version('1.0.0')
    .parse();
}

const processInfo = (filePath: string): void => {
  const dataView = readFile(filePath);
  const { tags, firstFrame } = extractTagsAndFirstFrame(dataView);

  printHeading('Tags');
  if (tags.length) {
    console.log(util.inspect(tags, { depth: 10, colors: true }) + '\n');
  } else {
    console.log('not exist');
  }

  printFrame(firstFrame, 'First Frame');

  const lastFrame: any = mp3Parser.readLastFrame(dataView);
  printFrame(lastFrame, 'Last Frame');
};

const processSummary = (filePath: string): void => {
  const dataView = readFile(filePath);
  const { tags, firstFrame } = extractTagsAndFirstFrame(dataView);

  console.log(`File size: ${dataView.byteLength.toLocaleString()} byte\n`);

  // Tags Summary
  let byteLengthsOfTags: ByteLength = {};
  tags.forEach((tag) => addByteLength(byteLengthsOfTags, tag));
  logSummary('Tag', byteLengthsOfTags);

  // Frames Summary
  if (!firstFrame) {
    return;
  }
  let byteLengthsOfFrames: ByteLength = {};
  addByteLength(byteLengthsOfFrames, firstFrame);
  let nextFrameIndex = firstFrame._section.offset;
  while (nextFrameIndex < dataView.byteLength) {
    const frame = mp3Parser.readFrame(dataView, nextFrameIndex);
    if (!frame) {
      console.error('Frame read error');
      process.exit(1);
    }
    addByteLength(byteLengthsOfFrames, frame);
    nextFrameIndex = frame._section.nextFrameIndex;
  }
  logSummary('Frame', byteLengthsOfFrames);
};

function processFrame(filePath: string, targetFrameNumber: number): void {
  if (targetFrameNumber < 1) {
    console.error('Please specify a valid frame number (greater than 0).');
    process.exit(1);
  }

  const dataView = readFile(filePath);
  const { firstFrame } = extractTagsAndFirstFrame(dataView);

  if (!firstFrame) {
    console.log(`Frame not found in the file.`);
    return;
  }

  if (targetFrameNumber === 1) {
    printFrame(firstFrame, `Frame 1`);
    return;
  }

  let currentFrameNumber = 2;
  let nextFrameIndex = firstFrame._section.nextFrameIndex;

  while (nextFrameIndex < dataView.byteLength && currentFrameNumber <= targetFrameNumber) {
    const frame: any = mp3Parser.readFrame(dataView, nextFrameIndex);
    if (!frame) {
      console.error(new Error('Frame read error'));
      process.exit(1);
    }
    if (currentFrameNumber === targetFrameNumber) {
      printFrame(frame, `Frame ${targetFrameNumber}`);
      return;
    }

    nextFrameIndex = frame._section.nextFrameIndex;
    currentFrameNumber++;
  }

  console.log(`Frame number ${targetFrameNumber} not found in the file.`);
}

function readFile(path: string): DataView {
  try {
    const buffer = fs.readFileSync(path);
    return new DataView(toArrayBuffer(buffer));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const bufferLength = buffer.length;
  const uint8Array = new Uint8Array(new ArrayBuffer(bufferLength));

  for (let i = 0; i < bufferLength; ++i) {
    const currentBuffer = buffer[i];
    if (currentBuffer === undefined) {
      console.error('Buffer read error');
      process.exit(1);
    }
    uint8Array[i] = currentBuffer;
  }
  return uint8Array.buffer;
}

function extractTagsAndFirstFrame(dataViewBuffer: DataView) {
  // first frame stored with tags
  const tags = mp3Parser.readTags(dataViewBuffer);
  const extractedTags = [];
  let firstFrame = null;

  for (const tag of tags) {
    if (tag._section.type !== 'frame') {
      extractedTags.push(tag);
    } else {
      firstFrame = tag;
      break;
    }
  }

  return { tags: extractedTags, firstFrame };
}

function logSummary(type: string, byteLength: ByteLength): void {
  printHeading(`${type} Summary`);
  Object.entries(byteLength).forEach(printLogByteLengthCount);
  const sumValue = Object.values(byteLength).reduce((a, v) => a + v, 0);

  console.log(`total Frames: ${sumValue.toLocaleString()}\n`);
}

function printLogByteLengthCount([byteLength, count]: [string, number]): void {
  console.log(`Frames of ${byteLength.toLocaleString()} byte: ${count.toLocaleString()}`);
}

function addByteLength(byteLengths: ByteLength, data: any): void {
  const byteLength = data._section.byteLength;
  byteLengths[byteLength] = (byteLengths[byteLength] || 0) + 1;
}

function printFrame(frame: Object | null, description: string): void {
  printHeading(description);

  if (frame) {
    console.log(util.inspect(frame, { depth: 10, colors: true }) + '\n');
  } else {
    console.log('not exist\n');
  }
}

function printHeading(heading: string) {
  console.log(`====================================`);
  console.log(` ${heading}`);
  console.log(`====================================`);
}

main();
