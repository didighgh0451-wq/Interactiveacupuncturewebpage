import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * figma:asset/xxx.png 가상 모듈 스킴을 빌드에서도 resolve 해주는 플러그인.
 * Figma Make dev 서버는 이 스킴을 런타임에 처리하지만
 * vite build (Rollup) 에선 별도 플러그인이 없어 실패한다.
 * 여기서는 빌드 시에만 동작하며 dev 서버를 통한 URL 로 매핑한다.
 */
function figmaAssetPlugin(): Plugin {
  return {
    name: 'figma-asset-resolver',
    enforce: 'pre',

    // 빌드 시 figma:asset/ 를 가상 모듈로 resolve
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        return '\0' + source          // \0 prefix = Rollup virtual module
      }
    },

    // 가상 모듈의 콘텐츠: default export 로 원래 경로를 반환
    // Figma Make 배포 파이프라인이 이 경로를 CDN URL 로 치환함
    load(id) {
      if (id.startsWith('\0figma:asset/')) {
        const assetPath = id.slice(1)   // '\0' 제거 → 'figma:asset/hash.png'
        // dev 서버에서 resolve 되던 경로를 그대로 export
        return `export default "${assetPath}";`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    figmaAssetPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
