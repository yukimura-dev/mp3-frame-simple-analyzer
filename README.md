# MP3 Frame Simple Analyzer

MP3 Frame Simple Analyzer is a Node.js library for analyzing MP3 files.
It uses the [mp3-parser](https://www.npmjs.com/package/mp3-parser) library to parse MP3 files and extract detailed information about them. 
## Setup

To setup the project, install the dependencies first:
```
yarn install
```

## Usage

### info

The `info` command provides detailed information about the tag and the first and last frames of an MP3 file.

```sh
yarn mp3fun info <your-file-path>
```

Here is a sample output:
```
====================================
 Tags
====================================
[
  {
    _section: { type: 'Xing', offset: 0, byteLength: 417, nextFrameIndex: 417 },
    header: {
      _section: { type: 'frameHeader', byteLength: 4, offset: 0 },
      mpegAudioVersionBits: '11',
      mpegAudioVersion: 'MPEG Version 1 (ISO/IEC 11172-3)',
      layerDescriptionBits: '01',
      layerDescription: 'Layer III',
      isProtected: 1,
      protectionBit: '1',
      bitrateBits: '1001',
      bitrate: 128,
      samplingRateBits: '00',
      samplingRate: 44100,
      frameIsPaddedBit: '0',
      frameIsPadded: false,
      framePadding: 0,
      privateBit: '0',
      channelModeBits: '01',
      channelMode: 'Joint stereo (Stereo)'
    },
    identifier: 'Info'
  }
]

====================================
 First Frame
====================================
{
  _section: {
    type: 'frame',
    offset: 417,
    sampleLength: 1152,
    byteLength: 417,
    nextFrameIndex: 834
  },
  header: {
    _section: { type: 'frameHeader', byteLength: 4, offset: 417 },
    mpegAudioVersionBits: '11',
    mpegAudioVersion: 'MPEG Version 1 (ISO/IEC 11172-3)',
    layerDescriptionBits: '01',
    layerDescription: 'Layer III',
    isProtected: 1,
    protectionBit: '1',
    bitrateBits: '1001',
    bitrate: 128,
    samplingRateBits: '00',
    samplingRate: 44100,
    frameIsPaddedBit: '0',
    frameIsPadded: false,
    framePadding: 0,
    privateBit: '0',
    channelModeBits: '01',
    channelMode: 'Joint stereo (Stereo)'
  }
}

====================================
 Last Frame
====================================
{
  (omitted for brevity)
}

```

### summary

The `summary` command outputs a summary of the byte lengths by type for an MP3 file.

```sh
yarn mp3fun summary <your-file-path>
```
Here is a sample output:
```
File size: 980,949 byte

====================================
 Tag Summary
====================================
Frames of 417 byte: 1
total Frames: 1

====================================
 Frame Summary
====================================
Frames of 417 byte: 97
Frames of 418 byte: 2,250
total Frames: 2,347
```

### frame

The `frame` command outputs detailed information for the specified frame of an MP3 file.

```sh
yarn mp3fun frame <your-file-path> <frame number>
```
Here is a sample output:
```
====================================
 Frame 2
====================================
{
  _section: {
    type: 'frame',
    offset: 135865,
    sampleLength: 1152,
    byteLength: 209,
    nextFrameIndex: 136074
  },
  header: {
    _section: { type: 'frameHeader', byteLength: 4, offset: 135865 },
    mpegAudioVersionBits: '11',
    mpegAudioVersion: 'MPEG Version 1 (ISO/IEC 11172-3)',
    layerDescriptionBits: '01',
    layerDescription: 'Layer III',
    isProtected: 1,
    protectionBit: '1',
    bitrateBits: '0101',
    bitrate: 64,
    samplingRateBits: '00',
    samplingRate: 44100,
    frameIsPaddedBit: '1',
    frameIsPadded: true,
    framePadding: 1,
    privateBit: '0',
    channelModeBits: '01',
    channelMode: 'Joint stereo (Stereo)'
  }
}
```
