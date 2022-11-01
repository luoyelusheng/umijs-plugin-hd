# umijs-plugin-hd

[![NPM version](https://img.shields.io/npm/v/umijs-plugin-hd.svg?style=flat)](https://npmjs.org/package/umijs-plugin-hd)
[![NPM downloads](http://img.shields.io/npm/dm/umijs-plugin-hd.svg?style=flat)](https://npmjs.org/package/umijs-plugin-hd)

Mobile HD adaptation solution

## Install

```bash
# or yarn
npm install
```

```bash
npm run build --watch
npm run start
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  mobileHd: {},
  plugins: [
    ['umijs-plugin-hd'],
  ],
}
```

## Options

可用选项

```js
export default {
  mobileHd: {
    "theme": {
      "@hd": "2px" // 默认配置
    },
    "px2rem": {
      "rootValue": 100,
      "unitPrecision": 5,
      "propWhiteList": [],
      "propBlackList": [],
      "exclude": false,
      "selectorBlackList": [],
      "selectorDoubleRemList": [/.adm-/, /.ant-/, /\:root/],
      "ignoreIdentifier": false,
      "replace": true,
      "mediaQuery": false,
      "minPixelValue": 0
    }
  }
```

## LICENSE

MIT
