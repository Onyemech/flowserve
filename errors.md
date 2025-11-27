Run `npm audit` for details.
PS C:\Users\DELL\Saas\serveflow\frontend> npm audit
# npm audit report

next  0.9.9 - 14.2.31
Severity: high
Next.js Server-Side Request Forgery in Server Actions - https://github.com/advisories/GHSA-fr5h-rqp8-mj6g
Denial of Service condition in Next.js image optimization - https://github.com/advisories/GHSA-g77x-44xx-532m
Information exposure in Next.js dev server due to lack of origin verification - https://github.com/advisories/GHSA-3h52-269p-cp9r
Next.js Affected by Cache Key Confusion for Image Optimization API Routes - https://github.com/advisories/GHSA-g5qg-72qw-gw5v
Next.js authorization bypass vulnerability - https://github.com/advisories/GHSA-7gfc-8cq8-jh5f
Next.js Improper Middleware Redirect Handling Leads to SSRF - https://github.com/advisories/GHSA-4342-x723-ch2f
Next.js Content Injection Vulnerability for Image Optimization - https://github.com/advisories/GHSA-xv57-4mr9-wg8v
Next.js Race Condition to Cache Poisoning - https://github.com/advisories/GHSA-qpjv-v59x-3qc4
No fix available
node_modules/@types/next-pwa/node_modules/next
  @types/next-pwa  *
  Depends on vulnerable versions of next
  node_modules/@types/next-pwa

2 vulnerabilities (1 moderate, 1 high)

Some issues need review, and may require choosing
a different dependency.
PS C:\Users\DELL\Saas\serveflow\frontend>  ⨯ ERROR: This build is using Turbopack, with a `webpack` config and no `turbopack` config.
   This may be a mistake.

   As of Next.js 16 Turbopack is enabled by default and
   custom webpack configurations may need to be migrated to Turbopack.    

   NOTE: your `webpack` config may have been added by a configuration plugin.
