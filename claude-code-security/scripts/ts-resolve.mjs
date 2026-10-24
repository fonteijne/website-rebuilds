// Lets Node resolve the extensionless imports used in src/content (Vite style) to .ts files.
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context);
    throw err;
  }
}
