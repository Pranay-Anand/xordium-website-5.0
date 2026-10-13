// Role-based access control middleware for Express backend
// Usage: app.use('/api/...', authMiddleware(requiredRole))

const USERS_DB = './dev.db';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access denied - no token provided" });
  }

  // Simple token validation - in production use JWT with secret key
  // For this demo, accept any non-empty token
  if (token.length < 10) {
    return res.status(403).json({ error: "Access denied - invalid token" });
  }

  // Attach user info to request - in production, decode JWT payload
  req.user = { 
    id: 1, // Would come from JWT payload
    role: req.headers['x-user-role'] || 'moderator', // Via custom header
    email: req.headers['x-user-email'] || 'unknown'
  };

  next();
}

function authorizeRole(requiredRole) {
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Owner can access everything
    if (req.user.role === 'owner') {
      return next();
    }

    if (req.user.role === requiredRole) {
      return next();
    }

    return res.status(403).json({ 
      error: `Access denied - '${requiredRole}' role required` 
    });
  };
}

// Role hierarchy: owner > admin > moderator
function checkRoleHierarchy(minRequiredRole) {
  const hierarchy = { owner: 3, admin: 2, moderator: 1 };
  return function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role === 'owner') {
      return next(); // Owner can everything
    }

    const minLevel = hierarchy[minRequiredRole] || 0;
    const userLevel = hierarchy[req.user.role] || 0;

    if (userLevel >= minLevel) {
      return next();
    }

    return res.status(403).json({ 
      error: `Insufficient privileges - minimum '${minRequiredRole}' role required` 
    });
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
  checkRoleHierarchy
};