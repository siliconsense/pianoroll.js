/* Tests that run without a browser: parsing, rebuilding, syllables, fitting.
   Everything here is a claim the README makes, checked rather than asserted. */
const PR = require('../pianoroll.js');
let failed = 0;
function is(got, want, what){
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${what}` + (ok ? '' : `  — got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`));
}

const SCORE = [
  'X:1', 'T:Demo', 'M:4/4', 'L:1/32', 'Q:1/4=96',
  'V: Vocal clef=treble name="Vocal Melody" snm="Vocal"',
  'V: Ins clef=treble name="Ins Melody" snm="Inst."',
  'K:Am', '% verse', 'V: Vocal',
  '"Am"A,8B,8C8D8|"F"E16D16|"C"C8B,8A,16|"G"z32|',
  'V: Ins',
  '"Am"A,,16E,,16|"F"F,,16C,,16|"C"C,,16G,,16|"G"G,,16D,,16|', ''
].join('\n');

const S = PR.parse(SCORE);
is(S.voiceIds, ['Vocal', 'Ins'], 'both voices are parsed');
is(S.bars, 4, 'bar count');
is(S.tempo, 96, 'tempo from Q:');
is(S.keyName, 'Am', 'key from K:');
is(S.tracks.Vocal.length, 9, 'notes in the vocal line');

const again = PR.parse(PR.build(S));
is(JSON.stringify(again.tracks), JSON.stringify(S.tracks), 'parse → build → parse is lossless');

/* Syllables follow the script: in Cyrillic every vowel is a syllable, in Latin a run
   of vowels is one and a silent trailing "e" does not count. */
is(PR.syllables('моя'), 2, 'Cyrillic: adjacent vowels count separately (моя)');
is(PR.syllables('аэропорт'), 4, 'Cyrillic: аэропорт');
is(PR.syllables('заиграет'), 4, 'Cyrillic: заиграет');
is(PR.syllables('спит'), 1, 'Cyrillic: one vowel, one syllable');
is(PR.syllables('rain'), 1, 'Latin: a vowel run is one syllable');
is(PR.syllables('come'), 1, 'Latin: silent trailing e is dropped');
is(PR.syllables('free'), 1, 'Latin: double vowel before the end stays one');
is(PR.syllables('Город спит на дне сентября'), 8, 'a whole line');

const fit = PR.fitToLyrics(PR.parse(SCORE), 'Every night I hear the rain\nFalling on an empty train', 'Vocal');
is(fit.ok, true, 'fitting reports success');
is(fit.after, fit.syllables, 'note count ends up equal to the syllable count');

is(PR.keyName(PR.transposeKey(PR.parse(SCORE).key, 3)), 'Cm', 'transpose up three semitones');
is(PR.keyName(PR.transposeKey(PR.parse(SCORE).key, -1)), 'G#m', 'transpose down one');

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
