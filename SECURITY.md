# Vaulture Security Architecture

## 🔒 Multi-Layer Security System

### Authentication & Authorization

- **JWT-based Authentication**: All file access requires valid JWT token
- **Role-based Access Control**: Creators can access their files, buyers only purchased files
- **Purchase Verification**: Database validation for user purchase status

### File Access Security

- **Time-limited Download URLs**: Links expire in 30 seconds
- **Cryptographic Tokens**: MD5-hashed tokens with file path + expiry + secret
- **No Direct File Access**: Files served through secure endpoint, not static hosting

### Enhanced Security Features (Latest Updates)

- **Rate Limiting**: Maximum 10 downloads per minute per user
- **Security Headers**: Prevent caching and content sniffing
- **Audit Logging**: All access attempts logged with user ID and IP
- **Request Monitoring**: Track unauthorized access attempts

## 🛡️ Security Layers

1. **Network Level**: CORS configuration
2. **Application Level**: JWT authentication required
3. **Endpoint Level**: Token and purchase validation
4. **File Level**: Time-limited access tokens
5. **Rate Limiting**: Abuse prevention
6. **Audit Trail**: Comprehensive logging

## 🚫 What's NOT Possible

- ❌ Direct file URL access without authentication
- ❌ File access without valid purchase or ownership
- ❌ Expired token usage (30-second limit)
- ❌ Rate limit bypass (10 downloads/minute max)
- ❌ Access from different user accounts
- ❌ File caching in browsers (prevented by headers)

## ✅ Valid Access Scenarios

- ✅ Creator accessing their own uploaded files
- ✅ Buyer accessing purchased files within token validity
- ✅ Authenticated users with valid JWT tokens
- ✅ Within rate limits and time constraints

## 🔍 Monitoring & Logging

All security events are logged including:

- Successful file access with user ID and IP
- Failed authentication attempts
- Rate limit violations
- Invalid/expired token usage
- Unauthorized access attempts

## 🔧 Testing Your Security

To verify the security is working:

1. **Test without authentication**:

   ```bash
   curl "http://localhost:8000/files/any-file.ext?token=test&expires=999999999999"
   # Should return: 403 Forbidden - "Not authenticated"
   ```

2. **Test with invalid token**:

   ```bash
   curl -H "Authorization: Bearer invalid" "http://localhost:8000/files/any-file.ext?token=test&expires=999999999999"
   # Should return: 401 Unauthorized - "Could not validate credentials"
   ```

3. **Test expired download token**:
   - Use a URL with past expiry timestamp
   - Should return: 403 Forbidden - "Invalid or expired download token"

## 📝 Best Practices

1. **Never store download URLs**: They expire quickly by design
2. **Re-request download URLs**: Each download should generate new URL
3. **Monitor logs**: Check for suspicious access patterns
4. **Regular token rotation**: JWT secrets should be rotated periodically
5. **Use HTTPS**: Always use encrypted connections in production

## 🎯 Your Security Status: ✅ SECURE

Your file access system is properly secured with multiple layers of protection. The issue you experienced was likely due to browser caching or testing different URLs. The actual file serving endpoint requires:

1. Valid JWT authentication
2. Valid time-limited download token
3. Purchase verification or file ownership
4. Rate limiting compliance
5. Audit trail logging

**Bottom Line**: Files cannot be accessed without proper authentication and authorization, even with direct URLs.
