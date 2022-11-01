import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { logger, Mustache, winPath } from "@umijs/utils";
import type { IApi } from "umi";
// @ts-ignore 暂时屏蔽
import px2rem from "../compiled/postcss-plugin-px2rem";

const DIR_NAME = "plugin-mobile-hd";

/**
 * @description
 * - `'javascript'`: try to match the file with extname `.{ts(x)|js(x)}`
 * - `'css'`: try to match the file with extname `.{less|sass|scss|stylus|css}`
 */
type FileType = "javascript" | "css";

interface IGetFileOpts {
  base: string;
  type: FileType;
  fileNameWithoutExt: string;
}

const extsMap: Record<FileType, string[]> = {
  javascript: [".ts", ".tsx", ".js", ".jsx"],
  css: [".less", ".sass", ".scss", ".stylus", ".css"],
};

/**
 * @param {IGetFileOpts} opts
 * Try to match the exact extname of the file in a specific directory.
 * @returns {any}
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
export function getFile(opts: IGetFileOpts) {
  const exts = extsMap[opts.type];
  for (const ext of exts) {
    const filename = `${opts.fileNameWithoutExt}${ext}`;
    const path = winPath(join(opts.base, filename));
    if (existsSync(path)) {
      return {
        path,
        filename,
      };
    }
  }
  return null;
}

export default (api: IApi) => {
  const enableBy = (opts: any) => {
    return !!opts.config.mobileHd;
  };
  api.describe({
    key: "mobileHd",
    config: {
      schema(joi) {
        return joi.object({
          theme: joi.object(),
          px2rem: joi.object(),
        });
      },
    },
    enableBy,
  });
  // only dev or build running
  if (!["dev", "build"].includes(api.name)) return;

  api.onStart(() => {
    api.skipPlugins(["hd"]);
    logger.info("Using mobileHd Plugin");
  });
  api.modifyDefaultConfig((config) => {
    const draftConfig = config;
    const { theme, px2rem: configPx2rem } = api.userConfig?.hd || {};
    draftConfig.theme = {
      ...(draftConfig.theme || {}),
      "@hd": "2px",
      ...(theme || {}),
    };
    draftConfig.extraPostCSSPlugins = [
      ...(draftConfig.extraPostCSSPlugins || []),
      px2rem({
        rootValue: 100,
        minPixelValue: 2,
        // eslint-disable-next-line no-useless-escape
        selectorDoubleRemList: [/.adm-/, /.ant-/, /\:root/],
        ...(configPx2rem || {}),
      }),
    ];
    return draftConfig;
  });

  // 生成临时文件
  api.onGenerateFiles({
    fn() {
      const hdTpl = readFileSync(
        join(__dirname, "..", "templates", "index.tpl"),
        "utf-8"
      );
      api.writeTmpFile({
        path: `${DIR_NAME}/index.tsx`,
        noPluginDir: true,
        content: Mustache.render(hdTpl, {}),
      });
    },
  });

  api.addEntryImports(() => {
    // src/hd.(tsx|ts|jsx|js)
    const hdFile = getFile({
      base: api.paths.absSrcPath || "",
      type: "javascript",
      fileNameWithoutExt: "hd",
    });

    return [
      {
        source: hdFile
          ? require.resolve(hdFile.path)
          : join(api.paths.absTmpPath, DIR_NAME, "index.tsx"),
      },
    ];
  });
};
