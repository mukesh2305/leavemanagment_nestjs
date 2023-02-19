import * as fs from 'fs';

export const NULL_SHING_VALUE = [null, undefined, ''];

export function generateBadRequest(description) {
  return {
    success: false,
    statusCode: 400,
    description,
    status: 'BAD_REQUEST',
  };
}
export function generateUnhandledRequest(description) {
  return {
    success: false,
    statusCode: 500,
    description,
    status: 'UNHANDLED_ERROR',
  };
}

export function ErrorLog(error) {
  console.log(typeof error);
  const date = new Date();
  const errorObj = {
    date: `${date}\n`,
    message: `${error.message}\n`,
    stack: `${error.stack}\n`,
  };
  fs.writeFile('./log/error.log', errorObj.date, { flag: 'a+' }, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.writeFile('./log/error.log', errorObj.stack, { flag: 'a+' }, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(errorObj.stack);
        }
      });
      console.log(errorObj.date);
    }
  });
  // const data = fs.appendFileSync('./error.txt', error.message);
  // console.log(data, 'daaata');
}

// module.exports = {
//     NULL_SHING_VALUE,
//     generateBadRequest,
//     generateUnhandledRequest
// }
