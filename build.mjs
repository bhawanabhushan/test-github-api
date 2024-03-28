/* eslint-disable */
import { build } from "esbuild";
import { glob } from "glob";
const files = await glob("tests/specs/*.ts");

await build({
	format: "cjs",
	target: "esnext",
	platform: "node",
	outdir: "output/",
	external: ["axios"],
	entryPoints: files,
	bundle: true,
});
