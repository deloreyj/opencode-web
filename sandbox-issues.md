# Cloudflare Sandbox SDK Issues

This document tracks discrepancies between the Cloudflare Sandbox SDK documentation and the actual library implementation.

## Documentation vs Implementation Discrepancies

### 1. `gitCheckout` - Missing `depth` option

**Documentation:** https://developers.cloudflare.com/sandbox/guides/git-workflows/

The docs show using `depth: 1` for shallow clones:

```ts
// Shallow clone (faster for large repos)
await sandbox.gitCheckout('https://github.com/user/large-repo', {
  depth: 1
});
```

**Actual TypeScript Type:**
```ts
// @cloudflare/sandbox@0.4.12
interface GitCheckoutOptions {
  branch?: string;
  targetDir?: string;
  sessionId?: string;
  // depth property does not exist
}
```

**Impact:** Cannot use shallow clones as documented. May cause slower clones for large repositories.

**Workaround:** Omit the `depth` option for now.

**Date Discovered:** 2025-10-29
**SDK Version:** @cloudflare/sandbox@0.4.12

---

## Template for New Issues

```markdown
### N. [Method/Feature] - [Brief Description]

**Documentation:** [Link to docs]

[Description of what the docs say]

**Actual Behavior/Type:**
[What the actual implementation does or what the TypeScript types show]

**Impact:** [How this affects usage]

**Workaround:** [If any]

**Date Discovered:** YYYY-MM-DD
**SDK Version:** @cloudflare/sandbox@X.Y.Z
```
