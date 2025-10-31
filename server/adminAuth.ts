import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Simple admin authentication middleware for Plesk deployment
export function setupAdminAuth(app: Express) {
  // Skip if already using Replit Auth
  if (process.env.REPL_ID) {
    return;
  }

  // Require SESSION_SECRET on external hosting
  if (!process.env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET environment variable is required for admin authentication. " +
      "Generate a strong secret: openssl rand -base64 32"
    );
  }

  // Require ADMIN_PASSWORD on external hosting
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required for admin authentication. " +
      "Generate a strong password: openssl rand -base64 32"
    );
  }

  const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    })
  );
}

export const requireAdminPassword: RequestHandler = async (req: any, res, next) => {
  // Import storage to check user role
  const { storage } = await import("./storage");
  
  // On Replit: Check both Replit Auth AND email/password session
  if (process.env.REPL_ID) {
    let userId: string | null = null;

    // Option 1: Replit Auth (Google OAuth)
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      userId = req.user.claims.sub;
    }
    // Option 2: Email/password session
    else if (req.session?.userId && req.session?.isAuthenticated) {
      userId = req.session.userId;
    }

    // No authentication found
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user has admin role
    try {
      const dbUser = await storage.getUser(userId);
      if (!dbUser || dbUser.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      return next();
    } catch (error) {
      console.error("Error checking admin role:", error);
      return res.status(500).json({ message: "Error verifying admin access" });
    }
  }

  // On Plesk: Check password-based session
  if (req.session?.isAdmin) {
    return next();
  }

  return res.status(401).json({ message: "Admin authentication required" });
};

export function registerAdminAuthRoutes(app: Express) {
  // Skip if using Replit Auth
  if (process.env.REPL_ID) {
    return;
  }

  // Admin login endpoint
  app.post("/api/admin/login", (req: any, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }

    return res.status(401).json({ message: "Invalid password" });
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Check admin status
  app.get("/api/admin/status", (req: any, res) => {
    res.json({ isAdmin: !!req.session?.isAdmin });
  });
}
