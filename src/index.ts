import yargs from 'yargs/yargs'
import { findOwnedFiles } from "./find-owned";
import { migrate } from "./migrate";

yargs(process.argv.slice(2))
  .command({
    command: 'migrate',
    describe: 'Copy files and hierarchy ',
    builder: (yargs) => {
      return yargs
        .usage('$0 migrate [Options]')
        .example(
          '$0 migrate --source="mySourceFolder" --dest="migrationDest"',
          'Copy files from "mySourceFolder" to "migrationDest"')
        .options({
          source: { type: 'string', default: 'migrationSource', description: 'Migration source folder' },
          dest: { type: 'string', default: 'migrationDest', description: 'Migration destination folder' }
        })
    },
    handler: async (argv) => {
      const sourceDir = argv.source
      const destDir = argv.dest
      await migrate(sourceDir, destDir)
    }
  })
  .command({
    command: 'find-owned',
    describe: 'List files owned by email',
    builder: (yargs) => {
      return yargs
        .usage('$0 find-owned [Options]')
        .example('$0 file-owned --owner="owner@mydomain"', 'List files owned by email')
        .options({
          owner: { type: 'string', demandOption: true, description: 'Owner email' }
        })
    },
    handler: async (argv) => {
      const email = argv.owner

      const files = await findOwnedFiles(email)

      files.map((file) => console.log(`${file.id}\t${file.name}`))
    }
  })
  .demandCommand(1, 1)
  .help('h')
  .alias('h', 'help')
  .parseAsync()
  .catch(console.log)
