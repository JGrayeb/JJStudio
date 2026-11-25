import { verifyPreparedStage } from "./release-stage-policy.mjs"
import { ReleaseError } from "./release-policy.mjs"
try {
  if (process.argv.length !== 3) throw new ReleaseError("Indica únicamente la carpeta stage exacta: npm run release:verify-stage -- RUTA")
  console.log(JSON.stringify(await verifyPreparedStage({ stagePath: process.argv[2] })))
} catch (error) {
  console.error(error instanceof ReleaseError ? error.message : "No se pudo verificar la preparación. No la publiques.")
  process.exitCode = 1
}
