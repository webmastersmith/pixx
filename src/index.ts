import { pixx } from './pixx';
import { pixxFlow } from './pixxFlow';
export { pixx };
export { pixxFlow } from './pixxFlow';

// Pixx
// development
// default test
// pixx('./src/compass.jpg').then((m) => console.log('\n\n', m, '\n\n'));

// classes test
// let pending = true;
// pixx('./src/compass.jpg', {
//   log: true,
//   title: 'Antique compass',
//   alt: 'Image of an old compass',
//   withBlur: true,
//   classes: ['my-special-class', 'border-blue-200', { 'border-red-200': pending }],
// });

// single type
// pixx('./src/compass.jpg', {
//   log: true,
//   picTypes: ['webp'],
//   sizes: ['(max-width: 450px) 75vw', '(max-width: 800px) 50vw', '25vw'],
// });

// art direction
// pixx(['./src/compass.jpg', './src/happy face.jpg'], {
//   log: true,
//   clean: true,
//   withBlur: true,
//   // returnReact: true,
//   omit: { remove: 'pixx_images', add: './my-special-folder' },
//   media: ['(max-width: 500px) compass.jpg', '(min-width: 501px) happy face.jpg'],
//   sizes: ['(max-width: 500px) 50vw', '(min-width: 501px) 25vw', '30vw'],
//   // styles: { color: 'blue', backgroundColor: 'red' }, // react
//   styles: ['color: blue', 'border-color: red'], // html
// }).then((m) => console.log('\n\n', m, '\n\n'));
// }).then((m) => console.log('\n\n', JSON.stringify(m)));

// PixxFlow
// pixxFlow(pixx, {
//   include: ['./test/**/*.html', './test/**/*.jsx', './test/**/*.tsx'],
//   ignore: ['node_modules/**', '**/avoid*'],
//   options: { log: true },
// });
