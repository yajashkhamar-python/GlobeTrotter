import recommendationService from '../services/recommendationService.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await recommendationService.getRecommendations(userId);

    if (result.status === 'no_preferences') {
      return res.status(200).json({ 
        success: true, 
        status: 'no_preferences',
        recommendations: { destinations: [], activities: [] } 
      });
    }

    res.status(200).json({ 
      success: true, 
      status: 'success',
      recommendations: result.recommendations 
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};
