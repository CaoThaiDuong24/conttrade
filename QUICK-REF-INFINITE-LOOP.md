# 🚨 REACT INFINITE LOOP - QUICK REFERENCE CARD

## ⚠️ Common Causes

### 1. Callback in useEffect Deps
```typescript
// ❌ DON'T
useEffect(() => {
  onChange(value);
}, [value, onChange]); // onChange thay đổi mỗi render!

// ✅ DO
const onChangeRef = useRef(onChange);
useEffect(() => { onChangeRef.current = onChange }, [onChange]);
useEffect(() => {
  onChangeRef.current(value);
}, [value]);
```

### 2. setState in Ref Callback
```typescript
// ❌ DON'T
const [node, setNode] = useState(null);
<div ref={setNode} /> // setState trigger re-render → new callback → ∞

// ✅ DO
const nodeRef = useRef(null);
<div ref={nodeRef} />
```

### 3. DOM Operations Trigger State
```typescript
// ❌ DON'T
useEffect(() => {
  ref.current?.focus(); // Nếu focus trigger state → ∞
}, [someDep]);

// ✅ DO
const hasFocusedRef = useRef(false);
useEffect(() => {
  if (!hasFocusedRef.current) {
    hasFocusedRef.current = true;
    ref.current?.focus();
  }
}, [someDep]);
```

### 4. Object/Array in Deps
```typescript
// ❌ DON'T
useEffect(() => {
  doSomething(config);
}, [config]); // config = {} mỗi render → khác nhau → ∞

// ✅ DO
useEffect(() => {
  doSomething(config);
}, [config.id, config.value]); // Primitives only

// Hoặc
const configRef = useRef(config);
useEffect(() => { configRef.current = config }, [config]);
```

---

## 🛠️ Quick Fixes

### Pattern A: Stable Callback
```typescript
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback }, [callback]);
// Use callbackRef.current thay vì callback
```

### Pattern B: One-Time Guard
```typescript
const hasRunRef = useRef(false);
if (!hasRunRef.current) {
  hasRunRef.current = true;
  // Run once
}
```

### Pattern C: Conditional Reset
```typescript
const guardRef = useRef(false);
useEffect(() => {
  if (condition && !guardRef.current) {
    guardRef.current = true;
    doAction();
  } else if (!condition) {
    guardRef.current = false;
  }
}, [condition]);
```

---

## 🔍 Debugging Steps

1. **Check console for "Maximum update depth" error**
2. **Use React DevTools Profiler** → xem component nào render nhiều
3. **Check useEffect dependencies** → có callback/object/array không?
4. **Check ref callbacks** → có setState không?
5. **Add console.log** ở đầu component → đếm số lần render

---

## ✅ Prevention Checklist

- [ ] Không có callback trong useEffect deps (dùng ref thay thế)
- [ ] Không có object/array trong deps (dùng primitives)
- [ ] Không dùng setState làm ref callback
- [ ] useCallback/useMemo cho functions/objects truyền xuống children
- [ ] Guard cho DOM operations (focus, scroll, click)
- [ ] Radix UI refs dùng useRef, không useState

---

## 📱 Emergency Quick Fix

Nếu đang bị lỗi và cần fix nhanh:

```typescript
// Tìm useEffect có callback trong deps:
useEffect(() => {
  callback(...);
}, [..., callback]); // ← ĐÂY!

// Wrap ngay:
const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback }, [callback]);
useEffect(() => {
  callbackRef.current(...);
}, [...]);  // ← Removed callback!
```

---

**Print this and keep at your desk! 📋**
