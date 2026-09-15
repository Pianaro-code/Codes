import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, buildCaption, illustrationFor } from '../src/content.js';

test('classifica SST', () => assert.equal(classify('Regra de seguranca do trabalho', ''), 'SST'));
test('classifica RH por padrao', () => assert.equal(classify('Tendencias de lideranca', ''), 'RH'));
test('legenda inclui fonte e hashtag', () => {
  const caption = buildCaption('Titulo', 'Resumo', 'Fonte', 'https://example.com', 'RH');
  assert.match(caption, /Fonte/);
  assert.match(caption, /#RecursosHumanos/);
});
test('sugere imagem visual coerente com a pauta', () => {
  assert.match(illustrationFor('SST', 'Ergonomia no trabalho'), /images\.unsplash\.com/);
  assert.notEqual(illustrationFor('RH', 'Lideranca'), illustrationFor('SST', 'Ergonomia no trabalho'));
});
