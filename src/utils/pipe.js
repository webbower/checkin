const pipe = (...fns) => x => fns.reduce((memo, fn) => fn(memo), x);

export default pipe;
