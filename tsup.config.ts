import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['ts/index.ts'],
  clean: true,
  experimentalDts: true,
})