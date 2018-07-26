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
  readtRNSChunkData(offset, size, colorType) {
    if (colorType === 3) {
      return Array(size).fill(0).map((v, i) => this.getUint8(offset + i));
    } else {
      return Array(size / 2).fill(0).map((v, i) => this.getUint16(offset + (i * 2)));
    }
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