import * as savedService from '../services/savedService.js';

export const getSavedDestinations = async (req, res) => {
  try {
    const userId = req.user.id;
    const savedDestinations = await savedService.getSavedDestinations(userId);
    res.json({ success: true, destinations: savedDestinations });
  } catch (error) {
    console.error('Error fetching saved destinations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved destinations' });
  }
};

export const saveDestination = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cityId } = req.body;

    if (!cityId) {
      return res.status(400).json({ success: false, message: 'City ID is required' });
    }

    const saved = await savedService.saveDestination(userId, cityId);
    res.json({ success: true, saved });
  } catch (error) {
    console.error('Error saving destination:', error);
    res.status(500).json({ success: false, message: 'Failed to save destination' });
  }
};

export const unsaveDestination = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cityId } = req.params;

    if (!cityId) {
      return res.status(400).json({ success: false, message: 'City ID is required' });
    }

    const removed = await savedService.unsaveDestination(userId, cityId);
    if (removed) {
      res.json({ success: true, message: 'Destination removed from saved list' });
    } else {
      res.status(404).json({ success: false, message: 'Saved destination not found' });
    }
  } catch (error) {
    console.error('Error unsaving destination:', error);
    res.status(500).json({ success: false, message: 'Failed to unsave destination' });
  }
};
