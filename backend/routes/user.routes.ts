import express from 'express';
import { UserService } from '../services/user.service';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Admin-only route to create new users
router.post(
  '/create', 
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole([UserRole.ADMIN]),
  async (req, res) => {
    try {
      const { email, password, role, department, firstName, lastName } = req.body;
      
      const user = await UserService.createUser(
        email, 
        password, 
        role, 
        { department, firstName, lastName }
      );

      res.status(201).json({ 
        message: 'User created successfully', 
        userId: user.firebaseUid 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Route to update user role (admin-only)
router.patch(
  '/role/:firebaseUid', 
  AuthMiddleware.verifyToken,
  AuthMiddleware.hasRole([UserRole.ADMIN]),
  async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const { role } = req.body;

      const updatedUser = await UserService.updateUserRole(firebaseUid, role);

      res.json({ 
        message: 'User role updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get current user profile
router.get(
  '/profile', 
  AuthMiddleware.verifyToken,
  async (req, res) => {
    try {
      const user = await UserService.getUserByFirebaseUid(req.user.uid);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;