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

Pour lancer l'indexation, utiliser les commandes suivantes :

```sh
$ node index.js --help
Usage: index [options]

Options:
  --input <input>    required   input file
  --output <output>  required   output file
  --conf <conf>      required   conf file (default: "conf.default.json")
  -h, --help         output usage information
```

```sh
$ node index.js --input=path/to/my/file.json --output=output.json
# Will create 2 files :
# output.json -> file containing enrichments (you could inserted it into mongodb)
# output.indexation.json -> file containing Teeft results (usefull to get more infos and not just keywords)
```

## Configuration ##

Le fichier de configuration devra ressembler à :

```js
{
  "langages": [
    "en",                 // enable english indexation, remove it if you don't need it
    "fr"                  // enable french indexation, remove it if you don't need it
  ],
  "conf": {
    "fr": {
      "id": "sourceUid",   // Identifier of document (used for logs)
      "data": [            // Selectors of parts of text you want to process
        "title.fr",
        "abstract.fr"
      ],
      "enrichment": {      // Enrichment informations
        "selectors": [         // Selectors used to identify document (used to build 'selectors' property of enrichment object)
          "sourceUid"
        ],
        "target": {            // Target of enrichment (used to build 'target' property of enrichment object)
          "from": "parent",
          "selector": "",
          "key": "enrichments.keywords.fr"
        }
      }
    },
    "en": {
      "id": "sourceUid",
      "data": [
        "title.en",
        "abstract.en"
      ],
      "enrichment": {
        "selectors": [
          "sourceUid"
        ],
        "target": {
          "from": "parent",
          "selector": "",
          "key": "enrichments.keywords.en"
        }
      }
    }
  }
}
```

Toutes ces informations permettront au programme de créer les données d'enrichissements comme :

```json
{
  "selectors": [
    {
      "selector": "sourceUid",
      "values": [
        "hal$halshs-00961648"
      ]
    }
  ],
  "target": {
    "from": "parent",
    "selector": "",
    "key": "enrichments.keywords.fr"
  },
  "value": [
    {
      "frequency": 30,
      "strength": 1,
      "specificity": 1,
      "probability": 0.11952191235059761,
      "term": "social"
    },
    {
      "frequency": 19,
      "strength": 1,
      "specificity": 0.6333333333333333,
      "probability": 0.07569721115537849,
      "term": "sociabilité"
    },
    {
      "frequency": 15,
      "strength": 1,
      "specificity": 0.5,
      "probability": 0.05976095617529881,
      "term": "lien"
    },
    {
      "frequency": 10,
      "strength": 1,
      "specificity": 0.3333333333333333,
      "probability": 0.0398406374501992,
      "term": "réseaux"
    },
    {
      "frequency": 9,
      "strength": 1,
      "specificity": 0.3,
      "probability": 0.035856573705179286,
      "term": "technologie"
    },
    {
      "frequency": 8,
      "strength": 1,
      "specificity": 0.2666666666666666,
      "probability": 0.03187250996015936,
      "term": "relation"
    },
    {
      "frequency": 8,
      "strength": 2,
      "specificity": 0.2666666666666666,
      "probability": 0.03187250996015936,
      "term": "réseaux social"
    },
    {
      "frequency": 7,
      "strength": 2,
      "specificity": 0.23333333333333328,
      "probability": 0.027888446215139442,
      "term": "lien social"
    },
    {
      "frequency": 7,
      "strength": 1,
      "specificity": 0.23333333333333328,
      "probability": 0.027888446215139442,
      "term": "nouvelle"
    },
    {
      "frequency": 6,
      "strength": 1,
      "specificity": 0.19999999999999998,
      "probability": 0.02390438247011952,
      "term": "fracture"
    },
    {
      "frequency": 6,
      "strength": 1,
      "specificity": 0.19999999999999998,
      "probability": 0.02390438247011952,
      "term": "déclin"
    },
    {
      "frequency": 6,
      "strength": 1,
      "specificity": 0.19999999999999998,
      "probability": 0.02390438247011952,
      "term": "communication"
    },
    {
      "frequency": 5,
      "strength": 2,
      "specificity": 0.16666666666666666,
      "probability": 0.0199203187250996,
      "term": "nouvelle technologie"
    },
    {
      "frequency": 5,
      "strength": 1,
      "specificity": 0.16666666666666666,
      "probability": 0.0199203187250996,
      "term": "affaiblissement"
    },
    {
      "frequency": 5,
      "strength": 1,
      "specificity": 0.16666666666666666,
      "probability": 0.0199203187250996,
      "term": "ligne"
    },
    {
      "frequency": 5,
      "strength": 1,
      "specificity": 0.16666666666666666,
      "probability": 0.0199203187250996,
      "term": "internet"
    },
    {
      "frequency": 5,
      "strength": 1,
      "specificity": 0.16666666666666666,
      "probability": 0.0199203187250996,
      "term": "groupe"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "transformation"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "classe"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "distance"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "vision"
    },
    {
      "frequency": 4,
      "strength": 2,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "fracture numérique"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "années"
    },
    {
      "frequency": 4,
      "strength": 1,
      "specificity": 0.1333333333333333,
      "probability": 0.01593625498007968,
      "term": "numérique"
    },
    {
      "frequency": 3,
      "strength": 2,
      "specificity": 0.09999999999999999,
      "probability": 0.01195219123505976,
      "term": "capital social"
    },
    {
      "frequency": 3,
      "strength": 2,
      "specificity": 0.09999999999999999,
      "probability": 0.01195219123505976,
      "term": "lien faible"
    }
  ]
}
```
