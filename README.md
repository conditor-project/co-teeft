# co-teeft
Script permettant de créer des enrichissments "teeft" (keywords)

## Usages

Ce programme traite des fichiers .json contenant un tableau de docObjects sous la forme :

```json
[
  { ... },
  { ... },
  { ... },
  { ... }
]
```

Pour lancer l'indexation, utiliser la commande suivante :

```sh
$ node index.js --help
Usage: insertEnrichments [options]

Options:
  --input <input>            required   input file
  --output <output>          required   output file
  -h, --help                 display help for command
```

```sh
$ node index.js --input=path/to/my/file.json --output=output.json
# Will create 2 files :
# output.json -> file containing enrichments
# output.indexation.json -> file containing Teeft results
```
