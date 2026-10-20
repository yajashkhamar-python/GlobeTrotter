import ProfileService from '../services/profileService.js';
import db from '../config/db.js';

// @desc    Get user profile data including stats and preferences
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user basic data
    const userRes = await db.query('SELECT id, name, email, language, created_at FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userRes.rows[0];

    // Fetch stats and preferences in parallel
    const [stats, preferences] = await Promise.all([
      ProfileService.getProfileStats(userId),
      ProfileService.getTravelPreferences(userId)
    ]);

    res.status(200).json({
      success: true,
      user,
      stats,
      preferences
    });

  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile data
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const updatedUser = await ProfileService.updateProfile(userId, name, normalizedEmail);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in updateProfile:', error);
    if (error.message === 'Email is already in use by another account') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user password
// @route   PUT /api/profile/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    await ProfileService.updatePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in updatePassword:', error);
    if (error.message === 'Incorrect current password') {
      return res.status(401).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user language
// @route   PUT /api/profile/language
// @access  Private
export const updateLanguage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({ success: false, message: 'Language is required' });
    }

    const updatedUser = await ProfileService.updateLanguage(userId, language);

    res.status(200).json({
      success: true,
      message: 'Language updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateLanguage:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await ProfileService.deleteAccount(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
