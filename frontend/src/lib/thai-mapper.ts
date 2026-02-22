export const thaiToEnglishMap: Record<string, string> = {
    'ๅ': '1', 'ภ': '4', 'ถ': '5', 'ุ': '6', 'ึ': '7', 'ค': '8', 'ต': '9', 'จ': '0',
    'ข': '-', 'ช': '=', 'ๆ': 'q', 'ไ': 'w', 'ำ': 'e', 'พ': 'r', 'ะ': 't', 'ั': 'y', 'ี': 'u', 'ร': 'i',
    'น': 'o', 'ย': 'p', 'บ': '[', 'ล': ']', 'ฟ': 'a', 'ห': 's', 'ก': 'd', 'ด': 'f', 'เ': 'g', '้': 'h',
    '่': 'j', 'า': 'k', 'ส': 'l', 'ว': ';', 'ง': '\'', 'ผ': 'z', 'ป': 'x', 'แ': 'c', 'อ': 'v', 'ิ': 'b',
    'ื': 'n', 'ท': 'm', 'ม': ',', 'ใ': '.', 'ฝ': '/',
    '๑': '@', '๒': '#', '๓': '$', '๔': '%', 'ู': '^', '฿': '&', '๕': '*', '๖': '(', '๗': ')',
    '๘': '_', '๙': '+', '๐': 'Q', 'ฎ': 'E', 'ฑ': 'R', 'ธ': 'T', 'ํ': 'Y', '๊': 'U', 'ณ': 'I',
    'ฯ': 'O', 'ญ': 'P', 'ฐ': '{', 'ฤ': 'A', 'ฆ': 'S', 'ฏ': 'D', 'โ': 'F', 'ฌ': 'G', '็': 'H',
    '๋': 'J', 'ษ': 'K', 'ศ': 'L', 'ซ': ':', 'ฉ': 'C', 'ฮ': 'V', 'ฺ': 'B',
    '์': 'N', 'ฒ': '<', 'ฬ': '>', 'ฦ': '?'
};

export function convertThaiToEng(text: string): string {
    return text.split('').map(char => {
        // Only convert actual Thai characters (Unicode range \u0E00-\u0E7F)
        // Leave ASCII characters as-is so '-', '/', '.', etc. are preserved
        if (char.charCodeAt(0) >= 0x0E00 && char.charCodeAt(0) <= 0x0E7F) {
            return thaiToEnglishMap[char] || char;
        }
        return char;
    }).join('');
}
