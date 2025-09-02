import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';


export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const stats = getReadingTime(textOnPage);
    // stats = { text: "3 min read", minutes: 3.2, time: 192000, words: 640 }

    // Arrondi "humain" + garde-fou à 1 min
    const minutesRounded = Math.max(1, Math.round(stats.minutes));

    // Chaîne FR
    const minutesReadFr = `${minutesRounded} min de lecture`;

    // Tu peux stocker les deux : la chaîne pour affichage, le nombre pour trier/SEO
    data.astro.frontmatter.minutesRead = minutesReadFr; // "3 min de lecture"
    data.astro.frontmatter.minutes = minutesRounded;    // 3
    data.astro.frontmatter.nbWords = stats.words;       // 640
  }};