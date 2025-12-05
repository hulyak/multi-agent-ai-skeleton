# IDL Resurrection Troubleshooting Guide

This guide helps you resolve common issues when resurrecting CORBA IDL files.

## Table of Contents
- [Parsing Issues](#parsing-issues)
- [Type Mapping Issues](#type-mapping-issues)
- [YAML Generation Issues](#yaml-generation-issues)
- [UI Issues](#ui-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Parsing Issues

### Issue: "Failed to parse IDL file"

**Symptoms:**
- Upload fails with parsing error
- No interfaces extracted
- Empty result

**Common Causes:**

1. **Malformed IDL Syntax**
   ```idl
   // ❌ Missing semicolon
   module MyModule {
     struct User {
       string name
     }
   }
   
   // ✅ Correct
   module MyModule {
     struct User {
       string name;
     };
   };
   ```

2. **Unsupported CORBA Features**
   - Unions (not yet supported)
   - Typedefs (partially supported)
   - Constants (not extracted)
   - Enums (not extracted)

**Solutions:**
- Check IDL syntax is valid CORBA 2.x/3.x
- Remove unsupported features
- Simplify complex type definitions
- Try one of the demo files first to verify the system works

---

### Issue: "Module not found"

**Symptoms:**
- Parser returns empty module name
- Module shows as "Unknown"

**Cause:**
IDL file doesn't have a proper module declaration.

**Solution:**
```idl
// ❌ Missing module
interface MyService {
  void doSomething();
};

// ✅ Wrapped in module
module MySystem {
  interface MyService {
    void doSomething();
  };
};
```

---

### Issue: "Methods not extracted"

**Symptoms:**
- Interface parsed but no methods found
- Empty methods array

**Common Causes:**

1. **Complex Method Signatures**
   ```idl
   // May fail with very complex signatures
   sequence<sequence<map<string, any>>> complexMethod();
   
   // Simplify to:
   sequence<ComplexType> complexMethod();
   ```

2. **Inline Type Definitions**
   ```idl
   // ❌ Inline struct (not supported)
   struct { string name; } getUser();
   
   // ✅ Named struct
   struct User { string name; };
   User getUser();
   ```

**Solution:**
- Extract inline types to named structs
- Simplify complex nested types
- Use standard CORBA types

---

### Issue: "Exceptions not linked to methods"

**Symptoms:**
- Exceptions extracted but not associated with methods
- `raises` clause ignored

**Cause:**
Incorrect `raises` syntax.

**Solution:**
```idl
// ❌ Wrong syntax
void myMethod() throw (MyException);

// ✅ Correct CORBA syntax
void myMethod() raises (MyException);

// ✅ Multiple exceptions
void myMethod() raises (Exception1, Exception2);
```

---

## Type Mapping Issues

### Issue: "Unknown type in generated YAML"

**Symptoms:**
- YAML contains unmapped CORBA types
- Type shows as original CORBA name

**Cause:**
Custom or uncommon CORBA type not in mapping table.

**Current Type Mappings:**
```
string          → string
long            → number
short           → number
unsigned long   → number
unsigned short  → number
double          → number
float           → number
boolean         → boolean
char            → string
wchar           → string
octet           → number
void            → void
sequence<T>     → T[]
any             → any
```

**Solution:**
- Use standard CORBA types when possible
- Custom types (structs, interfaces) are preserved as-is
- If you need a new mapping, the type will be preserved but may need manual adjustment

---

### Issue: "Sequence types not converted to arrays"

**Symptoms:**
- `sequence<string>` stays as `sequence<string>` instead of `string[]`

**Cause:**
Malformed sequence syntax.

**Solution:**
```idl
// ❌ Wrong
sequence < string > names;

// ✅ Correct (no spaces)
sequence<string> names;

// ✅ Nested sequences
sequence<sequence<string>> matrix;  // → string[][]
```

---

### Issue: "Parameter directions lost"

**Symptoms:**
- All parameters treated as inputs
- `out` and `inout` parameters not categorized

**Cause:**
Missing or incorrect direction keywords.

**Solution:**
```idl
// ❌ Missing direction
void myMethod(string param);

// ✅ Explicit direction
void myMethod(in string param);

// ✅ Output parameter
void myMethod(out string result);

// ✅ Input/output parameter
void myMethod(inout string data);
```

---

## YAML Generation Issues

### Issue: "Generated YAML has syntax errors"

**Symptoms:**
- YAML validation fails
- Indentation errors
- Missing colons or dashes

**Cause:**
Special characters in IDL identifiers.

**Solution:**
```idl
// ❌ Special characters in names
interface My-Service {
  void do:something();
};

// ✅ Use valid identifiers
interface MyService {
  void doSomething();
};
```

---

### Issue: "YAML file too large"

**Symptoms:**
- Generated YAML is unexpectedly large
- Many duplicate type definitions

**Cause:**
- Large IDL with many structs
- Repeated type definitions

**Solution:**
- This is expected for complex IDL files
- YAML is still more concise than IDL
- Consider splitting large interfaces into multiple files

---

### Issue: "Downloaded YAML is empty"

**Symptoms:**
- Download button works but file is empty
- File size is 0 bytes

**Cause:**
Browser blocked the download or conversion failed silently.

**Solution:**
1. Check browser console for errors
2. Try a different browser
3. Verify the resurrection completed successfully
4. Try downloading again

---

## UI Issues

### Issue: "Upload button not responding"

**Symptoms:**
- Click on upload button does nothing
- File dialog doesn't open

**Solutions:**
1. **Check File Input**
   - Ensure you're clicking the visible button, not the hidden input
   - Try refreshing the page

2. **Browser Compatibility**
   - Use a modern browser (Chrome, Firefox, Safari, Edge)
   - Enable JavaScript
   - Check browser console for errors

3. **File Permissions**
   - Ensure the IDL file is readable
   - Try copying the file to a different location

---

### Issue: "Animations not playing"

**Symptoms:**
- Parsing/converting animations don't show
- Instant transition to complete state

**Cause:**
`prefers-reduced-motion` is enabled.

**Solution:**
This is intentional for accessibility! The feature still works, just without animations.

To see animations:
- Disable "Reduce motion" in your OS settings
- Or enjoy the faster, accessible experience

---

### Issue: "Demo examples not loading"

**Symptoms:**
- Click demo button but nothing happens
- Error in console about missing files

**Solutions:**
1. **Check Demo Files Exist**
   ```bash
   ls demo/corba-idl/
   # Should show: RouterAgent.idl, SupportAgent.idl, ResearchAgent.idl
   ```

2. **Verify Public Folder**
   ```bash
   ls public/demo/corba-idl/
   # Files should be copied here during build
   ```

3. **Rebuild Project**
   ```bash
   npm run build
   npm start
   ```

---

### Issue: "Syntax highlighting not working"

**Symptoms:**
- IDL and YAML shown as plain text
- No color coding

**Cause:**
This is a lightweight regex-based highlighter, not a full syntax highlighter.

**Expected Behavior:**
- Keywords highlighted in purple
- Types highlighted in green
- Punctuation highlighted in neon
- Comments in gray

If you see no highlighting at all:
- Check browser console for errors
- Verify the component rendered correctly
- Try refreshing the page

---

## Performance Issues

### Issue: "Parsing takes too long"

**Symptoms:**
- Upload hangs on "Parsing" state
- Browser becomes unresponsive

**Causes:**
1. **Very Large IDL File**
   - Files over 10,000 lines may be slow
   - Complex nested structures increase parse time

2. **Many Interfaces**
   - Each interface is processed separately
   - 50+ interfaces may take several seconds

**Solutions:**
1. **Split Large Files**
   ```bash
   # Split by module
   grep -A 1000 "module Module1" large.idl > module1.idl
   grep -A 1000 "module Module2" large.idl > module2.idl
   ```

2. **Simplify IDL**
   - Remove unused interfaces
   - Extract common types to separate files
   - Remove comments and whitespace

3. **Be Patient**
   - Large files (5000+ lines) may take 5-10 seconds
   - This is normal for complex parsing

---

### Issue: "Browser crashes on large files"

**Symptoms:**
- Tab crashes during parsing
- "Out of memory" error

**Solution:**
The file is too large for browser-based parsing.

**Workaround:**
Use the programmatic API in Node.js:

```typescript
import fs from 'fs';
import { resurrectIDL } from './src/utils/idl-parser';

const idlContent = fs.readFileSync('huge-file.idl', 'utf-8');
const { specs, yaml } = resurrectIDL(idlContent);

specs.forEach((spec, i) => {
  fs.writeFileSync(`${spec.agent}.yaml`, yaml[i]);
});
```

---

## Common Error Messages

### "TypeError: Cannot read properties of undefined"

**Cause:** Malformed IDL structure.

**Solution:**
- Verify all interfaces have methods
- Check all structs have fields
- Ensure proper nesting of modules

---

### "SyntaxError: Unexpected token"

**Cause:** Invalid JavaScript/TypeScript in generated code.

**Solution:**
- This shouldn't happen with valid IDL
- Report as a bug with your IDL file
- Try simplifying the IDL

---

### "YAML validation failed"

**Cause:** Generated YAML has structural issues.

**Solution:**
- Check for special characters in names
- Verify type mappings are correct
- Report as a bug if IDL is valid

---

## Debugging Tips

### Enable Verbose Logging

```typescript
// In browser console
localStorage.setItem('DEBUG_IDL_PARSER', 'true');

// Reload page and try again
// Check console for detailed parsing logs
```

### Inspect Parsed Structure

```typescript
import { parseIDL } from '@/utils/idl-parser';

const idlContent = `...`;
const interfaces = parseIDL(idlContent);

// Inspect in console
console.log(JSON.stringify(interfaces, null, 2));
```

### Test Individual Components

```typescript
// Test just parsing
const interfaces = parseIDL(idlContent);
console.log('Parsed:', interfaces);

// Test just conversion
const specs = interfaces.map(idlToKiroSpec);
console.log('Converted:', specs);

// Test just YAML generation
const yaml = specs.map(specToYAML);
console.log('YAML:', yaml);
```

---

## Known Limitations

### Not Supported (Yet)
- ❌ CORBA unions
- ❌ CORBA enums (extracted but not in YAML)
- ❌ CORBA constants
- ❌ CORBA typedefs (partially)
- ❌ CORBA attributes
- ❌ CORBA inheritance
- ❌ CORBA valuetypes
- ❌ Preprocessor directives (#include, #define)

### Partially Supported
- ⚠️ Nested modules (flattened)
- ⚠️ Complex sequence types (may need simplification)
- ⚠️ Very long method signatures (may truncate)

### Fully Supported
- ✅ Interfaces
- ✅ Methods with parameters
- ✅ Structs
- ✅ Exceptions
- ✅ Basic CORBA types
- ✅ Sequence types
- ✅ Parameter directions (in/out/inout)
- ✅ Raises clauses

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Your issue might be documented
2. **Try the demos** - Verify the system works with known-good IDL
3. **Simplify your IDL** - Remove complexity to isolate the issue
4. **Check browser console** - Look for error messages

### Reporting Issues

When reporting a bug, include:

1. **IDL File** (or minimal reproduction)
   ```idl
   // Minimal IDL that reproduces the issue
   module Test {
     interface Broken {
       void causesError();
     };
   };
   ```

2. **Expected Behavior**
   - What you expected to happen
   - What YAML you expected

3. **Actual Behavior**
   - What actually happened
   - Error messages from console
   - Screenshots if UI issue

4. **Environment**
   - Browser and version
   - Operating system
   - Node.js version (if using programmatically)

### Community Resources

- **GitHub Issues**: Report bugs and request features
- **DevPost**: See the full project writeup
- **Kiro Community**: Ask questions about Kiro integration

---

## Quick Fixes Checklist

- [ ] IDL file has proper module declaration
- [ ] All interfaces have at least one method
- [ ] All structs have at least one field
- [ ] Method parameters have direction keywords (in/out/inout)
- [ ] Sequence types have no spaces: `sequence<T>` not `sequence < T >`
- [ ] No special characters in identifiers
- [ ] Exceptions are declared before being used in raises clauses
- [ ] File is valid CORBA IDL (test with a CORBA compiler if available)
- [ ] Browser JavaScript is enabled
- [ ] Using a modern browser (Chrome, Firefox, Safari, Edge)
- [ ] File size is reasonable (< 5000 lines for browser)

---

**Still stuck? Check [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for working examples!**

🧟‍♂️ Happy Troubleshooting! ⚡✨
