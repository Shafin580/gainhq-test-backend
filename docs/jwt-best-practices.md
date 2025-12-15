# JWT Best Practices

This document outlines the best practices for implementing JWT (JSON Web Tokens) authentication in a production environment.

## 1. Token Expiration Strategy

### Short-Lived Access Tokens
- **Current Implementation**: 24 hours
- **Production Recommendation**: 15 minutes to 1 hour
- **Rationale**: Shorter expiration reduces the window of opportunity for token theft and misuse

### Refresh Token Pattern
For production applications, implement a refresh token mechanism:

```typescript
// Access Token: Short-lived (15 min)
const accessToken = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  SECRET,
  { expiresIn: '15m' }
);

// Refresh Token: Long-lived (7 days), stored in database
const refreshToken = jwt.sign(
  { id: user.id, type: 'refresh' },
  REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

**Benefits**:
- Users stay logged in without frequent re-authentication
- Compromised access tokens expire quickly
- Refresh tokens can be revoked server-side

---

## 2. HTTPS Requirement

### Always Use HTTPS in Production
- **Critical**: JWT tokens MUST be transmitted over HTTPS only
- **Why**: HTTPS encrypts the entire communication channel, preventing man-in-the-middle attacks
- **Implementation**: 
  - Use SSL/TLS certificates (Let's Encrypt for free certificates)
  - Redirect all HTTP traffic to HTTPS
  - Set `Strict-Transport-Security` header

```javascript
// Express middleware to enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 3. Storage Options: HttpOnly Cookies vs. Authorization Headers

### Option 1: HttpOnly Cookies (Recommended for Web Apps)

**Advantages**:
- Protected from XSS attacks (JavaScript cannot access the cookie)
- Automatically sent with requests
- More secure for browser-based applications

**Implementation**:
```typescript
res.cookie('token', jwtToken, {
  httpOnly: true,        // Prevents JavaScript access
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 3600000,       // 1 hour
});
```

**Disadvantages**:
- Requires CSRF protection
- Not ideal for mobile apps or non-browser clients

---

### Option 2: Authorization Header (Current Implementation)

**Advantages**:
- Works with any client (mobile apps, SPAs, API consumers)
- No CSRF concerns
- Simple implementation

**Implementation**:
```typescript
// Client sends:
Authorization: Bearer <token>

// Server extracts:
const token = req.headers.authorization?.replace('Bearer ', '');
```

**Disadvantages**:
- Vulnerable to XSS if stored in localStorage
- Requires manual token management on client

---

### Best Practice Recommendation

**For Web Applications**:
Use **HttpOnly cookies** for authentication tokens and implement CSRF protection.

**For API/Mobile Apps**:
Use **Authorization headers** with tokens stored securely (iOS Keychain, Android Keystore).

**Hybrid Approach**:
- Short-lived access token in memory (or secure storage)
- Refresh token in HttpOnly cookie (web) or secure storage (mobile)

---

## 4. Secret Key Management

### Never Hardcode Secrets
```typescript
// ❌ Bad - Hardcoded secret
const secret = 'my-secret-key-123';

// ✅ Good - Environment variable
const secret = process.env.JWT_SECRET;
```

### Secret Requirements
- **Length**: Minimum 256 bits (32 characters)
- **Randomness**: Use cryptographically secure random generators
- **Rotation**: Rotate secrets periodically (quarterly recommended)

### Generate Strong Secrets
```bash
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Secret Storage
- **Development**: `.env` file (gitignored)
- **Production**: 
  - Environment variables (Heroku, Vercel, etc.)
  - Secret management services (AWS Secrets Manager, HashiCorp Vault)
  - Kubernetes Secrets

---

## 5. Token Payload Security

### Minimal Information
Only include necessary, non-sensitive data:

```typescript
// ✅ Good - Minimal payload
{
  id: 'user-uuid',
  email: 'user@example.com',
  role: 'student',
  iat: 1234567890,
  exp: 1234571490
}

// ❌ Bad - Sensitive data
{
  id: 'user-uuid',
  password: 'hashed-password',  // Never include
  creditCard: '1234-5678...',   // Never include
  ssn: '123-45-6789'            // Never include
}
```

**Remember**: JWT tokens are **encoded**, not **encrypted**. Anyone can decode and read the payload.

---

## 6. Token Revocation

### The Challenge
JWTs are stateless - once issued, they're valid until expiration.

### Solutions

**1. Blacklist/Deny List** (Database or Redis)
```typescript
// Store revoked tokens with expiration
await redis.set(`blacklist:${tokenId}`, '1', 'EX', remainingTTL);

// Verify middleware
if (await redis.exists(`blacklist:${tokenId}`)) {
  throw new Error('Token has been revoked');
}
```

**2. Token Versioning**
```typescript
// Include version in token
{ id: 'user-uuid', version: 5 }

// Store current version in database
// Invalidate all tokens when user changes password
user.tokenVersion += 1;
await user.save();
```

**3. Short Expiration + Refresh Tokens**
Best approach for most applications - reduces need for active revocation.

---

## 7. Additional Security Measures

### Rate Limiting
Prevent brute force attacks on auth endpoints:

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts',
});

app.post('/graphql', authLimiter, ...);
```

### Audience and Issuer Claims
```typescript
jwt.sign(payload, secret, {
  expiresIn: '1h',
  issuer: 'gainhq-backend',
  audience: 'gainhq-client',
});

// Verify
jwt.verify(token, secret, {
  issuer: 'gainhq-backend',
  audience: 'gainhq-client',
});
```

### Algorithm Specification
```typescript
// Always specify the algorithm
jwt.verify(token, secret, { algorithms: ['HS256'] });
```

---

## 8. Implementation Checklist

- [x] Use environment variables for secrets
- [x] Token expiration set appropriately
- [ ] HTTPS enforced in production
- [ ] HttpOnly cookies (if web app) or secure storage (if mobile)
- [ ] CSRF protection (if using cookies)
- [ ] Rate limiting on auth endpoints
- [ ] Token payload contains minimal data
- [ ] Refresh token mechanism (recommended for production)
- [ ] Token revocation strategy (if needed)
- [ ] Algorithm explicitly specified in verification
- [ ] Secrets rotated periodically

---

## 9. Security Testing

### Test for Common Vulnerabilities
1. **Token Replay**: Verify tokens can't be reused after logout
2. **Token Expiration**: Confirm expired tokens are rejected
3. **Algorithm Confusion**: Test `alg: none` attack prevention
4. **Secret Brute Force**: Ensure secret is strong enough

### Tools
- `jwt.io` - Decode and inspect JWTs
- `jwt_tool` - Security testing for JWTs
- OWASP ZAP - Web application security testing

---

## Summary

The current implementation provides a solid foundation with:
- ✅ Environment-based secret management
- ✅ Token expiration
- ✅ Standard Authorization header pattern

**For production deployment, prioritize**:
1. Enable HTTPS
2. Reduce token expiration to 15-60 minutes
3. Implement refresh token mechanism
4. Add rate limiting
5. Use HttpOnly cookies for web applications
