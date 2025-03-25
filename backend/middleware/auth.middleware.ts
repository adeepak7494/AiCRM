import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { DecodedIdToken  } from 'firebase-admin/auth';
import { User, UserRole } from '../models/user.model';

// Custom interface that extends DecodedIdToken
export interface CustomDecodedIdToken extends DecodedIdToken {
  uid: string;
  email?: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomDecodedIdToken;
    }
  }
}

export class AuthMiddleware {
  // Verify Firebase token and sync/create user in MongoDB
  public static async verifyToken(req: Request, res: Response, next: NextFunction) : Promise<any> {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(403).json({ error: 'No token provided' });
    }

    try {
      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Find or create user in MongoDB
      let user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (!user) {
        // Create new user if not exists
        user = new User({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          role: UserRole.READ_ONLY, // Default role
          lastLogin: new Date()
        });
        await user.save();
      } else {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }

      // Attach user to request
      req.user = {
        ...decodedToken,
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || UserRole.SALES_REP // Default role if not specified
      };

      next();
    } catch (error) {
      res.status(403).json({ error: 'Unauthorized' });
    }
  }

  // Role-based access control
  static hasRole(allowedRoles: UserRole[]) {
    return async (req: any, res: Response, next: NextFunction) => {
      try {
        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({ 
            error: 'Insufficient permissions',
            requiredRoles: allowedRoles
          });
        }

        next();
      } catch (error) {
        res.status(500).json({ error: 'Error checking user role' });
      }
    };
  }
}