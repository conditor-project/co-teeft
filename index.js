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
  .option("--conf <conf>", colors.yellow(colors.bold("required")) + "   conf file", "conf.default.json")
  .parse(process.argv);

let globalConf;

try {
  if (!fs.statSync(program.input).isFile()) {
    console.log('invalid value of --input : "' + program.input + '" is not a file.');
    process.exit(0);
  }
  if (!fs.statSync(program.conf).isFile()) {
    console.log('invalid value of --conf : "' + program.conf + '" is not a file.');
    process.exit(0);
  } else globalConf = JSON.parse(fs.readFileSync(program.conf, "utf-8").toString());
  if (typeof globalConf !== "object" || !globalConf.conf || !Array.isArray(globalConf.langages)) {
    console.log(
      program.conf + " do not contain required data (see https://github.com/conditor-project/co-teeft#readme)"
    );
    process.exit(0);
  }
} catch (err) {
  console.log(err);
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
    for (let key in globalConf.conf) {
      let conf = globalConf.conf[key],
        id = _.get(chunk.value, conf.id, undefined),
        text = conf.data.map((item) => _.get(chunk.value, item, "")).join(".");
      if (text.length > conf.data.length - 1) {
        let indexation = indexator[key].index(text, { sort: true, truncate: true }),
          enrichment = {
            selectors: _.transform(
              conf.enrichment.selectors,
              function (accumulator, selector) {
                let values = _.get(chunk.value, selector, undefined);
                if (typeof values !== "undefined") accumulator.push({ selector: selector, values: [values] });
              },
              []
            ),
            target: conf.target,
            value: indexation.keywords
          };
        if (indexation.keywords.length > 0 && enrichment.selectors.length > 0) {
          console.log(id + " : " + indexation.keywords.map((item) => item.term).join(","));
          outputIndexStream.write(
            (this.first ? "" : ",\n") + JSON.stringify({ selectors: enrichment.selectors, indexation: indexation })
          );
          outputStream.write((this.first ? "" : ",\n") + JSON.stringify(enrichment));
          this.first = false;
        } else {
          console.log(
            [
              id,
              ":",
              indexation.keywords.length <= 0 ? "No selectors found" : "",
              enrichment.selectors.length <= 0 ? " No selectors found" : ""
            ].join(" ")
          );
        }
      } else console.log(id + " : No text found in given properties (" + conf.data.join(",") + ")");
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
