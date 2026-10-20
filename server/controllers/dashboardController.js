import dashboardService from '../services/dashboardService.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const summary = await dashboardService.getSummary(userId);

    res.status(200).json({ 
      success: true, 
      ...summary
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard summary' });
  }
};
