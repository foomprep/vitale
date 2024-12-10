import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();
export default function workoutRoutes(workoutCollection) {
  router.post('/workout', async (req, res) => {
    try {
      console.log('POST /workout');
      const result = await workoutCollection.insertOne(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create item' });
    }
  });
  router.get('/workout/:id', async (req, res) => {
    try {
      console.log('GET /workout/:id');
      const workout = await workoutCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (workout) {
        res.json(workout);
      } else {
        res.status(404).json({ error: 'Workout not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve workout' });
    }
  });
  router.get('/workout', async (req, res) => {
    try {
      console.log('GET /workout');
      const workouts = await workoutCollection.find({}).toArray();
      res.json(workouts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve workouts' });
    }
  });
  router.delete('/workout/:id', async (req, res) => {
    try {
      console.log('DELETE /workout/:id');
      const result = await workoutCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete workout' });
    }
  });
  router.put('/workout', async (req, res) => {
    try {
      console.log('PUT /workout');
      const { _id, ...updateData } = req.body;  // Separate _id from the rest of the data
      const result = await workoutCollection.updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update workout' });
    }
  });
  return router;
}
