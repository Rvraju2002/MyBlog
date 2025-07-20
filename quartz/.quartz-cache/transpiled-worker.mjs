var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// quartz/worker.ts
import sourceMapSupport from "source-map-support";

// quartz/plugins/transformers/frontmatter.ts
import matter from "gray-matter";
import remarkFrontmatter from "remark-frontmatter";
import yaml from "js-yaml";
import toml from "toml";

// quartz/util/path.ts
import { slug as slugAnchor } from "github-slugger";
import rfdc from "rfdc";
var clone = rfdc();
var QUARTZ = "quartz";
function isRelativeURL(s) {
  const validStart = /^\.{1,2}/.test(s);
  const validEnding = !endsWith(s, "index");
  return validStart && validEnding && ![".md", ".html"].includes(_getFileExtension(s) ?? "");
}
__name(isRelativeURL, "isRelativeURL");
function sluggify(s) {
  return s.split("/").map(
    (segment) => segment.replace(/\s/g, "-").replace(/&/g, "-and-").replace(/%/g, "-percent").replace(/\?/g, "").replace(/#/g, "")
  ).join("/").replace(/\/$/, "");
}
__name(sluggify, "sluggify");
function slugifyFilePath(fp, excludeExt) {
  fp = stripSlashes(fp);
  let ext = _getFileExtension(fp);
  const withoutFileExt = fp.replace(new RegExp(ext + "$"), "");
  if (excludeExt || [".md", ".html", void 0].includes(ext)) {
    ext = "";
  }
  let slug = sluggify(withoutFileExt);
  if (endsWith(slug, "_index")) {
    slug = slug.replace(/_index$/, "index");
  }
  return slug + ext;
}
__name(slugifyFilePath, "slugifyFilePath");
function simplifySlug(fp) {
  const res = stripSlashes(trimSuffix(fp, "index"), true);
  return res.length === 0 ? "/" : res;
}
__name(simplifySlug, "simplifySlug");
function transformInternalLink(link) {
  let [fplike, anchor] = splitAnchor(decodeURI(link));
  const folderPath = isFolderPath(fplike);
  let segments = fplike.split("/").filter((x) => x.length > 0);
  let prefix = segments.filter(isRelativeSegment).join("/");
  let fp = segments.filter((seg) => !isRelativeSegment(seg) && seg !== "").join("/");
  const simpleSlug = simplifySlug(slugifyFilePath(fp));
  const joined = joinSegments(stripSlashes(prefix), stripSlashes(simpleSlug));
  const trail = folderPath ? "/" : "";
  const res = _addRelativeToStart(joined) + trail + anchor;
  return res;
}
__name(transformInternalLink, "transformInternalLink");
var _rebaseHastElement = /* @__PURE__ */ __name((el, attr, curBase, newBase) => {
  if (el.properties?.[attr]) {
    if (!isRelativeURL(String(el.properties[attr]))) {
      return;
    }
    const rel = joinSegments(resolveRelative(curBase, newBase), "..", el.properties[attr]);
    el.properties[attr] = rel;
  }
}, "_rebaseHastElement");
function normalizeHastElement(rawEl, curBase, newBase) {
  const el = clone(rawEl);
  _rebaseHastElement(el, "src", curBase, newBase);
  _rebaseHastElement(el, "href", curBase, newBase);
  if (el.children) {
    el.children = el.children.map(
      (child) => normalizeHastElement(child, curBase, newBase)
    );
  }
  return el;
}
__name(normalizeHastElement, "normalizeHastElement");
function pathToRoot(slug) {
  let rootPath = slug.split("/").filter((x) => x !== "").slice(0, -1).map((_) => "..").join("/");
  if (rootPath.length === 0) {
    rootPath = ".";
  }
  return rootPath;
}
__name(pathToRoot, "pathToRoot");
function resolveRelative(current, target) {
  const res = joinSegments(pathToRoot(current), simplifySlug(target));
  return res;
}
__name(resolveRelative, "resolveRelative");
function splitAnchor(link) {
  let [fp, anchor] = link.split("#", 2);
  if (fp.endsWith(".pdf")) {
    return [fp, anchor === void 0 ? "" : `#${anchor}`];
  }
  anchor = anchor === void 0 ? "" : "#" + slugAnchor(anchor);
  return [fp, anchor];
}
__name(splitAnchor, "splitAnchor");
function slugTag(tag) {
  return tag.split("/").map((tagSegment) => sluggify(tagSegment)).join("/");
}
__name(slugTag, "slugTag");
function joinSegments(...args) {
  return args.filter((segment) => segment !== "").join("/").replace(/\/\/+/g, "/");
}
__name(joinSegments, "joinSegments");
function getAllSegmentPrefixes(tags) {
  const segments = tags.split("/");
  const results = [];
  for (let i = 0; i < segments.length; i++) {
    results.push(segments.slice(0, i + 1).join("/"));
  }
  return results;
}
__name(getAllSegmentPrefixes, "getAllSegmentPrefixes");
function transformLink(src, target, opts) {
  let targetSlug = transformInternalLink(target);
  if (opts.strategy === "relative") {
    return targetSlug;
  } else {
    const folderTail = isFolderPath(targetSlug) ? "/" : "";
    const canonicalSlug = stripSlashes(targetSlug.slice(".".length));
    let [targetCanonical, targetAnchor] = splitAnchor(canonicalSlug);
    if (opts.strategy === "shortest") {
      const matchingFileNames = opts.allSlugs.filter((slug) => {
        const parts = slug.split("/");
        const fileName = parts.at(-1);
        return targetCanonical === fileName;
      });
      if (matchingFileNames.length === 1) {
        const targetSlug2 = matchingFileNames[0];
        return resolveRelative(src, targetSlug2) + targetAnchor;
      }
    }
    return joinSegments(pathToRoot(src), canonicalSlug) + folderTail;
  }
}
__name(transformLink, "transformLink");
function isFolderPath(fplike) {
  return fplike.endsWith("/") || endsWith(fplike, "index") || endsWith(fplike, "index.md") || endsWith(fplike, "index.html");
}
__name(isFolderPath, "isFolderPath");
function endsWith(s, suffix) {
  return s === suffix || s.endsWith("/" + suffix);
}
__name(endsWith, "endsWith");
function trimSuffix(s, suffix) {
  if (endsWith(s, suffix)) {
    s = s.slice(0, -suffix.length);
  }
  return s;
}
__name(trimSuffix, "trimSuffix");
function _getFileExtension(s) {
  return s.match(/\.[A-Za-z0-9]+$/)?.[0];
}
__name(_getFileExtension, "_getFileExtension");
function isRelativeSegment(s) {
  return /^\.{0,2}$/.test(s);
}
__name(isRelativeSegment, "isRelativeSegment");
function stripSlashes(s, onlyStripPrefix) {
  if (s.startsWith("/")) {
    s = s.substring(1);
  }
  if (!onlyStripPrefix && s.endsWith("/")) {
    s = s.slice(0, -1);
  }
  return s;
}
__name(stripSlashes, "stripSlashes");
function _addRelativeToStart(s) {
  if (s === "") {
    s = ".";
  }
  if (!s.startsWith(".")) {
    s = joinSegments(".", s);
  }
  return s;
}
__name(_addRelativeToStart, "_addRelativeToStart");

// quartz/i18n/locales/en-US.ts
var en_US_default = {
  propertyDefaults: {
    title: "Untitled",
    description: "No description provided"
  },
  components: {
    callout: {
      note: "Note",
      abstract: "Abstract",
      info: "Info",
      todo: "Todo",
      tip: "Tip",
      success: "Success",
      question: "Question",
      warning: "Warning",
      failure: "Failure",
      danger: "Danger",
      bug: "Bug",
      example: "Example",
      quote: "Quote"
    },
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "No backlinks found"
    },
    themeToggle: {
      lightMode: "Light mode",
      darkMode: "Dark mode"
    },
    explorer: {
      title: "Explorer"
    },
    footer: {
      createdWith: "Created with"
    },
    graph: {
      title: "Graph View"
    },
    recentNotes: {
      title: "Recent Notes",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `See ${remaining} more \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transclude of ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link to original"
    },
    search: {
      title: "Search",
      searchBarPlaceholder: "Search for something"
    },
    tableOfContents: {
      title: "Table of Contents"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min read`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Recent notes",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Last ${count} notes`, "lastFewNotes")
    },
    error: {
      title: "Not Found",
      notFound: "Either this page is private or doesn't exist.",
      home: "Return to Homepage"
    },
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item under this folder." : `${count} items under this folder.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Tag",
      tagIndex: "Tag Index",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item with this tag." : `${count} items with this tag.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Showing first ${count} tags.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Found ${count} total tags.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/en-GB.ts
var en_GB_default = {
  propertyDefaults: {
    title: "Untitled",
    description: "No description provided"
  },
  components: {
    callout: {
      note: "Note",
      abstract: "Abstract",
      info: "Info",
      todo: "To-Do",
      tip: "Tip",
      success: "Success",
      question: "Question",
      warning: "Warning",
      failure: "Failure",
      danger: "Danger",
      bug: "Bug",
      example: "Example",
      quote: "Quote"
    },
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "No backlinks found"
    },
    themeToggle: {
      lightMode: "Light mode",
      darkMode: "Dark mode"
    },
    explorer: {
      title: "Explorer"
    },
    footer: {
      createdWith: "Created with"
    },
    graph: {
      title: "Graph View"
    },
    recentNotes: {
      title: "Recent Notes",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `See ${remaining} more \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transclude of ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link to original"
    },
    search: {
      title: "Search",
      searchBarPlaceholder: "Search for something"
    },
    tableOfContents: {
      title: "Table of Contents"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min read`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Recent notes",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Last ${count} notes`, "lastFewNotes")
    },
    error: {
      title: "Not Found",
      notFound: "Either this page is private or doesn't exist.",
      home: "Return to Homepage"
    },
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item under this folder." : `${count} items under this folder.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Tag",
      tagIndex: "Tag Index",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item with this tag." : `${count} items with this tag.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Showing first ${count} tags.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Found ${count} total tags.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/fr-FR.ts
var fr_FR_default = {
  propertyDefaults: {
    title: "Sans titre",
    description: "Aucune description fournie"
  },
  components: {
    callout: {
      note: "Note",
      abstract: "R\xE9sum\xE9",
      info: "Info",
      todo: "\xC0 faire",
      tip: "Conseil",
      success: "Succ\xE8s",
      question: "Question",
      warning: "Avertissement",
      failure: "\xC9chec",
      danger: "Danger",
      bug: "Bogue",
      example: "Exemple",
      quote: "Citation"
    },
    backlinks: {
      title: "Liens retour",
      noBacklinksFound: "Aucun lien retour trouv\xE9"
    },
    themeToggle: {
      lightMode: "Mode clair",
      darkMode: "Mode sombre"
    },
    explorer: {
      title: "Explorateur"
    },
    footer: {
      createdWith: "Cr\xE9\xE9 avec"
    },
    graph: {
      title: "Vue Graphique"
    },
    recentNotes: {
      title: "Notes R\xE9centes",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Voir ${remaining} de plus \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transclusion de ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Lien vers l'original"
    },
    search: {
      title: "Recherche",
      searchBarPlaceholder: "Rechercher quelque chose"
    },
    tableOfContents: {
      title: "Table des Mati\xE8res"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min de lecture`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Notes r\xE9centes",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Les derni\xE8res ${count} notes`, "lastFewNotes")
    },
    error: {
      title: "Introuvable",
      notFound: "Cette page est soit priv\xE9e, soit elle n'existe pas.",
      home: "Retour \xE0 la page d'accueil"
    },
    folderContent: {
      folder: "Dossier",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 \xE9l\xE9ment sous ce dossier." : `${count} \xE9l\xE9ments sous ce dossier.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\xC9tiquette",
      tagIndex: "Index des \xE9tiquettes",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 \xE9l\xE9ment avec cette \xE9tiquette." : `${count} \xE9l\xE9ments avec cette \xE9tiquette.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Affichage des premi\xE8res ${count} \xE9tiquettes.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Trouv\xE9 ${count} \xE9tiquettes au total.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/it-IT.ts
var it_IT_default = {
  propertyDefaults: {
    title: "Senza titolo",
    description: "Nessuna descrizione"
  },
  components: {
    callout: {
      note: "Nota",
      abstract: "Astratto",
      info: "Info",
      todo: "Da fare",
      tip: "Consiglio",
      success: "Completato",
      question: "Domanda",
      warning: "Attenzione",
      failure: "Errore",
      danger: "Pericolo",
      bug: "Bug",
      example: "Esempio",
      quote: "Citazione"
    },
    backlinks: {
      title: "Link entranti",
      noBacklinksFound: "Nessun link entrante"
    },
    themeToggle: {
      lightMode: "Tema chiaro",
      darkMode: "Tema scuro"
    },
    explorer: {
      title: "Esplora"
    },
    footer: {
      createdWith: "Creato con"
    },
    graph: {
      title: "Vista grafico"
    },
    recentNotes: {
      title: "Note recenti",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Vedi ${remaining} altro \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transclusione di ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link all'originale"
    },
    search: {
      title: "Cerca",
      searchBarPlaceholder: "Cerca qualcosa"
    },
    tableOfContents: {
      title: "Tabella dei contenuti"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} minuti`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Note recenti",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Ultime ${count} note`, "lastFewNotes")
    },
    error: {
      title: "Non trovato",
      notFound: "Questa pagina \xE8 privata o non esiste.",
      home: "Ritorna alla home page"
    },
    folderContent: {
      folder: "Cartella",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 oggetto in questa cartella." : `${count} oggetti in questa cartella.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Etichetta",
      tagIndex: "Indice etichette",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 oggetto con questa etichetta." : `${count} oggetti con questa etichetta.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Prime ${count} etichette.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Trovate ${count} etichette totali.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/ja-JP.ts
var ja_JP_default = {
  propertyDefaults: {
    title: "\u7121\u984C",
    description: "\u8AAC\u660E\u306A\u3057"
  },
  components: {
    callout: {
      note: "\u30CE\u30FC\u30C8",
      abstract: "\u6284\u9332",
      info: "\u60C5\u5831",
      todo: "\u3084\u308B\u3079\u304D\u3053\u3068",
      tip: "\u30D2\u30F3\u30C8",
      success: "\u6210\u529F",
      question: "\u8CEA\u554F",
      warning: "\u8B66\u544A",
      failure: "\u5931\u6557",
      danger: "\u5371\u967A",
      bug: "\u30D0\u30B0",
      example: "\u4F8B",
      quote: "\u5F15\u7528"
    },
    backlinks: {
      title: "\u30D0\u30C3\u30AF\u30EA\u30F3\u30AF",
      noBacklinksFound: "\u30D0\u30C3\u30AF\u30EA\u30F3\u30AF\u306F\u3042\u308A\u307E\u305B\u3093"
    },
    themeToggle: {
      lightMode: "\u30E9\u30A4\u30C8\u30E2\u30FC\u30C9",
      darkMode: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9"
    },
    explorer: {
      title: "\u30A8\u30AF\u30B9\u30D7\u30ED\u30FC\u30E9\u30FC"
    },
    footer: {
      createdWith: "\u4F5C\u6210"
    },
    graph: {
      title: "\u30B0\u30E9\u30D5\u30D3\u30E5\u30FC"
    },
    recentNotes: {
      title: "\u6700\u8FD1\u306E\u8A18\u4E8B",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `\u3055\u3089\u306B${remaining}\u4EF6 \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `${targetSlug}\u306E\u307E\u3068\u3081`, "transcludeOf"),
      linkToOriginal: "\u5143\u8A18\u4E8B\u3078\u306E\u30EA\u30F3\u30AF"
    },
    search: {
      title: "\u691C\u7D22",
      searchBarPlaceholder: "\u691C\u7D22\u30EF\u30FC\u30C9\u3092\u5165\u529B"
    },
    tableOfContents: {
      title: "\u76EE\u6B21"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min read`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u6700\u8FD1\u306E\u8A18\u4E8B",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\u6700\u65B0\u306E${count}\u4EF6`, "lastFewNotes")
    },
    error: {
      title: "Not Found",
      notFound: "\u30DA\u30FC\u30B8\u304C\u5B58\u5728\u3057\u306A\u3044\u304B\u3001\u975E\u516C\u958B\u8A2D\u5B9A\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002",
      home: "\u30DB\u30FC\u30E0\u30DA\u30FC\u30B8\u306B\u623B\u308B"
    },
    folderContent: {
      folder: "\u30D5\u30A9\u30EB\u30C0",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => `${count}\u4EF6\u306E\u30DA\u30FC\u30B8`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u30BF\u30B0",
      tagIndex: "\u30BF\u30B0\u4E00\u89A7",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => `${count}\u4EF6\u306E\u30DA\u30FC\u30B8`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u306E\u3046\u3061\u6700\u521D\u306E${count}\u4EF6\u3092\u8868\u793A\u3057\u3066\u3044\u307E\u3059`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\u5168${count}\u500B\u306E\u30BF\u30B0\u3092\u8868\u793A\u4E2D`, "totalTags")
    }
  }
};

// quartz/i18n/locales/de-DE.ts
var de_DE_default = {
  propertyDefaults: {
    title: "Unbenannt",
    description: "Keine Beschreibung angegeben"
  },
  components: {
    callout: {
      note: "Hinweis",
      abstract: "Zusammenfassung",
      info: "Info",
      todo: "Zu erledigen",
      tip: "Tipp",
      success: "Erfolg",
      question: "Frage",
      warning: "Warnung",
      failure: "Misserfolg",
      danger: "Gefahr",
      bug: "Fehler",
      example: "Beispiel",
      quote: "Zitat"
    },
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Keine Backlinks gefunden"
    },
    themeToggle: {
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    },
    explorer: {
      title: "Explorer"
    },
    footer: {
      createdWith: "Erstellt mit"
    },
    graph: {
      title: "Graphansicht"
    },
    recentNotes: {
      title: "Zuletzt bearbeitete Seiten",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `${remaining} weitere ansehen \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transklusion von ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link zum Original"
    },
    search: {
      title: "Suche",
      searchBarPlaceholder: "Suche nach etwas"
    },
    tableOfContents: {
      title: "Inhaltsverzeichnis"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min read`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Zuletzt bearbeitete Seiten",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Letzte ${count} Seiten`, "lastFewNotes")
    },
    error: {
      title: "Nicht gefunden",
      notFound: "Diese Seite ist entweder nicht \xF6ffentlich oder existiert nicht.",
      home: "Return to Homepage"
    },
    folderContent: {
      folder: "Ordner",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 Datei in diesem Ordner." : `${count} Dateien in diesem Ordner.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Tag",
      tagIndex: "Tag-\xDCbersicht",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 Datei mit diesem Tag." : `${count} Dateien mit diesem Tag.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Die ersten ${count} Tags werden angezeigt.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `${count} Tags insgesamt.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/nl-NL.ts
var nl_NL_default = {
  propertyDefaults: {
    title: "Naamloos",
    description: "Geen beschrijving gegeven."
  },
  components: {
    callout: {
      note: "Notitie",
      abstract: "Samenvatting",
      info: "Info",
      todo: "Te doen",
      tip: "Tip",
      success: "Succes",
      question: "Vraag",
      warning: "Waarschuwing",
      failure: "Mislukking",
      danger: "Gevaar",
      bug: "Bug",
      example: "Voorbeeld",
      quote: "Citaat"
    },
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Geen backlinks gevonden"
    },
    themeToggle: {
      lightMode: "Lichte modus",
      darkMode: "Donkere modus"
    },
    explorer: {
      title: "Verkenner"
    },
    footer: {
      createdWith: "Gemaakt met"
    },
    graph: {
      title: "Grafiekweergave"
    },
    recentNotes: {
      title: "Recente notities",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Zie ${remaining} meer \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Invoeging van ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link naar origineel"
    },
    search: {
      title: "Zoeken",
      searchBarPlaceholder: "Doorzoek de website"
    },
    tableOfContents: {
      title: "Inhoudsopgave"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => minutes === 1 ? "1 minuut leestijd" : `${minutes} minuten leestijd`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Recente notities",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Laatste ${count} notities`, "lastFewNotes")
    },
    error: {
      title: "Niet gevonden",
      notFound: "Deze pagina is niet zichtbaar of bestaat niet.",
      home: "Keer terug naar de start pagina"
    },
    folderContent: {
      folder: "Map",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item in deze map." : `${count} items in deze map.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Label",
      tagIndex: "Label-index",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item met dit label." : `${count} items met dit label.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => count === 1 ? "Eerste label tonen." : `Eerste ${count} labels tonen.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `${count} labels gevonden.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/ro-RO.ts
var ro_RO_default = {
  propertyDefaults: {
    title: "F\u0103r\u0103 titlu",
    description: "Nici o descriere furnizat\u0103"
  },
  components: {
    callout: {
      note: "Not\u0103",
      abstract: "Rezumat",
      info: "Informa\u021Bie",
      todo: "De f\u0103cut",
      tip: "Sfat",
      success: "Succes",
      question: "\xCEntrebare",
      warning: "Avertisment",
      failure: "E\u0219ec",
      danger: "Pericol",
      bug: "Bug",
      example: "Exemplu",
      quote: "Citat"
    },
    backlinks: {
      title: "Leg\u0103turi \xEEnapoi",
      noBacklinksFound: "Nu s-au g\u0103sit leg\u0103turi \xEEnapoi"
    },
    themeToggle: {
      lightMode: "Modul luminos",
      darkMode: "Modul \xEEntunecat"
    },
    explorer: {
      title: "Explorator"
    },
    footer: {
      createdWith: "Creat cu"
    },
    graph: {
      title: "Graf"
    },
    recentNotes: {
      title: "Noti\u021Be recente",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Vezi \xEEnc\u0103 ${remaining} \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Extras din ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Leg\u0103tur\u0103 c\u0103tre original"
    },
    search: {
      title: "C\u0103utare",
      searchBarPlaceholder: "Introduce\u021Bi termenul de c\u0103utare..."
    },
    tableOfContents: {
      title: "Cuprins"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => minutes == 1 ? `lectur\u0103 de 1 minut` : `lectur\u0103 de ${minutes} minute`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Noti\u021Be recente",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Ultimele ${count} noti\u021Be`, "lastFewNotes")
    },
    error: {
      title: "Pagina nu a fost g\u0103sit\u0103",
      notFound: "Fie aceast\u0103 pagin\u0103 este privat\u0103, fie nu exist\u0103.",
      home: "Reveni\u021Bi la pagina de pornire"
    },
    folderContent: {
      folder: "Dosar",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 articol \xEEn acest dosar." : `${count} elemente \xEEn acest dosar.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Etichet\u0103",
      tagIndex: "Indexul etichetelor",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 articol cu aceast\u0103 etichet\u0103." : `${count} articole cu aceast\u0103 etichet\u0103.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Se afi\u0219eaz\u0103 primele ${count} etichete.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Au fost g\u0103site ${count} etichete \xEEn total.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/ca-ES.ts
var ca_ES_default = {
  propertyDefaults: {
    title: "Sense t\xEDtol",
    description: "Sense descripci\xF3"
  },
  components: {
    callout: {
      note: "Nota",
      abstract: "Resum",
      info: "Informaci\xF3",
      todo: "Per fer",
      tip: "Consell",
      success: "\xC8xit",
      question: "Pregunta",
      warning: "Advert\xE8ncia",
      failure: "Fall",
      danger: "Perill",
      bug: "Error",
      example: "Exemple",
      quote: "Cita"
    },
    backlinks: {
      title: "Retroenlla\xE7",
      noBacklinksFound: "No s'han trobat retroenlla\xE7os"
    },
    themeToggle: {
      lightMode: "Mode clar",
      darkMode: "Mode fosc"
    },
    explorer: {
      title: "Explorador"
    },
    footer: {
      createdWith: "Creat amb"
    },
    graph: {
      title: "Vista Gr\xE0fica"
    },
    recentNotes: {
      title: "Notes Recents",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Vegi ${remaining} m\xE9s \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transcluit de ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Enlla\xE7 a l'original"
    },
    search: {
      title: "Cercar",
      searchBarPlaceholder: "Cerca alguna cosa"
    },
    tableOfContents: {
      title: "Taula de Continguts"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `Es llegeix en ${minutes} min`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Notes recents",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\xDAltimes ${count} notes`, "lastFewNotes")
    },
    error: {
      title: "No s'ha trobat.",
      notFound: "Aquesta p\xE0gina \xE9s privada o no existeix.",
      home: "Torna a la p\xE0gina principal"
    },
    folderContent: {
      folder: "Carpeta",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 article en aquesta carpeta." : `${count} articles en esta carpeta.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Etiqueta",
      tagIndex: "\xEDndex d'Etiquetes",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 article amb aquesta etiqueta." : `${count} article amb aquesta etiqueta.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Mostrant les primeres ${count} etiquetes.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `S'han trobat ${count} etiquetes en total.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/es-ES.ts
var es_ES_default = {
  propertyDefaults: {
    title: "Sin t\xEDtulo",
    description: "Sin descripci\xF3n"
  },
  components: {
    callout: {
      note: "Nota",
      abstract: "Resumen",
      info: "Informaci\xF3n",
      todo: "Por hacer",
      tip: "Consejo",
      success: "\xC9xito",
      question: "Pregunta",
      warning: "Advertencia",
      failure: "Fallo",
      danger: "Peligro",
      bug: "Error",
      example: "Ejemplo",
      quote: "Cita"
    },
    backlinks: {
      title: "Retroenlaces",
      noBacklinksFound: "No se han encontrado retroenlaces"
    },
    themeToggle: {
      lightMode: "Modo claro",
      darkMode: "Modo oscuro"
    },
    explorer: {
      title: "Explorador"
    },
    footer: {
      createdWith: "Creado con"
    },
    graph: {
      title: "Vista Gr\xE1fica"
    },
    recentNotes: {
      title: "Notas Recientes",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Vea ${remaining} m\xE1s \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transcluido de ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Enlace al original"
    },
    search: {
      title: "Buscar",
      searchBarPlaceholder: "Busca algo"
    },
    tableOfContents: {
      title: "Tabla de Contenidos"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `Se lee en ${minutes} min`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Notas recientes",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\xDAltimas ${count} notas`, "lastFewNotes")
    },
    error: {
      title: "No se ha encontrado.",
      notFound: "Esta p\xE1gina es privada o no existe.",
      home: "Regresa a la p\xE1gina principal"
    },
    folderContent: {
      folder: "Carpeta",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 art\xEDculo en esta carpeta." : `${count} art\xEDculos en esta carpeta.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Etiqueta",
      tagIndex: "\xCDndice de Etiquetas",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 art\xEDculo con esta etiqueta." : `${count} art\xEDculos con esta etiqueta.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Mostrando las primeras ${count} etiquetas.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Se han encontrado ${count} etiquetas en total.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/ar-SA.ts
var ar_SA_default = {
  propertyDefaults: {
    title: "\u063A\u064A\u0631 \u0645\u0639\u0646\u0648\u0646",
    description: "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0642\u062F\u064A\u0645 \u0623\u064A \u0648\u0635\u0641"
  },
  components: {
    callout: {
      note: "\u0645\u0644\u0627\u062D\u0638\u0629",
      abstract: "\u0645\u0644\u062E\u0635",
      info: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A",
      todo: "\u0644\u0644\u0642\u064A\u0627\u0645",
      tip: "\u0646\u0635\u064A\u062D\u0629",
      success: "\u0646\u062C\u0627\u062D",
      question: "\u0633\u0624\u0627\u0644",
      warning: "\u062A\u062D\u0630\u064A\u0631",
      failure: "\u0641\u0634\u0644",
      danger: "\u062E\u0637\u0631",
      bug: "\u062E\u0644\u0644",
      example: "\u0645\u062B\u0627\u0644",
      quote: "\u0627\u0642\u062A\u0628\u0627\u0633"
    },
    backlinks: {
      title: "\u0648\u0635\u0644\u0627\u062A \u0627\u0644\u0639\u0648\u062F\u0629",
      noBacklinksFound: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0648\u0635\u0644\u0627\u062A \u0639\u0648\u062F\u0629"
    },
    themeToggle: {
      lightMode: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0646\u0647\u0627\u0631\u064A",
      darkMode: "\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0644\u064A\u0644\u064A"
    },
    explorer: {
      title: "\u0627\u0644\u0645\u0633\u062A\u0639\u0631\u0636"
    },
    footer: {
      createdWith: "\u0623\u064F\u0646\u0634\u0626 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645"
    },
    graph: {
      title: "\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u062A\u0641\u0627\u0639\u0644\u064A"
    },
    recentNotes: {
      title: "\u0622\u062E\u0631 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `\u062A\u0635\u0641\u062D ${remaining} \u0623\u0643\u062B\u0631 \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `\u0645\u0642\u062A\u0628\u0633 \u0645\u0646 ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u0648\u0635\u0644\u0629 \u0644\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u0629"
    },
    search: {
      title: "\u0628\u062D\u062B",
      searchBarPlaceholder: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0634\u064A\u0621 \u0645\u0627"
    },
    tableOfContents: {
      title: "\u0641\u0647\u0631\u0633 \u0627\u0644\u0645\u062D\u062A\u0648\u064A\u0627\u062A"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => minutes == 1 ? `\u062F\u0642\u064A\u0642\u0629 \u0623\u0648 \u0623\u0642\u0644 \u0644\u0644\u0642\u0631\u0627\u0621\u0629` : minutes == 2 ? `\u062F\u0642\u064A\u0642\u062A\u0627\u0646 \u0644\u0644\u0642\u0631\u0627\u0621\u0629` : `${minutes} \u062F\u0642\u0627\u0626\u0642 \u0644\u0644\u0642\u0631\u0627\u0621\u0629`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u0622\u062E\u0631 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\u0622\u062E\u0631 ${count} \u0645\u0644\u0627\u062D\u0638\u0629`, "lastFewNotes")
    },
    error: {
      title: "\u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F",
      notFound: "\u0625\u0645\u0627 \u0623\u0646 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062D\u0629 \u062E\u0627\u0635\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629.",
      home: "\u0627\u0644\u0639\u0648\u062F\u0647 \u0644\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"
    },
    folderContent: {
      folder: "\u0645\u062C\u0644\u062F",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "\u064A\u0648\u062C\u062F \u0639\u0646\u0635\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0645\u062C\u0644\u062F" : `\u064A\u0648\u062C\u062F ${count} \u0639\u0646\u0627\u0635\u0631 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0645\u062C\u0644\u062F.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u0627\u0644\u0648\u0633\u0645",
      tagIndex: "\u0645\u0624\u0634\u0631 \u0627\u0644\u0648\u0633\u0645",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "\u064A\u0648\u062C\u062F \u0639\u0646\u0635\u0631 \u0648\u0627\u062D\u062F \u0641\u0642\u0637 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0648\u0633\u0645" : `\u064A\u0648\u062C\u062F ${count} \u0639\u0646\u0627\u0635\u0631 \u062A\u062D\u062A \u0647\u0630\u0627 \u0627\u0644\u0648\u0633\u0645.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u0625\u0638\u0647\u0627\u0631 \u0623\u0648\u0644 ${count} \u0623\u0648\u0633\u0645\u0629.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\u064A\u0648\u062C\u062F ${count} \u0623\u0648\u0633\u0645\u0629.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/uk-UA.ts
var uk_UA_default = {
  propertyDefaults: {
    title: "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0438",
    description: "\u041E\u043F\u0438\u0441 \u043D\u0435 \u043D\u0430\u0434\u0430\u043D\u043E"
  },
  components: {
    callout: {
      note: "\u041F\u0440\u0438\u043C\u0456\u0442\u043A\u0430",
      abstract: "\u0410\u0431\u0441\u0442\u0440\u0430\u043A\u0442",
      info: "\u0406\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044F",
      todo: "\u0417\u0430\u0432\u0434\u0430\u043D\u043D\u044F",
      tip: "\u041F\u043E\u0440\u0430\u0434\u0430",
      success: "\u0423\u0441\u043F\u0456\u0445",
      question: "\u041F\u0438\u0442\u0430\u043D\u043D\u044F",
      warning: "\u041F\u043E\u043F\u0435\u0440\u0435\u0434\u0436\u0435\u043D\u043D\u044F",
      failure: "\u041D\u0435\u0432\u0434\u0430\u0447\u0430",
      danger: "\u041D\u0435\u0431\u0435\u0437\u043F\u0435\u043A\u0430",
      bug: "\u0411\u0430\u0433",
      example: "\u041F\u0440\u0438\u043A\u043B\u0430\u0434",
      quote: "\u0426\u0438\u0442\u0430\u0442\u0430"
    },
    backlinks: {
      title: "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0456 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F",
      noBacklinksFound: "\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u0445 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u044C \u043D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E"
    },
    themeToggle: {
      lightMode: "\u0421\u0432\u0456\u0442\u043B\u0438\u0439 \u0440\u0435\u0436\u0438\u043C",
      darkMode: "\u0422\u0435\u043C\u043D\u0438\u0439 \u0440\u0435\u0436\u0438\u043C"
    },
    explorer: {
      title: "\u041F\u0440\u043E\u0432\u0456\u0434\u043D\u0438\u043A"
    },
    footer: {
      createdWith: "\u0421\u0442\u0432\u043E\u0440\u0435\u043D\u043E \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u043E\u044E"
    },
    graph: {
      title: "\u0412\u0438\u0433\u043B\u044F\u0434 \u0433\u0440\u0430\u0444\u0430"
    },
    recentNotes: {
      title: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456 \u043D\u043E\u0442\u0430\u0442\u043A\u0438",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `\u041F\u0435\u0440\u0435\u0433\u043B\u044F\u043D\u0443\u0442\u0438 \u0449\u0435 ${remaining} \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `\u0412\u0438\u0434\u043E\u0431\u0443\u0442\u043E \u0437 ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u041F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u043D\u0430 \u043E\u0440\u0438\u0433\u0456\u043D\u0430\u043B"
    },
    search: {
      title: "\u041F\u043E\u0448\u0443\u043A",
      searchBarPlaceholder: "\u0428\u0443\u043A\u0430\u0442\u0438 \u0449\u043E\u0441\u044C"
    },
    tableOfContents: {
      title: "\u0417\u043C\u0456\u0441\u0442"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} \u0445\u0432 \u0447\u0438\u0442\u0430\u043D\u043D\u044F`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u041E\u0441\u0442\u0430\u043D\u043D\u0456 \u043D\u043E\u0442\u0430\u0442\u043A\u0438",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\u041E\u0441\u0442\u0430\u043D\u043D\u0456 \u043D\u043E\u0442\u0430\u0442\u043A\u0438: ${count}`, "lastFewNotes")
    },
    error: {
      title: "\u041D\u0435 \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E",
      notFound: "\u0426\u044F \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0430 \u0430\u0431\u043E \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u0430, \u0430\u0431\u043E \u043D\u0435 \u0456\u0441\u043D\u0443\u0454.",
      home: "\u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F \u043D\u0430 \u0433\u043E\u043B\u043E\u0432\u043D\u0443 \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0443"
    },
    folderContent: {
      folder: "\u0422\u0435\u043A\u0430",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "\u0423 \u0446\u0456\u0439 \u0442\u0435\u0446\u0456 1 \u0435\u043B\u0435\u043C\u0435\u043D\u0442." : `\u0415\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432 \u0443 \u0446\u0456\u0439 \u0442\u0435\u0446\u0456: ${count}.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u041C\u0456\u0442\u043A\u0430",
      tagIndex: "\u0406\u043D\u0434\u0435\u043A\u0441 \u043C\u0456\u0442\u043A\u0438",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 \u0435\u043B\u0435\u043C\u0435\u043D\u0442 \u0437 \u0446\u0456\u0454\u044E \u043C\u0456\u0442\u043A\u043E\u044E." : `\u0415\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432 \u0437 \u0446\u0456\u0454\u044E \u043C\u0456\u0442\u043A\u043E\u044E: ${count}.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u041F\u043E\u043A\u0430\u0437 \u043F\u0435\u0440\u0448\u0438\u0445 ${count} \u043C\u0456\u0442\u043E\u043A.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\u0412\u0441\u044C\u043E\u0433\u043E \u0437\u043D\u0430\u0439\u0434\u0435\u043D\u043E \u043C\u0456\u0442\u043E\u043A: ${count}.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/ru-RU.ts
var ru_RU_default = {
  propertyDefaults: {
    title: "\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F",
    description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442"
  },
  components: {
    callout: {
      note: "\u0417\u0430\u043C\u0435\u0442\u043A\u0430",
      abstract: "\u0420\u0435\u0437\u044E\u043C\u0435",
      info: "\u0418\u043D\u0444\u043E",
      todo: "\u0421\u0434\u0435\u043B\u0430\u0442\u044C",
      tip: "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430",
      success: "\u0423\u0441\u043F\u0435\u0445",
      question: "\u0412\u043E\u043F\u0440\u043E\u0441",
      warning: "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435",
      failure: "\u041D\u0435\u0443\u0434\u0430\u0447\u0430",
      danger: "\u041E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C",
      bug: "\u0411\u0430\u0433",
      example: "\u041F\u0440\u0438\u043C\u0435\u0440",
      quote: "\u0426\u0438\u0442\u0430\u0442\u0430"
    },
    backlinks: {
      title: "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438",
      noBacklinksFound: "\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442"
    },
    themeToggle: {
      lightMode: "\u0421\u0432\u0435\u0442\u043B\u044B\u0439 \u0440\u0435\u0436\u0438\u043C",
      darkMode: "\u0422\u0451\u043C\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C"
    },
    explorer: {
      title: "\u041F\u0440\u043E\u0432\u043E\u0434\u043D\u0438\u043A"
    },
    footer: {
      createdWith: "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E"
    },
    graph: {
      title: "\u0412\u0438\u0434 \u0433\u0440\u0430\u0444\u0430"
    },
    recentNotes: {
      title: "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043E\u0441\u0442\u0430\u0432\u0448${getForm(remaining, "\u0443\u044E\u0441\u044F", "\u0438\u0435\u0441\u044F", "\u0438\u0435\u0441\u044F")} ${remaining} \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `\u041F\u0435\u0440\u0435\u0445\u043E\u0434 \u0438\u0437 ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B"
    },
    search: {
      title: "\u041F\u043E\u0438\u0441\u043A",
      searchBarPlaceholder: "\u041D\u0430\u0439\u0442\u0438 \u0447\u0442\u043E-\u043D\u0438\u0431\u0443\u0434\u044C"
    },
    tableOfContents: {
      title: "\u041E\u0433\u043B\u0430\u0432\u043B\u0435\u043D\u0438\u0435"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `\u0432\u0440\u0435\u043C\u044F \u0447\u0442\u0435\u043D\u0438\u044F ~${minutes} \u043C\u0438\u043D.`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435 \u0437\u0430\u043C\u0435\u0442\u043A\u0438",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\u041F\u043E\u0441\u043B\u0435\u0434\u043D${getForm(count, "\u044F\u044F", "\u0438\u0435", "\u0438\u0435")} ${count} \u0437\u0430\u043C\u0435\u0442${getForm(count, "\u043A\u0430", "\u043A\u0438", "\u043E\u043A")}`, "lastFewNotes")
    },
    error: {
      title: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430",
      notFound: "\u042D\u0442\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u0430\u044F \u0438\u043B\u0438 \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442",
      home: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443"
    },
    folderContent: {
      folder: "\u041F\u0430\u043F\u043A\u0430",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => `\u0432 \u044D\u0442\u043E\u0439 \u043F\u0430\u043F\u043A\u0435 ${count} \u044D\u043B\u0435\u043C\u0435\u043D\u0442${getForm(count, "", "\u0430", "\u043E\u0432")}`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u0422\u0435\u0433",
      tagIndex: "\u0418\u043D\u0434\u0435\u043A\u0441 \u0442\u0435\u0433\u043E\u0432",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => `\u0441 \u044D\u0442\u0438\u043C \u0442\u0435\u0433\u043E\u043C ${count} \u044D\u043B\u0435\u043C\u0435\u043D\u0442${getForm(count, "", "\u0430", "\u043E\u0432")}`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430${getForm(count, "\u0435\u0442\u0441\u044F", "\u044E\u0442\u0441\u044F", "\u044E\u0442\u0441\u044F")} ${count} \u0442\u0435\u0433${getForm(count, "", "\u0430", "\u043E\u0432")}`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\u0412\u0441\u0435\u0433\u043E ${count} \u0442\u0435\u0433${getForm(count, "", "\u0430", "\u043E\u0432")}`, "totalTags")
    }
  }
};
function getForm(number, form1, form2, form5) {
  const remainder100 = number % 100;
  const remainder10 = remainder100 % 10;
  if (remainder100 >= 10 && remainder100 <= 20) return form5;
  if (remainder10 > 1 && remainder10 < 5) return form2;
  if (remainder10 == 1) return form1;
  return form5;
}
__name(getForm, "getForm");

// quartz/i18n/locales/ko-KR.ts
var ko_KR_default = {
  propertyDefaults: {
    title: "\uC81C\uBAA9 \uC5C6\uC74C",
    description: "\uC124\uBA85 \uC5C6\uC74C"
  },
  components: {
    callout: {
      note: "\uB178\uD2B8",
      abstract: "\uAC1C\uC694",
      info: "\uC815\uBCF4",
      todo: "\uD560\uC77C",
      tip: "\uD301",
      success: "\uC131\uACF5",
      question: "\uC9C8\uBB38",
      warning: "\uC8FC\uC758",
      failure: "\uC2E4\uD328",
      danger: "\uC704\uD5D8",
      bug: "\uBC84\uADF8",
      example: "\uC608\uC2DC",
      quote: "\uC778\uC6A9"
    },
    backlinks: {
      title: "\uBC31\uB9C1\uD06C",
      noBacklinksFound: "\uBC31\uB9C1\uD06C\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
    },
    themeToggle: {
      lightMode: "\uB77C\uC774\uD2B8 \uBAA8\uB4DC",
      darkMode: "\uB2E4\uD06C \uBAA8\uB4DC"
    },
    explorer: {
      title: "\uD0D0\uC0C9\uAE30"
    },
    footer: {
      createdWith: "Created with"
    },
    graph: {
      title: "\uADF8\uB798\uD504 \uBDF0"
    },
    recentNotes: {
      title: "\uCD5C\uADFC \uAC8C\uC2DC\uAE00",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `${remaining}\uAC74 \uB354\uBCF4\uAE30 \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `${targetSlug}\uC758 \uD3EC\uD568`, "transcludeOf"),
      linkToOriginal: "\uC6D0\uBCF8 \uB9C1\uD06C"
    },
    search: {
      title: "\uAC80\uC0C9",
      searchBarPlaceholder: "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD558\uC138\uC694"
    },
    tableOfContents: {
      title: "\uBAA9\uCC28"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min read`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\uCD5C\uADFC \uAC8C\uC2DC\uAE00",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\uCD5C\uADFC ${count} \uAC74`, "lastFewNotes")
    },
    error: {
      title: "Not Found",
      notFound: "\uD398\uC774\uC9C0\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uBE44\uACF5\uAC1C \uC124\uC815\uC774 \uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.",
      home: "\uD648\uD398\uC774\uC9C0\uB85C \uB3CC\uC544\uAC00\uAE30"
    },
    folderContent: {
      folder: "\uD3F4\uB354",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => `${count}\uAC74\uC758 \uD56D\uBAA9`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\uD0DC\uADF8",
      tagIndex: "\uD0DC\uADF8 \uBAA9\uB85D",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => `${count}\uAC74\uC758 \uD56D\uBAA9`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\uCC98\uC74C ${count}\uAC1C\uC758 \uD0DC\uADF8`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\uCD1D ${count}\uAC1C\uC758 \uD0DC\uADF8\uB97C \uCC3E\uC558\uC2B5\uB2C8\uB2E4.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/zh-CN.ts
var zh_CN_default = {
  propertyDefaults: {
    title: "\u65E0\u9898",
    description: "\u65E0\u63CF\u8FF0"
  },
  components: {
    callout: {
      note: "\u7B14\u8BB0",
      abstract: "\u6458\u8981",
      info: "\u63D0\u793A",
      todo: "\u5F85\u529E",
      tip: "\u63D0\u793A",
      success: "\u6210\u529F",
      question: "\u95EE\u9898",
      warning: "\u8B66\u544A",
      failure: "\u5931\u8D25",
      danger: "\u5371\u9669",
      bug: "\u9519\u8BEF",
      example: "\u793A\u4F8B",
      quote: "\u5F15\u7528"
    },
    backlinks: {
      title: "\u53CD\u5411\u94FE\u63A5",
      noBacklinksFound: "\u65E0\u6CD5\u627E\u5230\u53CD\u5411\u94FE\u63A5"
    },
    themeToggle: {
      lightMode: "\u4EAE\u8272\u6A21\u5F0F",
      darkMode: "\u6697\u8272\u6A21\u5F0F"
    },
    explorer: {
      title: "\u63A2\u7D22"
    },
    footer: {
      createdWith: "Created with"
    },
    graph: {
      title: "\u5173\u7CFB\u56FE\u8C31"
    },
    recentNotes: {
      title: "\u6700\u8FD1\u7684\u7B14\u8BB0",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `\u67E5\u770B\u66F4\u591A${remaining}\u7BC7\u7B14\u8BB0 \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `\u5305\u542B${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u6307\u5411\u539F\u59CB\u7B14\u8BB0\u7684\u94FE\u63A5"
    },
    search: {
      title: "\u641C\u7D22",
      searchBarPlaceholder: "\u641C\u7D22\u4E9B\u4EC0\u4E48"
    },
    tableOfContents: {
      title: "\u76EE\u5F55"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes}\u5206\u949F\u9605\u8BFB`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u6700\u8FD1\u7684\u7B14\u8BB0",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\u6700\u8FD1\u7684${count}\u6761\u7B14\u8BB0`, "lastFewNotes")
    },
    error: {
      title: "\u65E0\u6CD5\u627E\u5230",
      notFound: "\u79C1\u6709\u7B14\u8BB0\u6216\u7B14\u8BB0\u4E0D\u5B58\u5728\u3002",
      home: "\u8FD4\u56DE\u9996\u9875"
    },
    folderContent: {
      folder: "\u6587\u4EF6\u5939",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => `\u6B64\u6587\u4EF6\u5939\u4E0B\u6709${count}\u6761\u7B14\u8BB0\u3002`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u6807\u7B7E",
      tagIndex: "\u6807\u7B7E\u7D22\u5F15",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => `\u6B64\u6807\u7B7E\u4E0B\u6709${count}\u6761\u7B14\u8BB0\u3002`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u663E\u793A\u524D${count}\u4E2A\u6807\u7B7E\u3002`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\u603B\u5171\u6709${count}\u4E2A\u6807\u7B7E\u3002`, "totalTags")
    }
  }
};

// quartz/i18n/locales/vi-VN.ts
var vi_VN_default = {
  propertyDefaults: {
    title: "Kh\xF4ng c\xF3 ti\xEAu \u0111\u1EC1",
    description: "Kh\xF4ng c\xF3 m\xF4 t\u1EA3 \u0111\u01B0\u1EE3c cung c\u1EA5p"
  },
  components: {
    callout: {
      note: "Ghi Ch\xFA",
      abstract: "T\xF3m T\u1EAFt",
      info: "Th\xF4ng tin",
      todo: "C\u1EA7n L\xE0m",
      tip: "G\u1EE3i \xDD",
      success: "Th\xE0nh C\xF4ng",
      question: "Nghi V\u1EA5n",
      warning: "C\u1EA3nh B\xE1o",
      failure: "Th\u1EA5t B\u1EA1i",
      danger: "Nguy Hi\u1EC3m",
      bug: "L\u1ED7i",
      example: "V\xED D\u1EE5",
      quote: "Tr\xEDch D\u1EABn"
    },
    backlinks: {
      title: "Li\xEAn K\u1EBFt Ng\u01B0\u1EE3c",
      noBacklinksFound: "Kh\xF4ng c\xF3 li\xEAn k\u1EBFt ng\u01B0\u1EE3c \u0111\u01B0\u1EE3c t\xECm th\u1EA5y"
    },
    themeToggle: {
      lightMode: "S\xE1ng",
      darkMode: "T\u1ED1i"
    },
    explorer: {
      title: "Trong b\xE0i n\xE0y"
    },
    footer: {
      createdWith: "\u0110\u01B0\u1EE3c t\u1EA1o b\u1EDFi"
    },
    graph: {
      title: "Bi\u1EC3u \u0110\u1ED3"
    },
    recentNotes: {
      title: "B\xE0i vi\u1EBFt g\u1EA7n \u0111\xE2y",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Xem ${remaining} th\xEAm \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Bao g\u1ED3m ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Li\xEAn K\u1EBFt G\u1ED1c"
    },
    search: {
      title: "T\xECm Ki\u1EBFm",
      searchBarPlaceholder: "T\xECm ki\u1EBFm th\xF4ng tin"
    },
    tableOfContents: {
      title: "B\u1EA3ng N\u1ED9i Dung"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `\u0111\u1ECDc ${minutes} ph\xFAt`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Nh\u1EEFng b\xE0i g\u1EA7n \u0111\xE2y",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `${count} B\xE0i g\u1EA7n \u0111\xE2y`, "lastFewNotes")
    },
    error: {
      title: "Kh\xF4ng T\xECm Th\u1EA5y",
      notFound: "Trang n\xE0y \u0111\u01B0\u1EE3c b\u1EA3o m\u1EADt ho\u1EB7c kh\xF4ng t\u1ED3n t\u1EA1i.",
      home: "Tr\u1EDF v\u1EC1 trang ch\u1EE7"
    },
    folderContent: {
      folder: "Th\u01B0 M\u1EE5c",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 m\u1EE5c trong th\u01B0 m\u1EE5c n\xE0y." : `${count} m\u1EE5c trong th\u01B0 m\u1EE5c n\xE0y.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Th\u1EBB",
      tagIndex: "Th\u1EBB M\u1EE5c L\u1EE5c",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 m\u1EE5c g\u1EAFn th\u1EBB n\xE0y." : `${count} m\u1EE5c g\u1EAFn th\u1EBB n\xE0y.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Hi\u1EC3n th\u1ECB tr\u01B0\u1EDBc ${count} th\u1EBB.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `T\xECm th\u1EA5y ${count} th\u1EBB t\u1ED5ng c\u1ED9ng.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/pt-BR.ts
var pt_BR_default = {
  propertyDefaults: {
    title: "Sem t\xEDtulo",
    description: "Sem descri\xE7\xE3o"
  },
  components: {
    callout: {
      note: "Nota",
      abstract: "Abstrato",
      info: "Info",
      todo: "Pend\xEAncia",
      tip: "Dica",
      success: "Sucesso",
      question: "Pergunta",
      warning: "Aviso",
      failure: "Falha",
      danger: "Perigo",
      bug: "Bug",
      example: "Exemplo",
      quote: "Cita\xE7\xE3o"
    },
    backlinks: {
      title: "Backlinks",
      noBacklinksFound: "Sem backlinks encontrados"
    },
    themeToggle: {
      lightMode: "Tema claro",
      darkMode: "Tema escuro"
    },
    explorer: {
      title: "Explorador"
    },
    footer: {
      createdWith: "Criado com"
    },
    graph: {
      title: "Vis\xE3o de gr\xE1fico"
    },
    recentNotes: {
      title: "Notas recentes",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Veja mais ${remaining} \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Transcrever de ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Link ao original"
    },
    search: {
      title: "Pesquisar",
      searchBarPlaceholder: "Pesquisar por algo"
    },
    tableOfContents: {
      title: "Sum\xE1rio"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `Leitura de ${minutes} min`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Notas recentes",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `\xDAltimas ${count} notas`, "lastFewNotes")
    },
    error: {
      title: "N\xE3o encontrado",
      notFound: "Esta p\xE1gina \xE9 privada ou n\xE3o existe.",
      home: "Retornar a p\xE1gina inicial"
    },
    folderContent: {
      folder: "Arquivo",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item neste arquivo." : `${count} items neste arquivo.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Tag",
      tagIndex: "Sum\xE1rio de Tags",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 item com esta tag." : `${count} items com esta tag.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Mostrando as ${count} primeiras tags.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Encontradas ${count} tags.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/hu-HU.ts
var hu_HU_default = {
  propertyDefaults: {
    title: "N\xE9vtelen",
    description: "Nincs le\xEDr\xE1s"
  },
  components: {
    callout: {
      note: "Jegyzet",
      abstract: "Abstract",
      info: "Inform\xE1ci\xF3",
      todo: "Tennival\xF3",
      tip: "Tipp",
      success: "Siker",
      question: "K\xE9rd\xE9s",
      warning: "Figyelmeztet\xE9s",
      failure: "Hiba",
      danger: "Vesz\xE9ly",
      bug: "Bug",
      example: "P\xE9lda",
      quote: "Id\xE9zet"
    },
    backlinks: {
      title: "Visszautal\xE1sok",
      noBacklinksFound: "Nincs visszautal\xE1s"
    },
    themeToggle: {
      lightMode: "Vil\xE1gos m\xF3d",
      darkMode: "S\xF6t\xE9t m\xF3d"
    },
    explorer: {
      title: "F\xE1jlb\xF6ng\xE9sz\u0151"
    },
    footer: {
      createdWith: "K\xE9sz\xEDtve ezzel:"
    },
    graph: {
      title: "Grafikonn\xE9zet"
    },
    recentNotes: {
      title: "Legut\xF3bbi jegyzetek",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `${remaining} tov\xE1bbi megtekint\xE9se \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `${targetSlug} \xE1thivatkoz\xE1sa`, "transcludeOf"),
      linkToOriginal: "Hivatkoz\xE1s az eredetire"
    },
    search: {
      title: "Keres\xE9s",
      searchBarPlaceholder: "Keress valamire"
    },
    tableOfContents: {
      title: "Tartalomjegyz\xE9k"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} perces olvas\xE1s`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Legut\xF3bbi jegyzetek",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Legut\xF3bbi ${count} jegyzet`, "lastFewNotes")
    },
    error: {
      title: "Nem tal\xE1lhat\xF3",
      notFound: "Ez a lap vagy priv\xE1t vagy nem l\xE9tezik.",
      home: "Vissza a kezd\u0151lapra"
    },
    folderContent: {
      folder: "Mappa",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => `Ebben a mapp\xE1ban ${count} elem tal\xE1lhat\xF3.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "C\xEDmke",
      tagIndex: "C\xEDmke index",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => `${count} elem tal\xE1lhat\xF3 ezzel a c\xEDmk\xE9vel.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Els\u0151 ${count} c\xEDmke megjelen\xEDtve.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `\xD6sszesen ${count} c\xEDmke tal\xE1lhat\xF3.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/fa-IR.ts
var fa_IR_default = {
  propertyDefaults: {
    title: "\u0628\u062F\u0648\u0646 \u0639\u0646\u0648\u0627\u0646",
    description: "\u062A\u0648\u0636\u06CC\u062D \u062E\u0627\u0635\u06CC \u0627\u0636\u0627\u0641\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A"
  },
  components: {
    callout: {
      note: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A",
      abstract: "\u0686\u06A9\u06CC\u062F\u0647",
      info: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A",
      todo: "\u0627\u0642\u062F\u0627\u0645",
      tip: "\u0646\u06A9\u062A\u0647",
      success: "\u062A\u06CC\u06A9",
      question: "\u0633\u0624\u0627\u0644",
      warning: "\u0647\u0634\u062F\u0627\u0631",
      failure: "\u0634\u06A9\u0633\u062A",
      danger: "\u062E\u0637\u0631",
      bug: "\u0628\u0627\u06AF",
      example: "\u0645\u062B\u0627\u0644",
      quote: "\u0646\u0642\u0644 \u0642\u0648\u0644"
    },
    backlinks: {
      title: "\u0628\u06A9\u200C\u0644\u06CC\u0646\u06A9\u200C\u0647\u0627",
      noBacklinksFound: "\u0628\u062F\u0648\u0646 \u0628\u06A9\u200C\u0644\u06CC\u0646\u06A9"
    },
    themeToggle: {
      lightMode: "\u062D\u0627\u0644\u062A \u0631\u0648\u0634\u0646",
      darkMode: "\u062D\u0627\u0644\u062A \u062A\u0627\u0631\u06CC\u06A9"
    },
    explorer: {
      title: "\u0645\u0637\u0627\u0644\u0628"
    },
    footer: {
      createdWith: "\u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647 \u0628\u0627"
    },
    graph: {
      title: "\u0646\u0645\u0627\u06CC \u06AF\u0631\u0627\u0641"
    },
    recentNotes: {
      title: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `${remaining} \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u06CC\u06AF\u0631 \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `\u0627\u0632 ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u067E\u06CC\u0648\u0646\u062F \u0628\u0647 \u0627\u0635\u0644\u06CC"
    },
    search: {
      title: "\u062C\u0633\u062A\u062C\u0648",
      searchBarPlaceholder: "\u0645\u0637\u0644\u0628\u06CC \u0631\u0627 \u062C\u0633\u062A\u062C\u0648 \u06A9\u0646\u06CC\u062F"
    },
    tableOfContents: {
      title: "\u0641\u0647\u0631\u0633\u062A"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `\u0632\u0645\u0627\u0646 \u062A\u0642\u0631\u06CC\u0628\u06CC \u0645\u0637\u0627\u0644\u0639\u0647: ${minutes} \u062F\u0642\u06CC\u0642\u0647`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u0627\u062E\u06CC\u0631",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `${count} \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0627\u062E\u06CC\u0631`, "lastFewNotes")
    },
    error: {
      title: "\u06CC\u0627\u0641\u062A \u0646\u0634\u062F",
      notFound: "\u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u06CC\u0627 \u062E\u0635\u0648\u0635\u06CC \u0627\u0633\u062A \u06CC\u0627 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
      home: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0635\u0641\u062D\u0647 \u0627\u0635\u0644\u06CC"
    },
    folderContent: {
      folder: "\u067E\u0648\u0634\u0647",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? ".\u06CC\u06A9 \u0645\u0637\u0644\u0628 \u062F\u0631 \u0627\u06CC\u0646 \u067E\u0648\u0634\u0647 \u0627\u0633\u062A" : `${count} \u0645\u0637\u0644\u0628 \u062F\u0631 \u0627\u06CC\u0646 \u067E\u0648\u0634\u0647 \u0627\u0633\u062A.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "\u0628\u0631\u0686\u0633\u0628",
      tagIndex: "\u0641\u0647\u0631\u0633\u062A \u0628\u0631\u0686\u0633\u0628\u200C\u0647\u0627",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "\u06CC\u06A9 \u0645\u0637\u0644\u0628 \u0628\u0627 \u0627\u06CC\u0646 \u0628\u0631\u0686\u0633\u0628" : `${count} \u0645\u0637\u0644\u0628 \u0628\u0627 \u0627\u06CC\u0646 \u0628\u0631\u0686\u0633\u0628.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `\u062F\u0631 \u062D\u0627\u0644 \u0646\u0645\u0627\u06CC\u0634 ${count} \u0628\u0631\u0686\u0633\u0628.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `${count} \u0628\u0631\u0686\u0633\u0628 \u06CC\u0627\u0641\u062A \u0634\u062F.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/pl-PL.ts
var pl_PL_default = {
  propertyDefaults: {
    title: "Bez nazwy",
    description: "Brak opisu"
  },
  components: {
    callout: {
      note: "Notatka",
      abstract: "Streszczenie",
      info: "informacja",
      todo: "Do zrobienia",
      tip: "Wskaz\xF3wka",
      success: "Zrobione",
      question: "Pytanie",
      warning: "Ostrze\u017Cenie",
      failure: "Usterka",
      danger: "Niebiezpiecze\u0144stwo",
      bug: "B\u0142\u0105d w kodzie",
      example: "Przyk\u0142ad",
      quote: "Cytat"
    },
    backlinks: {
      title: "Odno\u015Bniki zwrotne",
      noBacklinksFound: "Brak po\u0142\u0105cze\u0144 zwrotnych"
    },
    themeToggle: {
      lightMode: "Trzyb jasny",
      darkMode: "Tryb ciemny"
    },
    explorer: {
      title: "Przegl\u0105daj"
    },
    footer: {
      createdWith: "Stworzone z u\u017Cyciem"
    },
    graph: {
      title: "Graf"
    },
    recentNotes: {
      title: "Najnowsze notatki",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Zobacz ${remaining} nastepnych \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Osadzone ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "\u0141\u0105cze do orygina\u0142u"
    },
    search: {
      title: "Szukaj",
      searchBarPlaceholder: "Search for something"
    },
    tableOfContents: {
      title: "Spis tre\u015Bci"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min. czytania `, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Najnowsze notatki",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Ostatnie ${count} notatek`, "lastFewNotes")
    },
    error: {
      title: "Nie znaleziono",
      notFound: "Ta strona jest prywatna lub nie istnieje.",
      home: "Powr\xF3t do strony g\u0142\xF3wnej"
    },
    folderContent: {
      folder: "Folder",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "W tym folderze jest 1 element." : `Element\xF3w w folderze: ${count}.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Znacznik",
      tagIndex: "Spis znacznik\xF3w",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "Oznaczony 1 element." : `Element\xF3w z tym znacznikiem: ${count}.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Pokazuje ${count} pierwszych znacznik\xF3w.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Znalezionych wszystkich znacznik\xF3w: ${count}.`, "totalTags")
    }
  }
};

// quartz/i18n/locales/cs-CZ.ts
var cs_CZ_default = {
  propertyDefaults: {
    title: "Bez n\xE1zvu",
    description: "Nebyl uveden \u017E\xE1dn\xFD popis"
  },
  components: {
    callout: {
      note: "Pozn\xE1mka",
      abstract: "Abstract",
      info: "Info",
      todo: "Todo",
      tip: "Tip",
      success: "\xDAsp\u011Bch",
      question: "Ot\xE1zka",
      warning: "Upozorn\u011Bn\xED",
      failure: "Chyba",
      danger: "Nebezpe\u010D\xED",
      bug: "Bug",
      example: "P\u0159\xEDklad",
      quote: "Citace"
    },
    backlinks: {
      title: "P\u0159\xEDchoz\xED odkazy",
      noBacklinksFound: "Nenalezeny \u017E\xE1dn\xE9 p\u0159\xEDchoz\xED odkazy"
    },
    themeToggle: {
      lightMode: "Sv\u011Btl\xFD re\u017Eim",
      darkMode: "Tmav\xFD re\u017Eim"
    },
    explorer: {
      title: "Proch\xE1zet"
    },
    footer: {
      createdWith: "Vytvo\u0159eno pomoc\xED"
    },
    graph: {
      title: "Graf"
    },
    recentNotes: {
      title: "Nejnov\u011Bj\u0161\xED pozn\xE1mky",
      seeRemainingMore: /* @__PURE__ */ __name(({ remaining }) => `Zobraz ${remaining} dal\u0161\xEDch \u2192`, "seeRemainingMore")
    },
    transcludes: {
      transcludeOf: /* @__PURE__ */ __name(({ targetSlug }) => `Zobrazen\xED ${targetSlug}`, "transcludeOf"),
      linkToOriginal: "Odkaz na p\u016Fvodn\xED dokument"
    },
    search: {
      title: "Hledat",
      searchBarPlaceholder: "Hledejte n\u011Bco"
    },
    tableOfContents: {
      title: "Obsah"
    },
    contentMeta: {
      readingTime: /* @__PURE__ */ __name(({ minutes }) => `${minutes} min \u010Dten\xED`, "readingTime")
    }
  },
  pages: {
    rss: {
      recentNotes: "Nejnov\u011Bj\u0161\xED pozn\xE1mky",
      lastFewNotes: /* @__PURE__ */ __name(({ count }) => `Posledn\xEDch ${count} pozn\xE1mek`, "lastFewNotes")
    },
    error: {
      title: "Nenalezeno",
      notFound: "Tato str\xE1nka je bu\u010F soukrom\xE1, nebo neexistuje.",
      home: "N\xE1vrat na domovskou str\xE1nku"
    },
    folderContent: {
      folder: "Slo\u017Eka",
      itemsUnderFolder: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 polo\u017Eka v t\xE9to slo\u017Ece." : `${count} polo\u017Eek v t\xE9to slo\u017Ece.`, "itemsUnderFolder")
    },
    tagContent: {
      tag: "Tag",
      tagIndex: "Rejst\u0159\xEDk tag\u016F",
      itemsUnderTag: /* @__PURE__ */ __name(({ count }) => count === 1 ? "1 polo\u017Eka s t\xEDmto tagem." : `${count} polo\u017Eek s t\xEDmto tagem.`, "itemsUnderTag"),
      showingFirst: /* @__PURE__ */ __name(({ count }) => `Zobrazuj\xED se prvn\xED ${count} tagy.`, "showingFirst"),
      totalTags: /* @__PURE__ */ __name(({ count }) => `Nalezeno celkem ${count} tag\u016F.`, "totalTags")
    }
  }
};

// quartz/i18n/index.ts
var TRANSLATIONS = {
  "en-US": en_US_default,
  "en-GB": en_GB_default,
  "fr-FR": fr_FR_default,
  "it-IT": it_IT_default,
  "ja-JP": ja_JP_default,
  "de-DE": de_DE_default,
  "nl-NL": nl_NL_default,
  "nl-BE": nl_NL_default,
  "ro-RO": ro_RO_default,
  "ro-MD": ro_RO_default,
  "ca-ES": ca_ES_default,
  "es-ES": es_ES_default,
  "ar-SA": ar_SA_default,
  "ar-AE": ar_SA_default,
  "ar-QA": ar_SA_default,
  "ar-BH": ar_SA_default,
  "ar-KW": ar_SA_default,
  "ar-OM": ar_SA_default,
  "ar-YE": ar_SA_default,
  "ar-IR": ar_SA_default,
  "ar-SY": ar_SA_default,
  "ar-IQ": ar_SA_default,
  "ar-JO": ar_SA_default,
  "ar-PL": ar_SA_default,
  "ar-LB": ar_SA_default,
  "ar-EG": ar_SA_default,
  "ar-SD": ar_SA_default,
  "ar-LY": ar_SA_default,
  "ar-MA": ar_SA_default,
  "ar-TN": ar_SA_default,
  "ar-DZ": ar_SA_default,
  "ar-MR": ar_SA_default,
  "uk-UA": uk_UA_default,
  "ru-RU": ru_RU_default,
  "ko-KR": ko_KR_default,
  "zh-CN": zh_CN_default,
  "vi-VN": vi_VN_default,
  "pt-BR": pt_BR_default,
  "hu-HU": hu_HU_default,
  "fa-IR": fa_IR_default,
  "pl-PL": pl_PL_default,
  "cs-CZ": cs_CZ_default
};
var defaultTranslation = "en-US";
var i18n = /* @__PURE__ */ __name((locale) => TRANSLATIONS[locale ?? defaultTranslation], "i18n");

// quartz/plugins/transformers/frontmatter.ts
var defaultOptions = {
  delimiters: "---",
  language: "yaml"
};
function coalesceAliases(data, aliases) {
  for (const alias of aliases) {
    if (data[alias] !== void 0 && data[alias] !== null) return data[alias];
  }
}
__name(coalesceAliases, "coalesceAliases");
function coerceToArray(input) {
  if (input === void 0 || input === null) return void 0;
  if (!Array.isArray(input)) {
    input = input.toString().split(",").map((tag) => tag.trim());
  }
  return input.filter((tag) => typeof tag === "string" || typeof tag === "number").map((tag) => tag.toString());
}
__name(coerceToArray, "coerceToArray");
var FrontMatter = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions, ...userOpts };
  return {
    name: "FrontMatter",
    markdownPlugins({ cfg }) {
      return [
        [remarkFrontmatter, ["yaml", "toml"]],
        () => {
          return (_, file) => {
            const { data } = matter(Buffer.from(file.value), {
              ...opts,
              engines: {
                yaml: /* @__PURE__ */ __name((s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }), "yaml"),
                toml: /* @__PURE__ */ __name((s) => toml.parse(s), "toml")
              }
            });
            if (data.title != null && data.title.toString() !== "") {
              data.title = data.title.toString();
            } else {
              data.title = file.stem ?? i18n(cfg.configuration.locale).propertyDefaults.title;
            }
            const tags = coerceToArray(coalesceAliases(data, ["tags", "tag"]));
            if (tags) data.tags = [...new Set(tags.map((tag) => slugTag(tag)))];
            const aliases = coerceToArray(coalesceAliases(data, ["aliases", "alias"]));
            if (aliases) data.aliases = aliases;
            const cssclasses = coerceToArray(coalesceAliases(data, ["cssclasses", "cssclass"]));
            if (cssclasses) data.cssclasses = cssclasses;
            file.data.frontmatter = data;
          };
        }
      ];
    }
  };
}, "FrontMatter");

// quartz/plugins/transformers/gfm.ts
import remarkGfm from "remark-gfm";
import smartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
var defaultOptions2 = {
  enableSmartyPants: true,
  linkHeadings: true
};
var GitHubFlavoredMarkdown = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions2, ...userOpts };
  return {
    name: "GitHubFlavoredMarkdown",
    markdownPlugins() {
      return opts.enableSmartyPants ? [remarkGfm, smartypants] : [remarkGfm];
    },
    htmlPlugins() {
      if (opts.linkHeadings) {
        return [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                role: "anchor",
                ariaHidden: true,
                tabIndex: -1,
                "data-no-popover": true
              },
              content: {
                type: "element",
                tagName: "svg",
                properties: {
                  width: 18,
                  height: 18,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round"
                },
                children: [
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                    },
                    children: []
                  },
                  {
                    type: "element",
                    tagName: "path",
                    properties: {
                      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                    },
                    children: []
                  }
                ]
              }
            }
          ]
        ];
      } else {
        return [];
      }
    }
  };
}, "GitHubFlavoredMarkdown");

// quartz/plugins/transformers/citations.ts
import rehypeCitation from "rehype-citation";
import { visit } from "unist-util-visit";

// quartz/plugins/transformers/lastmod.ts
import fs from "fs";
import path from "path";
import { Repository } from "@napi-rs/simple-git";
import chalk from "chalk";
var defaultOptions3 = {
  priority: ["frontmatter", "git", "filesystem"]
};
function coerceDate(fp, d) {
  const dt = new Date(d);
  const invalidDate = isNaN(dt.getTime()) || dt.getTime() === 0;
  if (invalidDate && d !== void 0) {
    console.log(
      chalk.yellow(
        `
Warning: found invalid date "${d}" in \`${fp}\`. Supported formats: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format`
      )
    );
  }
  return invalidDate ? /* @__PURE__ */ new Date() : dt;
}
__name(coerceDate, "coerceDate");
var CreatedModifiedDate = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions3, ...userOpts };
  return {
    name: "CreatedModifiedDate",
    markdownPlugins() {
      return [
        () => {
          let repo = void 0;
          return async (_tree, file) => {
            let created = void 0;
            let modified = void 0;
            let published = void 0;
            const fp = file.data.filePath;
            const fullFp = path.isAbsolute(fp) ? fp : path.posix.join(file.cwd, fp);
            for (const source of opts.priority) {
              if (source === "filesystem") {
                const st = await fs.promises.stat(fullFp);
                created ||= st.birthtimeMs;
                modified ||= st.mtimeMs;
              } else if (source === "frontmatter" && file.data.frontmatter) {
                created ||= file.data.frontmatter.date;
                modified ||= file.data.frontmatter.lastmod;
                modified ||= file.data.frontmatter.updated;
                modified ||= file.data.frontmatter["last-modified"];
                published ||= file.data.frontmatter.publishDate;
              } else if (source === "git") {
                if (!repo) {
                  repo = Repository.discover(file.cwd);
                }
                try {
                  modified ||= await repo.getFileLatestModifiedDateAsync(file.data.filePath);
                } catch {
                  console.log(
                    chalk.yellow(
                      `
Warning: ${file.data.filePath} isn't yet tracked by git, last modification date is not available for this file`
                    )
                  );
                }
              }
            }
            file.data.dates = {
              created: coerceDate(fp, created),
              modified: coerceDate(fp, modified),
              published: coerceDate(fp, published)
            };
          };
        }
      ];
    }
  };
}, "CreatedModifiedDate");

// quartz/plugins/transformers/latex.ts
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeMathjax from "rehype-mathjax/svg";
var Latex = /* @__PURE__ */ __name((opts) => {
  const engine = opts?.renderEngine ?? "katex";
  const macros = opts?.customMacros ?? {};
  return {
    name: "Latex",
    markdownPlugins() {
      return [remarkMath];
    },
    htmlPlugins() {
      if (engine === "katex") {
        return [[rehypeKatex, { output: "html", macros }]];
      } else {
        return [[rehypeMathjax, { macros }]];
      }
    },
    externalResources() {
      if (engine === "katex") {
        return {
          css: [
            // base css
            "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css"
          ],
          js: [
            {
              // fix copy behaviour: https://github.com/KaTeX/KaTeX/blob/main/contrib/copy-tex/README.md
              src: "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/copy-tex.min.js",
              loadTime: "afterDOMReady",
              contentType: "external"
            }
          ]
        };
      } else {
        return {};
      }
    }
  };
}, "Latex");

// quartz/plugins/transformers/description.ts
import { toString } from "hast-util-to-string";

// quartz/util/escape.ts
var escapeHTML = /* @__PURE__ */ __name((unsafe) => {
  return unsafe.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}, "escapeHTML");

// quartz/plugins/transformers/description.ts
var defaultOptions4 = {
  descriptionLength: 150,
  replaceExternalLinks: true
};
var urlRegex = new RegExp(
  /(https?:\/\/)?(?<domain>([\da-z\.-]+)\.([a-z\.]{2,6})(:\d+)?)(?<path>[\/\w\.-]*)(\?[\/\w\.=&;-]*)?/,
  "g"
);
var Description = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions4, ...userOpts };
  return {
    name: "Description",
    htmlPlugins() {
      return [
        () => {
          return async (tree, file) => {
            let frontMatterDescription = file.data.frontmatter?.description;
            let text = escapeHTML(toString(tree));
            if (opts.replaceExternalLinks) {
              frontMatterDescription = frontMatterDescription?.replace(
                urlRegex,
                "$<domain>$<path>"
              );
              text = text.replace(urlRegex, "$<domain>$<path>");
            }
            const desc = frontMatterDescription ?? text;
            const sentences = desc.replace(/\s+/g, " ").split(/\.\s/);
            const finalDesc = [];
            const len = opts.descriptionLength;
            let sentenceIdx = 0;
            let currentDescriptionLength = 0;
            if (sentences[0] !== void 0 && sentences[0].length >= len) {
              const firstSentence = sentences[0].split(" ");
              while (currentDescriptionLength < len) {
                const sentence = firstSentence[sentenceIdx];
                if (!sentence) break;
                finalDesc.push(sentence);
                currentDescriptionLength += sentence.length;
                sentenceIdx++;
              }
              finalDesc.push("...");
            } else {
              while (currentDescriptionLength < len) {
                const sentence = sentences[sentenceIdx];
                if (!sentence) break;
                const currentSentence = sentence.endsWith(".") ? sentence : sentence + ".";
                finalDesc.push(currentSentence);
                currentDescriptionLength += currentSentence.length;
                sentenceIdx++;
              }
            }
            file.data.description = finalDesc.join(" ");
            file.data.text = text;
          };
        }
      ];
    }
  };
}, "Description");

// quartz/plugins/transformers/links.ts
import path2 from "path";
import { visit as visit2 } from "unist-util-visit";
import isAbsoluteUrl from "is-absolute-url";
var defaultOptions5 = {
  markdownLinkResolution: "absolute",
  prettyLinks: true,
  openLinksInNewTab: false,
  lazyLoad: false,
  externalLinkIcon: true
};
var CrawlLinks = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions5, ...userOpts };
  return {
    name: "LinkProcessing",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree, file) => {
            const curSlug = simplifySlug(file.data.slug);
            const outgoing = /* @__PURE__ */ new Set();
            const transformOptions = {
              strategy: opts.markdownLinkResolution,
              allSlugs: ctx.allSlugs
            };
            visit2(tree, "element", (node, _index, _parent) => {
              if (node.tagName === "a" && node.properties && typeof node.properties.href === "string") {
                let dest = node.properties.href;
                const classes = node.properties.className ?? [];
                const isExternal = isAbsoluteUrl(dest);
                classes.push(isExternal ? "external" : "internal");
                if (isExternal && opts.externalLinkIcon) {
                  node.children.push({
                    type: "element",
                    tagName: "svg",
                    properties: {
                      "aria-hidden": "true",
                      class: "external-icon",
                      style: "max-width:0.8em;max-height:0.8em",
                      viewBox: "0 0 512 512"
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          d: "M320 0H288V64h32 82.7L201.4 265.4 178.7 288 224 333.3l22.6-22.6L448 109.3V192v32h64V192 32 0H480 320zM32 32H0V64 480v32H32 456h32V480 352 320H424v32 96H64V96h96 32V32H160 32z"
                        },
                        children: []
                      }
                    ]
                  });
                }
                if (node.children.length === 1 && node.children[0].type === "text" && node.children[0].value !== dest) {
                  classes.push("alias");
                }
                node.properties.className = classes;
                if (isExternal && opts.openLinksInNewTab) {
                  node.properties.target = "_blank";
                }
                const isInternal = !(isAbsoluteUrl(dest) || dest.startsWith("#"));
                if (isInternal) {
                  dest = node.properties.href = transformLink(
                    file.data.slug,
                    dest,
                    transformOptions
                  );
                  const url = new URL(dest, "https://base.com/" + stripSlashes(curSlug, true));
                  const canonicalDest = url.pathname;
                  let [destCanonical, _destAnchor] = splitAnchor(canonicalDest);
                  if (destCanonical.endsWith("/")) {
                    destCanonical += "index";
                  }
                  const full = decodeURIComponent(stripSlashes(destCanonical, true));
                  const simple = simplifySlug(full);
                  outgoing.add(simple);
                  node.properties["data-slug"] = full;
                }
                if (opts.prettyLinks && isInternal && node.children.length === 1 && node.children[0].type === "text" && !node.children[0].value.startsWith("#")) {
                  node.children[0].value = path2.basename(node.children[0].value);
                }
              }
              if (["img", "video", "audio", "iframe"].includes(node.tagName) && node.properties && typeof node.properties.src === "string") {
                if (opts.lazyLoad) {
                  node.properties.loading = "lazy";
                }
                if (!isAbsoluteUrl(node.properties.src)) {
                  let dest = node.properties.src;
                  dest = node.properties.src = transformLink(
                    file.data.slug,
                    dest,
                    transformOptions
                  );
                  node.properties.src = dest;
                }
              }
            });
            file.data.links = [...outgoing];
          };
        }
      ];
    }
  };
}, "CrawlLinks");

// quartz/plugins/transformers/ofm.ts
import { findAndReplace as mdastFindReplace } from "mdast-util-find-and-replace";
import rehypeRaw from "rehype-raw";
import { SKIP, visit as visit3 } from "unist-util-visit";
import path3 from "path";

// quartz/components/scripts/callout.inline.ts
var callout_inline_default = "";

// quartz/components/scripts/checkbox.inline.ts
var checkbox_inline_default = "";

// quartz/plugins/transformers/ofm.ts
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";

// quartz/util/lang.ts
function capitalize(s) {
  return s.substring(0, 1).toUpperCase() + s.substring(1);
}
__name(capitalize, "capitalize");
function classNames(displayClass, ...classes) {
  if (displayClass) {
    classes.push(displayClass);
  }
  return classes.join(" ");
}
__name(classNames, "classNames");

// quartz/plugins/transformers/ofm.ts
var defaultOptions6 = {
  comments: true,
  highlight: true,
  wikilinks: true,
  callouts: true,
  mermaid: true,
  parseTags: true,
  parseArrows: true,
  parseBlockReferences: true,
  enableInHtmlEmbed: false,
  enableYouTubeEmbed: true,
  enableVideoEmbed: true,
  enableCheckbox: false
};
var calloutMapping = {
  note: "note",
  abstract: "abstract",
  summary: "abstract",
  tldr: "abstract",
  info: "info",
  todo: "todo",
  tip: "tip",
  hint: "tip",
  important: "tip",
  success: "success",
  check: "success",
  done: "success",
  question: "question",
  help: "question",
  faq: "question",
  warning: "warning",
  attention: "warning",
  caution: "warning",
  failure: "failure",
  missing: "failure",
  fail: "failure",
  danger: "danger",
  error: "danger",
  bug: "bug",
  example: "example",
  quote: "quote",
  cite: "quote"
};
var arrowMapping = {
  "->": "&rarr;",
  "-->": "&rArr;",
  "=>": "&rArr;",
  "==>": "&rArr;",
  "<-": "&larr;",
  "<--": "&lArr;",
  "<=": "&lArr;",
  "<==": "&lArr;"
};
function canonicalizeCallout(calloutName) {
  const normalizedCallout = calloutName.toLowerCase();
  return calloutMapping[normalizedCallout] ?? calloutName;
}
__name(canonicalizeCallout, "canonicalizeCallout");
var externalLinkRegex = /^https?:\/\//i;
var arrowRegex = new RegExp(/(-{1,2}>|={1,2}>|<-{1,2}|<={1,2})/g);
var wikilinkRegex = new RegExp(
  /!?\[\[([^\[\]\|\#\\]+)?(#+[^\[\]\|\#\\]+)?(\\?\|[^\[\]\#]+)?\]\]/g
);
var tableRegex = new RegExp(/^\|([^\n])+\|\n(\|)( ?:?-{3,}:? ?\|)+\n(\|([^\n])+\|\n?)+/gm);
var tableWikilinkRegex = new RegExp(/(!?\[\[[^\]]*?\]\])/g);
var highlightRegex = new RegExp(/==([^=]+)==/g);
var commentRegex = new RegExp(/%%[\s\S]*?%%/g);
var calloutRegex = new RegExp(/^\[\!([\w-]+)\|?(.+?)?\]([+-]?)/);
var calloutLineRegex = new RegExp(/^> *\[\!\w+\|?.*?\][+-]?.*$/gm);
var tagRegex = new RegExp(
  /(?:^| )#((?:[-_\p{L}\p{Emoji}\p{M}\d])+(?:\/[-_\p{L}\p{Emoji}\p{M}\d]+)*)/gu
);
var blockReferenceRegex = new RegExp(/\^([-_A-Za-z0-9]+)$/g);
var ytLinkRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
var ytPlaylistLinkRegex = /[?&]list=([^#?&]*)/;
var videoExtensionRegex = new RegExp(/\.(mp4|webm|ogg|avi|mov|flv|wmv|mkv|mpg|mpeg|3gp|m4v)$/);
var wikilinkImageEmbedRegex = new RegExp(
  /^(?<alt>(?!^\d*x?\d*$).*?)?(\|?\s*?(?<width>\d+)(x(?<height>\d+))?)?$/
);
var ObsidianFlavoredMarkdown = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions6, ...userOpts };
  const mdastToHtml = /* @__PURE__ */ __name((ast) => {
    const hast = toHast(ast, { allowDangerousHtml: true });
    return toHtml(hast, { allowDangerousHtml: true });
  }, "mdastToHtml");
  return {
    name: "ObsidianFlavoredMarkdown",
    textTransform(_ctx, src) {
      if (opts.comments) {
        if (src instanceof Buffer) {
          src = src.toString();
        }
        src = src.replace(commentRegex, "");
      }
      if (opts.callouts) {
        if (src instanceof Buffer) {
          src = src.toString();
        }
        src = src.replace(calloutLineRegex, (value) => {
          return value + "\n> ";
        });
      }
      if (opts.wikilinks) {
        if (src instanceof Buffer) {
          src = src.toString();
        }
        src = src.replace(tableRegex, (value) => {
          return value.replace(tableWikilinkRegex, (_value, raw) => {
            let escaped = raw ?? "";
            escaped = escaped.replace("#", "\\#");
            escaped = escaped.replace(/((^|[^\\])(\\\\)*)\|/g, "$1\\|");
            return escaped;
          });
        });
        src = src.replace(wikilinkRegex, (value, ...capture) => {
          const [rawFp, rawHeader, rawAlias] = capture;
          const [fp, anchor] = splitAnchor(`${rawFp ?? ""}${rawHeader ?? ""}`);
          const blockRef = Boolean(rawHeader?.match(/^#?\^/)) ? "^" : "";
          const displayAnchor = anchor ? `#${blockRef}${anchor.trim().replace(/^#+/, "")}` : "";
          const displayAlias = rawAlias ?? rawHeader?.replace("#", "|") ?? "";
          const embedDisplay = value.startsWith("!") ? "!" : "";
          if (rawFp?.match(externalLinkRegex)) {
            return `${embedDisplay}[${displayAlias.replace(/^\|/, "")}](${rawFp})`;
          }
          return `${embedDisplay}[[${fp}${displayAnchor}${displayAlias}]]`;
        });
      }
      return src;
    },
    markdownPlugins(_ctx) {
      const plugins = [];
      plugins.push(() => {
        return (tree, file) => {
          const replacements = [];
          const base = pathToRoot(file.data.slug);
          if (opts.wikilinks) {
            replacements.push([
              wikilinkRegex,
              (value, ...capture) => {
                let [rawFp, rawHeader, rawAlias] = capture;
                const fp = rawFp?.trim() ?? "";
                const anchor = rawHeader?.trim() ?? "";
                const alias = rawAlias?.slice(1).trim();
                if (value.startsWith("!")) {
                  const ext = path3.extname(fp).toLowerCase();
                  const url2 = slugifyFilePath(fp);
                  if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".webp"].includes(ext)) {
                    const match = wikilinkImageEmbedRegex.exec(alias ?? "");
                    const alt = match?.groups?.alt ?? "";
                    const width = match?.groups?.width ?? "auto";
                    const height = match?.groups?.height ?? "auto";
                    return {
                      type: "image",
                      url: url2,
                      data: {
                        hProperties: {
                          width,
                          height,
                          alt
                        }
                      }
                    };
                  } else if ([".mp4", ".webm", ".ogv", ".mov", ".mkv"].includes(ext)) {
                    return {
                      type: "html",
                      value: `<video src="${url2}" controls></video>`
                    };
                  } else if ([".mp3", ".webm", ".wav", ".m4a", ".ogg", ".3gp", ".flac"].includes(ext)) {
                    return {
                      type: "html",
                      value: `<audio src="${url2}" controls></audio>`
                    };
                  } else if ([".pdf"].includes(ext)) {
                    return {
                      type: "html",
                      value: `<iframe src="${url2}" class="pdf"></iframe>`
                    };
                  } else {
                    const block = anchor;
                    return {
                      type: "html",
                      data: { hProperties: { transclude: true } },
                      value: `<blockquote class="transclude" data-url="${url2}" data-block="${block}" data-embed-alias="${alias}"><a href="${url2 + anchor}" class="transclude-inner">Transclude of ${url2}${block}</a></blockquote>`
                    };
                  }
                }
                const url = fp + anchor;
                return {
                  type: "link",
                  url,
                  children: [
                    {
                      type: "text",
                      value: alias ?? fp
                    }
                  ]
                };
              }
            ]);
          }
          if (opts.highlight) {
            replacements.push([
              highlightRegex,
              (_value, ...capture) => {
                const [inner] = capture;
                return {
                  type: "html",
                  value: `<span class="text-highlight">${inner}</span>`
                };
              }
            ]);
          }
          if (opts.parseArrows) {
            replacements.push([
              arrowRegex,
              (value, ..._capture) => {
                const maybeArrow = arrowMapping[value];
                if (maybeArrow === void 0) return SKIP;
                return {
                  type: "html",
                  value: `<span>${maybeArrow}</span>`
                };
              }
            ]);
          }
          if (opts.parseTags) {
            replacements.push([
              tagRegex,
              (_value, tag) => {
                if (/^[\/\d]+$/.test(tag)) {
                  return false;
                }
                tag = slugTag(tag);
                if (file.data.frontmatter) {
                  const noteTags = file.data.frontmatter.tags ?? [];
                  file.data.frontmatter.tags = [.../* @__PURE__ */ new Set([...noteTags, tag])];
                }
                return {
                  type: "link",
                  url: base + `/tags/${tag}`,
                  data: {
                    hProperties: {
                      className: ["tag-link"]
                    }
                  },
                  children: [
                    {
                      type: "text",
                      value: tag
                    }
                  ]
                };
              }
            ]);
          }
          if (opts.enableInHtmlEmbed) {
            visit3(tree, "html", (node) => {
              for (const [regex, replace] of replacements) {
                if (typeof replace === "string") {
                  node.value = node.value.replace(regex, replace);
                } else {
                  node.value = node.value.replace(regex, (substring, ...args) => {
                    const replaceValue = replace(substring, ...args);
                    if (typeof replaceValue === "string") {
                      return replaceValue;
                    } else if (Array.isArray(replaceValue)) {
                      return replaceValue.map(mdastToHtml).join("");
                    } else if (typeof replaceValue === "object" && replaceValue !== null) {
                      return mdastToHtml(replaceValue);
                    } else {
                      return substring;
                    }
                  });
                }
              }
            });
          }
          mdastFindReplace(tree, replacements);
        };
      });
      if (opts.enableVideoEmbed) {
        plugins.push(() => {
          return (tree, _file) => {
            visit3(tree, "image", (node, index, parent) => {
              if (parent && index != void 0 && videoExtensionRegex.test(node.url)) {
                const newNode = {
                  type: "html",
                  value: `<video controls src="${node.url}"></video>`
                };
                parent.children.splice(index, 1, newNode);
                return SKIP;
              }
            });
          };
        });
      }
      if (opts.callouts) {
        plugins.push(() => {
          return (tree, _file) => {
            visit3(tree, "blockquote", (node) => {
              if (node.children.length === 0) {
                return;
              }
              const [firstChild, ...calloutContent] = node.children;
              if (firstChild.type !== "paragraph" || firstChild.children[0]?.type !== "text") {
                return;
              }
              const text = firstChild.children[0].value;
              const restOfTitle = firstChild.children.slice(1);
              const [firstLine, ...remainingLines] = text.split("\n");
              const remainingText = remainingLines.join("\n");
              const match = firstLine.match(calloutRegex);
              if (match && match.input) {
                const [calloutDirective, typeString, calloutMetaData, collapseChar] = match;
                const calloutType = canonicalizeCallout(typeString.toLowerCase());
                const collapse = collapseChar === "+" || collapseChar === "-";
                const defaultState = collapseChar === "-" ? "collapsed" : "expanded";
                const titleContent = match.input.slice(calloutDirective.length).trim();
                const useDefaultTitle = titleContent === "" && restOfTitle.length === 0;
                const titleNode = {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      value: useDefaultTitle ? capitalize(typeString).replace(/-/g, " ") : titleContent + " "
                    },
                    ...restOfTitle
                  ]
                };
                const title = mdastToHtml(titleNode);
                const toggleIcon = `<div class="fold-callout-icon"></div>`;
                const titleHtml = {
                  type: "html",
                  value: `<div
                  class="callout-title"
                >
                  <div class="callout-icon"></div>
                  <div class="callout-title-inner">${title}</div>
                  ${collapse ? toggleIcon : ""}
                </div>`
                };
                const blockquoteContent = [titleHtml];
                if (remainingText.length > 0) {
                  blockquoteContent.push({
                    type: "paragraph",
                    children: [
                      {
                        type: "text",
                        value: remainingText
                      }
                    ]
                  });
                }
                node.children.splice(0, 1, ...blockquoteContent);
                const classNames2 = ["callout", calloutType];
                if (collapse) {
                  classNames2.push("is-collapsible");
                }
                if (defaultState === "collapsed") {
                  classNames2.push("is-collapsed");
                }
                node.data = {
                  hProperties: {
                    ...node.data?.hProperties ?? {},
                    className: classNames2.join(" "),
                    "data-callout": calloutType,
                    "data-callout-fold": collapse,
                    "data-callout-metadata": calloutMetaData
                  }
                };
                if (calloutContent.length > 0) {
                  const contentData = {
                    data: {
                      hProperties: {
                        className: "callout-content"
                      },
                      hName: "div"
                    },
                    type: "blockquote",
                    children: [...calloutContent]
                  };
                  node.children = [node.children[0], contentData];
                }
              }
            });
          };
        });
      }
      if (opts.mermaid) {
        plugins.push(() => {
          return (tree, _file) => {
            visit3(tree, "code", (node) => {
              if (node.lang === "mermaid") {
                node.data = {
                  hProperties: {
                    className: ["mermaid"]
                  }
                };
              }
            });
          };
        });
      }
      return plugins;
    },
    htmlPlugins() {
      const plugins = [rehypeRaw];
      if (opts.parseBlockReferences) {
        plugins.push(() => {
          const inlineTagTypes = /* @__PURE__ */ new Set(["p", "li"]);
          const blockTagTypes = /* @__PURE__ */ new Set(["blockquote"]);
          return (tree, file) => {
            file.data.blocks = {};
            visit3(tree, "element", (node, index, parent) => {
              if (blockTagTypes.has(node.tagName)) {
                const nextChild = parent?.children.at(index + 2);
                if (nextChild && nextChild.tagName === "p") {
                  const text = nextChild.children.at(0);
                  if (text && text.value && text.type === "text") {
                    const matches = text.value.match(blockReferenceRegex);
                    if (matches && matches.length >= 1) {
                      parent.children.splice(index + 2, 1);
                      const block = matches[0].slice(1);
                      if (!Object.keys(file.data.blocks).includes(block)) {
                        node.properties = {
                          ...node.properties,
                          id: block
                        };
                        file.data.blocks[block] = node;
                      }
                    }
                  }
                }
              } else if (inlineTagTypes.has(node.tagName)) {
                const last = node.children.at(-1);
                if (last && last.value && typeof last.value === "string") {
                  const matches = last.value.match(blockReferenceRegex);
                  if (matches && matches.length >= 1) {
                    last.value = last.value.slice(0, -matches[0].length);
                    const block = matches[0].slice(1);
                    if (last.value === "") {
                      let idx = (index ?? 1) - 1;
                      while (idx >= 0) {
                        const element = parent?.children.at(idx);
                        if (!element) break;
                        if (element.type !== "element") {
                          idx -= 1;
                        } else {
                          if (!Object.keys(file.data.blocks).includes(block)) {
                            element.properties = {
                              ...element.properties,
                              id: block
                            };
                            file.data.blocks[block] = element;
                          }
                          return;
                        }
                      }
                    } else {
                      if (!Object.keys(file.data.blocks).includes(block)) {
                        node.properties = {
                          ...node.properties,
                          id: block
                        };
                        file.data.blocks[block] = node;
                      }
                    }
                  }
                }
              }
            });
            file.data.htmlAst = tree;
          };
        });
      }
      if (opts.enableYouTubeEmbed) {
        plugins.push(() => {
          return (tree) => {
            visit3(tree, "element", (node) => {
              if (node.tagName === "img" && typeof node.properties.src === "string") {
                const match = node.properties.src.match(ytLinkRegex);
                const videoId = match && match[2].length == 11 ? match[2] : null;
                const playlistId = node.properties.src.match(ytPlaylistLinkRegex)?.[1];
                if (videoId) {
                  node.tagName = "iframe";
                  node.properties = {
                    class: "external-embed youtube",
                    allow: "fullscreen",
                    frameborder: 0,
                    width: "600px",
                    src: playlistId ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}` : `https://www.youtube.com/embed/${videoId}`
                  };
                } else if (playlistId) {
                  node.tagName = "iframe";
                  node.properties = {
                    class: "external-embed youtube",
                    allow: "fullscreen",
                    frameborder: 0,
                    width: "600px",
                    src: `https://www.youtube.com/embed/videoseries?list=${playlistId}`
                  };
                }
              }
            });
          };
        });
      }
      if (opts.enableCheckbox) {
        plugins.push(() => {
          return (tree, _file) => {
            visit3(tree, "element", (node) => {
              if (node.tagName === "input" && node.properties.type === "checkbox") {
                const isChecked = node.properties?.checked ?? false;
                node.properties = {
                  type: "checkbox",
                  disabled: false,
                  checked: isChecked,
                  class: "checkbox-toggle"
                };
              }
            });
          };
        });
      }
      return plugins;
    },
    externalResources() {
      const js = [];
      if (opts.enableCheckbox) {
        js.push({
          script: checkbox_inline_default,
          loadTime: "afterDOMReady",
          contentType: "inline"
        });
      }
      if (opts.callouts) {
        js.push({
          script: callout_inline_default,
          loadTime: "afterDOMReady",
          contentType: "inline"
        });
      }
      if (opts.mermaid) {
        js.push({
          script: `
          let mermaidImport = undefined
          document.addEventListener('nav', async () => {
            if (document.querySelector("code.mermaid")) {
              mermaidImport ||= await import('https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.7.0/mermaid.esm.min.mjs')
              const mermaid = mermaidImport.default
              const darkMode = document.documentElement.getAttribute('saved-theme') === 'dark'
              mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                theme: darkMode ? 'dark' : 'default'
              })

              await mermaid.run({
                querySelector: '.mermaid'
              })
            }
          });
          `,
          loadTime: "afterDOMReady",
          moduleType: "module",
          contentType: "inline"
        });
      }
      return { js };
    }
  };
}, "ObsidianFlavoredMarkdown");

// quartz/plugins/transformers/oxhugofm.ts
var relrefRegex = new RegExp(/\[([^\]]+)\]\(\{\{< relref "([^"]+)" >\}\}\)/, "g");
var predefinedHeadingIdRegex = new RegExp(/(.*) {#(?:.*)}/, "g");
var hugoShortcodeRegex = new RegExp(/{{(.*)}}/, "g");
var figureTagRegex = new RegExp(/< ?figure src="(.*)" ?>/, "g");
var inlineLatexRegex = new RegExp(/\\\\\((.+?)\\\\\)/, "g");
var blockLatexRegex = new RegExp(
  /(?:\\begin{equation}|\\\\\(|\\\\\[)([\s\S]*?)(?:\\\\\]|\\\\\)|\\end{equation})/,
  "g"
);
var quartzLatexRegex = new RegExp(/\$\$[\s\S]*?\$\$|\$.*?\$/, "g");

// quartz/plugins/transformers/syntax.ts
import rehypePrettyCode from "rehype-pretty-code";
var defaultOptions7 = {
  theme: {
    light: "github-light",
    dark: "github-dark"
  },
  keepBackground: false
};
var SyntaxHighlighting = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions7, ...userOpts };
  return {
    name: "SyntaxHighlighting",
    htmlPlugins() {
      return [[rehypePrettyCode, opts]];
    }
  };
}, "SyntaxHighlighting");

// quartz/plugins/transformers/toc.ts
import { visit as visit4 } from "unist-util-visit";
import { toString as toString2 } from "mdast-util-to-string";
import Slugger from "github-slugger";
var defaultOptions8 = {
  maxDepth: 3,
  minEntries: 1,
  showByDefault: true,
  collapseByDefault: true
};
var slugAnchor2 = new Slugger();
var TableOfContents = /* @__PURE__ */ __name((userOpts) => {
  const opts = { ...defaultOptions8, ...userOpts };
  return {
    name: "TableOfContents",
    markdownPlugins() {
      return [
        () => {
          return async (tree, file) => {
            const display = file.data.frontmatter?.enableToc ?? opts.showByDefault;
            if (display) {
              slugAnchor2.reset();
              const toc = [];
              let highestDepth = opts.maxDepth;
              visit4(tree, "heading", (node) => {
                if (node.depth <= opts.maxDepth) {
                  const text = toString2(node);
                  highestDepth = Math.min(highestDepth, node.depth);
                  toc.push({
                    depth: node.depth,
                    text,
                    slug: slugAnchor2.slug(text)
                  });
                }
              });
              if (toc.length > 0 && toc.length > opts.minEntries) {
                file.data.toc = toc.map((entry) => ({
                  ...entry,
                  depth: entry.depth - highestDepth
                }));
                file.data.collapseToc = opts.collapseByDefault;
              }
            }
          };
        }
      ];
    }
  };
}, "TableOfContents");

// quartz/plugins/transformers/linebreaks.ts
import remarkBreaks from "remark-breaks";

// quartz/plugins/transformers/roam.ts
import { visit as visit5 } from "unist-util-visit";
import { findAndReplace as mdastFindReplace2 } from "mdast-util-find-and-replace";
var orRegex = new RegExp(/{{or:(.*?)}}/, "g");
var TODORegex = new RegExp(/{{.*?\bTODO\b.*?}}/, "g");
var DONERegex = new RegExp(/{{.*?\bDONE\b.*?}}/, "g");
var videoRegex = new RegExp(/{{.*?\[\[video\]\].*?\:(.*?)}}/, "g");
var youtubeRegex = new RegExp(
  /{{.*?\[\[video\]\].*?(https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?=]*)?)}}/,
  "g"
);
var audioRegex = new RegExp(/{{.*?\[\[audio\]\].*?\:(.*?)}}/, "g");
var pdfRegex = new RegExp(/{{.*?\[\[pdf\]\].*?\:(.*?)}}/, "g");
var blockquoteRegex = new RegExp(/(\[\[>\]\])\s*(.*)/, "g");
var roamHighlightRegex = new RegExp(/\^\^(.+)\^\^/, "g");
var roamItalicRegex = new RegExp(/__(.+)__/, "g");
var tableRegex2 = new RegExp(/- {{.*?\btable\b.*?}}/, "g");
var attributeRegex = new RegExp(/\b\w+(?:\s+\w+)*::/, "g");

// quartz/plugins/filters/draft.ts
var RemoveDrafts = /* @__PURE__ */ __name(() => ({
  name: "RemoveDrafts",
  shouldPublish(_ctx, [_tree, vfile]) {
    const draftFlag = vfile.data?.frontmatter?.draft === true || vfile.data?.frontmatter?.draft === "true";
    return !draftFlag;
  }
}), "RemoveDrafts");

// quartz/plugins/emitters/contentPage.tsx
import path6 from "path";
import { visit as visit7 } from "unist-util-visit";

// quartz/components/Header.tsx
import { jsx } from "preact/jsx-runtime";
var Header = /* @__PURE__ */ __name(({ children }) => {
  return children.length > 0 ? /* @__PURE__ */ jsx("header", { children }) : null;
}, "Header");
Header.css = `
header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem 0;
  gap: 1.5rem;
}

header h1 {
  margin: 0;
  flex: auto;
}
`;
var Header_default = /* @__PURE__ */ __name(() => Header, "default");

// quartz/components/scripts/clipboard.inline.ts
var clipboard_inline_default = "";

// quartz/components/styles/clipboard.scss
var clipboard_default = "";

// quartz/components/Body.tsx
import { jsx as jsx2 } from "preact/jsx-runtime";
var Body = /* @__PURE__ */ __name(({ children }) => {
  return /* @__PURE__ */ jsx2("div", { id: "quartz-body", children });
}, "Body");
Body.afterDOMLoaded = clipboard_inline_default;
Body.css = clipboard_default;
var Body_default = /* @__PURE__ */ __name(() => Body, "default");

// quartz/components/renderPage.tsx
import { render } from "preact-render-to-string";

// quartz/util/resources.tsx
import { randomUUID } from "crypto";
import { jsx as jsx3 } from "preact/jsx-runtime";
function JSResourceToScriptElement(resource, preserve) {
  const scriptType = resource.moduleType ?? "application/javascript";
  const spaPreserve = preserve ?? resource.spaPreserve;
  if (resource.contentType === "external") {
    return /* @__PURE__ */ jsx3("script", { src: resource.src, type: scriptType, "spa-preserve": spaPreserve }, resource.src);
  } else {
    const content = resource.script;
    return /* @__PURE__ */ jsx3(
      "script",
      {
        type: scriptType,
        "spa-preserve": spaPreserve,
        dangerouslySetInnerHTML: { __html: content }
      },
      randomUUID()
    );
  }
}
__name(JSResourceToScriptElement, "JSResourceToScriptElement");

// quartz/components/renderPage.tsx
import { visit as visit6 } from "unist-util-visit";
import { jsx as jsx4, jsxs } from "preact/jsx-runtime";
var headerRegex = new RegExp(/h[1-6]/);
function pageResources(baseDir, staticResources) {
  const contentIndexPath = joinSegments(baseDir, "static/contentIndex.json");
  const contentIndexScript = `const fetchData = fetch("${contentIndexPath}").then(data => data.json())`;
  return {
    css: [joinSegments(baseDir, "index.css"), ...staticResources.css],
    js: [
      {
        src: joinSegments(baseDir, "prescript.js"),
        loadTime: "beforeDOMReady",
        contentType: "external"
      },
      {
        loadTime: "beforeDOMReady",
        contentType: "inline",
        spaPreserve: true,
        script: contentIndexScript
      },
      ...staticResources.js,
      {
        src: joinSegments(baseDir, "postscript.js"),
        loadTime: "afterDOMReady",
        moduleType: "module",
        contentType: "external"
      }
    ]
  };
}
__name(pageResources, "pageResources");
function renderPage(cfg, slug, componentData, components, pageResources2) {
  const root = clone(componentData.tree);
  visit6(root, "element", (node, _index, _parent) => {
    if (node.tagName === "blockquote") {
      const classNames2 = node.properties?.className ?? [];
      if (classNames2.includes("transclude")) {
        const inner = node.children[0];
        const transcludeTarget = inner.properties["data-slug"];
        const page = componentData.allFiles.find((f) => f.slug === transcludeTarget);
        if (!page) {
          return;
        }
        let blockRef = node.properties.dataBlock;
        if (blockRef?.startsWith("#^")) {
          blockRef = blockRef.slice("#^".length);
          let blockNode = page.blocks?.[blockRef];
          if (blockNode) {
            if (blockNode.tagName === "li") {
              blockNode = {
                type: "element",
                tagName: "ul",
                properties: {},
                children: [blockNode]
              };
            }
            node.children = [
              normalizeHastElement(blockNode, slug, transcludeTarget),
              {
                type: "element",
                tagName: "a",
                properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
                children: [
                  { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal }
                ]
              }
            ];
          }
        } else if (blockRef?.startsWith("#") && page.htmlAst) {
          blockRef = blockRef.slice(1);
          let startIdx = void 0;
          let startDepth = void 0;
          let endIdx = void 0;
          for (const [i, el] of page.htmlAst.children.entries()) {
            if (!(el.type === "element" && el.tagName.match(headerRegex))) continue;
            const depth = Number(el.tagName.substring(1));
            if (startIdx === void 0 || startDepth === void 0) {
              if (el.properties?.id === blockRef) {
                startIdx = i;
                startDepth = depth;
              }
            } else if (depth <= startDepth) {
              endIdx = i;
              break;
            }
          }
          if (startIdx === void 0) {
            return;
          }
          node.children = [
            ...page.htmlAst.children.slice(startIdx, endIdx).map(
              (child) => normalizeHastElement(child, slug, transcludeTarget)
            ),
            {
              type: "element",
              tagName: "a",
              properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
              children: [
                { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal }
              ]
            }
          ];
        } else if (page.htmlAst) {
          node.children = [
            {
              type: "element",
              tagName: "h1",
              properties: {},
              children: [
                {
                  type: "text",
                  value: page.frontmatter?.title ?? i18n(cfg.locale).components.transcludes.transcludeOf({
                    targetSlug: page.slug
                  })
                }
              ]
            },
            ...page.htmlAst.children.map(
              (child) => normalizeHastElement(child, slug, transcludeTarget)
            ),
            {
              type: "element",
              tagName: "a",
              properties: { href: inner.properties?.href, class: ["internal", "transclude-src"] },
              children: [
                { type: "text", value: i18n(cfg.locale).components.transcludes.linkToOriginal }
              ]
            }
          ];
        }
      }
    }
  });
  componentData.tree = root;
  const {
    head: Head,
    header,
    beforeBody,
    pageBody: Content2,
    afterBody,
    left,
    right,
    footer: Footer
  } = components;
  const Header2 = Header_default();
  const Body2 = Body_default();
  const LeftComponent = /* @__PURE__ */ jsx4("div", { class: "left sidebar", children: left.map((BodyComponent) => /* @__PURE__ */ jsx4(BodyComponent, { ...componentData })) });
  const RightComponent = /* @__PURE__ */ jsx4("div", { class: "right sidebar", children: right.map((BodyComponent) => /* @__PURE__ */ jsx4(BodyComponent, { ...componentData })) });
  const lang = componentData.fileData.frontmatter?.lang ?? cfg.locale?.split("-")[0] ?? "en";
  const doc = /* @__PURE__ */ jsxs("html", { lang, children: [
    /* @__PURE__ */ jsx4(Head, { ...componentData }),
    /* @__PURE__ */ jsx4("body", { "data-slug": slug, children: /* @__PURE__ */ jsx4("div", { id: "quartz-root", class: "page", children: /* @__PURE__ */ jsxs(Body2, { ...componentData, children: [
      LeftComponent,
      /* @__PURE__ */ jsxs("div", { class: "center", children: [
        /* @__PURE__ */ jsxs("div", { class: "page-header", children: [
          /* @__PURE__ */ jsx4(Header2, { ...componentData }),
          header.map((HeaderComponent) => /* @__PURE__ */ jsx4(HeaderComponent, { ...componentData })),
          /* @__PURE__ */ jsx4("div", { class: "popover-hint", children: beforeBody.map((BodyComponent) => /* @__PURE__ */ jsx4(BodyComponent, { ...componentData })) })
        ] }),
        /* @__PURE__ */ jsx4(Content2, { ...componentData }),
        /* @__PURE__ */ jsx4("hr", {}),
        /* @__PURE__ */ jsx4("div", { class: "page-footer", children: afterBody.map((BodyComponent) => /* @__PURE__ */ jsx4(BodyComponent, { ...componentData })) })
      ] }),
      RightComponent,
      /* @__PURE__ */ jsx4(Footer, { ...componentData })
    ] }) }) }),
    pageResources2.js.filter((resource) => resource.loadTime === "afterDOMReady").map((res) => JSResourceToScriptElement(res))
  ] });
  return "<!DOCTYPE html>\n" + render(doc);
}
__name(renderPage, "renderPage");

// quartz/util/jsx.tsx
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx as jsx5, jsxs as jsxs2 } from "preact/jsx-runtime";

// quartz/util/trace.ts
import chalk2 from "chalk";
import process2 from "process";
import { isMainThread } from "workerpool";
var rootFile = /.*at file:/;
function trace(msg, err) {
  let stack = err.stack ?? "";
  const lines = [];
  lines.push("");
  lines.push(
    "\n" + chalk2.bgRed.black.bold(" ERROR ") + "\n\n" + chalk2.red(` ${msg}`) + (err.message.length > 0 ? `: ${err.message}` : "")
  );
  let reachedEndOfLegibleTrace = false;
  for (const line of stack.split("\n").slice(1)) {
    if (reachedEndOfLegibleTrace) {
      break;
    }
    if (!line.includes("node_modules")) {
      lines.push(` ${line}`);
      if (rootFile.test(line)) {
        reachedEndOfLegibleTrace = true;
      }
    }
  }
  const traceMsg = lines.join("\n");
  if (!isMainThread) {
    throw new Error(traceMsg);
  } else {
    console.error(traceMsg);
    process2.exit(1);
  }
}
__name(trace, "trace");

// quartz/util/jsx.tsx
import { jsx as jsx6 } from "preact/jsx-runtime";
var customComponents = {
  table: /* @__PURE__ */ __name((props) => /* @__PURE__ */ jsx6("div", { class: "table-container", children: /* @__PURE__ */ jsx6("table", { ...props }) }), "table")
};
function htmlToJsx(fp, tree) {
  try {
    return toJsxRuntime(tree, {
      Fragment,
      jsx: jsx5,
      jsxs: jsxs2,
      elementAttributeNameCase: "html",
      components: customComponents
    });
  } catch (e) {
    trace(`Failed to parse Markdown in \`${fp}\` into JSX`, e);
  }
}
__name(htmlToJsx, "htmlToJsx");

// quartz/components/pages/Content.tsx
import { jsx as jsx7 } from "preact/jsx-runtime";
var Content = /* @__PURE__ */ __name(({ fileData, tree }) => {
  const content = htmlToJsx(fileData.filePath, tree);
  const classes = fileData.frontmatter?.cssclasses ?? [];
  const classString = ["popover-hint", ...classes].join(" ");
  return /* @__PURE__ */ jsx7("article", { class: classString, children: content });
}, "Content");
var Content_default = /* @__PURE__ */ __name(() => Content, "default");

// quartz/components/styles/listPage.scss
var listPage_default = "";

// quartz/components/Date.tsx
import { Fragment as Fragment2, jsx as jsx8 } from "preact/jsx-runtime";
function getDate(cfg, data) {
  if (!cfg.defaultDateType) {
    throw new Error(
      `Field 'defaultDateType' was not set in the configuration object of quartz.config.ts. See https://quartz.jzhao.xyz/configuration#general-configuration for more details.`
    );
  }
  return data.dates?.[cfg.defaultDateType];
}
__name(getDate, "getDate");
function formatDate(d, locale = "en-US") {
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}
__name(formatDate, "formatDate");
function Date2({ date, locale }) {
  return /* @__PURE__ */ jsx8(Fragment2, { children: formatDate(date, locale) });
}
__name(Date2, "Date");

// quartz/components/PageList.tsx
import { jsx as jsx9, jsxs as jsxs3 } from "preact/jsx-runtime";
function byDateAndAlphabetical(cfg) {
  return (f1, f2) => {
    if (f1.dates && f2.dates) {
      return getDate(cfg, f2).getTime() - getDate(cfg, f1).getTime();
    } else if (f1.dates && !f2.dates) {
      return -1;
    } else if (!f1.dates && f2.dates) {
      return 1;
    }
    const f1Title = f1.frontmatter?.title.toLowerCase() ?? "";
    const f2Title = f2.frontmatter?.title.toLowerCase() ?? "";
    return f1Title.localeCompare(f2Title);
  };
}
__name(byDateAndAlphabetical, "byDateAndAlphabetical");
var PageList = /* @__PURE__ */ __name(({ cfg, fileData, allFiles, limit, sort }) => {
  const sorter = sort ?? byDateAndAlphabetical(cfg);
  let list = allFiles.sort(sorter);
  if (limit) {
    list = list.slice(0, limit);
  }
  return /* @__PURE__ */ jsx9("ul", { class: "section-ul", children: list.map((page) => {
    const title = page.frontmatter?.title;
    const tags = page.frontmatter?.tags ?? [];
    return /* @__PURE__ */ jsx9("li", { class: "section-li", children: /* @__PURE__ */ jsxs3("div", { class: "section", children: [
      /* @__PURE__ */ jsx9("div", { children: page.dates && /* @__PURE__ */ jsx9("p", { class: "meta", children: /* @__PURE__ */ jsx9(Date2, { date: getDate(cfg, page), locale: cfg.locale }) }) }),
      /* @__PURE__ */ jsx9("div", { class: "desc", children: /* @__PURE__ */ jsx9("h3", { children: /* @__PURE__ */ jsx9("a", { href: resolveRelative(fileData.slug, page.slug), class: "internal", children: title }) }) })
    ] }) });
  }) });
}, "PageList");
PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
`;

// quartz/components/pages/TagContent.tsx
import { Fragment as Fragment3, jsx as jsx10, jsxs as jsxs4 } from "preact/jsx-runtime";
var defaultOptions9 = {
  numPages: 10
};
var TagContent_default = /* @__PURE__ */ __name((opts) => {
  const options2 = { ...defaultOptions9, ...opts };
  const TagContent = /* @__PURE__ */ __name((props) => {
    const { tree, fileData, allFiles, cfg } = props;
    const slug = fileData.slug;
    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`);
    }
    const tag = simplifySlug(slug.slice("tags/".length));
    const allPagesWithTag = /* @__PURE__ */ __name((tag2) => allFiles.filter(
      (file) => (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag2)
    ), "allPagesWithTag");
    const content = tree.children.length === 0 ? fileData.description : htmlToJsx(fileData.filePath, tree);
    const cssClasses = fileData.frontmatter?.cssclasses ?? [];
    const classes = ["popover-hint", ...cssClasses].join(" ");
    if (tag === "/") {
      const tags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes)
        )
      ].sort((a, b) => a.localeCompare(b));
      const tagItemMap = /* @__PURE__ */ new Map();
      for (const tag2 of tags) {
        tagItemMap.set(tag2, allPagesWithTag(tag2));
      }
      return /* @__PURE__ */ jsxs4("div", { class: classes, children: [
        /* @__PURE__ */ jsx10("article", { children: /* @__PURE__ */ jsx10("p", { children: content }) }),
        /* @__PURE__ */ jsx10("p", { children: i18n(cfg.locale).pages.tagContent.totalTags({ count: tags.length }) }),
        /* @__PURE__ */ jsx10("div", { children: tags.map((tag2) => {
          const pages = tagItemMap.get(tag2);
          const listProps = {
            ...props,
            allFiles: pages
          };
          const contentPage = allFiles.filter((file) => file.slug === `tags/${tag2}`).at(0);
          const root = contentPage?.htmlAst;
          const content2 = !root || root?.children.length === 0 ? contentPage?.description : htmlToJsx(contentPage.filePath, root);
          return /* @__PURE__ */ jsxs4("div", { children: [
            /* @__PURE__ */ jsx10("h2", { children: /* @__PURE__ */ jsx10("a", { class: "internal tag-link", href: `../tags/${tag2}`, children: tag2 }) }),
            content2 && /* @__PURE__ */ jsx10("p", { children: content2 }),
            /* @__PURE__ */ jsxs4("div", { class: "page-listing", children: [
              /* @__PURE__ */ jsxs4("p", { children: [
                i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length }),
                pages.length > options2.numPages && /* @__PURE__ */ jsxs4(Fragment3, { children: [
                  " ",
                  /* @__PURE__ */ jsx10("span", { children: i18n(cfg.locale).pages.tagContent.showingFirst({
                    count: options2.numPages
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsx10(PageList, { limit: options2.numPages, ...listProps, sort: opts?.sort })
            ] })
          ] });
        }) })
      ] });
    } else {
      const pages = allPagesWithTag(tag);
      const listProps = {
        ...props,
        allFiles: pages
      };
      return /* @__PURE__ */ jsxs4("div", { class: classes, children: [
        /* @__PURE__ */ jsx10("article", { children: content }),
        /* @__PURE__ */ jsxs4("div", { class: "page-listing", children: [
          /* @__PURE__ */ jsx10("p", { children: i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length }) }),
          /* @__PURE__ */ jsx10("div", { children: /* @__PURE__ */ jsx10(PageList, { ...listProps }) })
        ] })
      ] });
    }
  }, "TagContent");
  TagContent.css = listPage_default + PageList.css;
  return TagContent;
}, "default");

// quartz/components/pages/FolderContent.tsx
import path4 from "path";
import { jsx as jsx11, jsxs as jsxs5 } from "preact/jsx-runtime";
var defaultOptions10 = {
  showFolderCount: true,
  showSubfolders: true
};
var FolderContent_default = /* @__PURE__ */ __name((opts) => {
  const options2 = { ...defaultOptions10, ...opts };
  const FolderContent = /* @__PURE__ */ __name((props) => {
    const { tree, fileData, allFiles, cfg } = props;
    const folderSlug = stripSlashes(simplifySlug(fileData.slug));
    const folderParts = folderSlug.split(path4.posix.sep);
    const allPagesInFolder = [];
    const allPagesInSubfolders = /* @__PURE__ */ new Map();
    allFiles.forEach((file) => {
      const fileSlug = stripSlashes(simplifySlug(file.slug));
      const prefixed = fileSlug.startsWith(folderSlug) && fileSlug !== folderSlug;
      const fileParts = fileSlug.split(path4.posix.sep);
      const isDirectChild = fileParts.length === folderParts.length + 1;
      if (!prefixed) {
        return;
      }
      if (isDirectChild) {
        allPagesInFolder.push(file);
      } else if (options2.showSubfolders) {
        const subfolderSlug = joinSegments(
          ...fileParts.slice(0, folderParts.length + 1)
        );
        const pagesInFolder = allPagesInSubfolders.get(subfolderSlug) || [];
        allPagesInSubfolders.set(subfolderSlug, [...pagesInFolder, file]);
      }
    });
    allPagesInSubfolders.forEach((files, subfolderSlug) => {
      const hasIndex = allPagesInFolder.some(
        (file) => subfolderSlug === stripSlashes(simplifySlug(file.slug))
      );
      if (!hasIndex) {
        const subfolderDates = files.sort(byDateAndAlphabetical(cfg))[0].dates;
        const subfolderTitle = subfolderSlug.split(path4.posix.sep).at(-1);
        allPagesInFolder.push({
          slug: subfolderSlug,
          dates: subfolderDates,
          frontmatter: { title: subfolderTitle, tags: ["folder"] }
        });
      }
    });
    const cssClasses = fileData.frontmatter?.cssclasses ?? [];
    const classes = ["popover-hint", ...cssClasses].join(" ");
    const listProps = {
      ...props,
      sort: options2.sort,
      allFiles: allPagesInFolder
    };
    const content = tree.children.length === 0 ? fileData.description : htmlToJsx(fileData.filePath, tree);
    return /* @__PURE__ */ jsxs5("div", { class: classes, children: [
      /* @__PURE__ */ jsx11("article", { children: content }),
      /* @__PURE__ */ jsxs5("div", { class: "page-listing", children: [
        options2.showFolderCount && /* @__PURE__ */ jsx11("p", { children: i18n(cfg.locale).pages.folderContent.itemsUnderFolder({
          count: allPagesInFolder.length
        }) }),
        /* @__PURE__ */ jsx11("div", { children: /* @__PURE__ */ jsx11(PageList, { ...listProps }) })
      ] })
    ] });
  }, "FolderContent");
  FolderContent.css = listPage_default + PageList.css;
  return FolderContent;
}, "default");

// quartz/components/pages/404.tsx
import { jsx as jsx12, jsxs as jsxs6 } from "preact/jsx-runtime";
var NotFound = /* @__PURE__ */ __name(({ cfg }) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`);
  const baseDir = url.pathname;
  return /* @__PURE__ */ jsxs6("article", { class: "popover-hint", children: [
    /* @__PURE__ */ jsx12("h1", { children: "404" }),
    /* @__PURE__ */ jsx12("p", { children: i18n(cfg.locale).pages.error.notFound }),
    /* @__PURE__ */ jsx12("a", { href: baseDir, children: i18n(cfg.locale).pages.error.home })
  ] });
}, "NotFound");
var __default = /* @__PURE__ */ __name(() => NotFound, "default");

// quartz/components/ArticleTitle.tsx
import { jsx as jsx13 } from "preact/jsx-runtime";
var ArticleTitle = /* @__PURE__ */ __name(({ fileData, displayClass }) => {
  const title = fileData.frontmatter?.title;
  if (title) {
    return /* @__PURE__ */ jsx13("h1", { class: classNames(displayClass, "article-title"), children: title });
  } else {
    return null;
  }
}, "ArticleTitle");
ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`;
var ArticleTitle_default = /* @__PURE__ */ __name(() => ArticleTitle, "default");

// quartz/components/scripts/darkmode.inline.ts
var darkmode_inline_default = "";

// quartz/components/styles/darkmode.scss
var darkmode_default = "";

// quartz/components/Darkmode.tsx
import { jsx as jsx14, jsxs as jsxs7 } from "preact/jsx-runtime";
var Darkmode = /* @__PURE__ */ __name(({ displayClass, cfg }) => {
  return /* @__PURE__ */ jsxs7("button", { class: classNames(displayClass, "darkmode"), id: "darkmode", children: [
    /* @__PURE__ */ jsxs7(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        xmlnsXlink: "http://www.w3.org/1999/xlink",
        version: "1.1",
        id: "dayIcon",
        x: "0px",
        y: "0px",
        viewBox: "0 0 35 35",
        style: "enable-background:new 0 0 35 35",
        xmlSpace: "preserve",
        "aria-label": i18n(cfg.locale).components.themeToggle.darkMode,
        children: [
          /* @__PURE__ */ jsx14("title", { children: i18n(cfg.locale).components.themeToggle.darkMode }),
          /* @__PURE__ */ jsx14("path", { d: "M6,17.5C6,16.672,5.328,16,4.5,16h-3C0.672,16,0,16.672,0,17.5    S0.672,19,1.5,19h3C5.328,19,6,18.328,6,17.5z M7.5,26c-0.414,0-0.789,0.168-1.061,0.439l-2,2C4.168,28.711,4,29.086,4,29.5    C4,30.328,4.671,31,5.5,31c0.414,0,0.789-0.168,1.06-0.44l2-2C8.832,28.289,9,27.914,9,27.5C9,26.672,8.329,26,7.5,26z M17.5,6    C18.329,6,19,5.328,19,4.5v-3C19,0.672,18.329,0,17.5,0S16,0.672,16,1.5v3C16,5.328,16.671,6,17.5,6z M27.5,9    c0.414,0,0.789-0.168,1.06-0.439l2-2C30.832,6.289,31,5.914,31,5.5C31,4.672,30.329,4,29.5,4c-0.414,0-0.789,0.168-1.061,0.44    l-2,2C26.168,6.711,26,7.086,26,7.5C26,8.328,26.671,9,27.5,9z M6.439,8.561C6.711,8.832,7.086,9,7.5,9C8.328,9,9,8.328,9,7.5    c0-0.414-0.168-0.789-0.439-1.061l-2-2C6.289,4.168,5.914,4,5.5,4C4.672,4,4,4.672,4,5.5c0,0.414,0.168,0.789,0.439,1.06    L6.439,8.561z M33.5,16h-3c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5h3c0.828,0,1.5-0.672,1.5-1.5S34.328,16,33.5,16z     M28.561,26.439C28.289,26.168,27.914,26,27.5,26c-0.828,0-1.5,0.672-1.5,1.5c0,0.414,0.168,0.789,0.439,1.06l2,2    C28.711,30.832,29.086,31,29.5,31c0.828,0,1.5-0.672,1.5-1.5c0-0.414-0.168-0.789-0.439-1.061L28.561,26.439z M17.5,29    c-0.829,0-1.5,0.672-1.5,1.5v3c0,0.828,0.671,1.5,1.5,1.5s1.5-0.672,1.5-1.5v-3C19,29.672,18.329,29,17.5,29z M17.5,7    C11.71,7,7,11.71,7,17.5S11.71,28,17.5,28S28,23.29,28,17.5S23.29,7,17.5,7z M17.5,25c-4.136,0-7.5-3.364-7.5-7.5    c0-4.136,3.364-7.5,7.5-7.5c4.136,0,7.5,3.364,7.5,7.5C25,21.636,21.636,25,17.5,25z" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs7(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        xmlnsXlink: "http://www.w3.org/1999/xlink",
        version: "1.1",
        id: "nightIcon",
        x: "0px",
        y: "0px",
        viewBox: "0 0 100 100",
        style: "enable-background:new 0 0 100 100",
        xmlSpace: "preserve",
        "aria-label": i18n(cfg.locale).components.themeToggle.lightMode,
        children: [
          /* @__PURE__ */ jsx14("title", { children: i18n(cfg.locale).components.themeToggle.lightMode }),
          /* @__PURE__ */ jsx14("path", { d: "M96.76,66.458c-0.853-0.852-2.15-1.064-3.23-0.534c-6.063,2.991-12.858,4.571-19.655,4.571  C62.022,70.495,50.88,65.88,42.5,57.5C29.043,44.043,25.658,23.536,34.076,6.47c0.532-1.08,0.318-2.379-0.534-3.23  c-0.851-0.852-2.15-1.064-3.23-0.534c-4.918,2.427-9.375,5.619-13.246,9.491c-9.447,9.447-14.65,22.008-14.65,35.369  c0,13.36,5.203,25.921,14.65,35.368s22.008,14.65,35.368,14.65c13.361,0,25.921-5.203,35.369-14.65  c3.872-3.871,7.064-8.328,9.491-13.246C97.826,68.608,97.611,67.309,96.76,66.458z" })
        ]
      }
    )
  ] });
}, "Darkmode");
Darkmode.beforeDOMLoaded = darkmode_inline_default;
Darkmode.css = darkmode_default;

// quartz/util/theme.ts
var DEFAULT_SANS_SERIF = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
var DEFAULT_MONO = "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace";
function googleFontHref(theme) {
  const { code, header, body } = theme.typography;
  return `https://fonts.googleapis.com/css2?family=${code}&family=${header}:wght@400;700&family=${body}:ital,wght@0,400;0,600;1,400;1,600&display=swap`;
}
__name(googleFontHref, "googleFontHref");
function joinStyles(theme, ...stylesheet) {
  return `
${stylesheet.join("\n\n")}

:root {
  --light: ${theme.colors.lightMode.light};
  --lightgray: ${theme.colors.lightMode.lightgray};
  --gray: ${theme.colors.lightMode.gray};
  --darkgray: ${theme.colors.lightMode.darkgray};
  --dark: ${theme.colors.lightMode.dark};
  --secondary: ${theme.colors.lightMode.secondary};
  --tertiary: ${theme.colors.lightMode.tertiary};
  --highlight: ${theme.colors.lightMode.highlight};
  --textHighlight: ${theme.colors.lightMode.textHighlight};

  --headerFont: "${theme.typography.header}", ${DEFAULT_SANS_SERIF};
  --bodyFont: "${theme.typography.body}", ${DEFAULT_SANS_SERIF};
  --codeFont: "${theme.typography.code}", ${DEFAULT_MONO};
}

:root[saved-theme="dark"] {
  --light: ${theme.colors.darkMode.light};
  --lightgray: ${theme.colors.darkMode.lightgray};
  --gray: ${theme.colors.darkMode.gray};
  --darkgray: ${theme.colors.darkMode.darkgray};
  --dark: ${theme.colors.darkMode.dark};
  --secondary: ${theme.colors.darkMode.secondary};
  --tertiary: ${theme.colors.darkMode.tertiary};
  --highlight: ${theme.colors.darkMode.highlight};
  --textHighlight: ${theme.colors.darkMode.textHighlight};
}
`;
}
__name(joinStyles, "joinStyles");

// quartz/components/Head.tsx
import { Fragment as Fragment4, jsx as jsx15, jsxs as jsxs8 } from "preact/jsx-runtime";
var Head_default = /* @__PURE__ */ __name(() => {
  const Head = /* @__PURE__ */ __name(({ cfg, fileData, externalResources }) => {
    const titleSuffix = cfg.pageTitleSuffix ?? "";
    const title = (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix;
    const description = fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description;
    const { css, js } = externalResources;
    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`);
    const path12 = url.pathname;
    const baseDir = fileData.slug === "404" ? path12 : pathToRoot(fileData.slug);
    const iconPath = joinSegments(baseDir, "static/icon.jpeg");
    const ogImagePath = `https://${cfg.baseUrl}/static/icon.jpeg`;
    return /* @__PURE__ */ jsxs8("head", { children: [
      /* @__PURE__ */ jsx15("title", { children: title }),
      /* @__PURE__ */ jsx15("meta", { charSet: "utf-8" }),
      cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && /* @__PURE__ */ jsxs8(Fragment4, { children: [
        /* @__PURE__ */ jsx15("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
        /* @__PURE__ */ jsx15("link", { rel: "preconnect", href: "https://fonts.gstatic.com" }),
        /* @__PURE__ */ jsx15("link", { rel: "stylesheet", href: googleFontHref(cfg.theme) })
      ] }),
      /* @__PURE__ */ jsx15("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      /* @__PURE__ */ jsx15("meta", { property: "og:title", content: title }),
      /* @__PURE__ */ jsx15("meta", { property: "og:description", content: description }),
      cfg.baseUrl && /* @__PURE__ */ jsx15("meta", { property: "og:image", content: ogImagePath }),
      /* @__PURE__ */ jsx15("meta", { property: "og:width", content: "1200" }),
      /* @__PURE__ */ jsx15("meta", { property: "og:height", content: "675" }),
      /* @__PURE__ */ jsx15("link", { rel: "icon", href: iconPath }),
      /* @__PURE__ */ jsx15("script", { async: true, src: "https://www.googletagmanager.com/gtag/js?id=G-6D6PENTGR9" }),
      /* @__PURE__ */ jsx15(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6D6PENTGR9');
    `
          }
        }
      ),
      /* @__PURE__ */ jsx15("meta", { name: "description", content: description }),
      /* @__PURE__ */ jsx15("meta", { name: "generator", content: "Quartz" }),
      css.map((href) => /* @__PURE__ */ jsx15("link", { href, rel: "stylesheet", type: "text/css", "spa-preserve": true }, href)),
      js.filter((resource) => resource.loadTime === "beforeDOMReady").map((res) => JSResourceToScriptElement(res, true))
    ] });
  }, "Head");
  return Head;
}, "default");

// quartz/components/PageTitle.tsx
import { jsx as jsx16 } from "preact/jsx-runtime";
var PageTitle = /* @__PURE__ */ __name(({ fileData, cfg, displayClass }) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title;
  const baseDir = pathToRoot(fileData.slug);
  return /* @__PURE__ */ jsx16("h2", { class: classNames(displayClass, "page-title"), children: /* @__PURE__ */ jsx16("a", { href: baseDir, children: title }) });
}, "PageTitle");
PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
}
`;

// quartz/components/ContentMeta.tsx
import readingTime from "reading-time";

// quartz/components/styles/contentMeta.scss
var contentMeta_default = "";

// quartz/components/ContentMeta.tsx
import { jsx as jsx17 } from "preact/jsx-runtime";
var defaultOptions11 = {
  showReadingTime: true,
  showComma: true
};
var ContentMeta_default = /* @__PURE__ */ __name((opts) => {
  const options2 = { ...defaultOptions11, ...opts };
  function ContentMetadata({ cfg, fileData, displayClass }) {
    const text = fileData.text;
    if (text) {
      const segments = [];
      if (fileData.dates) {
        segments.push(formatDate(getDate(cfg, fileData), cfg.locale));
      }
      if (options2.showReadingTime) {
        const { minutes, words: _words } = readingTime(text);
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes)
        });
        segments.push(displayedTime);
      }
      const segmentsElements = segments.map((segment) => /* @__PURE__ */ jsx17("span", { children: segment }));
      return /* @__PURE__ */ jsx17("p", { "show-comma": options2.showComma, class: classNames(displayClass, "content-meta"), children: segmentsElements });
    } else {
      return null;
    }
  }
  __name(ContentMetadata, "ContentMetadata");
  ContentMetadata.css = contentMeta_default;
  return ContentMetadata;
}, "default");

// quartz/components/Spacer.tsx
import { jsx as jsx18 } from "preact/jsx-runtime";
function Spacer({ displayClass }) {
  return /* @__PURE__ */ jsx18("div", { class: classNames(displayClass, "spacer") });
}
__name(Spacer, "Spacer");
var Spacer_default = /* @__PURE__ */ __name(() => Spacer, "default");

// quartz/components/styles/legacyToc.scss
var legacyToc_default = "";

// quartz/components/styles/toc.scss
var toc_default = "";

// quartz/components/scripts/toc.inline.ts
var toc_inline_default = "";

// quartz/components/TableOfContents.tsx
import { jsx as jsx19, jsxs as jsxs9 } from "preact/jsx-runtime";
var defaultOptions12 = {
  layout: "modern"
};
var TableOfContents2 = /* @__PURE__ */ __name(({
  fileData,
  displayClass,
  cfg
}) => {
  if (!fileData.toc) {
    return null;
  }
  return /* @__PURE__ */ jsxs9("div", { class: classNames(displayClass, "toc"), children: [
    /* @__PURE__ */ jsxs9(
      "button",
      {
        type: "button",
        id: "toc",
        class: fileData.collapseToc ? "collapsed" : "",
        "aria-controls": "toc-content",
        "aria-expanded": !fileData.collapseToc,
        children: [
          /* @__PURE__ */ jsx19("h3", { children: i18n(cfg.locale).components.tableOfContents.title }),
          /* @__PURE__ */ jsx19(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "fold",
              children: /* @__PURE__ */ jsx19("polyline", { points: "6 9 12 15 18 9" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx19("div", { id: "toc-content", class: fileData.collapseToc ? "collapsed" : "", children: /* @__PURE__ */ jsx19("ul", { class: "overflow", children: fileData.toc.map((tocEntry) => /* @__PURE__ */ jsx19("li", { class: `depth-${tocEntry.depth}`, children: /* @__PURE__ */ jsx19("a", { href: `#${tocEntry.slug}`, "data-for": tocEntry.slug, children: tocEntry.text }) }, tocEntry.slug)) }) })
  ] });
}, "TableOfContents");
TableOfContents2.css = toc_default;
TableOfContents2.afterDOMLoaded = toc_inline_default;
var LegacyTableOfContents = /* @__PURE__ */ __name(({ fileData, cfg }) => {
  if (!fileData.toc) {
    return null;
  }
  return /* @__PURE__ */ jsxs9("details", { id: "toc", open: !fileData.collapseToc, children: [
    /* @__PURE__ */ jsx19("summary", { children: /* @__PURE__ */ jsx19("h3", { children: i18n(cfg.locale).components.tableOfContents.title }) }),
    /* @__PURE__ */ jsx19("ul", { children: fileData.toc.map((tocEntry) => /* @__PURE__ */ jsx19("li", { class: `depth-${tocEntry.depth}`, children: /* @__PURE__ */ jsx19("a", { href: `#${tocEntry.slug}`, "data-for": tocEntry.slug, children: tocEntry.text }) }, tocEntry.slug)) })
  ] });
}, "LegacyTableOfContents");
LegacyTableOfContents.css = legacyToc_default;
var TableOfContents_default = /* @__PURE__ */ __name((opts) => {
  const layout = opts?.layout ?? defaultOptions12.layout;
  return layout === "modern" ? TableOfContents2 : LegacyTableOfContents;
}, "default");

// quartz/components/ExplorerNode.tsx
import { Fragment as Fragment5, jsx as jsx20, jsxs as jsxs10 } from "preact/jsx-runtime";

// quartz/components/Explorer.tsx
import { jsx as jsx21, jsxs as jsxs11 } from "preact/jsx-runtime";

// quartz/components/TagList.tsx
import { jsx as jsx22 } from "preact/jsx-runtime";
var TagList = /* @__PURE__ */ __name(({ fileData, displayClass }) => {
  const tags = fileData.frontmatter?.tags;
  const baseDir = pathToRoot(fileData.slug);
  if (tags && tags.length > 0) {
    return /* @__PURE__ */ jsx22("ul", { class: classNames(displayClass, "tags"), children: tags.map((tag) => {
      const linkDest = baseDir + `/tags/${slugTag(tag)}`;
      return /* @__PURE__ */ jsx22("li", { children: /* @__PURE__ */ jsx22("a", { href: linkDest, class: "internal tag-link", children: tag }) });
    }) });
  } else {
    return null;
  }
}, "TagList");
TagList.css = `
.tags {
  list-style: none;
  display: flex;
  padding-left: 0;
  gap: 0.4rem;
  margin: 1rem 0;
  flex-wrap: wrap;
  justify-self: end;
}

.section-li > .section > .tags {
  justify-content: flex-end;
}
  
.tags > li {
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  overflow-wrap: normal;
}

a.internal.tag-link {
  border-radius: 8px;
  background-color: var(--highlight);
  padding: 0.2rem 0.4rem;
  margin: 0 0.1rem;
}
`;
var TagList_default = /* @__PURE__ */ __name(() => TagList, "default");

// quartz/components/scripts/graph.inline.ts
var graph_inline_default = "";

// quartz/components/styles/graph.scss
var graph_default = "";

// quartz/components/Graph.tsx
import { jsx as jsx23, jsxs as jsxs12 } from "preact/jsx-runtime";
var defaultOptions13 = {
  localGraph: {
    drag: true,
    zoom: true,
    depth: 1,
    scale: 1.1,
    repelForce: 0.5,
    centerForce: 0.3,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    showTags: true,
    removeTags: [],
    focusOnHover: false
  },
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repelForce: 0.5,
    centerForce: 0.3,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    showTags: true,
    removeTags: [],
    focusOnHover: true
  }
};
var Graph_default = /* @__PURE__ */ __name((opts) => {
  const Graph = /* @__PURE__ */ __name(({ displayClass, cfg }) => {
    const localGraph = { ...defaultOptions13.localGraph, ...opts?.localGraph };
    const globalGraph = { ...defaultOptions13.globalGraph, ...opts?.globalGraph };
    return /* @__PURE__ */ jsxs12("div", { class: classNames(displayClass, "graph"), children: [
      /* @__PURE__ */ jsx23("h3", { children: i18n(cfg.locale).components.graph.title }),
      /* @__PURE__ */ jsxs12("div", { class: "graph-outer", children: [
        /* @__PURE__ */ jsx23("div", { id: "graph-container", "data-cfg": JSON.stringify(localGraph) }),
        /* @__PURE__ */ jsx23("button", { id: "global-graph-icon", "aria-label": "Global Graph", children: /* @__PURE__ */ jsx23(
          "svg",
          {
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            xmlnsXlink: "http://www.w3.org/1999/xlink",
            x: "0px",
            y: "0px",
            viewBox: "0 0 55 55",
            fill: "currentColor",
            xmlSpace: "preserve",
            children: /* @__PURE__ */ jsx23(
              "path",
              {
                d: "M49,0c-3.309,0-6,2.691-6,6c0,1.035,0.263,2.009,0.726,2.86l-9.829,9.829C32.542,17.634,30.846,17,29,17\r\n                s-3.542,0.634-4.898,1.688l-7.669-7.669C16.785,10.424,17,9.74,17,9c0-2.206-1.794-4-4-4S9,6.794,9,9s1.794,4,4,4\r\n                c0.74,0,1.424-0.215,2.019-0.567l7.669,7.669C21.634,21.458,21,23.154,21,25s0.634,3.542,1.688,4.897L10.024,42.562\r\n                C8.958,41.595,7.549,41,6,41c-3.309,0-6,2.691-6,6s2.691,6,6,6s6-2.691,6-6c0-1.035-0.263-2.009-0.726-2.86l12.829-12.829\r\n                c1.106,0.86,2.44,1.436,3.898,1.619v10.16c-2.833,0.478-5,2.942-5,5.91c0,3.309,2.691,6,6,6s6-2.691,6-6c0-2.967-2.167-5.431-5-5.91\r\n                v-10.16c1.458-0.183,2.792-0.759,3.898-1.619l7.669,7.669C41.215,39.576,41,40.26,41,41c0,2.206,1.794,4,4,4s4-1.794,4-4\r\n                s-1.794-4-4-4c-0.74,0-1.424,0.215-2.019,0.567l-7.669-7.669C36.366,28.542,37,26.846,37,25s-0.634-3.542-1.688-4.897l9.665-9.665\r\n                C46.042,11.405,47.451,12,49,12c3.309,0,6-2.691,6-6S52.309,0,49,0z M11,9c0-1.103,0.897-2,2-2s2,0.897,2,2s-0.897,2-2,2\r\n                S11,10.103,11,9z M6,51c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S8.206,51,6,51z M33,49c0,2.206-1.794,4-4,4s-4-1.794-4-4\r\n                s1.794-4,4-4S33,46.794,33,49z M29,31c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S32.309,31,29,31z M47,41c0,1.103-0.897,2-2,2\r\n                s-2-0.897-2-2s0.897-2,2-2S47,39.897,47,41z M49,10c-2.206,0-4-1.794-4-4s1.794-4,4-4s4,1.794,4,4S51.206,10,49,10z"
              }
            )
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx23("div", { id: "global-graph-outer", children: /* @__PURE__ */ jsx23("div", { id: "global-graph-container", "data-cfg": JSON.stringify(globalGraph) }) })
    ] });
  }, "Graph");
  Graph.css = graph_default;
  Graph.afterDOMLoaded = graph_inline_default;
  return Graph;
}, "default");

// quartz/components/styles/backlinks.scss
var backlinks_default = "";

// quartz/components/Backlinks.tsx
import { jsx as jsx24, jsxs as jsxs13 } from "preact/jsx-runtime";
var Backlinks = /* @__PURE__ */ __name(({
  fileData,
  allFiles,
  displayClass,
  cfg
}) => {
  const slug = simplifySlug(fileData.slug);
  const backlinkFiles = allFiles.filter((file) => file.links?.includes(slug));
  return /* @__PURE__ */ jsxs13("div", { class: classNames(displayClass, "backlinks"), children: [
    /* @__PURE__ */ jsx24("h3", { children: i18n(cfg.locale).components.backlinks.title }),
    /* @__PURE__ */ jsx24("ul", { class: "overflow", children: backlinkFiles.length > 0 ? backlinkFiles.map((f) => /* @__PURE__ */ jsx24("li", { children: /* @__PURE__ */ jsx24("a", { href: resolveRelative(fileData.slug, f.slug), class: "internal", children: f.frontmatter?.title }) })) : /* @__PURE__ */ jsx24("li", { children: i18n(cfg.locale).components.backlinks.noBacklinksFound }) })
  ] });
}, "Backlinks");
Backlinks.css = backlinks_default;

// quartz/components/styles/search.scss
var search_default = "";

// quartz/components/scripts/search.inline.ts
var search_inline_default = "";

// quartz/components/Search.tsx
import { jsx as jsx25, jsxs as jsxs14 } from "preact/jsx-runtime";
var defaultOptions14 = {
  enablePreview: true
};
var Search_default = /* @__PURE__ */ __name((userOpts) => {
  const Search = /* @__PURE__ */ __name(({ displayClass, cfg }) => {
    const opts = { ...defaultOptions14, ...userOpts };
    const searchPlaceholder = i18n(cfg.locale).components.search.searchBarPlaceholder;
    return /* @__PURE__ */ jsxs14("div", { className: "top-nav-wrapper", children: [
      /* @__PURE__ */ jsxs14("div", { className: "top-nav-wrapper", children: [
        /* @__PURE__ */ jsx25("div", { className: "page-titles", children: /* @__PURE__ */ jsx25("a", { className: "headshot", href: ".", children: /* @__PURE__ */ jsx25(MyProfile, {}) }) }),
        /* @__PURE__ */ jsx25("div", { className: "desktop-only", children: /* @__PURE__ */ jsxs14("div", { className: "flex header-links", children: [
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/post", children: "Blog" }),
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/notes", children: "Notes" }),
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/projects", children: "Projects" }),
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/hire", children: "Hire Me" }),
          /* @__PURE__ */ jsx25(DarkModeComp, { displayClass, cfg }),
          /* @__PURE__ */ jsx25(
            SearchComp,
            {
              opts,
              cfg,
              searchPlaceholder,
              displayClass
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsx25("div", { className: "popover-hint", children: /* @__PURE__ */ jsx25("div", { className: "mobile-only", children: /* @__PURE__ */ jsxs14("div", { className: "top-nav", children: [
        /* @__PURE__ */ jsxs14("div", { className: "hamburger", id: "hamburger", children: [
          /* @__PURE__ */ jsx25("span", {}),
          /* @__PURE__ */ jsx25("span", {}),
          /* @__PURE__ */ jsx25("span", {})
        ] }),
        /* @__PURE__ */ jsx25("div", { id: "mobile-links", className: "off-screen-menu", children: /* @__PURE__ */ jsxs14("div", { className: "mobile-header-links", children: [
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/post", children: "Blog" }),
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/notes", children: "Notes" }),
          /* @__PURE__ */ jsx25("a", { className: "header-link", href: "/projects", children: "Projects" }),
          /* @__PURE__ */ jsx25(DarkModeComp, { displayClass, cfg }),
          /* @__PURE__ */ jsx25(
            SearchComp,
            {
              opts,
              cfg,
              searchPlaceholder,
              displayClass
            }
          )
        ] }) })
      ] }) }) })
    ] });
  }, "Search");
  Search.afterDOMLoaded = search_inline_default;
  Search.css = search_default;
  return Search;
}, "default");
function MyProfile() {
  return /* @__PURE__ */ jsx25(
    "img",
    {
      src: "data:image/jpeg;base64,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",
      alt: "K.Boopathi"
    }
  );
}
__name(MyProfile, "MyProfile");
function SearchComp({ userOpts, cfg, displayClass }) {
  const opts = { ...defaultOptions14, ...userOpts };
  const searchPlaceholder = i18n(cfg.locale).components.search.searchBarPlaceholder;
  return /* @__PURE__ */ jsxs14("div", { class: classNames(displayClass, "search"), children: [
    /* @__PURE__ */ jsx25("button", { class: "search-button", id: "search-button", children: /* @__PURE__ */ jsx25("svg", { role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 19.9 19.7", children: /* @__PURE__ */ jsxs14("g", { class: "search-path", fill: "none", children: [
      /* @__PURE__ */ jsx25("path", { "stroke-linecap": "square", d: "M18.5 18.3l-5.4-5.4" }),
      /* @__PURE__ */ jsx25("circle", { cx: "8", cy: "8", r: "7" })
    ] }) }) }),
    /* @__PURE__ */ jsx25("div", { id: "search-container", children: /* @__PURE__ */ jsxs14("div", { id: "search-space", children: [
      /* @__PURE__ */ jsx25(
        "input",
        {
          autocomplete: "off",
          id: "search-bar",
          name: "search",
          type: "text",
          "aria-label": searchPlaceholder,
          placeholder: searchPlaceholder
        }
      ),
      /* @__PURE__ */ jsx25("div", { id: "search-layout", "data-preview": opts.enablePreview })
    ] }) })
  ] });
}
__name(SearchComp, "SearchComp");
function DarkModeComp({ displayClass, cfg }) {
  return /* @__PURE__ */ jsxs14("button", { class: classNames(displayClass, "darkmode"), id: "darkmode", children: [
    /* @__PURE__ */ jsxs14(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        xmlnsXlink: "http://www.w3.org/1999/xlink",
        version: "1.1",
        id: "dayIcon",
        x: "0px",
        y: "0px",
        viewBox: "0 0 35 35",
        style: "enable-background:new 0 0 35 35",
        xmlSpace: "preserve",
        "aria-label": i18n(cfg.locale).components.themeToggle.darkMode,
        children: [
          /* @__PURE__ */ jsx25("title", { children: i18n(cfg.locale).components.themeToggle.darkMode }),
          /* @__PURE__ */ jsx25("path", { d: "M6,17.5C6,16.672,5.328,16,4.5,16h-3C0.672,16,0,16.672,0,17.5    S0.672,19,1.5,19h3C5.328,19,6,18.328,6,17.5z M7.5,26c-0.414,0-0.789,0.168-1.061,0.439l-2,2C4.168,28.711,4,29.086,4,29.5    C4,30.328,4.671,31,5.5,31c0.414,0,0.789-0.168,1.06-0.44l2-2C8.832,28.289,9,27.914,9,27.5C9,26.672,8.329,26,7.5,26z M17.5,6    C18.329,6,19,5.328,19,4.5v-3C19,0.672,18.329,0,17.5,0S16,0.672,16,1.5v3C16,5.328,16.671,6,17.5,6z M27.5,9    c0.414,0,0.789-0.168,1.06-0.439l2-2C30.832,6.289,31,5.914,31,5.5C31,4.672,30.329,4,29.5,4c-0.414,0-0.789,0.168-1.061,0.44    l-2,2C26.168,6.711,26,7.086,26,7.5C26,8.328,26.671,9,27.5,9z M6.439,8.561C6.711,8.832,7.086,9,7.5,9C8.328,9,9,8.328,9,7.5    c0-0.414-0.168-0.789-0.439-1.061l-2-2C6.289,4.168,5.914,4,5.5,4C4.672,4,4,4.672,4,5.5c0,0.414,0.168,0.789,0.439,1.06    L6.439,8.561z M33.5,16h-3c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5h3c0.828,0,1.5-0.672,1.5-1.5S34.328,16,33.5,16z     M28.561,26.439C28.289,26.168,27.914,26,27.5,26c-0.828,0-1.5,0.672-1.5,1.5c0,0.414,0.168,0.789,0.439,1.06l2,2    C28.711,30.832,29.086,31,29.5,31c0.828,0,1.5-0.672,1.5-1.5c0-0.414-0.168-0.789-0.439-1.061L28.561,26.439z M17.5,29    c-0.829,0-1.5,0.672-1.5,1.5v3c0,0.828,0.671,1.5,1.5,1.5s1.5-0.672,1.5-1.5v-3C19,29.672,18.329,29,17.5,29z M17.5,7    C11.71,7,7,11.71,7,17.5S11.71,28,17.5,28S28,23.29,28,17.5S23.29,7,17.5,7z M17.5,25c-4.136,0-7.5-3.364-7.5-7.5    c0-4.136,3.364-7.5,7.5-7.5c4.136,0,7.5,3.364,7.5,7.5C25,21.636,21.636,25,17.5,25z" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs14(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        xmlnsXlink: "http://www.w3.org/1999/xlink",
        version: "1.1",
        id: "nightIcon",
        x: "0px",
        y: "0px",
        viewBox: "0 0 100 100",
        style: "enable-background:new 0 0 100 100",
        xmlSpace: "preserve",
        "aria-label": i18n(cfg.locale).components.themeToggle.lightMode,
        children: [
          /* @__PURE__ */ jsx25("title", { children: i18n(cfg.locale).components.themeToggle.lightMode }),
          /* @__PURE__ */ jsx25("path", { d: "M96.76,66.458c-0.853-0.852-2.15-1.064-3.23-0.534c-6.063,2.991-12.858,4.571-19.655,4.571  C62.022,70.495,50.88,65.88,42.5,57.5C29.043,44.043,25.658,23.536,34.076,6.47c0.532-1.08,0.318-2.379-0.534-3.23  c-0.851-0.852-2.15-1.064-3.23-0.534c-4.918,2.427-9.375,5.619-13.246,9.491c-9.447,9.447-14.65,22.008-14.65,35.369  c0,13.36,5.203,25.921,14.65,35.368s22.008,14.65,35.368,14.65c13.361,0,25.921-5.203,35.369-14.65  c3.872-3.871,7.064-8.328,9.491-13.246C97.826,68.608,97.611,67.309,96.76,66.458z" })
        ]
      }
    )
  ] });
}
__name(DarkModeComp, "DarkModeComp");

// quartz/components/styles/footer.scss
var footer_default = "";

// quartz/components/Footer.tsx
import { jsx as jsx26, jsxs as jsxs15 } from "preact/jsx-runtime";
var Footer_default = /* @__PURE__ */ __name((opts) => {
  const Footer = /* @__PURE__ */ __name(({ displayClass, cfg }) => {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const links = opts?.links ?? [];
    return /* @__PURE__ */ jsxs15("footer", { class: `${displayClass ?? ""}`, children: [
      /* @__PURE__ */ jsxs15("p", { children: [
        "Build with \u2665 K.Boopathi \xA9 ",
        year
      ] }),
      /* @__PURE__ */ jsx26("ul", { children: Object.entries(links).map(([text, link]) => /* @__PURE__ */ jsx26("li", { children: /* @__PURE__ */ jsx26("a", { href: link, children: text }) })) })
    ] });
  }, "Footer");
  Footer.css = footer_default;
  return Footer;
}, "default");

// quartz/components/DesktopOnly.tsx
import { Fragment as Fragment6, jsx as jsx27 } from "preact/jsx-runtime";
var DesktopOnly_default = /* @__PURE__ */ __name((component) => {
  if (component) {
    const Component = component;
    const DesktopOnly = /* @__PURE__ */ __name((props) => {
      return /* @__PURE__ */ jsx27(Component, { displayClass: "desktop-only", ...props });
    }, "DesktopOnly");
    DesktopOnly.displayName = component.displayName;
    DesktopOnly.afterDOMLoaded = component?.afterDOMLoaded;
    DesktopOnly.beforeDOMLoaded = component?.beforeDOMLoaded;
    DesktopOnly.css = component?.css;
    return DesktopOnly;
  } else {
    return () => /* @__PURE__ */ jsx27(Fragment6, {});
  }
}, "default");

// quartz/components/MobileOnly.tsx
import { Fragment as Fragment7, jsx as jsx28 } from "preact/jsx-runtime";
var MobileOnly_default = /* @__PURE__ */ __name((component) => {
  if (component) {
    const Component = component;
    const MobileOnly = /* @__PURE__ */ __name((props) => {
      return /* @__PURE__ */ jsx28(Component, { displayClass: "mobile-only", ...props });
    }, "MobileOnly");
    MobileOnly.displayName = component.displayName;
    MobileOnly.afterDOMLoaded = component?.afterDOMLoaded;
    MobileOnly.beforeDOMLoaded = component?.beforeDOMLoaded;
    MobileOnly.css = component?.css;
    return MobileOnly;
  } else {
    return () => /* @__PURE__ */ jsx28(Fragment7, {});
  }
}, "default");

// quartz/components/RecentNotes.tsx
import { jsx as jsx29, jsxs as jsxs16 } from "preact/jsx-runtime";

// quartz/components/styles/breadcrumbs.scss
var breadcrumbs_default = "";

// quartz/components/Breadcrumbs.tsx
import { Fragment as Fragment8, jsx as jsx30, jsxs as jsxs17 } from "preact/jsx-runtime";
var defaultOptions15 = {
  spacerSymbol: "\u276F",
  rootName: "Home",
  resolveFrontmatterTitle: true,
  hideOnRoot: true,
  showCurrentPage: true
};
function formatCrumb(displayName, baseSlug, currentSlug) {
  return {
    displayName: displayName.replaceAll("-", " "),
    path: resolveRelative(baseSlug, currentSlug)
  };
}
__name(formatCrumb, "formatCrumb");
var Breadcrumbs_default = /* @__PURE__ */ __name((opts) => {
  const options2 = { ...defaultOptions15, ...opts };
  let folderIndex;
  const Breadcrumbs = /* @__PURE__ */ __name(({
    fileData,
    allFiles,
    displayClass
  }) => {
    if (options2.hideOnRoot && fileData.slug === "index") {
      return /* @__PURE__ */ jsx30(Fragment8, {});
    }
    const firstEntry = formatCrumb(options2.rootName, fileData.slug, "/");
    const crumbs = [firstEntry];
    if (!folderIndex && options2.resolveFrontmatterTitle) {
      folderIndex = /* @__PURE__ */ new Map();
      for (const file of allFiles) {
        const folderParts = file.slug?.split("/");
        if (folderParts?.at(-1) === "index") {
          folderIndex.set(folderParts.slice(0, -1).join("/"), file);
        }
      }
    }
    const slugParts = fileData.slug?.split("/");
    if (slugParts) {
      const isTagPath = slugParts[0] === "tags";
      let currentPath = "";
      for (let i = 0; i < slugParts.length - 1; i++) {
        let curPathSegment = slugParts[i];
        const currentFile = folderIndex?.get(slugParts.slice(0, i + 1).join("/"));
        if (currentFile) {
          const title = currentFile.frontmatter.title;
          if (title !== "index") {
            curPathSegment = title;
          }
        }
        currentPath = joinSegments(currentPath, slugParts[i]);
        const includeTrailingSlash = !isTagPath || i < 1;
        const crumb = formatCrumb(
          curPathSegment,
          fileData.slug,
          currentPath + (includeTrailingSlash ? "/" : "")
        );
        crumbs.push(crumb);
      }
      if (options2.showCurrentPage && slugParts.at(-1) !== "index") {
        crumbs.push({
          displayName: fileData.frontmatter.title,
          path: ""
        });
      }
    }
    return /* @__PURE__ */ jsx30("nav", { class: classNames(displayClass, "breadcrumb-container"), "aria-label": "breadcrumbs", children: crumbs.map((crumb, index) => /* @__PURE__ */ jsxs17("div", { class: "breadcrumb-element", children: [
      /* @__PURE__ */ jsx30("a", { href: crumb.path, children: crumb.displayName }),
      index !== crumbs.length - 1 && /* @__PURE__ */ jsx30("p", { children: ` ${options2.spacerSymbol} ` })
    ] })) });
  }, "Breadcrumbs");
  Breadcrumbs.css = breadcrumbs_default;
  return Breadcrumbs;
}, "default");

// quartz/components/Comments.tsx
import { jsx as jsx31 } from "preact/jsx-runtime";

// quartz/components/TopNav.tsx
import { jsx as jsx32, jsxs as jsxs18 } from "preact/jsx-runtime";
var SearchCom = Search_default();
var TopNav = /* @__PURE__ */ __name((props) => {
  return /* @__PURE__ */ jsxs18("div", { className: "top-nav-wrapper", children: [
    /* @__PURE__ */ jsxs18("div", { className: "top-nav-wrapper", children: [
      /* @__PURE__ */ jsx32("div", { className: "page-titles", children: /* @__PURE__ */ jsx32("a", { className: "headshot", href: ".", children: /* @__PURE__ */ jsx32(MyProfile2, {}) }) }),
      /* @__PURE__ */ jsx32("div", { className: "desktop-only", children: /* @__PURE__ */ jsxs18("div", { className: "flex header-links", children: [
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/newsletter", children: "Blog" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/notest", children: "Notes" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/hire", children: "Hire Me" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/projects", children: "Projects" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx32("div", { className: "popover-hint", children: /* @__PURE__ */ jsx32("div", { className: "mobile-only", children: /* @__PURE__ */ jsxs18("div", { className: "top-nav", children: [
      /* @__PURE__ */ jsxs18("div", { className: "hamburger", id: "hamburger", children: [
        /* @__PURE__ */ jsx32("span", {}),
        /* @__PURE__ */ jsx32("span", {}),
        /* @__PURE__ */ jsx32("span", {})
      ] }),
      /* @__PURE__ */ jsx32("div", { id: "mobile-links", className: "off-screen-menu", children: /* @__PURE__ */ jsxs18("div", { className: "mobile-header-links", children: [
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/newsletter", children: "Blog" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/Courses", children: "Notes" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/hire", children: "Hire Me" }),
        /* @__PURE__ */ jsx32("a", { className: "header-link", href: "/projects", children: "Projects" })
      ] }) })
    ] }) }) })
  ] });
}, "TopNav");
TopNav.css = `
header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin: 1.5rem 0;
    display: flex
}
.top-nav-wrapper{
display:flex;
justify-content: space-between;
width:100%
}

header h1 {
    flex: auto;
    margin: 0
}



pre:hover>.clipboard-button {
    opacity: 1;
    transition: all .2s
}

.page-title {
    margin: 0
}

.headshot img {
    box-shadow: var(--box-shadow);
    z-index: 998;
    border: 4px solid #fff;
    border-radius: 1000px;
    max-width: 80px;
    max-height: 80px;
    margin: 0;
    position: relative
}

.header-links {
    box-shadow: var(--box-shadow);
    background-color: var(--white);
    border-radius: 2em;
    padding: 0 .75em;
    display: flex;
    overflow: hidden
}

.header-link {
    color: var(--darkblue);
    font-family: var(--headerFont);
    padding: .75em .5em;
    font-size: 1.125rem;
    transition: all .2s ease-in-out
}

.header-link:hover {
    color: var(--darkblue);
    background-color: var(--light)
}

.mobile-header-links {
    flex-direction: column;
    display: flex
}

.mobile-header-link {
    color: var(--darkblue);
    text-align: left;
    font-family: var(--headerFont);
    padding: .3em .5em;
    font-size: 2.25rem;
    transition: all .2s ease-in-out
}

.off-screen-menu {
    text-align: center;
    border-top-left-radius: 2rem;
    border-bottom-left-radius: 2rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 450px;
    height: 100vh;
    font-size: 3rem;
    transition: all .3s;
    display: flex;
    position: fixed;
    top: 0;
    right: -450px;
    box-shadow: 0 0 20px #00000040
}

.off-screen-menu.active {
    right: 0
}

.top-nav {
    background-color: var(--darkblue);
    z-index: 900;
    padding: 1rem;
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0
}

.hamburger {
    cursor: pointer;
    z-index: 1000;
    width: 40px;
    height: 50px;
    margin-left: auto;
    position: relative
}

.hamburger span {
    background-color: var(--white);
    border-radius: 25px;
    width: 100%;
    height: 5px;
    transition: all .3s;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%)
}

.hamburger span:first-child {
    top: 25%
}

.hamburger span:nth-child(3) {
    top: 75%
}

.hamburger.active span {
    background-color: var(--darkblue)
}

.hamburger.active span:first-child {
    top: 50%;
    transform: translate(-50%,-50%)rotate(45deg)
}

.hamburger.active span:nth-child(2) {
    opacity: 0
}

.hamburger.active span:nth-child(3) {
    top: 50%;
    transform: translate(-50%,-50%)rotate(-45deg)
}

`;
function MyProfile2() {
  return /* @__PURE__ */ jsx32(
    "img",
    {
      src: "data:image/jpeg;base64,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",
      alt: "K.Boopathi"
    }
  );
}
__name(MyProfile2, "MyProfile");

// quartz.layout.ts
var sharedPageComponents = {
  head: Head_default(),
  header: [Search_default()],
  afterBody: [Graph_default()],
  footer: Footer_default({
    links: {
      GitHub: "https://github.com/programmerraja",
      Linkedin: "https://www.linkedin.com/in/programmerraja/",
      Twitter: "https://twitter.com/programmerraja"
    }
  })
};
var defaultContentPageLayout = {
  beforeBody: [
    Breadcrumbs_default(),
    ArticleTitle_default(),
    ContentMeta_default(),
    TagList_default(),
    MobileOnly_default(TableOfContents_default())
  ],
  left: [
    MobileOnly_default(Spacer_default())
    // Component.Search(),
    // Component.Darkmode(),
    // Component.DesktopOnly(Component.Explorer()),
  ],
  right: [
    // Component.Graph(),
    DesktopOnly_default(TableOfContents_default())
    // Component.Backlinks(),
  ]
};
var defaultListPageLayout = {
  beforeBody: [Breadcrumbs_default(), ArticleTitle_default(), ContentMeta_default()],
  left: [
    MobileOnly_default(Spacer_default())
    // Component.Search(),
    // Component.Darkmode(),
    // Component.DesktopOnly(Component.Explorer()),
  ],
  right: []
};

// quartz/plugins/emitters/contentPage.tsx
import chalk3 from "chalk";

// quartz/plugins/emitters/helpers.ts
import path5 from "path";
import fs2 from "fs";
var write = /* @__PURE__ */ __name(async ({ ctx, slug, ext, content }) => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext);
  const dir = path5.dirname(pathToPage);
  await fs2.promises.mkdir(dir, { recursive: true });
  await fs2.promises.writeFile(pathToPage, content);
  return pathToPage;
}, "write");

// quartz/depgraph.ts
var DepGraph = class {
  static {
    __name(this, "DepGraph");
  }
  // node: incoming and outgoing edges
  _graph = /* @__PURE__ */ new Map();
  constructor() {
    this._graph = /* @__PURE__ */ new Map();
  }
  export() {
    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }
  toString() {
    return JSON.stringify(this.export(), null, 2);
  }
  // BASIC GRAPH OPERATIONS
  get nodes() {
    return Array.from(this._graph.keys());
  }
  get edges() {
    let edges = [];
    this.forEachEdge((edge) => edges.push(edge));
    return edges;
  }
  hasNode(node) {
    return this._graph.has(node);
  }
  addNode(node) {
    if (!this._graph.has(node)) {
      this._graph.set(node, { incoming: /* @__PURE__ */ new Set(), outgoing: /* @__PURE__ */ new Set() });
    }
  }
  // Remove node and all edges connected to it
  removeNode(node) {
    if (this._graph.has(node)) {
      for (const target of this._graph.get(node).outgoing) {
        this.removeEdge(node, target);
      }
      for (const source of this._graph.get(node).incoming) {
        this.removeEdge(source, node);
      }
      this._graph.delete(node);
    }
  }
  forEachNode(callback) {
    for (const node of this._graph.keys()) {
      callback(node);
    }
  }
  hasEdge(from, to) {
    return Boolean(this._graph.get(from)?.outgoing.has(to));
  }
  addEdge(from, to) {
    this.addNode(from);
    this.addNode(to);
    this._graph.get(from).outgoing.add(to);
    this._graph.get(to).incoming.add(from);
  }
  removeEdge(from, to) {
    if (this._graph.has(from) && this._graph.has(to)) {
      this._graph.get(from).outgoing.delete(to);
      this._graph.get(to).incoming.delete(from);
    }
  }
  // returns -1 if node does not exist
  outDegree(node) {
    return this.hasNode(node) ? this._graph.get(node).outgoing.size : -1;
  }
  // returns -1 if node does not exist
  inDegree(node) {
    return this.hasNode(node) ? this._graph.get(node).incoming.size : -1;
  }
  forEachOutNeighbor(node, callback) {
    this._graph.get(node)?.outgoing.forEach(callback);
  }
  forEachInNeighbor(node, callback) {
    this._graph.get(node)?.incoming.forEach(callback);
  }
  forEachEdge(callback) {
    for (const [source, { outgoing }] of this._graph.entries()) {
      for (const target of outgoing) {
        callback([source, target]);
      }
    }
  }
  // DEPENDENCY ALGORITHMS
  // Add all nodes and edges from other graph to this graph
  mergeGraph(other) {
    other.forEachEdge(([source, target]) => {
      this.addNode(source);
      this.addNode(target);
      this.addEdge(source, target);
    });
  }
  // For the node provided:
  // If node does not exist, add it
  // If an incoming edge was added in other, it is added in this graph
  // If an incoming edge was deleted in other, it is deleted in this graph
  updateIncomingEdgesForNode(other, node) {
    this.addNode(node);
    other.forEachInNeighbor(node, (neighbor) => {
      this.addEdge(neighbor, node);
    });
    this.forEachEdge(([source, target]) => {
      if (target === node && !other.hasEdge(source, target)) {
        this.removeEdge(source, target);
      }
    });
  }
  // Remove all nodes that do not have any incoming or outgoing edges
  // A node may be orphaned if the only node pointing to it was removed
  removeOrphanNodes() {
    let orphanNodes = /* @__PURE__ */ new Set();
    this.forEachNode((node) => {
      if (this.inDegree(node) === 0 && this.outDegree(node) === 0) {
        orphanNodes.add(node);
      }
    });
    orphanNodes.forEach((node) => {
      this.removeNode(node);
    });
    return orphanNodes;
  }
  // Get all leaf nodes (i.e. destination paths) reachable from the node provided
  // Eg. if the graph is A -> B -> C
  //                     D ---^
  // and the node is B, this function returns [C]
  getLeafNodes(node) {
    let stack = [node];
    let visited = /* @__PURE__ */ new Set();
    let leafNodes = /* @__PURE__ */ new Set();
    while (stack.length > 0) {
      let node2 = stack.pop();
      if (visited.has(node2)) {
        continue;
      }
      visited.add(node2);
      if (this.outDegree(node2) === 0) {
        leafNodes.add(node2);
      }
      this.forEachOutNeighbor(node2, (neighbor) => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      });
    }
    return leafNodes;
  }
  // Get all ancestors of the leaf nodes reachable from the node provided
  // Eg. if the graph is A -> B -> C
  //                     D ---^
  // and the node is B, this function returns [A, B, D]
  getLeafNodeAncestors(node) {
    const leafNodes = this.getLeafNodes(node);
    let visited = /* @__PURE__ */ new Set();
    let upstreamNodes = /* @__PURE__ */ new Set();
    leafNodes.forEach((leafNode) => {
      let stack = [leafNode];
      while (stack.length > 0) {
        let node2 = stack.pop();
        if (visited.has(node2)) {
          continue;
        }
        visited.add(node2);
        if (this.outDegree(node2) !== 0) {
          upstreamNodes.add(node2);
        }
        this.forEachInNeighbor(node2, (parentNode) => {
          if (!visited.has(parentNode)) {
            stack.push(parentNode);
          }
        });
      }
    });
    return upstreamNodes;
  }
};

// quartz/plugins/emitters/contentPage.tsx
var parseDependencies = /* @__PURE__ */ __name((argv, hast, file) => {
  const dependencies = [];
  visit7(hast, "element", (elem) => {
    let ref = null;
    if (["script", "img", "audio", "video", "source", "iframe"].includes(elem.tagName) && elem?.properties?.src) {
      ref = elem.properties.src.toString();
    } else if (["a", "link"].includes(elem.tagName) && elem?.properties?.href) {
      ref = elem.properties.href.toString();
    }
    if (ref === null || !isRelativeURL(ref)) {
      return;
    }
    let fp = path6.join(file.data.filePath, path6.relative(argv.directory, ref)).replace(/\\/g, "/");
    if (!fp.split("/").pop()?.includes(".")) {
      fp += ".md";
    }
    dependencies.push(fp);
  });
  return dependencies;
}, "parseDependencies");
var ContentPage = /* @__PURE__ */ __name((userOpts) => {
  const opts = {
    ...sharedPageComponents,
    ...defaultContentPageLayout,
    pageBody: Content_default(),
    ...userOpts
  };
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts;
  const Header2 = Header_default();
  const Body2 = Body_default();
  return {
    name: "ContentPage",
    getQuartzComponents() {
      return [
        Head,
        Header2,
        Body2,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer
      ];
    },
    async getDependencyGraph(ctx, content, _resources) {
      const graph = new DepGraph();
      for (const [tree, file] of content) {
        const sourcePath = file.data.filePath;
        const slug = file.data.slug;
        graph.addEdge(sourcePath, joinSegments(ctx.argv.output, slug + ".html"));
        parseDependencies(ctx.argv, tree, file).forEach((dep) => {
          graph.addEdge(dep, sourcePath);
        });
      }
      return graph;
    },
    async emit(ctx, content, resources) {
      const cfg = ctx.cfg.configuration;
      const fps = [];
      const allFiles = content.map((c) => c[1].data);
      let containsIndex = false;
      for (const [tree, file] of content) {
        const slug = file.data.slug;
        if (slug === "index") {
          containsIndex = true;
        }
        const externalResources = pageResources(pathToRoot(slug), resources);
        const componentData = {
          ctx,
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles
        };
        const content2 = renderPage(cfg, slug, componentData, opts, externalResources);
        const fp = await write({
          ctx,
          content: content2,
          slug,
          ext: ".html"
        });
        fps.push(fp);
      }
      if (!containsIndex && !ctx.argv.fastRebuild) {
        console.log(
          chalk3.yellow(
            `
Warning: you seem to be missing an \`index.md\` home page file at the root of your \`${ctx.argv.directory}\` folder. This may cause errors when deploying.`
          )
        );
      }
      return fps;
    }
  };
}, "ContentPage");

// quartz/plugins/vfile.ts
import { VFile } from "vfile";
function defaultProcessedContent(vfileData) {
  const root = { type: "root", children: [] };
  const vfile = new VFile("");
  vfile.data = vfileData;
  return [root, vfile];
}
__name(defaultProcessedContent, "defaultProcessedContent");

// quartz/plugins/emitters/tagPage.tsx
var TagPage = /* @__PURE__ */ __name((userOpts) => {
  const opts = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: TagContent_default({ sort: userOpts?.sort }),
    ...userOpts
  };
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts;
  const Header2 = Header_default();
  const Body2 = Body_default();
  return {
    name: "TagPage",
    getQuartzComponents() {
      return [
        Head,
        Header2,
        Body2,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer
      ];
    },
    async getDependencyGraph(ctx, content, _resources) {
      const graph = new DepGraph();
      for (const [_tree, file] of content) {
        const sourcePath = file.data.filePath;
        const tags = (file.data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes);
        if (tags.length > 0) {
          tags.push("index");
        }
        for (const tag of tags) {
          graph.addEdge(
            sourcePath,
            joinSegments(ctx.argv.output, "tags", tag + ".html")
          );
        }
      }
      return graph;
    },
    async emit(ctx, content, resources) {
      const fps = [];
      const allFiles = content.map((c) => c[1].data);
      const cfg = ctx.cfg.configuration;
      const tags = new Set(
        allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes)
      );
      tags.add("index");
      const tagDescriptions = Object.fromEntries(
        [...tags].map((tag) => {
          const title = tag === "index" ? i18n(cfg.locale).pages.tagContent.tagIndex : `${i18n(cfg.locale).pages.tagContent.tag}: ${tag}`;
          return [
            tag,
            defaultProcessedContent({
              slug: joinSegments("tags", tag),
              frontmatter: { title, tags: [] }
            })
          ];
        })
      );
      for (const [tree, file] of content) {
        const slug = file.data.slug;
        if (slug.startsWith("tags/")) {
          const tag = slug.slice("tags/".length);
          if (tags.has(tag)) {
            tagDescriptions[tag] = [tree, file];
          }
        }
      }
      for (const tag of tags) {
        const slug = joinSegments("tags", tag);
        const externalResources = pageResources(pathToRoot(slug), resources);
        const [tree, file] = tagDescriptions[tag];
        const componentData = {
          ctx,
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles
        };
        const content2 = renderPage(cfg, slug, componentData, opts, externalResources);
        const fp = await write({
          ctx,
          content: content2,
          slug: file.data.slug,
          ext: ".html"
        });
        fps.push(fp);
      }
      return fps;
    }
  };
}, "TagPage");

// quartz/plugins/emitters/folderPage.tsx
import path7 from "path";
var FolderPage = /* @__PURE__ */ __name((userOpts) => {
  const opts = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: FolderContent_default({ sort: userOpts?.sort }),
    ...userOpts
  };
  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts;
  const Header2 = Header_default();
  const Body2 = Body_default();
  return {
    name: "FolderPage",
    getQuartzComponents() {
      return [
        Head,
        Header2,
        Body2,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer
      ];
    },
    async getDependencyGraph(_ctx, content, _resources) {
      const graph = new DepGraph();
      content.map(([_tree, vfile]) => {
        const slug = vfile.data.slug;
        const folderName = path7.dirname(slug ?? "");
        if (slug && folderName !== "." && folderName !== "tags") {
          graph.addEdge(vfile.data.filePath, joinSegments(folderName, "index.html"));
        }
      });
      return graph;
    },
    async emit(ctx, content, resources) {
      const fps = [];
      const allFiles = content.map((c) => c[1].data);
      const cfg = ctx.cfg.configuration;
      const folders = new Set(
        allFiles.flatMap((data) => {
          return data.slug ? _getFolders(data.slug).filter(
            (folderName) => folderName !== "." && folderName !== "tags"
          ) : [];
        })
      );
      const folderDescriptions = Object.fromEntries(
        [...folders].map((folder) => [
          folder,
          defaultProcessedContent({
            slug: joinSegments(folder, "index"),
            frontmatter: {
              title: `${i18n(cfg.locale).pages.folderContent.folder}: ${folder}`,
              tags: []
            }
          })
        ])
      );
      for (const [tree, file] of content) {
        const slug = stripSlashes(simplifySlug(file.data.slug));
        if (folders.has(slug)) {
          folderDescriptions[slug] = [tree, file];
        }
      }
      for (const folder of folders) {
        const slug = joinSegments(folder, "index");
        const externalResources = pageResources(pathToRoot(slug), resources);
        const [tree, file] = folderDescriptions[folder];
        const componentData = {
          ctx,
          fileData: file.data,
          externalResources,
          cfg,
          children: [],
          tree,
          allFiles
        };
        const content2 = renderPage(cfg, slug, componentData, opts, externalResources);
        const fp = await write({
          ctx,
          content: content2,
          slug,
          ext: ".html"
        });
        fps.push(fp);
      }
      return fps;
    }
  };
}, "FolderPage");
function _getFolders(slug) {
  var folderName = path7.dirname(slug ?? "");
  const parentFolderNames = [folderName];
  while (folderName !== ".") {
    folderName = path7.dirname(folderName ?? "");
    parentFolderNames.push(folderName);
  }
  return parentFolderNames;
}
__name(_getFolders, "_getFolders");

// quartz/plugins/emitters/contentIndex.ts
import { toHtml as toHtml2 } from "hast-util-to-html";
var defaultOptions16 = {
  enableSiteMap: true,
  enableRSS: true,
  rssLimit: 10,
  rssFullHtml: false,
  includeEmptyFiles: true
};
function generateSiteMap(cfg, idx) {
  const base = cfg.baseUrl ?? "";
  const createURLEntry = /* @__PURE__ */ __name((slug, content) => `<url>
    <loc>https://${joinSegments(base, encodeURI(slug))}</loc>
    ${content.date && `<lastmod>${content.date.toISOString()}</lastmod>`}
  </url>`, "createURLEntry");
  const urls = Array.from(idx).map(([slug, content]) => createURLEntry(simplifySlug(slug), content)).join("");
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}
__name(generateSiteMap, "generateSiteMap");
function generateRSSFeed(cfg, idx, limit) {
  const base = cfg.baseUrl ?? "";
  const createURLEntry = /* @__PURE__ */ __name((slug, content) => `<item>
    <title>${escapeHTML(content.title)}</title>
    <link>https://${joinSegments(base, encodeURI(slug))}</link>
    <guid>https://${joinSegments(base, encodeURI(slug))}</guid>
    <description>${content.richContent ?? content.description}</description>
    <pubDate>${content.date?.toUTCString()}</pubDate>
  </item>`, "createURLEntry");
  const items = Array.from(idx).sort(([_, f1], [__, f2]) => {
    if (f1.date && f2.date) {
      return f2.date.getTime() - f1.date.getTime();
    } else if (f1.date && !f2.date) {
      return -1;
    } else if (!f1.date && f2.date) {
      return 1;
    }
    return f1.title.localeCompare(f2.title);
  }).map(([slug, content]) => createURLEntry(simplifySlug(slug), content)).slice(0, limit ?? idx.size).join("");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
      <title>${escapeHTML(cfg.pageTitle)}</title>
      <link>https://${base}</link>
      <description>${!!limit ? i18n(cfg.locale).pages.rss.lastFewNotes({ count: limit }) : i18n(cfg.locale).pages.rss.recentNotes} on ${escapeHTML(
    cfg.pageTitle
  )}</description>
      <generator>Quartz -- quartz.jzhao.xyz</generator>
      ${items}
    </channel>
  </rss>`;
}
__name(generateRSSFeed, "generateRSSFeed");
var ContentIndex = /* @__PURE__ */ __name((opts) => {
  opts = { ...defaultOptions16, ...opts };
  return {
    name: "ContentIndex",
    async getDependencyGraph(ctx, content, _resources) {
      const graph = new DepGraph();
      for (const [_tree, file] of content) {
        const sourcePath = file.data.filePath;
        graph.addEdge(
          sourcePath,
          joinSegments(ctx.argv.output, "static/contentIndex.json")
        );
        if (opts?.enableSiteMap) {
          graph.addEdge(sourcePath, joinSegments(ctx.argv.output, "sitemap.xml"));
        }
        if (opts?.enableRSS) {
          graph.addEdge(sourcePath, joinSegments(ctx.argv.output, "index.xml"));
        }
      }
      return graph;
    },
    async emit(ctx, content, _resources) {
      const cfg = ctx.cfg.configuration;
      const emitted = [];
      const linkIndex = /* @__PURE__ */ new Map();
      for (const [tree, file] of content) {
        const slug = file.data.slug;
        const date = getDate(ctx.cfg.configuration, file.data) ?? /* @__PURE__ */ new Date();
        if (opts?.includeEmptyFiles || file.data.text && file.data.text !== "") {
          linkIndex.set(slug, {
            title: file.data.frontmatter?.title,
            links: file.data.links ?? [],
            tags: file.data.frontmatter?.tags ?? [],
            content: file.data.text ?? "",
            richContent: opts?.rssFullHtml ? escapeHTML(toHtml2(tree, { allowDangerousHtml: true })) : void 0,
            date,
            description: file.data.description ?? ""
          });
        }
      }
      if (opts?.enableSiteMap) {
        emitted.push(
          await write({
            ctx,
            content: generateSiteMap(cfg, linkIndex),
            slug: "sitemap",
            ext: ".xml"
          })
        );
      }
      if (opts?.enableRSS) {
        emitted.push(
          await write({
            ctx,
            content: generateRSSFeed(cfg, linkIndex, opts.rssLimit),
            slug: "index",
            ext: ".xml"
          })
        );
      }
      const fp = joinSegments("static", "contentIndex");
      const simplifiedIndex = Object.fromEntries(
        Array.from(linkIndex).map(([slug, content2]) => {
          delete content2.description;
          delete content2.date;
          return [slug, content2];
        })
      );
      emitted.push(
        await write({
          ctx,
          content: JSON.stringify(simplifiedIndex),
          slug: fp,
          ext: ".json"
        })
      );
      return emitted;
    },
    getQuartzComponents: /* @__PURE__ */ __name(() => [], "getQuartzComponents")
  };
}, "ContentIndex");

// quartz/plugins/emitters/aliases.ts
import path8 from "path";
var AliasRedirects = /* @__PURE__ */ __name(() => ({
  name: "AliasRedirects",
  getQuartzComponents() {
    return [];
  },
  async getDependencyGraph(ctx, content, _resources) {
    const graph = new DepGraph();
    const { argv } = ctx;
    for (const [_tree, file] of content) {
      const dir = path8.posix.relative(argv.directory, path8.dirname(file.data.filePath));
      const aliases = file.data.frontmatter?.aliases ?? [];
      const slugs = aliases.map((alias) => path8.posix.join(dir, alias));
      const permalink = file.data.frontmatter?.permalink;
      if (typeof permalink === "string") {
        slugs.push(permalink);
      }
      for (let slug of slugs) {
        if (slug.endsWith("/")) {
          slug = joinSegments(slug, "index");
        }
        graph.addEdge(file.data.filePath, joinSegments(argv.output, slug + ".html"));
      }
    }
    return graph;
  },
  async emit(ctx, content, _resources) {
    const { argv } = ctx;
    const fps = [];
    for (const [_tree, file] of content) {
      const ogSlug = simplifySlug(file.data.slug);
      const dir = path8.posix.relative(argv.directory, path8.dirname(file.data.filePath));
      const aliases = file.data.frontmatter?.aliases ?? [];
      const slugs = aliases.map((alias) => path8.posix.join(dir, alias));
      const permalink = file.data.frontmatter?.permalink;
      if (typeof permalink === "string") {
        slugs.push(permalink);
      }
      for (let slug of slugs) {
        if (slug.endsWith("/")) {
          slug = joinSegments(slug, "index");
        }
        const redirUrl = resolveRelative(slug, file.data.slug);
        const fp = await write({
          ctx,
          content: `
            <!DOCTYPE html>
            <html lang="en-us">
            <head>
            <title>${ogSlug}</title>
            <link rel="canonical" href="${redirUrl}">
            <meta name="robots" content="noindex">
            <meta charset="utf-8">
            <meta http-equiv="refresh" content="0; url=${redirUrl}">
            </head>
            </html>
            `,
          slug,
          ext: ".html"
        });
        fps.push(fp);
      }
    }
    return fps;
  }
}), "AliasRedirects");

// quartz/plugins/emitters/assets.ts
import path10 from "path";
import fs3 from "fs";

// quartz/util/glob.ts
import path9 from "path";
import { globby } from "globby";
function toPosixPath(fp) {
  return fp.split(path9.sep).join("/");
}
__name(toPosixPath, "toPosixPath");
async function glob(pattern, cwd, ignorePatterns) {
  const fps = (await globby(pattern, {
    cwd,
    ignore: ignorePatterns,
    gitignore: true
  })).map(toPosixPath);
  return fps;
}
__name(glob, "glob");

// quartz/plugins/emitters/assets.ts
var filesToCopy = /* @__PURE__ */ __name(async (argv, cfg) => {
  return await glob("**", argv.directory, ["**/*.md", ...cfg.configuration.ignorePatterns]);
}, "filesToCopy");
var Assets = /* @__PURE__ */ __name(() => {
  return {
    name: "Assets",
    getQuartzComponents() {
      return [];
    },
    async getDependencyGraph(ctx, _content, _resources) {
      const { argv, cfg } = ctx;
      const graph = new DepGraph();
      const fps = await filesToCopy(argv, cfg);
      for (const fp of fps) {
        const ext = path10.extname(fp);
        const src = joinSegments(argv.directory, fp);
        const name = slugifyFilePath(fp, true) + ext;
        const dest = joinSegments(argv.output, name);
        graph.addEdge(src, dest);
      }
      return graph;
    },
    async emit({ argv, cfg }, _content, _resources) {
      const assetsPath = argv.output;
      const fps = await filesToCopy(argv, cfg);
      const res = [];
      for (const fp of fps) {
        const ext = path10.extname(fp);
        const src = joinSegments(argv.directory, fp);
        const name = slugifyFilePath(fp, true) + ext;
        const dest = joinSegments(assetsPath, name);
        const dir = path10.dirname(dest);
        await fs3.promises.mkdir(dir, { recursive: true });
        await fs3.promises.copyFile(src, dest);
        res.push(dest);
      }
      return res;
    }
  };
}, "Assets");

// quartz/plugins/emitters/static.ts
import fs4 from "fs";
var Static = /* @__PURE__ */ __name(() => ({
  name: "Static",
  getQuartzComponents() {
    return [];
  },
  async getDependencyGraph({ argv, cfg }, _content, _resources) {
    const graph = new DepGraph();
    const staticPath = joinSegments(QUARTZ, "static");
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns);
    for (const fp of fps) {
      graph.addEdge(
        joinSegments("static", fp),
        joinSegments(argv.output, "static", fp)
      );
    }
    return graph;
  },
  async emit({ argv, cfg }, _content, _resources) {
    const staticPath = joinSegments(QUARTZ, "static");
    const fps = await glob("**", staticPath, cfg.configuration.ignorePatterns);
    await fs4.promises.cp(staticPath, joinSegments(argv.output, "static"), {
      recursive: true,
      dereference: true
    });
    return fps.map((fp) => joinSegments(argv.output, "static", fp));
  }
}), "Static");

// quartz/components/scripts/spa.inline.ts
var spa_inline_default = "";

// quartz/components/scripts/popover.inline.ts
var popover_inline_default = "";

// quartz/styles/custom.scss
var custom_default = "";

// quartz/components/styles/popover.scss
var popover_default = "";

// quartz/plugins/emitters/componentResources.ts
import { Features, transform } from "lightningcss";
import { transform as transpile } from "esbuild";
function getComponentResources(ctx) {
  const allComponents = /* @__PURE__ */ new Set();
  for (const emitter of ctx.cfg.plugins.emitters) {
    const components = emitter.getQuartzComponents(ctx);
    for (const component of components) {
      allComponents.add(component);
    }
  }
  const componentResources = {
    css: /* @__PURE__ */ new Set(),
    beforeDOMLoaded: /* @__PURE__ */ new Set(),
    afterDOMLoaded: /* @__PURE__ */ new Set()
  };
  for (const component of allComponents) {
    const { css, beforeDOMLoaded, afterDOMLoaded } = component;
    if (css) {
      componentResources.css.add(css);
    }
    if (beforeDOMLoaded) {
      componentResources.beforeDOMLoaded.add(beforeDOMLoaded);
    }
    if (afterDOMLoaded) {
      componentResources.afterDOMLoaded.add(afterDOMLoaded);
    }
  }
  return {
    css: [...componentResources.css],
    beforeDOMLoaded: [...componentResources.beforeDOMLoaded],
    afterDOMLoaded: [...componentResources.afterDOMLoaded]
  };
}
__name(getComponentResources, "getComponentResources");
async function joinScripts(scripts) {
  const script = scripts.map((script2) => `(function () {${script2}})();`).join("\n");
  const res = await transpile(script, {
    minify: true
  });
  return res.code;
}
__name(joinScripts, "joinScripts");
function addGlobalPageResources(ctx, componentResources) {
  const cfg = ctx.cfg.configuration;
  if (cfg.enablePopovers) {
    componentResources.afterDOMLoaded.push(popover_inline_default);
    componentResources.css.push(popover_default);
  }
  if (cfg.analytics?.provider === "google") {
    const tagId = cfg.analytics.tagId;
    componentResources.afterDOMLoaded.push(`
      const gtagScript = document.createElement("script")
      gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=${tagId}"
      gtagScript.async = true
      document.head.appendChild(gtagScript)

      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", "${tagId}", { send_page_view: false });

      document.addEventListener("nav", () => {
        gtag("event", "page_view", {
          page_title: document.title,
          page_location: location.href,
        });
      });`);
  } else if (cfg.analytics?.provider === "plausible") {
    const plausibleHost = cfg.analytics.host ?? "https://plausible.io";
    componentResources.afterDOMLoaded.push(`
      const plausibleScript = document.createElement("script")
      plausibleScript.src = "${plausibleHost}/js/script.manual.js"
      plausibleScript.setAttribute("data-domain", location.hostname)
      plausibleScript.defer = true
      document.head.appendChild(plausibleScript)

      window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }

      document.addEventListener("nav", () => {
        plausible("pageview")
      })
    `);
  } else if (cfg.analytics?.provider === "umami") {
    componentResources.afterDOMLoaded.push(`
      const umamiScript = document.createElement("script")
      umamiScript.src = "${cfg.analytics.host ?? "https://analytics.umami.is"}/script.js"
      umamiScript.setAttribute("data-website-id", "${cfg.analytics.websiteId}")
      umamiScript.async = true

      document.head.appendChild(umamiScript)
    `);
  } else if (cfg.analytics?.provider === "goatcounter") {
    componentResources.afterDOMLoaded.push(`
      const goatcounterScript = document.createElement("script")
      goatcounterScript.src = "${cfg.analytics.scriptSrc ?? "https://gc.zgo.at/count.js"}"
      goatcounterScript.async = true
      goatcounterScript.setAttribute("data-goatcounter",
        "https://${cfg.analytics.websiteId}.${cfg.analytics.host ?? "goatcounter.com"}/count")
      document.head.appendChild(goatcounterScript)
    `);
  } else if (cfg.analytics?.provider === "posthog") {
    componentResources.afterDOMLoaded.push(`
      const posthogScript = document.createElement("script")
      posthogScript.innerHTML= \`!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${cfg.analytics.apiKey}',{api_host:'${cfg.analytics.host ?? "https://app.posthog.com"}'})\`
      document.head.appendChild(posthogScript)
    `);
  } else if (cfg.analytics?.provider === "tinylytics") {
    const siteId = cfg.analytics.siteId;
    componentResources.afterDOMLoaded.push(`
      const tinylyticsScript = document.createElement("script")
      tinylyticsScript.src = "https://tinylytics.app/embed/${siteId}.js"
      tinylyticsScript.defer = true
      document.head.appendChild(tinylyticsScript)
    `);
  } else if (cfg.analytics?.provider === "cabin") {
    componentResources.afterDOMLoaded.push(`
      const cabinScript = document.createElement("script")
      cabinScript.src = "${cfg.analytics.host ?? "https://scripts.withcabin.com"}/hello.js"
      cabinScript.defer = true
      cabinScript.async = true
      document.head.appendChild(cabinScript)
    `);
  } else if (cfg.analytics?.provider === "clarity") {
    componentResources.afterDOMLoaded.push(`
      const clarityScript = document.createElement("script")
      clarityScript.innerHTML= \`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${cfg.analytics.projectId}");\`
      document.head.appendChild(clarityScript)
    `);
  }
  if (cfg.enableSPA) {
    componentResources.afterDOMLoaded.push(spa_inline_default);
  } else {
    componentResources.afterDOMLoaded.push(`
      window.spaNavigate = (url, _) => window.location.assign(url)
      window.addCleanup = () => {}
      const event = new CustomEvent("nav", { detail: { url: document.body.dataset.slug } })
      document.dispatchEvent(event)
    `);
  }
}
__name(addGlobalPageResources, "addGlobalPageResources");
var ComponentResources = /* @__PURE__ */ __name(() => {
  return {
    name: "ComponentResources",
    getQuartzComponents() {
      return [];
    },
    async getDependencyGraph(_ctx, _content, _resources) {
      return new DepGraph();
    },
    async emit(ctx, _content, _resources) {
      const promises = [];
      const cfg = ctx.cfg.configuration;
      const componentResources = getComponentResources(ctx);
      let googleFontsStyleSheet = "";
      if (cfg.theme.fontOrigin === "local") {
      } else if (cfg.theme.fontOrigin === "googleFonts" && !cfg.theme.cdnCaching) {
        let match;
        const fontSourceRegex = /url\((https:\/\/fonts.gstatic.com\/s\/[^)]+\.(woff2|ttf))\)/g;
        googleFontsStyleSheet = await (await fetch(googleFontHref(ctx.cfg.configuration.theme))).text();
        while ((match = fontSourceRegex.exec(googleFontsStyleSheet)) !== null) {
          const url = match[1];
          const [filename, ext] = url.split("/").pop().split(".");
          googleFontsStyleSheet = googleFontsStyleSheet.replace(
            url,
            `https://${cfg.baseUrl}/static/fonts/${filename}.ttf`
          );
          promises.push(
            fetch(url).then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch font`);
              }
              return res.arrayBuffer();
            }).then(
              (buf) => write({
                ctx,
                slug: joinSegments("static", "fonts", filename),
                ext: `.${ext}`,
                content: Buffer.from(buf)
              })
            )
          );
        }
      }
      addGlobalPageResources(ctx, componentResources);
      const stylesheet = joinStyles(
        ctx.cfg.configuration.theme,
        googleFontsStyleSheet,
        ...componentResources.css,
        custom_default
      );
      const [prescript, postscript] = await Promise.all([
        joinScripts(componentResources.beforeDOMLoaded),
        joinScripts(componentResources.afterDOMLoaded)
      ]);
      promises.push(
        write({
          ctx,
          slug: "index",
          ext: ".css",
          content: transform({
            filename: "index.css",
            code: Buffer.from(stylesheet),
            minify: true,
            targets: {
              safari: 15 << 16 | 6 << 8,
              // 15.6
              ios_saf: 15 << 16 | 6 << 8,
              // 15.6
              edge: 115 << 16,
              firefox: 102 << 16,
              chrome: 109 << 16
            },
            include: Features.MediaQueries
          }).code.toString()
        }),
        write({
          ctx,
          slug: "prescript",
          ext: ".js",
          content: prescript
        }),
        write({
          ctx,
          slug: "postscript",
          ext: ".js",
          content: postscript
        })
      );
      return await Promise.all(promises);
    }
  };
}, "ComponentResources");

// quartz/plugins/emitters/404.tsx
var NotFoundPage = /* @__PURE__ */ __name(() => {
  const opts = {
    ...sharedPageComponents,
    pageBody: __default(),
    beforeBody: [],
    left: [],
    right: []
  };
  const { head: Head, pageBody, footer: Footer } = opts;
  const Body2 = Body_default();
  return {
    name: "404Page",
    getQuartzComponents() {
      return [Head, Body2, pageBody, Footer];
    },
    async getDependencyGraph(_ctx, _content, _resources) {
      return new DepGraph();
    },
    async emit(ctx, _content, resources) {
      const cfg = ctx.cfg.configuration;
      const slug = "404";
      const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`);
      const path12 = url.pathname;
      const externalResources = pageResources(path12, resources);
      const notFound = i18n(cfg.locale).pages.error.title;
      const [tree, vfile] = defaultProcessedContent({
        slug,
        text: notFound,
        description: notFound,
        frontmatter: { title: notFound, tags: [] }
      });
      const componentData = {
        ctx,
        fileData: vfile.data,
        externalResources,
        cfg,
        children: [],
        tree,
        allFiles: []
      };
      return [
        await write({
          ctx,
          content: renderPage(cfg, slug, componentData, opts, externalResources),
          slug,
          ext: ".html"
        })
      ];
    }
  };
}, "NotFoundPage");

// quartz/plugins/emitters/cname.ts
import chalk4 from "chalk";

// quartz.config.ts
var config = {
  configuration: {
    pageTitle: "\u{1F9E0} Second Brain",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible"
    },
    locale: "en-US",
    baseUrl: "programmerraja.github.io",
    ignorePatterns: ["private", "template", ".obsidian", "Scripts", "Excalidraw", "misc", "Focus_Dashboard"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Rubik",
        body: "Source Sans Pro",
        code: "IBM Plex Mono"
      },
      colors: {
        lightMode: {
          light: "#0d122b",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "white",
          tertiary: "#8d00ff",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288"
        },
        darkMode: {
          light: "#0d122b",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "white",
          tertiary: "#8d00ff",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#b3aa0288"
        }
      }
    }
  },
  plugins: {
    transformers: [
      FrontMatter(),
      CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"]
      }),
      SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark"
        },
        keepBackground: false
      }),
      ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      GitHubFlavoredMarkdown(),
      TableOfContents(),
      CrawlLinks({ markdownLinkResolution: "shortest" }),
      Description(),
      Latex({ renderEngine: "katex" })
    ],
    filters: [RemoveDrafts()],
    emitters: [
      AliasRedirects(),
      ComponentResources(),
      ContentPage(),
      FolderPage(),
      TagPage(),
      ContentIndex({
        enableSiteMap: true,
        enableRSS: true
      }),
      Assets(),
      Static(),
      NotFoundPage()
    ]
  }
};
var quartz_config_default = config;

// quartz/processors/parse.ts
import esbuild from "esbuild";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// quartz/util/perf.ts
import chalk5 from "chalk";
import pretty from "pretty-time";
var PerfTimer = class {
  static {
    __name(this, "PerfTimer");
  }
  evts;
  constructor() {
    this.evts = {};
    this.addEvent("start");
  }
  addEvent(evtName) {
    this.evts[evtName] = process.hrtime();
  }
  timeSince(evtName) {
    return chalk5.yellow(pretty(process.hrtime(this.evts[evtName ?? "start"])));
  }
};

// quartz/processors/parse.ts
import { read } from "to-vfile";
import path11 from "path";
import workerpool, { Promise as WorkerPromise } from "workerpool";

// quartz/util/log.ts
import { Spinner } from "cli-spinner";

// quartz/processors/parse.ts
function createProcessor(ctx) {
  const transformers = ctx.cfg.plugins.transformers;
  return unified().use(remarkParse).use(
    transformers.filter((p) => p.markdownPlugins).flatMap((plugin) => plugin.markdownPlugins(ctx))
  ).use(remarkRehype, { allowDangerousHtml: true }).use(transformers.filter((p) => p.htmlPlugins).flatMap((plugin) => plugin.htmlPlugins(ctx)));
}
__name(createProcessor, "createProcessor");
function createFileParser(ctx, fps) {
  const { argv, cfg } = ctx;
  return async (processor) => {
    const res = [];
    for (const fp of fps) {
      try {
        const perf = new PerfTimer();
        const file = await read(fp);
        file.value = file.value.toString().trim();
        for (const plugin of cfg.plugins.transformers.filter((p) => p.textTransform)) {
          file.value = plugin.textTransform(ctx, file.value.toString());
        }
        file.data.filePath = file.path;
        file.data.relativePath = path11.posix.relative(argv.directory, file.path);
        file.data.slug = slugifyFilePath(file.data.relativePath);
        const ast = processor.parse(file);
        const newAst = await processor.run(ast, file);
        res.push([newAst, file]);
        if (argv.verbose) {
          console.log(`[process] ${fp} -> ${file.data.slug} (${perf.timeSince()})`);
        }
      } catch (err) {
        trace(`
Failed to process \`${fp}\``, err);
      }
    }
    return res;
  };
}
__name(createFileParser, "createFileParser");

// quartz/util/sourcemap.ts
import fs5 from "fs";
import { fileURLToPath } from "url";
var options = {
  // source map hack to get around query param
  // import cache busting
  retrieveSourceMap(source) {
    if (source.includes(".quartz-cache")) {
      let realSource = fileURLToPath(source.split("?", 2)[0] + ".map");
      return {
        map: fs5.readFileSync(realSource, "utf8")
      };
    } else {
      return null;
    }
  }
};

// quartz/worker.ts
sourceMapSupport.install(options);
async function parseFiles(buildId, argv, fps, allSlugs) {
  const ctx = {
    buildId,
    cfg: quartz_config_default,
    argv,
    allSlugs
  };
  const processor = createProcessor(ctx);
  const parse = createFileParser(ctx, fps);
  return parse(processor);
}
__name(parseFiles, "parseFiles");
export {
  parseFiles
};
//# sourceMappingURL=transpiled-worker.mjs.map
