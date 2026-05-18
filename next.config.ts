import type { NextConfig } from "next";

/**
 * mind-ar 1.2.5 contains a `require("fs")` call gated by a runtime
 * `IS_NODE` check, plus a few other Node-only imports. Bundlers see those
 * statically and refuse to build for the browser. We alias them to an
 * empty module so they tree-shake away on the client.
 *
 * Turbopack on Windows can't resolve absolute paths in `resolveAlias` yet,
 * so we use a project-root-relative path with forward slashes.
 */
const emptyShim = "./shims/empty.mjs";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: { browser: emptyShim },
      path: { browser: emptyShim },
      crypto: { browser: emptyShim },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
