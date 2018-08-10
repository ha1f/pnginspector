const SIZE_SIGNATURE = 0x08;
const IS_LITTLE_ENDIAN = false;
// const COLOR_TYPE_MAP = { 3: 'PNG-8', 2: 'PNG-24', 6: 'PNG-32' };

function elementsEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

export default class PngParser {
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.dataView = new DataView(arrayBuffer, 0);
  }
  validateIsPng() {
    if (this.dataView.byteLength < SIZE_SIGNATURE) {
      return false;
    }
    const expected = [137, 80,  78, 71, 13, 10, 26, 10];
    return elementsEqual(this.getUint8Array(0, SIZE_SIGNATURE), expected);
  }
  getDataURI() {
    return `data:image/png;base64,${btoa(Array.from(new Uint8Array(this.arrayBuffer), e => String.fromCharCode(e)).join(''))}`;
  }
  getUint32(offset) {
    return this.dataView.getUint32(offset, IS_LITTLE_ENDIAN);
  }
  getUint16(offset) {
    return this.dataView.getUint16(offset, IS_LITTLE_ENDIAN);
  }
  getUint8(offset) {
    return this.dataView.getUint8(offset);
  }
  getChar(offset) {
    return String.fromCharCode(this.getUint8(offset));
  }
  getString(offset, number) {
    return Array(number).fill(0).map((v, i) => this.getChar(offset + i)).join('');
  }
  getUint8Array(offset, number) {
    return Array(number).fill(0).map((v, i) => this.getUint8(offset + i));
  }
  getStringWhile(offset, condition) {
    let result = [];
    let i = 0;
    let data = this.getUint8(offset + i);
    while (condition(data)) {
      result.push(data);
      i += 1;
      data = this.getUint8(offset + i);
    }
    return { text: result.map((v, i) => String.fromCharCode(v)).join(''), endOffset: offset + i };
  }
  readIHDRChunkData(offset = 0x10) {
    return {
      width: this.getUint32(offset),
      height: this.getUint32(offset + 4),
      bitDepth: this.getUint8(offset + 8),
      colorType: this.getUint8(offset + 9),
      compression: this.getUint8(offset + 10),
      filter: this.getUint8(offset + 11),
      interlace: this.getUint8(offset + 12),
      crc: this.getUint32(offset + 13),
    };
  }
  readPlteChunkData(offset, length) {
    let colors = [];
    const maxI = length -  2;
    for (let i=0; i < maxI; i += 3) {
      colors.push({ red: this.getUint8(offset + i), green: this.getUint8(offset + i + 1), blue: this.getUint8(offset + i + 2) });
    }
    return colors;
  }
  readtRNSChunkData(offset, size, colorType) {
    if (colorType === 3) {
      return Array(size).fill(0).map((v, i) => this.getUint8(offset + i));
    } else {
      return Array(size / 2).fill(0).map((v, i) => this.getUint16(offset + (i * 2)));
    }
  }
  readFctlChunkData(offset) {
    return {
      sequenceNumber: this.getUint32(offset),
      width: this.getUint32(offset + 4),
      height: this.getUint32(offset + 8),
      xOffset: this.getUint32(offset + 12),
      yOffset: this.getUint32(offset + 16),
      delayNum: this.getUint16(offset + 20),
      delayDen: this.getUint16(offset + 22),
      disposeOp: this.getUint8(offset + 24),
      blendOp: this.getUint8(offset + 25)
    };
  }
  readActlChunkData(offset) {
    return {
      numFrames: this.getUint32(offset),
      numPlays: this.getUint32(offset)
    };
  }
  readTextChunkData(offset, length) {
    // https://www.setsuki.com/hsp/ext/chunk/tEXt.htm
    return {
      text: this.getString(offset, length)
    };
  }
  readItxtChunkData(offset) {
    let result = this.getStringWhile(offset, ((v) => v != 0));
    const keyword = result.text;
    const compressionFlag = this.getUint8(result.endOffset + 1);
    const compressionMethod = this.getUint8(result.endOffset + 2);
    result = this.getStringWhile(result.endOffset + 3, ((v) => v != 0));
    const languageTag = result.text;
    result = this.getStringWhile(result.endOffset, ((v) => v != 0));
    const translatedKeyword = result.text;
    result = this.getStringWhile(result.endOffset, ((v) => v != 0));
    const text = result.text;
    return {
      keyword: keyword,
      compressionFlag: compressionFlag,
      compressionMethod: compressionMethod,
      languageTag: languageTag,
      translatedKeyword: translatedKeyword,
      text: text
    };
  }
  readChrmChunkData(offset) {
    return {
      whilePoint: { x: this.getUint32(offset + 0), y: this.getUint32(offset + 4) },
      red: { x: this.getUint32(offset + 8), y: this.getUint32(offset + 12) },
      green: { x: this.getUint32(offset + 16), y: this.getUint32(offset + 20) },
      blue: { x: this.getUint32(offset + 24), y: this.getUint32(offset + 28) }
    };
  }
  readPhysChunkData(offset) {
    return {
      pixelsPerUnit: { x: this.getUint32(offset + 0), y: this.getUint32(offset + 4) },
      unitSpecifier: this.getUint8(offset + 8)
    };
  }
  readChunk(offset) {
    let currentOffset = offset;
    const size = this.getUint32(currentOffset);
    currentOffset += 4;
    const type = this.getString(currentOffset, 4);
    currentOffset += 4;
    // データを読み飛ばす
    const dataOffset = currentOffset;
    currentOffset += size;
    // CRC
    const crc = this.getUint32(currentOffset);
    currentOffset += 4;
    return {
      size: size,
      type: type,
      crc: crc,
      dataOffset: dataOffset,
      endOffset: currentOffset,
    };
  }
  getChunks() {
    const chunks = [];
    let chunk = { size: 0, type: '', crc: 0, endOffset: SIZE_SIGNATURE };
    while (chunk.type !== 'IEND') {
      chunk = this.readChunk(chunk.endOffset);
      chunks.push(chunk);
    }
    return chunks;
  }
  getChunkInformation() {
    let results = []
    const chunks = this.getChunks();
    let ihdr = null
    for (const chunk of chunks) {
      console.log(chunk);
      if (chunk.type === 'IHDR') {
        ihdr = this.readIHDRChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, ihdr));
      } else if (chunk.type === 'tRNS') {
        const trns = this.readtRNSChunkData(chunk.dataOffset, chunk.size, ihdr.colorType || 3);
        results.push(Object.assign(chunk, { values: trns }));
      } else if (chunk.type == 'fcTL') {
        const fctl = this.readFctlChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, fctl));
      } else if (chunk.type == 'acTL') {
        const actl = this.readActlChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, actl));
      } else if (chunk.type == 'tEXt') {
        const text = this.readTextChunkData(chunk.dataOffset, chunk.size);
        results.push(Object.assign(chunk, text));
      } else if (chunk.type == 'iTXt') {
        const itxt = this.readItxtChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, itxt));
      } else if (chunk.type == 'cHRM') {
        const chrm = this.readChrmChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, chrm));
      } else if (chunk.type == 'pHYs') {
        const phys = this.readPhysChunkData(chunk.dataOffset);
        results.push(Object.assign(chunk, phys));
      } else if (chunk.type == 'PLTE') {
        const plte = this.readPlteChunkData(chunk.dataOffset, chunk.size);
        results.push(Object.assign(chunk, { values: plte }));
      } else {
        results.push(chunk);
      }
    }
    return results;
  }
  showInformation() {
    const chunks = this.getChunks();
    for (const chunk of chunks) {
      console.log(chunk);
      if (chunk.type === 'IHDR') {
        const ihdr = this.readIHDRChunkData(chunk.dataOffset);
        console.log(ihdr);
      }
    }
  }
}