// export function AutoUnsubscribe(constructor) {
//   const original = constructor.prototype.ngOnDestroy;

//   constructor.prototype.ngOnDestroy = function () {
//     for (const prop in this) {
//       if (prop === 'subscriptions') {
//         for (const sub in this[prop]) {
//           if (sub && typeof sub.unsubscribe === 'function') {
//             sub.unsubscribe();
//           }
//         }
//         break;
//       }
//     }

//     original &&
//       typeof original === 'function' &&
//       original.apply(this, arguments);
//   };
// }
