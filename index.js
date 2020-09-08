/**
 * @prettier
 */
"use strict";

/* Module Require */
const StreamArray = require("stream-json/streamers/StreamArray"),
  lexicon = require("./resources/lexicon.json"),
  stopwords = {
    fr: require("./resources/stopwords.fr.json"),
    en: require("./resources/stopwords.en.json")
  },
  NlpjsTFr = require("nlp-js-tools-french"),
  snowballFactory = require("snowball-stemmers"),
  program = require("commander"),
  _ = require("lodash"),
  fs = require("fs"),
  async = require("async"),
  Teeft = require("tdm-teeft"),
  stream = require("stream"),
  colors = require("colors/safe");

program
  .requiredOption("--input <input>", colors.yellow(colors.bold("required")) + "   input file")
  .requiredOption("--output <output>", colors.yellow(colors.bold("required")) + "   output file")
  .parse(process.argv);

try {
  if (!fs.statSync(program.input).isFile()) {
    console.log('invalid value of --input : "' + program.input + '" is not a file.');
    process.exit(0);
  }
} catch {
  console.log('invalid value of --input : "' + program.input + '" is an invalid path.');
  process.exit(0);
}

try {
  fs.unlinkSync(program.output);
  fs.unlinkSync(program.output.replace(".json", "") + ".indexation.json");
} catch (err) {
  // handle the error
  if (err.errno !== -2) {
    console.log(err);
    process.exit();
  }
}

class MyWritable extends stream.Writable {
  constructor(options = {}) {
    super(options);
    this.first = true;
  }
  write(chunk) {
    if (_.has(chunk.value, "abstract.fr")) {
      let textFr = _.has(chunk.value, "title.fr") ? chunk.value.title.fr : "" + chunk.value.abstract.fr,
        indexationFR = indexator.fr.index(textFr, { sort: true, truncate: true }),
        keywordsFR = indexationFR.keywords,
        enrichmentFR = {
          selectors: [{ selector: "sourceUid", values: [chunk.value.sourceUid] }],
          target: { from: "parent", selector: "", key: "enrichments.keywords.fr" },
          value: keywordsFR
        };
      console.log(chunk.value.sourceUid + " : " + keywordsFR.map((item) => item.term).join(","));
      outputIndexStream.write((this.first ? "" : ",\n") + JSON.stringify(indexationFR));
      outputStream.write((this.first ? "" : ",\n") + JSON.stringify(enrichmentFR));
      this.first = false;
    }
    if (_.has(chunk.value, "abstract.en")) {
      let textEN = _.has(chunk.value, "title.en") ? chunk.value.title.en : "" + chunk.value.abstract.en,
        indexationEN = indexator.en.index(textEN, { sort: true, truncate: true }),
        keywordsEN = indexationEN.keywords,
        enrichmentEN = {
          selectors: [{ selector: "sourceUid", values: [chunk.value.sourceUid] }],
          target: { from: "parent", selector: "", key: "enrichments.keywords.en" },
          value: keywordsEN
        };
      console.log(chunk.value.sourceUid + " : " + keywordsEN.map((item) => item.term).join(","));
      outputIndexStream.write((this.first ? "" : ",\n") + JSON.stringify(indexationEN));
      outputStream.write((this.first ? "" : ",\n") + JSON.stringify(enrichmentEN));
      this.first = false;
    }
  }
}

const translateTag = function (tag) {
  if (tag === "noun") return "nom";
  else if (tag === "verb") return "ver";
  else return tag;
};

let options = {
    fr: {
      stopwords: stopwords.fr,
      lexicon: lexicon,
      stemmer: snowballFactory.newStemmer("french"),
      lemmatizer: {
        lemmas: function (term, tag) {
          let nlpToolsFr = new NlpjsTFr(term, { tagTypes: [translateTag(tag)] }),
            lemmatization = nlpToolsFr.lemmatizer(),
            lemma =
              lemmatization.length > 0
                ? lemmatization
                    .map((item) => item.lemma)
                    .sort()
                    .join(":")
                : term;
          return [[lemma, tag]];
        }
      }
    },
    en: {
      stopwords: stopwords.en
    }
  },
  indexator = {
    en: new Teeft.Indexator(options.en),
    fr: new Teeft.Indexator(options.fr)
  };

const outputStream = fs.createWriteStream(program.output, { flags: "a" }),
  outputIndexStream = fs.createWriteStream(program.output.replace(".json", "") + ".indexation.json", { flags: "a" }),
  jsonStream = StreamArray.withParser(),
  teeftStream = new MyWritable({ autoDestroy: true });

outputStream.write("[\n");
outputIndexStream.write("[\n");

fs.createReadStream(program.input).pipe(jsonStream.input);
jsonStream.pipe(teeftStream);

teeftStream.on("finish", function () {
  outputStream.write("\n]");
  outputIndexStream.write("\n]");
});
